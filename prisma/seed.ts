// prisma/seed.ts

import prisma from "../lib/prisma";
import { stations } from "../data/stations";

async function main() {
  await prisma.$transaction(async (tx) => {
    console.log("🌱 Starting seed...");

  const existingStations = await tx.station.count();

  if (existingStations > 0) {
    // Delete all existing stations first (optional)
    await tx.station.deleteMany();
    console.log("🧹 Cleared existing stations data");
  }


  console.log("🧹 Cleared existing stations data");

  // Create stations in batches
  await tx.station.createMany({
    data: stations,
  });

  console.log(`🎉 Successfully seeded ${stations.length} stations`);
  })
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
