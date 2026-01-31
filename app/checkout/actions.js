'use server'

import { getServerSessionHelper } from '../../lib/auth'
import prisma from '../../lib/prisma'

function serializeOrder(order) {
  if (!order) return null
  return {
    ...order,
    totalAmount: order.totalAmount != null ? Number(order.totalAmount) : null,
    items: order.items?.map((it) => ({
      ...it,
      price: it.price != null ? Number(it.price) : 0,
      product: {
        ...it.product,
        priceHourly: it.product?.priceHourly != null ? Number(it.product.priceHourly) : 0,
      },
    })) || [],
  }
}

export async function getCheckoutData() {
  const session = await getServerSessionHelper()
  if (!session || !session.user) return { error: 'Unauthorized' }
  const userId = parseInt(session.user.id)

  const [user, order] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.order.findFirst({
      where: { userId, status: 'QUOTATION' },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: { select: { id: true, name: true, companyName: true } },
              },
            },
          },
          orderBy: { id: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  if (!order) return { error: null, user, order: { id: null, items: [], totalAmount: 0, deliveryMethod: null, shippingAddress: user?.address || '' } }
  const serialized = serializeOrder(order)
  const totalAmount = serialized.items.reduce((s, it) => s + Number(it.price || 0), 0)
  return { error: null, user, order: { ...serialized, totalAmount, shippingAddress: serialized.shippingAddress || user?.address || '' } }
}

export async function saveAddress(address) {
  const session = await getServerSessionHelper()
  if (!session || !session.user) return { error: 'Unauthorized' }
  const userId = parseInt(session.user.id)

  const order = await prisma.order.findFirst({ where: { userId, status: 'QUOTATION' } })
  if (!order) return { error: 'Cart is empty' }

  await prisma.order.update({ where: { id: order.id }, data: { shippingAddress: String(address || '') } })
  return { error: null }
}

export async function saveDeliveryMethod(method) {
  const session = await getServerSessionHelper()
  if (!session || !session.user) return { error: 'Unauthorized' }
  const userId = parseInt(session.user.id)
  const order = await prisma.order.findFirst({ where: { userId, status: 'QUOTATION' } })
  if (!order) return { error: 'Cart is empty' }

  if (!['COD', 'PICKUP'].includes(method)) return { error: 'Invalid delivery method' }
  await prisma.order.update({ where: { id: order.id }, data: { deliveryMethod: method } })
  return { error: null }
}

export async function confirmOrder() {
  const session = await getServerSessionHelper()
  if (!session || !session.user) return { error: 'Unauthorized' }
  const userId = parseInt(session.user.id)

  const order = await prisma.order.findFirst({
    where: { userId, status: 'QUOTATION' },
    include: { items: { include: { product: true } } },
  })
  if (!order) return { error: 'Cart is empty' }
  if (!order.shippingAddress) return { error: 'Address is required' }
  if (!order.deliveryMethod) return { error: 'Delivery method is required' }

  const totalAmount = order.items.reduce((s, it) => s + Number(it.price || 0), 0)
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'SALE_ORDER', totalAmount },
  })
  return { error: null }
}

export async function payNow() {
  const session = await getServerSessionHelper()
  if (!session || !session.user) return { error: 'Unauthorized' }
  const userId = parseInt(session.user.id)

  const order = await prisma.order.findFirst({
    where: { userId, status: 'SALE_ORDER' },
    include: {
      items: {
        include: { product: true },
      },
    },
  })
  if (!order) return { error: 'Order not in confirmable state' }

  const amountTotal = Number(order.totalAmount || 0) * 1.18

  // In a transaction: re-validate availability against overlapping reservations
  // and deduct stock to prevent double booking. If any item fails, rollback.
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } })
      if (!product || !product.isRentable) throw new Error('Product not rentable')

      const start = new Date(item.startDate)
      const end = new Date(item.endDate)
      const now = new Date()
      if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end) || end <= start || start < now) {
        throw new Error('Invalid date range for an item')
      }

      const reservingStatuses = ['SALE_ORDER', 'SALE_ORDER_CONFIRMED', 'INVOICED']
      // Reserved excluding this order's own items
      const overlappingReserved = await tx.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
          productId: item.productId,
          order: { status: { in: reservingStatuses }, id: { not: order.id } },
          NOT: [{ endDate: { lte: start } }, { startDate: { gte: end } }],
        },
      })
      const reservedExcl = overlappingReserved._sum.quantity || 0
      const available = Number(product.totalStock) - Number(reservedExcl)
      if (item.quantity > available) {
        throw new Error('Out of stock for one or more items for selected dates')
      }

      // Deduct stock to reflect committed inventory
      await tx.product.update({
        where: { id: item.productId },
        data: { totalStock: product.totalStock - item.quantity },
      })
    }

    await tx.order.update({ where: { id: order.id }, data: { status: 'INVOICED' } })
    await tx.invoice.create({
      data: {
        orderId: order.id,
        userId,
        amountTotal,
        amountPaid: amountTotal,
        status: 'PAID',
      },
    })
  })

  return { error: null }
}
