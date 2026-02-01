'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'

export async function fetchVendorProducts() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  if (session.user?.role !== 'VENDOR') throw new Error('Forbidden')

  const vendorId = Number(session.user.id)

  const products = await prisma.product.findMany({
    where: { vendorId },
    include: { vendor: { select: { id: true, name: true, companyName: true } } },
    orderBy: { id: 'desc' },
  })

  return products.map((product) => ({
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
}
