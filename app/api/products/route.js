import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Build where clause
    const where = {
      isRentable: true,
      adminApproved: true,
    }

    if (category && category !== 'All') {
      where.category = category.toUpperCase().replace(' ', '_')
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get products with vendor information
    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    })

    // Transform products to match frontend expectations
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      dailyRate: product.priceHourly ? Number(product.priceHourly) * 24 : 0, // Convert hourly to daily
      priceHourly: product.priceHourly ? Number(product.priceHourly) : 0,
      totalStock: product.totalStock,
      vendor: {
        id: product.vendor.id,
        name: product.vendor.name,
        companyName: product.vendor.companyName,
      },
      isRentable: product.isRentable,
    }))

    return NextResponse.json(transformedProducts, { status: 200 })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching products' },
      { status: 500 }
    )
  }
}
