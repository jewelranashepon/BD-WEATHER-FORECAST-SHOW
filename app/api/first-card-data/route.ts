import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/getSession";
import { convertUTCToBDTime, getTodayBDRange, hourToUtc } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import { diff } from "deep-object-diff";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

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
    const localTime = convertUTCToBDTime(formattedObservingTime);

    const dataType =
      typeof data.dataType === "string"
        ? data.dataType
        : Object.values(data.dataType || {}).join("") || "";

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

    // Check if the observation time already exists
    const existingObservingTime = await prisma.observingTime.findFirst({
      where: {
        AND: [
          {
            utcTime: formattedObservingTime,
          },
          {
            stationId: stationRecord.id,
          },
        ],
      },
    });

    if (existingObservingTime) {
      return NextResponse.json(
        {
          error: true,
          message: "Observing time already exists",
        },
        { status: 400 }
      );
    }

    // All Data
    const meteorologicalData = {
      dataType,
      subIndicator: data.subIndicator || "",
      alteredThermometer: data.alteredThermometer || "",
      barAsRead: data.barAsRead || "",
      correctedForIndex: data.correctedForIndex || "",
      heightDifference: data.heightDifference || "",
      correctionForTemp: data.correctionForTemp || "",
      stationLevelPressure: data.stationLevelPressure || "",
      seaLevelReduction: data.seaLevelReduction || "",
      correctedSeaLevelPressure: data.correctedSeaLevelPressure || "",
      afternoonReading: data.afternoonReading || "",
      pressureChange24h: data.pressureChange24h || "",

      dryBulbAsRead: data.dryBulbAsRead || "",
      wetBulbAsRead: data.wetBulbAsRead || "",
      maxMinTempAsRead: data.maxMinTempAsRead || "",

      dryBulbCorrected: data.dryBulbCorrected || "",
      wetBulbCorrected: data.wetBulbCorrected || "",
      maxMinTempCorrected: data.maxMinTempCorrected || "",

      Td: data.Td || "",
      relativeHumidity: data.relativeHumidity || "",

      squallConfirmed: String(data.squallConfirmed ?? ""),
      squallForce: data.squallForce || "",
      squallDirection: String(data.squallDirection) || "",
      squallTime: data.squallTime || "",

      horizontalVisibility: data.horizontalVisibility || "",
      miscMeteors: data.miscMeteors || "",

      pastWeatherW1: data.pastWeatherW1 || "",
      pastWeatherW2: data.pastWeatherW2 || "",
      presentWeatherWW: data.presentWeatherWW || "",

      c2Indicator: data.c2Indicator || "",
      submittedAt: new Date(),
    };

    const [savedEntry, totalCount] = await prisma.$transaction([
      prisma.observingTime.create({
        data: {
          utcTime: formattedObservingTime,
          MeteorologicalEntry: {
            create: {
              ...meteorologicalData,
            },
          },
          station: {
            connect: {
              id: stationRecord.id,
            },
          },
          localTime: localTime,
          user: {
            connect: {
              id: session.user.id,
            },
          },
        },
      }),
      prisma.meteorologicalEntry.count(),
    ]);

    
    // Log The Action
    await LogAction({
      init: prisma,
      action: LogActionType.CREATE,
      actionText: "Meteorological Data Created",
      role: session.user.role!,
      actorId: session.user.id,
      actorEmail: session.user.email,
      module: LogModule.METEOROLOGICAL_ENTRY,
    });

    // Revalidate time checking
    revalidateTag("time-check");

    return NextResponse.json(
      {
        error: false,
        message: "Data saved successfully",
        dataCount: totalCount,
        entry: savedEntry,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error saving meteorological entry:", error);
    return NextResponse.json(
      {
        error: true,
        message: "Failed to save data",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const stationIdParam = searchParams.get("stationId");

    // Use the station ID from the query parameter if provided, otherwise use the user's station
    const stationId = stationIdParam || session.user.station?.id;

    // Super admin can view all stations if no specific station is requested
    if (!stationId && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Station ID is required" },
        { status: 400 }
      );
    }

    const startTime = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 7));
    startTime.setHours(0, 0, 0, 0); // Start of day

    const endTime = endDate ? new Date(endDate) : new Date();
    endTime.setHours(23, 59, 59, 999); // End of day

    const { startToday, endToday } = getTodayBDRange();

    const start = startDate ? startTime : startToday;
    const end = endDate ? endTime : endToday;

    const superFilter = session.user.role === "super_admin";

    const entries = await prisma.observingTime.findMany({
      where: {
        AND: [
          {
            utcTime: {
              gte: start,
              lte: end,
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
        MeteorologicalEntry: true,
      },
      orderBy: {
        utcTime: "desc",
      },
      take: 100,
    });

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching meteorological entries:", error);
    return NextResponse.json(
      { message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Find the existing entry with its related observing time
    const existingEntry = await prisma.meteorologicalEntry.findUnique({
      where: { id },
      include: {
        ObservingTime: {
          include: {
            station: true,
            user: true,
          },
        },
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 });
    }

    // Check permissions
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
        const recordStationId = record.ObservingTime.stationId;
        const recordUserId = record.ObservingTime.userId;

        if (role === "super_admin") return daysDifference <= 365;
        if (role === "station_admin") {
          return daysDifference <= 30 && userStationId === recordStationId;
        }
        if (role === "observer") {
          return daysDifference <= 2 && userId === recordUserId;
        }
        return false;
      } catch (e) {
        console.warn("Error in canEditRecord:", e);
        return false;
      }
    };

    const canEdit = canEditRecord(existingEntry, session.user);
    if (!canEdit) {
      return NextResponse.json(
        {
          message: "You don't have permission to edit this record.",
        },
        { status: 403 }
      );
    }

    // Update the entry
    const updatedEntry = await prisma.meteorologicalEntry.update({
      where: { id },
      data: {
        ...updateData,
      },
      include: {
        ObservingTime: {
          include: {
            station: true,
          },
        },
      },
    });

    // Revalidate time checking
    revalidateTag("time-check");

    // Log The Action
    const diffData = diff(existingEntry, updatedEntry);
    await LogAction({
      init: prisma,
      action: LogActionType.UPDATE,
      actionText: "Meteorological Data Updated",
      role: session.user.role!,
      actorId: session.user.id,
      actorEmail: session.user.email,
      module: LogModule.METEOROLOGICAL_ENTRY,
      details: diffData,
    });

    return NextResponse.json(
      {
        message: "Data updated successfully",
        entry: updatedEntry,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating meteorological entry:", error);
    return NextResponse.json(
      {
        message: "Failed to update data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
