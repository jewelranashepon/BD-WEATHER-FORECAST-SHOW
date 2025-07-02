// File: /app/api/agroclimatological-data/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/getSession'
import { AgroclimatologicalFormData } from '@/app/dashboard/data-entry/agroclimatological/agroclimatological-form'

export const dynamic = 'force-dynamic'

// Helper function to safely parse numeric values
function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return isNaN(num) ? null : num
}

export async function POST(request: Request) {
  const session = await getSession()
  
  // Authentication check
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Please log in to submit data' },
      { status: 401 }
    )
  }

  // Validate request content type
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { success: false, message: 'Invalid content type. Expected application/json' },
      { status: 400 }
    )
  }

  try {
    const data: AgroclimatologicalFormData = await request.json()
    console.log('Received submission data:', JSON.stringify(data, null, 2))

    // Prepare data for database insertion
    const dbData = {
      // Station Information
      elevation: parseNumber(data.stationInfo.elevation) ?? 0,
      date: new Date(data.stationInfo.date),
      utcTime: new Date(),

      // Solar & Sunshine Data
      solarRadiation: parseNumber(data.solarRadiation),
      sunShineHour: parseNumber(data.sunShineHour),

      // Air Temperature Data
      airTempDry05m: parseNumber(data.airTemperature.dry05m),
      airTempWet05m: parseNumber(data.airTemperature.wet05m),
      airTempDry12m: parseNumber(data.airTemperature.dry12m),
      airTempWet12m: parseNumber(data.airTemperature.wet12m),
      airTempDry22m: parseNumber(data.airTemperature.dry22m),
      airTempWet22m: parseNumber(data.airTemperature.wet22m),

      // Temperature Summary
      minTemp: parseNumber(data.minTemp),
      maxTemp: parseNumber(data.maxTemp),
      meanTemp: parseNumber(data.meanTemp),
      grassMinTemp: parseNumber(data.grassMinTemp),

      // Soil Temperature Data
      soilTemp5cm: parseNumber(data.soilTemperature.depth5cm),
      soilTemp10cm: parseNumber(data.soilTemperature.depth10cm),
      soilTemp20cm: parseNumber(data.soilTemperature.depth20cm),
      soilTemp30cm: parseNumber(data.soilTemperature.depth30cm),
      soilTemp50cm: parseNumber(data.soilTemperature.depth50cm),

      // Soil Moisture Data
      soilMoisture0to20cm: parseNumber(data.soilMoisture.depth0to20cm),
      soilMoisture20to50cm: parseNumber(data.soilMoisture.depth20to50cm),

      // Humidity & Evaporation Data
      panWaterEvap: parseNumber(data.panWaterEvap),
      relativeHumidity: parseNumber(data.relativeHumidity),
      evaporation: parseNumber(data.evaporation),
      dewPoint: parseNumber(data.dewPoint),

      // Weather Measurements
      windSpeed: parseNumber(data.windSpeed),
      duration: parseNumber(data.duration),
      rainfall: parseNumber(data.rainfall),

      // User and Station tracking
      userId: session.user.id,
      stationId: session.user.station?.id,  
    }

    console.log('Processed data for database:', JSON.stringify(dbData, null, 2))

    // Create the database entry
    const result = await prisma.agroclimatologicalData.create({
      data: {
        ...dbData,
        stationId: session.user.station?.id!,  // Now guaranteed to be a string
      },
    });

    console.log('Database insertion successful:', result)

    return NextResponse.json({
      success: true,
      message: 'Agroclimatological data submitted successfully!',
      data: {
        id: result.id,
        stationId: result.stationId,
        date: result.date,
        createdAt: result.createdAt,
      },
    })

  } catch (error: any) {
    console.error('Error submitting agroclimatological data:', error)

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'Data for this station and time period already exists. Please update instead.',
        },
        { status: 409 }
      )
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    // Handle database connection errors
    if (error.code === 'P1001') {
      return NextResponse.json(
        { success: false, message: 'Database connection error. Please try again later.' },
        { status: 500 }
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while processing your request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Please log in to access data' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const stationId = searchParams.get('stationId')
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Number(searchParams.get('offset')) || 0

    const where: any = {}

    // Date filter (inclusive range)
    if (startDate && endDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)

      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      where.date = {
        gte: start,
        lte: end,
      }
    }

    // Station filter
    if (stationId && stationId !== 'all') {
      where.stationId = stationId
    } else {
      // fallback to user's station if not super admin
      if (session.user.role !== 'super_admin') {
        where.stationId = session.user.station?.id
      }
    }

    // User-level access control (non-super-admin sees only own or own-station data)
    if (session.user.role !== 'super_admin') {
      where.OR = [
        { userId: session.user.id },
        { stationId: session.user.station?.id },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.agroclimatologicalData.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          station: { select: { id: true, name: true } },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.agroclimatologicalData.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })

  } catch (error: any) {
    console.error('Error fetching agroclimatological data:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}


// export async function GET(request: Request) {
//   const session = await getSession()
  
//   // Authentication check
//   if (!session?.user) {
//     return NextResponse.json(
//       { success: false, message: 'Unauthorized: Please log in to access data' },
//       { status: 401 }
//     )
//   }

//   try {
//     const { searchParams } = new URL(request.url)
//     const stationName = searchParams.get('stationName')
//     const year = searchParams.get('year')
//     const month = searchParams.get('month')
//     const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
//     const offset = Number(searchParams.get('offset')) || 0

//     const where: any = {
//       OR: [
//         { userId: session.user.id }, // User's own data
//         { stationId: session.user.station?.id }, // Data from user's station
//       ],
//     }

//     // Add filters if provided
//     if (stationName) where.stationName = { contains: stationName, mode: 'insensitive' }
//     if (year && month) {
//       const start = new Date(Number(year), Number(month) - 1, 1)
//       const end = new Date(Number(year), Number(month), 1)
//       where.date = { gte: start, lt: end }
//     }

//     // Fetch data with pagination
//     const [data, total] = await Promise.all([
//       prisma.agroclimatologicalData.findMany({
//         where,
//         include: {
//           user: { select: { id: true, name: true, email: true } },
//           station: { select: { id: true, name: true } },
//         },
//         orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
//         take: limit,
//         skip: offset,
//       }),
//       prisma.agroclimatologicalData.count({ where }),
//     ])

//     return NextResponse.json({
//       success: true,
//       data,
//       pagination: {
//         total,
//         limit,
//         offset,
//         hasMore: offset + limit < total,
//       },
//     })

//   } catch (error: any) {
//     console.error('Error fetching agroclimatological data:', error)
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Failed to fetch data',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 }
//     )
//   }
// }