import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { getServerSessionHelper } from '../../../../lib/auth'

// GET /api/vendor/customers
// Returns a list of customers who have placed orders that include the authenticated vendor's products.
export async function GET() {
  try {
    const session = await getServerSessionHelper()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Require vendor role
    if (session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const vendorId = parseInt(session.user.id)
    if (!Number.isFinite(vendorId)) {
      return NextResponse.json({ error: 'Invalid vendor id' }, { status: 400 })
    }

    // Find orders that include at least one item of this vendor's products
    // Consider customers who reached SALE_ORDER and beyond (submitted orders)
    const consideredStatuses = ['SALE_ORDER', 'SALE_ORDER_CONFIRMED', 'INVOICED']

    const orders = await prisma.order.findMany({
      where: {
        status: { in: consideredStatuses },
        items: {
          some: {
            product: { vendorId },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            role: true,
            companyName: true,
            gstin: true,
          },
        },
        invoice: {
          select: {
            amountTotal: true,
            amountPaid: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Reduce to unique customers with orders details
    const byUser = new Map()
    for (const ord of orders) {
      const u = ord.user
      if (!u) continue
      if (!byUser.has(u.id)) {
        byUser.set(u.id, {
          id: u.id,
          name: u.name,
          email: u.email,
          address: u.address,
          role: u.role,
          companyName: u.companyName,
          gstin: u.gstin,
          orders: [],
        })
      }
      const rec = byUser.get(u.id)
      rec.orders.push({
        orderId: ord.id,
        status: ord.status,
        amountTotal: ord.invoice?.amountTotal || 0,
        amountPaid: ord.invoice?.amountPaid || 0,
        paymentStatus: ord.invoice?.status || 'PENDING',
        createdAt: ord.createdAt,
      })
    }

    const customers = Array.from(byUser.values()).map(customer => ({
      ...customer,
      orders: customer.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), // Sort by newest first
    }))
    return NextResponse.json({ customers }, { status: 200 })
  } catch (error) {
    console.error('Vendor customers GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
