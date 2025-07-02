import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/getSession";
import { getTodayBDRange, getTodayUtcRange } from "@/lib/utils";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import { diff } from "deep-object-diff";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { startToday, endToday } = getTodayUtcRange();
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

    if (observingTime && observingTime._count.SynopticCode > 0) {
      return NextResponse.json({
        success: false,
        error: "Synoptic code already exists for this time",
        status: 400,
      });
    }

    const stationId = session.user.station?.stationId;
    if (!stationId) {
      return NextResponse.json({
        success: false,
        error: "Station ID is required",
        status: 400,
      });
    }

    const stationRecord = await prisma.station.findFirst({
      where: { id: session.user.station?.id },
    });

    if (!stationRecord) {
      return NextResponse.json({
        success: false,
        error: `No station found with ID: ${stationId}`,
        status: 404,
      });
    }

    const newEntry = await prisma.synopticCode.create({
      data: {
        dataType: body.dataType || "SYNOP",
        C1: body.C1 || null,
        Iliii: body.Iliii || null,
        iRiXhvv: body.iRiXhvv || null,
        Nddff: body.Nddff || null,
        S1nTTT: body.S1nTTT || null,
        S2nTddTddTdd: body.S2nTddTddTdd || null,
        P3PPP4PPPP: body.P3PPP4PPPP || null,
        RRRtR6: body.RRRtR6 || null,
        wwW1W2: body.wwW1W2 || null,
        NhClCmCh: body.NhClCmCh || null,
        S2nTnTnTnInInInIn: body.S2nTnTnTnInInInIn || null,
        D56DLDMDH: body.D56DLDMDH || null,
        CD57DaEc: body.CD57DaEc || null,
        avgTotalCloud: body.avgTotalCloud || null,
        C2: body.C2 || null,
        GG: body.GG || null,
        P24Group58_59: body.P24Group58_59 || null,
        R24Group6_7: body.R24Group6_7 || null,
        NsChshs: body.NsChshs || null,
        dqqqt90: body.dqqqt90 || null,
        fqfqfq91: body.fqfqfq91 || null,
        weatherRemark: body.weatherRemark || null,
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
      actionText: "Synoptic Code Created",
      role: session.user.role!,
      actorId: session.user.id,
      actorEmail: session.user.email,
      module: LogModule.SYNOPTIC_CODE,
    });

    return NextResponse.json(
      { success: true, message: "Synoptic entry saved", data: newEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save synoptic entry:", error);
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
  const stationIdParam = searchParams.get("stationId");

  const userStationId = session.user.station?.id;
  const isSuperAdmin = session.user.role === "super_admin";

const startTime = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 7));
    startTime.setHours(0, 0, 0, 0); // Start of day

    const endTime = endDate ? new Date(endDate) : new Date();
    endTime.setHours(23, 59, 59, 999); // End of day

    const { startToday, endToday } = getTodayBDRange();

    const start = startDate ? startTime : startToday;
    const end = endDate ? endTime : endToday;

  // Determine which station ID to use
  const stationId = stationIdParam || (!isSuperAdmin ? userStationId : undefined);

  // For non-super admins, station ID is mandatory
  if (!stationId && !isSuperAdmin) {
    return NextResponse.json(
      { message: "Station ID is required" },
      { status: 400 }
    );
  }

  try {
    const entries = await prisma.synopticCode.findMany({
      where: {
        ObservingTime: {
          ...(stationId ? { stationId } : {}), // Optional station filter
          utcTime: {
            gte: start,
            lte: end,
          },
        },
      },
      include: {
        ObservingTime: {
          include: {
            station: true,
          },
        },
      },
      orderBy: {
        ObservingTime: {
          utcTime: "desc",
        },
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching synoptic data:", error);
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

    const existingRecord = await prisma.synopticCode.findUnique({
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

    if (session.user.role !== "super_admin" && userStationId !== recordStationId) {
      return NextResponse.json(
        { success: false, error: "Permission denied" },
        { status: 403 }
      );
    }

    const updatedRecord = await prisma.synopticCode.update({
      where: { id },
      data: updateData,
    });

    // Log The Action
    const diffData = diff(existingRecord, updatedRecord);
    await LogAction({
      init: prisma,
      action: LogActionType.UPDATE,
      actionText: "Synoptic Code Updated",
      role: session.user.role!,
      actorId: session.user.id,
      actorEmail: session.user.email,
      module: LogModule.SYNOPTIC_CODE,
      details: diffData,
    });

    return NextResponse.json(
      { success: true, data: updatedRecord },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating synoptic record:", error);
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
