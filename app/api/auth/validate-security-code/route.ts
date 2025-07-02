import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { securityCode } = await request.json();

    if (!securityCode) {
      return NextResponse.json(
        { valid: false, message: "Security code is required" },
        { status: 400 }
      );
    }

    // Check if the security code exists in the database
    const user = await prisma.users.findFirst({
      where: {
        securityCode,
      },
    });

    if (user) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, message: "Invalid security code" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error validating security code:", error);
    return NextResponse.json(
      {
        valid: false,
        message: "An error occurred while validating the security code",
      },
      { status: 500 }
    );
  }
}
