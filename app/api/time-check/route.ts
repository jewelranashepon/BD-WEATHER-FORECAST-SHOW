import prisma from "@/lib/prisma";
import { hourToUtc } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import moment from "moment";

// Check if observing time exist or not and return each data count
export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { hour } = body;

  try {
    const formattedUtcTime = hourToUtc(hour);
    const yesterDayUtcTime = moment(formattedUtcTime)
      .subtract(1, "day")
      .toDate();

    // Get today's and yesterday's observing time
    const [observingTime, yesterdayObservingTime] = await prisma.$transaction([
      prisma.observingTime.findFirst({
        where: {
          AND: [
            {
              utcTime: formattedUtcTime,
            },
            {
              stationId: session.user.station?.id,
            },
          ],
        },
        orderBy: {
          utcTime: "desc",
        },
        include: {
          _count: {
            select: {
              MeteorologicalEntry: true,
              WeatherObservation: true,
              SynopticCode: true,
              DailySummary: true,
            },
          },
        },
      }),
      prisma.observingTime.findFirst({
        where: {
          AND: [
            {
              utcTime: yesterDayUtcTime,
            },
            {
              stationId: session.user.station?.id,
            },
          ],
        },
        include: {
          MeteorologicalEntry: true,
        },
        orderBy: {
          utcTime: "desc",
        },
      }),
    ]);

    if (!observingTime) {
      return NextResponse.json(
        {
          allowFirstCard: true,
          allowSecondCard: false,
          message: "First card data not found!",
          yesterday: {
            meteorologicalEntry: yesterdayObservingTime
              ? yesterdayObservingTime.MeteorologicalEntry
              : [],
          },
        },
        { status: 400 }
      );
    }

    if (observingTime && observingTime._count.WeatherObservation > 0) {
      return NextResponse.json(
        {
          allowFirstCard: false,
          allowSecondCard: false,
          message: "Observing time already exists!",
          yesterday: {
            meteorologicalEntry: yesterdayObservingTime
              ? yesterdayObservingTime.MeteorologicalEntry
              : [],
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      allowFirstCard: false,
      allowSecondCard: true,
      message: "Observing time already exists!",
      time: observingTime.utcTime,
      yesterday: {
        meteorologicalEntry: yesterdayObservingTime
          ? yesterdayObservingTime.MeteorologicalEntry
          : [],
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: true,
        message: "Failed to check time",
      },
      { status: 500 }
    );
  }
}


