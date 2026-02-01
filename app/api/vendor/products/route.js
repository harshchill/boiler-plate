import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { getServerSessionHelper } from '../../../../lib/auth'

export async function GET() {
  try {
    const session = await getServerSessionHelper()
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'VENDOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const vendorId = parseInt(session.user.id)
    if (!Number.isFinite(vendorId)) return NextResponse.json({ error: 'Invalid vendor id' }, { status: 400 })

    const products = await prisma.product.findMany({
      where: { vendorId },
      select: {
        id: true,
        name: true,
        priceHourly: true,
        totalStock: true,
        isRentable: true,
        adminApproved: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error('Vendor products GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
