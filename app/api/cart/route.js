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

    if (!product.isRentable || product.totalStock < quantity) {
      return NextResponse.json(
        { error: 'Product is not available for rental or insufficient stock' },
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
    const start = new Date(startDate)
    const end = new Date(endDate)
    const hours = Math.ceil((end - start) / (1000 * 60 * 60))
    const itemPrice = hours * Number(product.priceHourly || 0) * parseInt(quantity)

    if (existingItem) {
      // Update quantity and price if item exists
      const newQuantity = existingItem.quantity + parseInt(quantity)
      const newPrice = hours * Number(product.priceHourly || 0) * newQuantity
      
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
