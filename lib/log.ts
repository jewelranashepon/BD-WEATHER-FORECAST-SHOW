import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const LogActionType = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

export const LogModule = {
  USER: "USER",
  STATION: "STATION",
  OBSERVING_TIME: "OBSERVING_TIME",
  METEOROLOGICAL_ENTRY: "METEOROLOGICAL_ENTRY",
  WEATHER_OBSERVATION: "WEATHER_OBSERVATION",
  DAILY_SUMMARY: "DAILY_SUMMARY",
  SYNOPTIC_CODE: "SYNOPTIC_CODE",
}


// Type for Prisma Transaction Client
type PrismaTransactionClient = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> | PrismaClient

// Props for LogAction
interface LogActionProps {
  init: PrismaTransactionClient;
  action: string;
  actionText?: string;
  role: string;
  actorId: string;
  targetId?: string;
  actorEmail?: string;
  targetEmail?: string;
  module?: string;
  details?: object;
}

// Function to log actions
export const LogAction = async ({
  init,
  action,
  actionText,
  role,
  actorId,
  targetId,
  actorEmail,
  targetEmail,
  module,
  details,
}: LogActionProps) => {
  try {
    await init.logs.create({
      data: {
        userId: actorId,
        targetId: targetId,
        actorEmail,
        targetEmail,
        role,
        action,
        actionText,
        module,
        details: details,
      },
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
};
