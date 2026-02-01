'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'

export async function fetchVendorCustomers() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  if (session.user?.role !== 'VENDOR') throw new Error('Forbidden')

  const vendorId = Number(session.user.id)

  // Get all orders from this vendor's products and extract unique customers
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            vendorId,
          },
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
        },
      },
    },
  })

  // Extract unique customers
  const uniqueCustomers = {}
  orders.forEach((order) => {
    if (order.user) {
      uniqueCustomers[order.user.id] = order.user
    }
  })

  return Object.values(uniqueCustomers).map((customer) => ({
    id: customer.id,
    name: customer.name || 'Unknown',
    email: customer.email || 'N/A',
    phone: customer.address || 'N/A',
  }))
}
