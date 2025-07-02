import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { getTodayUtcRange, hourToUtc } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import { diff } from "deep-object-diff";
import { generateDailySummary } from "@/lib/getDailySummary";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    if (!data.observingTimeId) {
      return NextResponse.json(
        {
          error: true,
          message: "Must provide observation time",
        },
        { status: 404 }
      );
    }

    const formattedObservingTime = hourToUtc(data.observingTimeId);

    // First, find the ObservingTime record by its UTC time
    const observingTime = await prisma.observingTime.findFirst({
      where: {
        AND: [
          {
            utcTime: formattedObservingTime,
          },
          {
            stationId: session.user.station?.id,
          },
        ],
      },
      select: {
        id: true,
        utcTime: true,
        _count: {
          select: {
            MeteorologicalEntry: true,
            WeatherObservation: true,
          },
        },
      },
      orderBy: {
        utcTime: "desc",
      },
    });

    if (!observingTime?._count.MeteorologicalEntry) {
      return NextResponse.json(
        {
          error: true,
          message: "First card entry not found",
        },
        { status: 400 }
      );
    }

    if (observingTime?._count.WeatherObservation) {
      return NextResponse.json(
        {
          error: true,
          message: "Second card entry already exists",
        },
        { status: 400 }
      );
    }

    // Get station ID from session
    const stationId = session.user.station?.id;
    if (!stationId) {
      return NextResponse.json(
        {
          error: true,
          message: "Station ID is required",
        },
        { status: 400 }
      );
    }

    // Find the station by stationId to get its primary key (id)
    const stationRecord = await prisma.station.findFirst({
      where: { id: stationId },
    });

    if (!stationRecord) {
      return NextResponse.json(
        {
          error: true,
          message: `No station found with ID: ${stationId}`,
        },
        { status: 404 }
      );
    }

    const convertToUTCDateTime = (
      dateString: string | null,
      timeString: string | null
    ): Date | null => {
      if (!dateString || !timeString) return null;

      const [year, month, day] = dateString.split("-").map(Number);
      const [hour, minute] = timeString.split(":").map(Number);

      if (
        !year ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hour) ||
        isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return null;
      }

      return new Date(Date.UTC(year, month - 1, day, hour, minute));
    };

    const observationData = {
      tabActive: data.metadata?.tabActiveAtSubmission || "unknown",

      // Observer info
      observerInitial: data.observer?.["observer-initial"] || null,
      cardIndicator: "2",

      // Cloud
      lowCloudForm: data.clouds?.low?.form || null,
      lowCloudHeight: data.clouds?.low?.height || null,
      lowCloudAmount: data.clouds?.low?.amount || null,
      lowCloudDirection: data.clouds?.low?.direction || null,
      mediumCloudForm: data.clouds?.medium?.form || null,
      mediumCloudHeight: data.clouds?.medium?.height || null,
      mediumCloudAmount: data.clouds?.medium?.amount || null,
      mediumCloudDirection: data.clouds?.medium?.direction || null,
      highCloudForm: data.clouds?.high?.form || null,
      highCloudHeight: data.clouds?.high?.height || null,
      highCloudAmount: data.clouds?.high?.amount || null,
      highCloudDirection: data.clouds?.high?.direction || null,

      // Total cloud
      totalCloudAmount: data.totalCloud?.["total-cloud-amount"] || null,

      // Significant clouds
      layer1Form: data.significantClouds?.layer1?.form || null,
      layer1Height: data.significantClouds?.layer1?.height || null,
      layer1Amount: data.significantClouds?.layer1?.amount || null,
      layer2Form: data.significantClouds?.layer2?.form || null,
      layer2Height: data.significantClouds?.layer2?.height || null,
      layer2Amount: data.significantClouds?.layer2?.amount || null,
      layer3Form: data.significantClouds?.layer3?.form || null,
      layer3Height: data.significantClouds?.layer3?.height || null,
      layer3Amount: data.significantClouds?.layer3?.amount || null,
      layer4Form: data.significantClouds?.layer4?.form || null,
      layer4Height: data.significantClouds?.layer4?.height || null,
      layer4Amount: data.significantClouds?.layer4?.amount || null,

      // Rainfall - Convert hour strings to DateTime objects
      rainfallTimeStart: convertToUTCDateTime(
        data.rainfall?.["date-start"] || null,
        data.rainfall?.["time-start"] || null
      ),
      rainfallTimeEnd: convertToUTCDateTime(
        data.rainfall?.["date-end"] || null,
        data.rainfall?.["time-end"] || null
      ),

      rainfallSincePrevious: data.rainfall?.["since-previous"] || null,
      rainfallDuringPrevious: data.rainfall?.["during-previous"] || null,
      rainfallLast24Hours: data.rainfall?.["last-24-hours"] || null,
      isIntermittentRain:
        typeof data.rainfall?.isIntermittentRain === "boolean"
          ? data.rainfall?.isIntermittentRain
          : null,

      // Wind
      windFirstAnemometer: data.wind?.["first-anemometer"] || null,
      windSecondAnemometer: data.wind?.["second-anemometer"] || null,
      windSpeed: data.wind?.speed || null,
      windDirection: data.wind?.["wind-direction"] || null,
    };

    const saved = await prisma.weatherObservation.create({
      data: {
        ObservingTime: {
          connect: {
            id: observingTime?.id,
            stationId: stationRecord.id,
          },
        },
        ...observationData,
      },
    });

    // Log The Action
    await LogAction({
      init: prisma,
      action: LogActionType.CREATE,
      actionText: "Weather Observation Created",
      role: session.user.role!,
      actorId: session.user.id,
      actorEmail: session.user.email,
      module: LogModule.WEATHER_OBSERVATION,
    });

    // Create daily 
    const { startToday, endToday } = getTodayUtcRange();
    const firstAndSecondCardData = await prisma.observingTime.findMany({
      where: {
        AND: [
          {
            utcTime: {
              gte: startToday,
              lte: endToday,
            },
          },
          { stationId: stationRecord.id },
        ],
      },
      include: {
        station: true,
        MeteorologicalEntry: true,
        WeatherObservation: true,
      },
      orderBy: {
        utcTime: "desc",
      },
      take: 100,
    });

    // Calculate Daily Summary
    const getCalculatedDailySummary = generateDailySummary(
      firstAndSecondCardData,
      formattedObservingTime,
      stationRecord.id
    );

    const { dataType, measurements } = getCalculatedDailySummary;

      // Create Daily Summary
      await prisma.dailySummary.create({
        data: {
          dataType: dataType,
          avStationPressure: measurements[0],
          avSeaLevelPressure: measurements[1],
          avDryBulbTemperature: measurements[2],
          avWetBulbTemperature: measurements[3],
          maxTemperature: measurements[4],
          minTemperature: measurements[5],
          totalPrecipitation: measurements[6],
          avDewPointTemperature: measurements[7],
          avRelativeHumidity: measurements[8],
          windSpeed: measurements[9],
          windDirectionCode: measurements[10],
          maxWindSpeed: measurements[11],
          maxWindDirection: measurements[12],
          avTotalCloud: measurements[13],
          lowestVisibility: measurements[14],
          totalRainDuration: measurements[15],
          ObservingTime: {
            connect: {
              id: observingTime.id,
              stationId: stationRecord.id,
            },
          },
        },
      });

    // Log The Action
    await LogAction({
      init: prisma,
      action: LogActionType.CREATE,
      actionText: "Daily Summary Created",
      role: session.user.role!,
      actorId: session.user.id,
      actorEmail: session.user.email,
      module: LogModule.DAILY_SUMMARY,
    });

    // Revalidate time checking
    revalidateTag("time-check");

    return NextResponse.json({
      error: false,
      message: "Observation saved successfully",
      data: { id: saved.id, stationId: stationRecord.id },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: true,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET Daily Summary
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const stationIdParam = searchParams.get("stationId");

    const stationId = stationIdParam || session.user.station?.id;

    if (!stationId && session.user.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Station ID is required" },
        { status: 400 }
      );
    }

    const startTime = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 7));
    startTime.setHours(0, 0, 0, 0);
    const endTime = endDate ? new Date(endDate) : new Date();
    endTime.setHours(23, 59, 59, 999);

    const superFilter = session.user.role === "super_admin";

    const entries = await prisma.observingTime.findMany({
      where: {
        AND: [
          {
            utcTime: {
              gte: startTime,
              lte: endTime,
            },
          },
          ...(superFilter
            ? stationIdParam
              ? [{ stationId: stationIdParam }]
              : []
            : [{ stationId: session.user.station?.id }]),
        ],
      },
      include: {
        station: true,
        user: true,
        MeteorologicalEntry: true,
        WeatherObservation: true,
      },
      orderBy: { utcTime: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, type, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const canEditRecord = (record: any, user: any): boolean => {
      if (!user) return false;

      // If no createdAt date (shouldn't happen with Prisma defaults)
      if (!record.createdAt) return true;

      try {
        const { differenceInDays } = require("date-fns");

        // createdAt is already a Date object from Prisma
        const submissionDate = record.createdAt;
        const now = new Date();
        const daysDifference = differenceInDays(now, submissionDate);

        const role = user.role;
        const userId = user.id;
        const userStationId = user.station?.id;
        const recordStationId = record.ObservingTime?.stationId;
        const recordUserId = record.ObservingTime?.userId;

        if (role === "super_admin") return daysDifference <= 365;
        if (role === "station_admin") {
          return daysDifference <= 30 && userStationId === recordStationId;
        }
        if (role === "observer") {
          return daysDifference <= 1 && userId === recordUserId;
        }
        return false;
      } catch (e) {
        console.warn("Error in canEditRecord:", e);
        return false;
      }
    };

    if (type === "weather") {
      // Handle weather observation update
      const existing = await prisma.weatherObservation.findUnique({
        where: { id },
        include: {
          ObservingTime: {
            include: {
              user: true,
              station: true,
            },
          },
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Weather observation not found" },
          { status: 404 }
        );
      }

      const userRole = session.user.role;
      const userStationId = session.user.station?.id;
      const isOwner = session.user.id === existing.ObservingTime?.userId;

      let canEdit = false;
      if (userRole === "super_admin") canEdit = true;
      else if (
        userRole === "station_admin" &&
        userStationId === existing.ObservingTime?.station?.id
      )
        canEdit = true;
      else if (userRole === "observer" && isOwner) canEdit = true;

      // Add the time-based permission check
      if (canEdit && !canEditRecord(existing, session.user)) {
        return NextResponse.json(
          {
            success: false,
            error: "Editing period has expired for this record",
          },
          { status: 403 }
        );
      }

      if (!canEdit) {
        return NextResponse.json(
          { success: false, error: "Permission denied" },
          { status: 403 }
        );
      }

      const updated = await prisma.weatherObservation.update({
        where: { id },
        data: updateData,
        include: {
          ObservingTime: {
            include: {
              user: true,
              station: true,
            },
          },
        },
      });

      // Revalidate time checking
      revalidateTag("time-check");

      // Log The Action
      const diffData = diff(existing, updated);
      await LogAction({
        init: prisma,
        action: LogActionType.UPDATE,
        actionText: "Weather Observation Updated",
        role: session.user.role!,
        actorId: session.user.id,
        actorEmail: session.user.email,
        module: LogModule.WEATHER_OBSERVATION,
        details: diffData,
      });

      return NextResponse.json({
        success: true,
        message: "Weather observation updated",
        data: updated,
      });
    }
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
