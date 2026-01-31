import { NextResponse } from 'next/server'
import { getServerSessionHelper } from '../../../../lib/auth'
import prisma from '../../../../lib/prisma'

export async function GET() {
  try {
    const session = await getServerSessionHelper()
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all stats
    const [
      totalUsers,
      totalCustomers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalInvoices,
      totalRevenue,
      ordersByStatus,
      revenueByMonth,
      recentOrders,
      topVendors
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total customers
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      
      // Total vendors
      prisma.user.count({ where: { role: 'VENDOR' } }),
      
      // Total products
      prisma.product.count(),
      
      // Total orders
      prisma.order.count(),
      
      // Total invoices
      prisma.invoice.count(),
      
      // Total revenue (sum of all paid invoices)
      prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { amountPaid: true }
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // Revenue by month (last 6 months)
      prisma.invoice.findMany({
        where: {
          status: 'PAID',
          issuedAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        },
        select: {
          amountPaid: true,
          issuedAt: true
        }
      }),
      
      // Recent orders (last 10)
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          items: {
            include: {
              product: {
                select: { name: true }
              }
            }
          }
        }
      }),
      
      // Top vendors by product count
      prisma.user.findMany({
        where: { role: 'VENDOR' },
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: {
          products: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ])

    // Process revenue by month
    const monthlyRevenue = {}
    revenueByMonth.forEach(invoice => {
      const month = invoice.issuedAt.toISOString().substring(0, 7) // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(invoice.amountPaid)
    })

    // Format monthly revenue for chart
    const revenueChartData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Number(revenue)
      }))

    // Process orders by status
    const ordersStatusData = ordersByStatus.map(item => ({
      status: item.status,
      count: item._count.id
    }))

    // Calculate pending revenue
    const pendingRevenue = await prisma.invoice.aggregate({
      where: { status: { in: ['UNPAID', 'PARTIAL'] } },
      _sum: { amountTotal: true }
    })

    // Calculate total revenue (paid + pending)
    const totalRevenueAmount = Number(totalRevenue._sum.amountPaid || 0)
    const pendingRevenueAmount = Number(pendingRevenue._sum.amountTotal || 0)

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCustomers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalInvoices,
        totalRevenue: totalRevenueAmount,
        pendingRevenue: pendingRevenueAmount,
        totalRevenueWithPending: totalRevenueAmount + pendingRevenueAmount
      },
      charts: {
        ordersByStatus: ordersStatusData,
        revenueByMonth: revenueChartData
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        user: order.user.name,
        email: order.user.email,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        itemsCount: order.items.length
      })),
      topVendors: topVendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        companyName: vendor.companyName,
        productsCount: vendor._count.products
      }))
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching stats' },
      { status: 500 }
    )
  }
}
