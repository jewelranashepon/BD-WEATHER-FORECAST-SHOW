
"use server"

import fs from "fs"
import path from "path"

export async function saveDailySummeryData(formData: any) {
  try {
    const dataDir = path.join(process.cwd(), "data");

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "daily-summery-data.json");
    let existingData: any[] = [];

    // If the file exists, read and parse existing data
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      existingData = JSON.parse(fileContents);
    }

    // Append the new form data to existing array
    existingData.push({
      ...formData,
      submittedAt: new Date().toISOString(), // Optional: add timestamp to each entry
    });

    // Write back to the same file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return {
      success: true,
      message: "Daily Summery data saved successfully",
      filePath: "data/daily-summery-data.json",
    };
  } catch (error) {
    console.error("Error saving daily summery data:", error);
    return {
      success: false,
      message: "Failed to save daily summery data",
    };
  }
}
