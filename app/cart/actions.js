'use server'

import { getServerSessionHelper } from '../../lib/auth'
import prisma from '../../lib/prisma'

export async function getCart() {
  try {
    const session = await getServerSessionHelper()
    
    if (!session || !session.user) {
      return { error: 'Unauthorized', cart: null }
    }

    const userId = parseInt(session.user.id)

    // Get QUOTATION order (cart) - use findFirst since we only want one cart per user
    const order = await prisma.order.findFirst({
      where: { 
        userId,
        status: 'QUOTATION'
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    name: true,
                    companyName: true,
                  },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            id: 'desc' // Order by id instead of createdAt which doesn't exist
          }
        },
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!order) {
      return { error: null, cart: { id: null, items: [], totalAmount: 0 } }
    }

    // Convert Decimal fields to numbers for serialization
    const serializedCart = {
      ...order,
      totalAmount: order.totalAmount ? Number(order.totalAmount) : null,
      items: order.items.map(item => ({
        ...item,
        price: item.price ? Number(item.price) : 0,
        product: {
          ...item.product,
          priceHourly: item.product.priceHourly ? Number(item.product.priceHourly) : 0,
        }
      }))
    }

    // Calculate total amount
    const totalAmount = serializedCart.items.reduce((sum, item) => {
      return sum + Number(item.price || 0)
    }, 0)

    return { error: null, cart: { ...serializedCart, totalAmount } }
  } catch (error) {
    console.error('Get cart error:', error)
    return { error: 'Failed to fetch cart', cart: null }
  }
}

export async function removeCartItem(itemId) {
  try {
    const session = await getServerSessionHelper()
    
    if (!session || !session.user) {
      return { error: 'Unauthorized' }
    }

    const userId = parseInt(session.user.id)

    // Verify item belongs to user's cart
    const item = await prisma.orderItem.findFirst({
      where: {
        id: parseInt(itemId),
        order: {
          userId,
          status: 'QUOTATION'
        }
      }
    })

    if (!item) {
      return { error: 'Item not found' }
    }

    await prisma.orderItem.delete({
      where: { id: parseInt(itemId) }
    })

    return { error: null }
  } catch (error) {
    console.error('Remove cart item error:', error)
    return { error: 'Failed to remove item' }
  }
}

export async function updateCartItemQuantity(itemId, quantity) {
  try {
    const session = await getServerSessionHelper()
    if (!session || !session.user) {
      return { error: 'Unauthorized' }
    }

    const userId = parseInt(session.user.id)

    // Verify item belongs to user's cart
    const item = await prisma.orderItem.findFirst({
      where: {
        id: parseInt(itemId),
        order: {
          userId,
          status: 'QUOTATION'
        }
      },
      include: {
        product: true
      }
    })

    if (!item) {
      return { error: 'Item not found' }
    }

    if (quantity <= 0) {
      return { error: 'Quantity must be greater than 0' }
    }

    // Validate date range (no past bookings)
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    const now = new Date()
    if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end) || end <= start || start < now) {
      return { error: 'Invalid date range' }
    }

    // Validate availability against overlapping reservations for active orders
    const reservingStatuses = ['SALE_ORDER', 'SALE_ORDER_CONFIRMED', 'INVOICED']
    const overlappingReserved = await prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        productId: item.productId,
        order: { status: { in: reservingStatuses } },
        NOT: [
          { endDate: { lte: start } },
          { startDate: { gte: end } },
        ],
      },
    })
    const reservedQty = overlappingReserved._sum.quantity || 0
    const available = Number(item.product.totalStock) - Number(reservedQty)
    if (parseInt(quantity) > available) {
      return { error: 'Insufficient stock for the selected dates' }
    }

    // Recalculate price
    const hours = Math.ceil((end - start) / (1000 * 60 * 60))
    const newPrice = hours * Number(item.product.priceHourly || 0) * quantity

    await prisma.orderItem.update({
      where: { id: parseInt(itemId) },
      data: {
        quantity: parseInt(quantity),
        price: newPrice
      }
    })

    return { error: null }
  } catch (error) {
    console.error('Update cart item error:', error)
    return { error: 'Failed to update item' }
  }
}