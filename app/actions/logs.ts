"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function getLogs({
  limit = 10,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const session = await getSession();

    if (!session) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }

    // Define the where condition based on user role
    const whereCondition = {
      AND: [
        {
          role: session.user.role === "super_admin" ? undefined : "observer",
        },
        {
          actor: {
            stationId: session.user.role === "super_admin" ? undefined : session.user.station?.id,
          },
        },
      ],
    };

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.logs.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
        include: {
          actor: true,
          targetUser: true,
        },
      }),
      prisma.logs.count({
        where: whereCondition,
      }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error("Error fetching logs:", error);
    return {
      error: `Failed to fetch logs: ${error}`,
      status: 500,
    };
  }
}
