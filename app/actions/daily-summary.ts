"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function getDailySummary(date: string, stationIdParam?: string) {
  const session = await getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  const selectedDate = new Date(date);
  const startTime = new Date(selectedDate);
  startTime.setUTCHours(0, 0, 0, 0);
  
  const endTime = new Date(selectedDate);
  endTime.setUTCHours(23, 59, 59, 999);

  const superFilter = session.user.role === "super_admin";

  try {
    // For the specific date, get the latest entry
    const dateParts = date.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
    const day = parseInt(dateParts[2]);
    
    const dayStart = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    
    // Get the latest entry for this date and station
    const latestDailySummary = await prisma.dailySummary.findFirst({
      where: {
        ObservingTime: {
          utcTime: {
            gte: dayStart,
            lte: dayEnd,
          },
          ...(superFilter
            ? stationIdParam
              ? { stationId: stationIdParam }
              : {}
            : { stationId: session.user.station?.id }),
        },
      },
      orderBy: {
        ObservingTime: {
          utcTime: 'desc',
        },
      },
      include: {
        ObservingTime: {
          include: {
            station: true,
          },
        },
      },
    });

    return { success: true, data: latestDailySummary };
  } catch (error) {
    console.error("Error fetching daily summary data:", error);
    return { success: false, error: "Failed to fetch daily summary data" };
  }
}