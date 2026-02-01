import { NextResponse } from 'next/server'

import prisma from '../../../../../lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { adminApproved: false },
      include: {
        vendor: {
          select: { id: true, name: true, companyName: true },
        },
      },
      orderBy: { id: 'desc' },
    })

    const transformed = products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      dailyRate: product.priceHourly ? Number(product.priceHourly) * 24 : 0,
      priceHourly: product.priceHourly ? Number(product.priceHourly) : 0,
      totalStock: product.totalStock,
      isRentable: product.isRentable,
      adminApproved: product.adminApproved,
      vendor: {
        id: product.vendor?.id,
        name: product.vendor?.name,
        companyName: product.vendor?.companyName,
      },
    }))

    return NextResponse.json(transformed, { status: 200 })
  } catch (error) {
    console.error('Admin pending products error:', error)
    return NextResponse.json({ error: 'Failed to fetch pending products' }, { status: 500 })
  }
}
