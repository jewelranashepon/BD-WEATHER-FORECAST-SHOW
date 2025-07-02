import { getSession } from "@/lib/getSession";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import prisma from "@/lib/prisma";
import { getTodayUtcRange } from "@/lib/utils";
import { diff } from "deep-object-diff";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // First, find the ObservingTime record by its UTC time
    const { startToday, endToday } = getTodayUtcRange();
    // First, find the ObservingTime record by its UTC time
    const observingTime = await prisma.observingTime.findFirst({
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
      select: {
        id: true,
        utcTime: true,
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

    if (!observingTime) {
      return NextResponse.json({
        success: false,
        error: "No observing time for today",
        status: 404,
      });
    }

    if (
      observingTime &&
      !observingTime._count.MeteorologicalEntry &&
      !observingTime._count.WeatherObservation
    ) {
      return NextResponse.json({
        success: false,
        error:
          "Meteorological entry and weather observation are not available for this time",
        status: 400,
      });
    }

    if (observingTime && observingTime._count.DailySummary > 0) {
      return NextResponse.json({
        success: false,
        error: "Daily summary already exists for this time",
        status: 400,
      });
    }

    // Get station ID from session
    const stationId = session.user.station?.id;
    if (!stationId) {
      return NextResponse.json({
        success: false,
        error: "Station ID is required",
        status: 400,
      });
    }

    // Find the station by stationId to get its primary key (id)
    const stationRecord = await prisma.station.findFirst({
      where: { id: stationId },
    });

    if (!stationRecord) {
      return NextResponse.json({
        success: false,
        error: `No station found with ID: ${stationId}`,
        status: 404,
      });
    }

    const entry = await prisma.dailySummary.create({
      data: {
        dataType: body.dataType,
        avStationPressure: body.measurements?.[0] || null,
        avSeaLevelPressure: body.measurements?.[1] || null,
        avDryBulbTemperature: body.measurements?.[2] || null,
        avWetBulbTemperature: body.measurements?.[3] || null,
        maxTemperature: body.measurements?.[4] || null,
        minTemperature: body.measurements?.[5] || null,
        totalPrecipitation: body.measurements?.[6] || null,
        avDewPointTemperature: body.measurements?.[7] || null,
        avRelativeHumidity: body.measurements?.[8] || null,
        windSpeed: body.measurements?.[9] || null,
        windDirectionCode: body.windDirection || null,
        maxWindSpeed: body.measurements?.[11] || null,
        maxWindDirection: body.measurements?.[12] || null,
        avTotalCloud: body.measurements?.[13] || null,
        lowestVisibility: body.measurements?.[14] || null,
        totalRainDuration: body.measurements?.[15] || null,
        ObservingTime: {
          connect: {
            id: observingTime?.id,
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

    return NextResponse.json({
      success: true,
      message: "Daily summary saved successfully",
    });
  } catch (err) {
    console.error("❌ DB save error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save data",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await getSession();

  if (!session || !session.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const stationIdParam = searchParams.get("stationId"); // optional

  const startTime = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(new Date().getDate() - 7));
  startTime.setHours(0, 0, 0, 0);

  const endTime = endDate ? new Date(endDate) : new Date();
  endTime.setHours(23, 59, 59, 999);

  const superFilter = session.user.role === "super_admin";

  try {
    const rawSummaries = await prisma.dailySummary.findMany({
      where: {
        AND: [
          {
            ObservingTime: {
              utcTime: {
                gte: startTime,
                lte: endTime,
              },
            },
          },
          ...(superFilter
            ? stationIdParam
              ? [{ ObservingTime: { stationId: stationIdParam } }]
              : []
            : [{ ObservingTime: { stationId: session.user.station?.id } }]),
        ],
      },
      orderBy: {
        ObservingTime: {
          utcTime: "desc",
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

    console.log("Raw Summaries:", rawSummaries);

    // Group by stationId + date
    const grouped: Record<string, any[]> = {};

    for (const entry of rawSummaries) {
      const stationId = entry.ObservingTime.stationId;
      const dateKey = new Date(entry.ObservingTime.utcTime)
        .toISOString()
        .split("T")[0]; // "YYYY-MM-DD"
      const key = `${stationId}_${dateKey}`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    }

    const averagedSummaries = Object.values(grouped).map((entries) => {
      const first = entries[0];

      const averageField = (field: keyof typeof first, factor = 1) => {
        const values = entries
          .map((e) => parseFloat(e[field] as any))
          .filter((v) => !isNaN(v));
        if (values.length === 0) return null;
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return (avg / factor).toFixed(1);
      };

      return {
        ...first,
        maxTemperature: averageField("maxTemperature", 10),
        minTemperature: averageField("minTemperature", 10),
        totalPrecipitation: averageField("totalPrecipitation"),
        windSpeed: averageField("windSpeed"),
        avTotalCloud: averageField("avTotalCloud"),
        totalRainDuration: averageField("totalRainDuration"),
        avRelativeHumidity: averageField("avRelativeHumidity"),
        lowestVisibility: averageField("lowestVisibility"),
      };
    });

    return NextResponse.json(averagedSummaries);
  } catch (error) {
    console.error("Error fetching daily summary data:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, ObservingTime, ...updateData } = body;

    const existingRecord = await prisma.dailySummary.findUnique({
      where: { id },
      include: { ObservingTime: true },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: "Record not found" },
        { status: 404 }
      );
    }

    const userStationId = session.user.station?.id;
    const recordStationId = existingRecord.ObservingTime?.stationId;

    if (
      session.user.role !== "super_admin" &&
      userStationId !== recordStationId
    ) {
      return NextResponse.json(
        { success: false, error: "Permission denied" },
        { status: 403 }
      );
    }

    const updatedRecord = await prisma.dailySummary.update({
      where: { id },
      data: updateData,
    });

    // Log The Action
    const diffData = diff(existingRecord, updatedRecord);
    await LogAction({
      init: prisma,
      action: LogActionType.UPDATE,
      actionText: "Daily Summary Updated",
      role: session.user.role!,
      actorId: session.user.id,
      actorEmail: session.user.email,
      module: LogModule.DAILY_SUMMARY,
      details: diffData,
    });

    return NextResponse.json(
      { success: true, data: updatedRecord },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating daily summary record:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
