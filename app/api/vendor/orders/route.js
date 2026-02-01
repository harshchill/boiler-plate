import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { getServerSessionHelper } from '../../../../lib/auth'

// GET: list orders related to this vendor (orders that include vendor's products)
// POST: create a new order (quotation) on behalf of vendor to a customer
// PATCH: update order status (e.g., mark confirmed/completed)

export async function GET() {
  try {
    const session = await getServerSessionHelper()
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const vendorId = parseInt(session.user.id)
    if (!Number.isFinite(vendorId)) return NextResponse.json({ error: 'Invalid vendor id' }, { status: 400 })

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { product: { vendorId } }
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true, companyName: true } },
        items: { include: { product: { select: { id: true, name: true, priceHourly: true } } } },
        invoice: { select: { amountTotal: true, amountPaid: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error('Vendor orders GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSessionHelper()
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const vendorId = parseInt(session.user.id)
    if (!Number.isFinite(vendorId)) return NextResponse.json({ error: 'Invalid vendor id' }, { status: 400 })

    const body = await request.json()
    const { userId, items, deliveryMethod, shippingAddress } = body

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Validate each item and compute total
    let total = 0
    const itemsToCreate = []
    for (const it of items) {
      const productId = parseInt(it.productId)
      const quantity = parseInt(it.quantity) || 1
      const startDate = it.startDate ? new Date(it.startDate) : null
      const endDate = it.endDate ? new Date(it.endDate) : null

      if (!Number.isFinite(productId)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })

      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return NextResponse.json({ error: `Product ${productId} not found` }, { status: 404 })
      if (product.vendorId !== vendorId) return NextResponse.json({ error: 'Unauthorized product' }, { status: 403 })

      // Calculate duration hours if dates provided else default 1
      let hours = 1
      if (startDate && endDate) {
        const ms = Math.max(0, endDate - startDate)
        hours = Math.ceil(ms / (1000 * 60 * 60)) || 1
      }

      const pricePerUnit = product.priceHourly || 0
      const linePrice = Number(pricePerUnit) * hours * quantity
      total += linePrice

      itemsToCreate.push({ productId, quantity, price: linePrice.toString(), startDate, endDate })
    }

    const order = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        status: 'QUOTATION',
        totalAmount: total.toString(),
        deliveryMethod: deliveryMethod || null,
        shippingAddress: shippingAddress || null,
        items: {
          create: itemsToCreate.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            startDate: i.startDate || new Date(),
            endDate: i.endDate || new Date(),
          }))
        }
      },
      include: { items: { include: { product: true } }, user: true }
    })

    return NextResponse.json({ order, success: true, message: 'Quotation created' }, { status: 201 })
  } catch (error) {
    console.error('Vendor orders POST error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSessionHelper()
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const vendorId = parseInt(session.user.id)
    if (!Number.isFinite(vendorId)) return NextResponse.json({ error: 'Invalid vendor id' }, { status: 400 })

    const body = await request.json()
    const { orderId, action } = body
    const oid = parseInt(orderId)
    if (!Number.isFinite(oid)) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: oid }, include: { items: { include: { product: true } } } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Ensure the vendor is related to this order via its items
    const touchesVendor = order.items.some(i => i.product.vendorId === vendorId)
    if (!touchesVendor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let updated
    if (action === 'mark_confirmed') {
      updated = await prisma.order.update({ where: { id: oid }, data: { status: 'SALE_ORDER_CONFIRMED' } })
    } else if (action === 'mark_invoiced') {
      updated = await prisma.order.update({ where: { id: oid }, data: { status: 'INVOICED' } })
    } else if (action === 'delete') {
      await prisma.order.delete({ where: { id: oid } })
      return NextResponse.json({ success: true, message: 'Order deleted' }, { status: 200 })
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, order: updated })
  } catch (error) {
    console.error('Vendor orders PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
