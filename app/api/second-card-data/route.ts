import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";
import { getTodayUtcRange } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { startToday, endToday } = getTodayUtcRange();

    const data = await prisma.observingTime.findMany({
      where: {
        AND: [
          {
            stationId: session.user.station?.id,
          },
          {
            utcTime: {
              gte: startToday,
              lte: endToday,
            },
          },
        ],
      },
      include: {
        station: true,
        WeatherObservation: true,
      },
      orderBy: {
        utcTime: "desc",
      },
      take: 8,
    });

    if (!data) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    // Return the data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching second card data:", error);
    return NextResponse.json(
      { error: "Failed to fetch second card data" },
      { status: 500 }
    );
  }
}
