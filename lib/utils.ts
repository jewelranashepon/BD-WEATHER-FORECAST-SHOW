import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a hour code to UTC ISO string (e.g., "12" -> "2025-05-19T12:00:00.000Z")
 */
export function hourToUtc(code: string): string {
  const hour = parseInt(code, 10);
  if (isNaN(hour) || hour < 0 || hour > 23) {
    throw new Error(`Invalid hour code: ${code}`);
  }

  const now = new Date();
  const utcDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour)
  );
  return utcDate.toISOString();
}

/**
 * Converts a UTC ISO string back to hour code (e.g., "2025-05-19T12:00:00.000Z" -> "12")
 */
export function utcToHour(isoString: string): string {
  const date = new Date(isoString);
  const hour = date.getUTCHours(); // always UTC
  return hour.toString().padStart(2, "0");
}

/**
 * Converts a UTC ISO string to Dhaka time (Asia/Dhaka)
 */
export function convertUTCToBDTime(isoString: string): string {
  const utcDate = new Date(isoString);

  // Get the time in Dhaka by adding UTC+6 offset (6 * 60 * 60 * 1000 ms)
  const dhakaOffsetMs = 6 * 60 * 60 * 1000;
  const dhakaDate = new Date(utcDate.getTime() + dhakaOffsetMs);

  return dhakaDate.toISOString();
}

// Get the start and end of today in UTC
export function getTodayUtcRange(): { startToday: Date; endToday: Date } {
  const now = new Date();

  const startToday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  const endToday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  return { startToday, endToday };
}

// Get the start and end of yesterday in UTC
export function getYesterdayRange(): { startYesterday: Date; endYesterday: Date } {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);

  const startYesterday = new Date(
    Date.UTC(
      yesterday.getUTCFullYear(),
      yesterday.getUTCMonth(),
      yesterday.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  const endYesterday = new Date(
    Date.UTC(
      yesterday.getUTCFullYear(),
      yesterday.getUTCMonth(),
      yesterday.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  return { startYesterday, endYesterday };
}

// Get the start and end of today in Bangladesh time
export function getTodayBDRange(): { startToday: Date; endToday: Date } {
  const now = new Date();

  // Convert current UTC time to BDT using Intl
  const bdNowStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now); // Gives: "2025-05-22"

  const [year, month, day] = bdNowStr.split('-').map(Number);

  // Define the start and end of today in BDT (local times)
  const startBDT = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const endBDT = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  // Now treat these as BDT and convert to UTC by subtracting 6 hours
  const startToday = new Date(startBDT.getTime() - 6 * 60 * 60 * 1000);
  const endToday = new Date(endBDT.getTime() - 6 * 60 * 60 * 1000);

  return { startToday, endToday };
}


// Get the start and end of yesterday in Bangladesh time
export function getYesterdayBDRange(): { startYesterday: Date; endYesterday: Date } {
  const now = new Date();

  // Convert now to BDT
  const bdNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  bdNow.setUTCDate(bdNow.getUTCDate() - 1); // Go back one BDT day

  const year = bdNow.getUTCFullYear();
  const month = bdNow.getUTCMonth();
  const day = bdNow.getUTCDate();

  const startYesterday = new Date(Date.UTC(year, month, day, 0, 0, 0) - 6 * 60 * 60 * 1000);
  const endYesterday = new Date(Date.UTC(year, month, day, 23, 59, 59, 999) - 6 * 60 * 60 * 1000);

  return { startYesterday, endYesterday };
}




/**
 * Checks if a given UTC time has passed a specified number of hours
 */
export function hasHoursPassed(savedUtcTime: string, hours: number): boolean {
  const savedDate = new Date(savedUtcTime);
  const now = new Date();

  const diffMs = now.getTime() - savedDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= hours;
}

/**
 * Get the time left until a specified number of hours have passed
 */
export function getTimeDiffInHours(savedUtcTime: string): number {
  const savedDate = new Date(savedUtcTime);
  const now = new Date();

  const diffMs = savedDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return Number(diffHours.toFixed(2));
}


// const startDateParam = startDate ? moment(startDate).utc().add(1, "day").startOf("day").toDate() : null;
// const endDateParam = endDate ? moment(endDate).utc().add(1, "day").endOf("day").toDate() : null;

// const statTime = startDateParam || moment().utc().startOf("day").toDate();
// const endTime = endDateParam || moment().utc().endOf("day").toDate();