import prisma from '../../../lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return Response.json({
      categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return Response.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return Response.json(
        { error: 'Category already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim()
      }
    })

    return Response.json(
      { category, success: true, message: 'Category created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating category:', error)
    return Response.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
