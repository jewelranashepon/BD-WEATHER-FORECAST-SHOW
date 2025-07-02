// "use server"

// import fs from "fs"
// import path from "path"

// export async function saveSynopticCodeData(formData: any) {
//   try {
//     // Create data directory if it doesn't exist
//     const dataDir = path.join(process.cwd(), "data")
//     if (!fs.existsSync(dataDir)) {
//       fs.mkdirSync(dataDir, { recursive: true })
//     }

//     // Generate a unique filename based on timestamp and station
//     const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
//     const stationNo = formData.stationNo || "unknown"
//     const filename = `weather-data-station-${stationNo}-${timestamp}.json`

//     // Write the data to a JSON file
//     fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(formData, null, 2))

//     return {
//       success: true,
//       message: "Weather data saved successfully",
//       filename,
//     }
//   } catch (error) {
//     console.error("Error saving weather data:", error)
//     return {
//       success: false,
//       message: "Failed to save weather data",
//     }
//   }
// }















"use server"

import fs from "fs"
import path from "path"

export async function saveSynopticCodeData(formData: any) {
  try {
    const dataDir = path.join(process.cwd(), "data");

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "synoptic-code-data.json");
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
      message: "Synoptic Code data saved successfully",
      filePath: "data/synoptic-code-data.json",
    };
  } catch (error) {
    console.error("Error saving synoptic code data:", error);
    return {
      success: false,
      message: "Failed to save synoptic code data",
    };
  }
}
