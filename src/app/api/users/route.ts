import { NextRequest, NextResponse } from 'next/server'
import { registerUser, createBulkUsers, createAdminUser } from '@/lib/user-service'
import { UserData } from '@/lib/user-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, users, user, isAdmin } = body

    // Validate request body
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'create_single':
        // Create a single user
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'User data is required for single creation' },
            { status: 400 }
          )
        }

        const singleResult = await registerUser(user as UserData)
        return NextResponse.json(singleResult)

      case 'create_bulk':
        // Create multiple users
        if (!users || !Array.isArray(users)) {
          return NextResponse.json(
            { success: false, error: 'Users array is required for bulk creation' },
            { status: 400 }
          )
        }

        const bulkResult = await createBulkUsers(users as UserData[])
        return NextResponse.json(bulkResult)

      case 'create_admin':
        // Create admin user
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'User data is required for admin creation' },
            { status: 400 }
          )
        }

        const adminResult = await createAdminUser(user as UserData, isAdmin || false)
        return NextResponse.json(adminResult)

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('User creation API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'health':
        // Health check endpoint
        return NextResponse.json({
          success: true,
          message: 'User creation API is running',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('User API GET error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
