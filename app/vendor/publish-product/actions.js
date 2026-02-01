'use server'

import prisma from '../../../lib/prisma'
import { getServerSessionHelper } from '../../../lib/auth'

export async function createProduct(data) {
  try {
    const session = await getServerSessionHelper()

    // Verify user is authenticated and is a vendor
    if (!session?.user || session.user.role !== 'VENDOR') {
      return {
        error: 'Unauthorized: Must be a vendor to create products',
        success: false
      }
    }

    const vendorId = typeof session.user.id === 'string'
      ? parseInt(session.user.id, 10)
      : Number(session.user.id)

    if (!Number.isFinite(vendorId)) {
      return {
        error: 'Invalid vendor ID',
        success: false
      }
    }

    // Validate required fields
    if (!data.name?.trim()) {
      return {
        error: 'Product name is required',
        success: false
      }
    }

    if (!data.priceHourly || Number(data.priceHourly) <= 0) {
      return {
        error: 'Hourly price must be greater than 0',
        success: false
      }
    }

    if (!data.totalStock || Number(data.totalStock) <= 0) {
      return {
        error: 'Total stock must be greater than 0',
        success: false
      }
    }

    // Parse category ID if provided
    let categoryId = null
    if (data.categoryId) {
      categoryId = parseInt(data.categoryId, 10)
      if (!Number.isFinite(categoryId)) {
        return {
          error: 'Invalid category selected',
          success: false
        }
      }
    }

    // Create the product with adminApproved defaulting to false
    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        priceHourly: data.priceHourly.toString(),
        totalStock: parseInt(data.totalStock, 10),
        isRentable: data.isRentable !== false,
        image: data.image || null,
        categoryId: categoryId,
        vendorId: vendorId,
        adminApproved: false // Always false for vendor-created products
      },
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      }
    })

    return {
      success: true,
      product: product,
      message: 'Product created successfully! Awaiting admin approval.'
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      error: error.message || 'Failed to create product',
      success: false
    }
  }
}
