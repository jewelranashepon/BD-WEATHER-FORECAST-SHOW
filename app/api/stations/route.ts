import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

// GET stations based on role
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let stations;

    // Filter stations based on user role
    if (session.user.role === "super_admin") {
      // Super admin can see all stations
      stations = await prisma.station.findMany();
    } else if (
      session.user.role === "station_admin" ||
      session.user.role === "observer"
    ) {
      // Station admin and observer can only see their assigned station
      if (!session.user.stationId) {
        return NextResponse.json(
          { error: "No station assigned to user" },
          { status: 404 }
        );
      }

      stations = await prisma.station.findMany({
        where: {
          id: session.user.stationId,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    return NextResponse.json(stations);
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { message: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}

// POST create new station
export async function POST(request: Request) {
  try {
    const { name, stationId, securityCode, latitude, longitude } =
      await request.json();

    // Validate required fields
    if (!name || !stationId || !securityCode) {
      return NextResponse.json(
        { error: "Name, stationId, and securityCode are required" },
        { status: 400 }
      );
    }

    const station = await prisma.station.create({
      data: {
        name,
        stationId,
        securityCode,
        latitude: latitude ? Number.parseFloat(latitude) : 23.685, // Default latitude if not provided
        longitude: longitude ? Number.parseFloat(longitude) : 90.3563, // Default longitude if not provided
      },
    });

    return NextResponse.json(station);
  } catch (error) {
    console.error("Error creating station:", error);
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 500 }
    );
  }
}
