"use server";

import prisma from "@/lib/prisma";
import { getTodayUtcRange } from "@/lib/utils";
import { getSession } from "@/lib/getSession";

// Get todays time data for checking
export async function getTimeData() {
  try {
    const session = await getSession();

    if (!session) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }

    const { startToday, endToday } = getTodayUtcRange();

    const data = await prisma.observingTime.findMany({
      where: {
        AND: [
          {
            utcTime: {
              gte: startToday,
              lte: endToday,
            },
          },
          {
            stationId: session.user.station?.id,
          },
        ],
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
      orderBy: {
        utcTime: "desc",
      },
    });

    const formattedData =
      data.length > 0
        ? data.map((item) => {
            return {
              createdAt: item.createdAt,
              id: item.id,
              localTime: item.localTime,
              stationId: item.stationId,
              updatedAt: item.updatedAt,
              userId: item.userId,
              utcTime: item.utcTime,
              hasMeteorologicalEntry: item._count.MeteorologicalEntry > 0,
              hasWeatherObservation: item._count.WeatherObservation > 0,
              hasSynopticCode: item._count.SynopticCode > 0,
              hasDailySummary: item._count.DailySummary > 0,
            };
          })
        : [];

    return formattedData;
  } catch (error) {
    return {
      error: `Error fetching time information: ${error}`,
      status: 500,
    };
  }
}
