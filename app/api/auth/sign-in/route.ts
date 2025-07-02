import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import moment from "moment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, securityCode, stationId, stationName } =
      body;

    // Validate required fields
    if (
      !email ||
      !password ||
      !role ||
      !securityCode ||
      !stationId ||
      !stationName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Check if the station exists and security code matches
    const station = await prisma.station.findFirst({
      where: { stationId: stationId },
    });

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    if (station.securityCode !== securityCode) {
      return NextResponse.json(
        { error: "Invalid security code" },
        { status: 401 }
      );
    }

    // 2. Check if user exists with the given email and role
    // Use select to explicitly specify which fields to retrieve to avoid schema mismatch issues
    const user = await prisma.users.findFirst({
      where: {
        email,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        Station: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or does not have the requested role" },
        { status: 404 }
      );
    }

    // 3. Check if the user is associated with the station
    if (user.Station.stationId !== stationId) {
      return NextResponse.json(
        { error: "User is not associated with this station" },
        { status: 403 }
      );
    }

    // Check if the user already has an active session (prevent multiple logins)
    const existingSession = await prisma.sessions.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        expiresAt: "desc",
      },
    });

    // Check if session already exist and if not expired (Then don't allow multiple session)
    if (existingSession) {
      const isSessionExpired = moment(existingSession?.expiresAt).isBefore();
      if (!isSessionExpired) {
        return NextResponse.json(
          { error: "You are already logged in from another device" },
          { status: 403 }
        );
      }
    }

    // 4. Authenticate the user using better-auth
    const response = await auth.api.signInEmail({
      asResponse: true,
      body: {
        email,
        password,
      },
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 }
    );
  }
}
