// app/api/soil-moisture/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/getSession';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Validate station ID
    if (!session.user.station?.id) {
      return NextResponse.json(
        { message: 'Station ID is required' },
        { status: 400 }
      );
    }

    // Create new soil moisture record
    const newRecord = await prisma.soilMoistureData.create({
      data: {
        date: new Date(data.date),
        depth: parseInt(data.depth),
        w1: parseFloat(data.w1),
        w2: parseFloat(data.w2),
        w3: parseFloat(data.w3),
        Ws: parseFloat(data.Ws),
        Ds: parseFloat(data.Ds),
        Sm: parseFloat(data.Sm),
        station: {
          connect: {
            id: session.user.station.id,
          },
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Data saved successfully', data: newRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving soil moisture data:', error);
    return NextResponse.json(
      { message: 'Failed to save data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await prisma.soilMoistureData.findMany({
      where: {
        stationId: session.user.station?.id,
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        station: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data }, { status: 200 });

  } catch (error) {
    console.error('Error fetching soil moisture data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}