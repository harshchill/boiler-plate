import { getServerSession } from 'next-auth/next'
import { authOptions } from '../app/api/auth/[...nextauth]/route'

export async function getServerSessionHelper() {
  try {
    const session = await getServerSession(authOptions)
    return session
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}
