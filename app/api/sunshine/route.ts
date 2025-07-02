import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

export async function POST(req: Request) {
  try {
    const { date, hours, total, stationId: bodyStationId } = await req.json();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const stationId = bodyStationId ?? session.user.station?.id;

    if (!date || !Array.isArray(hours) || typeof total !== "number" || !stationId) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const parsedDate = new Date(date);

    const existing = await prisma.sunshineData.findUnique({
      where: {
        date_stationId: { date: parsedDate, stationId: stationId },
      },
    });

    if (existing) {
      await prisma.sunshineData.update({
        where: {
          date_stationId: { date: parsedDate, stationId: stationId },
        },
        data: {
          hours,
          total,
          userId,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.sunshineData.create({
        data: {
          date: parsedDate,
          hours,
          total,
          stationId: stationId,
          userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sunshine POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stationId = session.user.station?.id;

    const sunshineData = await prisma.sunshineData.findMany({
      where: { stationId: stationId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sunshineData);
  } catch (error) {
    console.error("Sunshine GET error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
