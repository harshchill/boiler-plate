import { NextResponse } from 'next/server'
import { getServerSessionHelper } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

// GET - Fetch user's cart (QUOTATION order)
export async function GET() {
  try {
    const session = await getServerSessionHelper()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)

    // Get or create QUOTATION order (this is the "cart")
    let order = await prisma.order.findFirst({
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
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!order) {
      order = await prisma.order.create({
        data: {
          userId,
          status: 'QUOTATION',
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
                },
              },
            },
          },
        },
      })
    }

    // Convert Decimal fields to numbers for JSON serialization
    const serializedOrder = {
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

    return NextResponse.json(serializedOrder, { status: 200 })
  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching cart' },
      { status: 500 }
    )
  }
}

// POST - Add item to cart (QUOTATION order)
export async function POST(request) {
  try {
    const session = await getServerSessionHelper()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()
    const { productId, quantity, startDate, endDate } = body

    // Validate input
    if (!productId || !quantity || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, quantity, startDate, endDate' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()
    if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end) || end <= start) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      )
    }
    if (start < now) {
      return NextResponse.json(
        { error: 'Cannot book in the past' },
        { status: 400 }
      )
    }

    // Validate product exists and is rentable
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (!product.isRentable) {
      return NextResponse.json(
        { error: 'Product is not available for rental' },
        { status: 400 }
      )
    }

    // Get or create QUOTATION order (cart)
    let order = await prisma.order.findFirst({
      where: { 
        userId,
        status: 'QUOTATION'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!order) {
      order = await prisma.order.create({
        data: {
          userId,
          status: 'QUOTATION',
        },
      })
    }

    // Check if item already exists in order with same dates
    const existingItem = await prisma.orderItem.findFirst({
      where: {
        orderId: order.id,
        productId: parseInt(productId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    })

    // Calculate price
    const hours = Math.ceil((end - start) / (1000 * 60 * 60))
    const itemPrice = hours * Number(product.priceHourly || 0) * parseInt(quantity)

    // Check availability against overlapping reservations
    const reservingStatuses = ['SALE_ORDER', 'SALE_ORDER_CONFIRMED', 'INVOICED']
    const overlappingReserved = await prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        productId: parseInt(productId),
        order: { status: { in: reservingStatuses } },
        NOT: [
          { endDate: { lte: start } },
          { startDate: { gte: end } },
        ],
      },
    })
    const reservedQty = overlappingReserved._sum.quantity || 0
    const available = Number(product.totalStock) - Number(reservedQty)
    if (parseInt(quantity) > available) {
      return NextResponse.json(
        { error: 'Insufficient stock for the selected dates' },
        { status: 400 }
      )
    }

    if (existingItem) {
      // Update quantity and price if item exists
      const newQuantity = existingItem.quantity + parseInt(quantity)
      const newPrice = hours * Number(product.priceHourly || 0) * newQuantity
      // Re-check availability for updated quantity (exclude the existing item's current quantity from reserved)
      const overlappingReservedExcludingSelf = await prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
          productId: parseInt(productId),
          order: { status: { in: reservingStatuses } },
          NOT: [
            { endDate: { lte: start } },
            { startDate: { gte: end } },
          ],
          id: { not: existingItem.id },
        },
      })
      const reservedExcl = overlappingReservedExcludingSelf._sum.quantity || 0
      const availableForUpdate = Number(product.totalStock) - Number(reservedExcl)
      if (newQuantity > availableForUpdate) {
        return NextResponse.json(
          { error: 'Insufficient stock for the selected dates' },
          { status: 400 }
        )
      }
      
      const updatedItem = await prisma.orderItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price: newPrice,
        },
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
            },
          },
        },
      })

      // Update order timestamp
      await prisma.order.update({
        where: { id: order.id },
        data: { updatedAt: new Date() }
      })

      // Serialize Decimal fields
      const serializedItem = {
        ...updatedItem,
        price: updatedItem.price ? Number(updatedItem.price) : 0,
        product: {
          ...updatedItem.product,
          priceHourly: updatedItem.product.priceHourly ? Number(updatedItem.product.priceHourly) : 0,
        }
      }

      return NextResponse.json(
        { message: 'Cart item updated', item: serializedItem },
        { status: 200 }
      )
    }

    // Create new order item with calculated price
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        price: itemPrice,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
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
          },
        },
      },
    })

    // Update order timestamp
    await prisma.order.update({
      where: { id: order.id },
      data: { updatedAt: new Date() }
    })

    // Serialize Decimal fields
    const serializedItem = {
      ...orderItem,
      price: orderItem.price ? Number(orderItem.price) : 0,
      product: {
        ...orderItem.product,
        priceHourly: orderItem.product.priceHourly ? Number(orderItem.product.priceHourly) : 0,
      }
    }

    return NextResponse.json(
      { message: 'Item added to cart', item: serializedItem },
      { status: 201 }
    )
  } catch (error) {
    console.error('Cart POST error:', error)
    return NextResponse.json(
      { error: 'An error occurred while adding item to cart' },
      { status: 500 }
    )
  }
}
