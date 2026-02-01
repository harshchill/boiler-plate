import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const updated = await prisma.product.update({
      where: { id },
      data: { adminApproved: true },
    })

    return NextResponse.json({ success: true, product: { id: updated.id, adminApproved: updated.adminApproved } }, { status: 200 })
  } catch (error) {
    console.error('Approve product error:', error)
    return NextResponse.json({ error: 'Failed to approve product' }, { status: 500 })
  }
}
