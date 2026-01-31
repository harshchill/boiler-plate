import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(request, { params }) {
  try {
    const paramsObj = await params
    const id = parseInt(paramsObj.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            companyName: true,
            gstin: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform product to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      dailyRate: product.priceHourly ? Number(product.priceHourly) * 24 : 0,
      priceHourly: product.priceHourly ? Number(product.priceHourly) : 0,
      totalStock: product.totalStock,
      vendor: {
        id: product.vendor.id,
        name: product.vendor.name,
        companyName: product.vendor.companyName,
        gstin: product.vendor.gstin,
      },
      isRentable: product.isRentable,
    }

    return NextResponse.json(transformedProduct, { status: 200 })
  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching the product' },
      { status: 500 }
    )
  }
}
