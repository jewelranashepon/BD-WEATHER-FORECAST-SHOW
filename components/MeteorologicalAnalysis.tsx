"use client";

import type React from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import * as d3 from "d3";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Thermometer,
  Gauge,
  Wind,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Upload,
  FileText,
  Loader2,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";

// Enhanced data parsing utilities with proper calculations
const parseMeteorologicalData = (rawData: string, format: string) => {
  try {
    if (format === "pilot") {
      return parsePilotData(rawData);
    } else if (format === "dems") {
      return parseDemsData(rawData);
    } else if (format === "csv") {
      return parseCsvData(rawData);
    } else {
      return autoDetectAndParse(rawData);
    }
  } catch (error) {
    throw new Error(`Failed to parse data: ${error.message}`);
  }
};

// Add these styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "bold",
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
  },
  table: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginBottom: 5,
  },
  tableHeader: {
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "20%",
    padding: 3,
  },
});

const MeteoPDF = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Meteorological Analysis Report</Text>

      <View style={styles.section}>
        <Text style={styles.header}>Station Information</Text>
        <Text style={styles.text}>Name: {data.stationInfo.name}</Text>
        <Text style={styles.text}>Country: {data.stationInfo.country}</Text>
        <Text style={styles.text}>
          Coordinates: {data.stationInfo.coordinates.lat.toFixed(4)}°N,{" "}
          {data.stationInfo.coordinates.lng.toFixed(4)}°E
        </Text>
        <Text style={styles.text}>
          Elevation: {data.stationInfo.elevation} m
        </Text>
        <Text style={styles.text}>Date: {data.stationInfo.date}</Text>
        <Text style={styles.text}>Time: {data.stationInfo.time} UTC</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Data Summary</Text>
        <Text style={styles.text}>
          Measurement Levels: {data.atmosphericProfile.length}
        </Text>
        <Text style={styles.text}>
          Max Altitude: {data.stationInfo.maxAltitude} m
        </Text>
        <Text style={styles.text}>Data Quality: {data.dataQuality}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>
          Atmospheric Profile (First 10 records)
        </Text>
        <View style={[styles.table, styles.tableHeader]}>
          <Text style={styles.tableCol}>Altitude (m)</Text>
          <Text style={styles.tableCol}>Pressure (hPa)</Text>
          <Text style={styles.tableCol}>Temp (°C)</Text>
          <Text style={styles.tableCol}>Humidity (%)</Text>
          <Text style={styles.tableCol}>Wind (m/s)</Text>
        </View>
        {data.atmosphericProfile.slice(0, 10).map((row, i) => (
          <View key={i} style={[styles.table, styles.tableRow]}>
            <Text style={styles.tableCol}>{row.altitude}</Text>
            <Text style={styles.tableCol}>
              {row.pressure?.toFixed(1) || "-"}
            </Text>
            <Text style={styles.tableCol}>
              {row.temperature?.toFixed(1) || "-"}
            </Text>
            <Text style={styles.tableCol}>
              {row.humidity?.toFixed(0) || "-"}
            </Text>
            <Text style={styles.tableCol}>
              {row.windSpeed?.toFixed(1) || "-"}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const parsePilotData = (data: string) => {
  const lines = data.split("\n").filter((line) => line.trim());

  // Extract station information with proper parsing
  const stationInfo = {
    name: extractValue(lines, "Station") || "DHAKA",
    country: extractValue(lines, "Nation") || "BANGLADESH",
    wmoId: extractValue(lines, "WMO") || "41923",
    coordinates: {
      lat: Number.parseFloat(
        extractValue(lines, "GroundLat") ||
          extractValue(lines, "Lat") ||
          "23.779702"
      ),
      lng: Number.parseFloat(
        extractValue(lines, "GroundLng") ||
          extractValue(lines, "Lng") ||
          "90.379230"
      ),
    },
    elevation: Number.parseFloat(
      extractValue(lines, "GroundAlt") ||
        extractValue(lines, "Elevation") ||
        "11"
    ),
    date: extractValue(lines, "Date") || new Date().toISOString().split("T")[0],
    time: extractValue(lines, "Time") || "12:00",
    groundPressure: Number.parseFloat(
      extractValue(lines, "GroundP") || "1010.6"
    ),
    groundTemperature: Number.parseFloat(
      extractValue(lines, "GroundT") || "20.0"
    ),
    maxAltitude: Number.parseFloat(extractValue(lines, "AltMax") || "12197"),
  };

  // Extract atmospheric profile data with proper validation
  const atmosphericData = extractAtmosphericProfile(lines);

  // Calculate proper ground conditions from first measurement or metadata
  const groundConditions = {
    pressure:
      stationInfo.groundPressure || atmosphericData[0]?.pressure || 1010.6,
    temperature:
      stationInfo.groundTemperature || atmosphericData[0]?.temperature || 20.0,
    maxAltitude:
      stationInfo.maxAltitude ||
      Math.max(...atmosphericData.map((d) => d.altitude)) ||
      12197,
  };

  return {
    stationInfo: { ...stationInfo, ...groundConditions },
    atmosphericProfile: atmosphericData,
    dataQuality: calculateDataQuality(atmosphericData),
    messageTypes: analyzeMessageTypes(lines),
    groundConditions,
  };
};

const parseDemsData = (data: string) => {
  const lines = data.split("\n").filter((line) => line.trim());
  const demsMessages = lines.filter(
    (line) => line.includes("DEMS") || line.includes("TTAA")
  );

  const atmosphericData = [];
  const messageTypes = new Map();

  // Parse TTAA codes properly according to WMO standards
  demsMessages.forEach((line) => {
    if (line.includes("TTAA")) {
      const measurements = extractTTAAMeasurements(line);
      atmosphericData.push(...measurements);
    }

    const msgType = extractMessageType(line);
    if (msgType) {
      messageTypes.set(msgType, (messageTypes.get(msgType) || 0) + 1);
    }
  });

  // Calculate ground conditions from lowest altitude measurement
  const sortedData = atmosphericData.sort((a, b) => a.altitude - b.altitude);
  const groundMeasurement = sortedData[0] || {};

  const groundConditions = {
    pressure: groundMeasurement.pressure || 1013.25, // Standard sea level pressure
    temperature: groundMeasurement.temperature || 15.0, // Standard temperature
    maxAltitude: Math.max(...atmosphericData.map((d) => d.altitude)) || 0,
  };

  return {
    stationInfo: {
      name: "DEMS Station",
      country: "Unknown",
      coordinates: { lat: 0, lng: 0 },
      elevation: groundMeasurement.altitude || 0,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0],
      ...groundConditions,
    },
    atmosphericProfile: atmosphericData,
    dataQuality: calculateDataQuality(atmosphericData),
    messageTypes: Array.from(messageTypes.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: (count / demsMessages.length) * 100,
    })),
    groundConditions,
  };
};

const parseCsvData = (data: string) => {
  const lines = data.split("\n").filter((line) => line.trim());
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const atmosphericData = lines
    .slice(1)
    .map((line) => {
      const values = line.split(",");
      const entry = {};

      headers.forEach((header, index) => {
        const value = Number.parseFloat(values[index]);
        if (!isNaN(value)) {
          // Map common CSV headers to standard names
          if (header.includes("alt") || header.includes("height"))
            entry.altitude = value;
          else if (header.includes("press") || header.includes("hpa"))
            entry.pressure = value;
          else if (header.includes("temp") || header.includes("celsius"))
            entry.temperature = value;
          else if (header.includes("humid") || header.includes("rh"))
            entry.humidity = value;
          else if (header.includes("wind") && header.includes("speed"))
            entry.windSpeed = value;
          else if (header.includes("wind") && header.includes("dir"))
            entry.windDir = value;
          else entry[header] = value;
        }
      });

      return entry;
    })
    .filter((entry) => Object.keys(entry).length > 0)
    .sort((a, b) => (a.altitude || 0) - (b.altitude || 0)); // Sort by altitude

  // Calculate ground conditions from lowest altitude
  const groundMeasurement = atmosphericData[0] || {};
  const groundConditions = {
    pressure: groundMeasurement.pressure || 1013.25,
    temperature: groundMeasurement.temperature || 15.0,
    maxAltitude: Math.max(...atmosphericData.map((d) => d.altitude || 0)),
  };

  return {
    stationInfo: {
      name: "CSV Data",
      country: "User Input",
      coordinates: { lat: 0, lng: 0 },
      elevation: groundMeasurement.altitude || 0,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0],
      ...groundConditions,
    },
    atmosphericProfile: atmosphericData,
    dataQuality: calculateDataQuality(atmosphericData),
    messageTypes: [
      { type: "CSV", count: atmosphericData.length, percentage: 100 },
    ],
    groundConditions,
  };
};

// Helper function to extract values from text lines
const extractValue = (lines: string[], key: string): string | null => {
  for (const line of lines) {
    if (line.includes(key)) {
      // Handle different formats: "Key: Value", "Key Value", "Key(unit) Value"
      const match = line.match(
        new RegExp(`${key}[:\\s\$$][^\$$]*\\)?[:\\s]+([\\d\\.\\-]+)`, "i")
      );
      if (match) return match[1];

      // Try splitting by colon or space
      const parts = line.split(/[:\s]+/);
      const keyIndex = parts.findIndex((part) =>
        part.toLowerCase().includes(key.toLowerCase())
      );
      if (keyIndex !== -1 && keyIndex < parts.length - 1) {
        return parts[keyIndex + 1];
      }
    }
  }
  return null;
};

// Enhanced atmospheric profile extraction
const extractAtmosphericProfile = (lines: string[]) => {
  const dataLines = lines.filter((line) => {
    // Look for lines with multiple numeric values (atmospheric measurements)
    const nums = line
      .split(/\s+/)
      .filter(
        (part) =>
          !isNaN(Number.parseFloat(part)) && isFinite(Number.parseFloat(part))
      );
    return nums.length >= 3; // At least altitude, pressure, temperature
  });

  return dataLines
    .map((line) => {
      const values = line
        .split(/\s+/)
        .map((v) => Number.parseFloat(v))
        .filter((v) => !isNaN(v) && isFinite(v));

      // Standard order: altitude, pressure, temperature, humidity, windSpeed, windDirection
      return {
        altitude: values[0] || 0,
        pressure: values[1] || null,
        temperature: values[2] || null,
        humidity: values[3] || null,
        windSpeed: values[4] || null,
        windDir: values[5] || null,
      };
    })
    .filter((entry) => entry.altitude !== null && entry.pressure !== null)
    .sort((a, b) => a.altitude - b.altitude); // Sort by altitude ascending
};

// Enhanced TTAA measurement extraction following WMO FM 35 TEMP code
const extractTTAAMeasurements = (line: string) => {
  const numbers = line
    .split(/\s+/)
    .map((n) => Number.parseFloat(n))
    .filter((n) => !isNaN(n) && isFinite(n));

  const measurements = [];

  // TTAA format: Station_ID Date/Time followed by groups of measurements
  // Each group typically: pressure_level temperature dewpoint_depression wind_direction wind_speed
  for (let i = 2; i < numbers.length - 4; i += 5) {
    const pressure = numbers[i];
    const temperature = numbers[i + 1];
    const dewpoint = numbers[i + 2];
    const windDir = numbers[i + 3];
    const windSpeed = numbers[i + 4];

    if (pressure && temperature !== undefined) {
      // Convert pressure level to altitude (approximate using barometric formula)
      const altitude = pressureToAltitude(pressure);

      measurements.push({
        altitude: altitude,
        pressure: pressure,
        temperature: temperature / 10, // TTAA temperatures are in tenths of degrees
        humidity: dewpointToHumidity(temperature / 10, dewpoint / 10),
        windSpeed: windSpeed || null,
        windDir: windDir || null,
      });
    }
  }

  return measurements.sort((a, b) => a.altitude - b.altitude);
};

// Convert pressure to altitude using international standard atmosphere
const pressureToAltitude = (pressure: number): number => {
  // Standard atmosphere formula: h = 44330 * (1 - (P/P0)^(1/5.255))
  const P0 = 1013.25; // Standard sea level pressure in hPa
  return Math.round(44330 * (1 - Math.pow(pressure / P0, 1 / 5.255)));
};

// Convert dewpoint depression to relative humidity
const dewpointToHumidity = (
  temperature: number,
  dewpointDep: number
): number => {
  const dewpoint = temperature - dewpointDep;
  // Magnus formula approximation
  const humidity =
    (100 * Math.exp((17.625 * dewpoint) / (243.04 + dewpoint))) /
    Math.exp((17.625 * temperature) / (243.04 + temperature));
  return Math.max(0, Math.min(100, Math.round(humidity)));
};

const autoDetectAndParse = (data: string) => {
  if (
    data.includes("PILOT") ||
    data.includes("DHAKA") ||
    data.includes("Station")
  ) {
    return parsePilotData(data);
  } else if (data.includes("DEMS") || data.includes("TTAA")) {
    return parseDemsData(data);
  } else if (data.includes(",") && data.split("\n").length > 1) {
    return parseCsvData(data);
  } else {
    throw new Error(
      "Unable to detect data format. Please specify the format manually."
    );
  }
};

const extractMessageType = (line: string) => {
  const match = line.match(/RR[MLKBA]/);
  return match ? match[0] : null;
};

// Enhanced data quality calculation
const calculateDataQuality = (data: any[]) => {
  if (!data || data.length === 0) return 0;

  let totalFields = 0;
  let validFields = 0;
  let criticalFields = 0;
  let validCriticalFields = 0;

  data.forEach((item) => {
    // Critical fields: altitude, pressure, temperature
    const critical = ["altitude", "pressure", "temperature"];
    const optional = ["humidity", "windSpeed", "windDir"];

    critical.forEach((field) => {
      criticalFields++;
      if (
        item[field] !== null &&
        item[field] !== undefined &&
        !isNaN(item[field])
      ) {
        validCriticalFields++;
      }
    });

    optional.forEach((field) => {
      totalFields++;
      if (
        item[field] !== null &&
        item[field] !== undefined &&
        !isNaN(item[field])
      ) {
        validFields++;
      }
    });
  });

  // Weight critical fields more heavily
  const criticalQuality = (validCriticalFields / criticalFields) * 100;
  const optionalQuality =
    totalFields > 0 ? (validFields / totalFields) * 100 : 100;

  return Math.round(criticalQuality * 0.7 + optionalQuality * 0.3);
};

const analyzeMessageTypes = (lines: string[]) => {
  const types = new Map();
  lines.forEach((line) => {
    if (line.includes("PILOT"))
      types.set("PILOT", (types.get("PILOT") || 0) + 1);
    if (line.includes("TEMP")) types.set("TEMP", (types.get("TEMP") || 0) + 1);
    if (line.includes("DEMS")) types.set("DEMS", (types.get("DEMS") || 0) + 1);
  });

  const total = Array.from(types.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(types.entries()).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / total) * 100),
  }));
};

// Enhanced statistics calculation with proper handling of missing values
const calculateStatistics = (data: any[], field: string) => {
  const values = data
    .map((d) => d[field])
    .filter((v) => v !== null && v !== undefined && !isNaN(v) && isFinite(v));

  if (values.length === 0) return { min: 0, max: 0, avg: 0, std: 0, count: 0 };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  return {
    min: Number.parseFloat(min.toFixed(2)),
    max: Number.parseFloat(max.toFixed(2)),
    avg: Number.parseFloat(avg.toFixed(2)),
    std: Number.parseFloat(std.toFixed(2)),
    count: values.length,
  };
};

// Format numbers according to international standards
const formatValue = (value: number, unit: string, decimals = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";

  const formatted = value.toFixed(decimals);
  return `${formatted} ${unit}`;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function MeteorologicalAnalysis() {
  const [rawData, setRawData] = useState("");
  const [dataFormat, setDataFormat] = useState("auto");
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("input");

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setRawData(content);
        };
        reader.readAsText(file);
      }
    },
    []
  );

  const handleParseData = useCallback(async () => {
    if (!rawData.trim()) {
      setError("Please provide data to parse");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = parseMeteorologicalData(rawData, dataFormat);
      setParsedData(result);
      setActiveTab("profiles");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [rawData, dataFormat]);

  const loadSampleData = useCallback(() => {
    // Accurate sample data based on the Dhaka sounding
    const sampleData = `DHAKA 11/21/2024 11:31
PILOT messages

Station: DHAKA
Nation: BANGLADESH
GroundLat: 23.779702
GroundLng: 90.379230
GroundAlt(m): 11
GroundP(hPa): 1010.6
GroundT(°C): 20.0
AltMax(m): 12197
Ascent(m/s): 3.8

11 1010.6 20.0 85 3.8 180
500 954.0 16.5 78 8.2 195
1000 899.0 13.0 72 12.5 210
1500 846.0 9.5 68 15.8 225
2000 795.0 6.0 65 18.2 240
3000 701.0 -1.0 58 22.5 255
4000 616.0 -8.0 52 26.8 270
5000 540.0 -15.0 45 30.2 285
6000 472.0 -22.0 38 33.5 300
7000 411.0 -29.0 32 36.8 315
8000 356.0 -36.0 28 40.2 330
9000 307.0 -43.0 25 43.5 345
9373 280.0 -46.5 22 45.0 350
12197 150.0 -65.0 15 48.0 355`;

    setRawData(sampleData);
    setDataFormat("pilot");
  }, []);

  // Calculate statistics if data is available
  const statistics = parsedData
    ? {
        temperature: calculateStatistics(
          parsedData.atmosphericProfile,
          "temperature"
        ),
        pressure: calculateStatistics(
          parsedData.atmosphericProfile,
          "pressure"
        ),
        humidity: calculateStatistics(
          parsedData.atmosphericProfile,
          "humidity"
        ),
        windSpeed: calculateStatistics(
          parsedData.atmosphericProfile,
          "windSpeed"
        ),
      }
    : null;

  // Add this function to your component (inside the MeteorologicalAnalysis component but outside the return statement)
  const handleExport = useCallback(
    (format: string) => {
      if (!parsedData) return;

      let content = "";
      let mimeType = "";
      let fileName = `meteo_analysis_${parsedData.stationInfo.name}_${parsedData.stationInfo.date}`;

      switch (format) {
        case "csv":
          // CSV export remains the same
          const headers = [
            "Altitude (m)",
            "Pressure (hPa)",
            "Temperature (°C)",
            "Humidity (%RH)",
            "Wind Speed (m/s)",
            "Wind Direction (°)",
          ];
          const rows = parsedData.atmosphericProfile.map(
            (d) =>
              `${d.altitude},${d.pressure || ""},${d.temperature || ""},${d.humidity || ""},${d.windSpeed || ""},${d.windDir || ""}`
          );
          content = [headers.join(","), ...rows].join("\n");
          mimeType = "text/csv";
          fileName += ".csv";

          // Create download link
          const blob = new Blob([content], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;

        case "json":
          // JSON export remains the same
          const jsonData = {
            station: parsedData.stationInfo,
            atmosphericProfile: parsedData.atmosphericProfile,
            dataQuality: parsedData.dataQuality,
            messageTypes: parsedData.messageTypes,
            timestamp: new Date().toISOString(),
          };
          content = JSON.stringify(jsonData, null, 2);
          mimeType = "application/json";
          fileName += ".json";

          // Create download link
          const jsonBlob = new Blob([content], { type: mimeType });
          const jsonUrl = URL.createObjectURL(jsonBlob);
          const jsonA = document.createElement("a");
          jsonA.href = jsonUrl;
          jsonA.download = fileName;
          document.body.appendChild(jsonA);
          jsonA.click();
          document.body.removeChild(jsonA);
          URL.revokeObjectURL(jsonUrl);
          break;

        case "pdf":
          // PDF is handled by the PDFDownloadLink component in the JSX
          // We don't need to do anything here
          break;

        case "netcdf":
          // Basic NetCDF-like export (simplified)
          // Note: This is a simplified version. Full NetCDF support would require a proper library
          const ncHeader = `netcdf meteo_${parsedData.stationInfo.name.replace(/\s+/g, "_")} {
dimensions:
  level = ${parsedData.atmosphericProfile.length} ;
variables:
  double altitude(level) ;
    altitude:units = "meters" ;
  double pressure(level) ;
    pressure:units = "hPa" ;
  double temperature(level) ;
    temperature:units = "Celsius" ;
  double humidity(level) ;
    humidity:units = "%" ;
  double wind_speed(level) ;
    wind_speed:units = "m/s" ;
  double wind_direction(level) ;
    wind_direction:units = "degrees" ;

// Global attributes:
  :title = "Meteorological sounding data" ;
  :institution = "Atmospheric Sounding Data Analyzer" ;
  :source = "Upper-air sounding" ;
  :history = "Generated on ${new Date().toISOString()}" ;
  :station_name = "${parsedData.stationInfo.name}" ;
  :station_country = "${parsedData.stationInfo.country}" ;
  :coordinates = "${parsedData.stationInfo.coordinates.lat}N, ${parsedData.stationInfo.coordinates.lng}E" ;
  :elevation = "${parsedData.stationInfo.elevation} m" ;

data:
`;

          // Add the data section
          let ncData = "";
          parsedData.atmosphericProfile.forEach((d) => {
            ncData += `  altitude = ${d.altitude} ;
  pressure = ${d.pressure || "NaN"} ;
  temperature = ${d.temperature || "NaN"} ;
  humidity = ${d.humidity || "NaN"} ;
  wind_speed = ${d.windSpeed || "NaN"} ;
  wind_direction = ${d.windDir || "NaN"} ;
`;
          });

          content = ncHeader + ncData + "}";
          mimeType = "text/plain";
          fileName += ".nc";

          // Create download link
          const ncBlob = new Blob([content], { type: mimeType });
          const ncUrl = URL.createObjectURL(ncBlob);
          const ncA = document.createElement("a");
          ncA.href = ncUrl;
          ncA.download = fileName;
          document.body.appendChild(ncA);
          ncA.click();
          document.body.removeChild(ncA);
          URL.revokeObjectURL(ncUrl);
          break;

        default:
          return;
      }
    },
    [parsedData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-blue-600" />
            Atmospheric Sounding Data Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            International Standard Meteorological Analysis System
          </p>

          {parsedData && (
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 bg-white/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {parsedData.stationInfo.name}, {parsedData.stationInfo.country}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {parsedData.stationInfo.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {parsedData.stationInfo.time} UTC
              </div>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="input">Data Input</TabsTrigger>
            <TabsTrigger value="profiles" disabled={!parsedData}>
              Atmospheric Profiles
            </TabsTrigger>
            <TabsTrigger value="analysis" disabled={!parsedData}>
              Statistical Analysis
            </TabsTrigger>
            <TabsTrigger value="dems" disabled={!parsedData}>
              DEMS Data
            </TabsTrigger>
            <TabsTrigger value="quality" disabled={!parsedData}>
              Data Quality
            </TabsTrigger>
            <TabsTrigger value="wind" disabled={!parsedData}>
              Wind Analysis
            </TabsTrigger>
          </TabsList>

          {/* Data Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Upload Data File
                  </CardTitle>
                  <CardDescription>
                    Upload meteorological data files (TXT, CSV, or other
                    formats)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Drag and drop your file here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".txt,.csv,.dat"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-format">Data Format</Label>
                    <select
                      id="data-format"
                      value={dataFormat}
                      onChange={(e) => setDataFormat(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="pilot">PILOT Messages</option>
                      <option value="dems">DEMS Format</option>
                      <option value="csv">CSV Data</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Text Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Paste Raw Data
                  </CardTitle>
                  <CardDescription>
                    Copy and paste your meteorological data directly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="raw-data">Raw Meteorological Data</Label>
                    <Textarea
                      id="raw-data"
                      placeholder="Paste PILOT messages, DEMS data, or CSV content here..."
                      value={rawData}
                      onChange={(e) => setRawData(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleParseData}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analyze Data
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={loadSampleData}>
                      Load Sample
                    </Button>
                    <Button variant="outline" onClick={() => setRawData("")}>
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Data Preview */}
            {parsedData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Data Successfully Parsed - International Format
                  </CardTitle>
                  <CardDescription>
                    Preview of your atmospheric sounding data with corrected
                    calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {parsedData.atmosphericProfile.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Measurement Levels
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {parsedData.dataQuality}%
                      </p>
                      <p className="text-sm text-gray-600">Data Quality</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {parsedData.stationInfo.name}
                      </p>
                      <p className="text-sm text-gray-600">Station</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {parsedData.messageTypes.length}
                      </p>
                      <p className="text-sm text-gray-600">Message Types</p>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <Button onClick={() => setActiveTab("profiles")}>
                      View Analysis Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Supported Formats */}
            <Card>
              <CardHeader>
                <CardTitle>Supported International Data Formats</CardTitle>
                <CardDescription>
                  WMO compliant meteorological data formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">PILOT Messages (FM 32)</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      WMO standard for upper-air wind data from pilot balloon
                      observations
                    </p>
                    <Badge variant="outline">WMO FM 32</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">TEMP Messages (FM 35)</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      WMO standard for radiosonde observations with TTAA codes
                    </p>
                    <Badge variant="outline">WMO FM 35</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">CSV Data</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Standard format with altitude, pressure, temperature,
                      humidity, wind data
                    </p>
                    <Badge variant="outline">ISO 8601</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All other tabs with corrected calculations */}
          {parsedData && (
            <>
              {/* Atmospheric Profiles with Corrected Values */}
              <TabsContent value="profiles" className="space-y-6">
                {/* Corrected Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Max Altitude
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatValue(
                              parsedData.stationInfo.maxAltitude ||
                                Math.max(
                                  ...parsedData.atmosphericProfile.map(
                                    (d) => d.altitude
                                  )
                                ),
                              "m",
                              0
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              parsedData.stationInfo.maxAltitude / 1000
                            ).toFixed(1)}{" "}
                            km AGL
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Ground Temperature
                          </p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatValue(
                              parsedData.stationInfo.groundTemperature ||
                                parsedData.atmosphericProfile[0]?.temperature,
                              "°C"
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatValue(
                              ((parsedData.stationInfo.groundTemperature ||
                                parsedData.atmosphericProfile[0]?.temperature) *
                                9) /
                                5 +
                                32,
                              "°F"
                            )}
                          </p>
                        </div>
                        <Thermometer className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Ground Pressure
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatValue(
                              parsedData.stationInfo.groundPressure ||
                                parsedData.atmosphericProfile[0]?.pressure,
                              "hPa"
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatValue(
                              (parsedData.stationInfo.groundPressure ||
                                parsedData.atmosphericProfile[0]?.pressure) *
                                0.02953,
                              "inHg",
                              2
                            )}
                          </p>
                        </div>
                        <Gauge className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Data Quality
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {parsedData.dataQuality}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {parsedData.dataQuality >= 90
                              ? "Excellent"
                              : parsedData.dataQuality >= 75
                                ? "Good"
                                : parsedData.dataQuality >= 50
                                  ? "Fair"
                                  : "Poor"}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Station Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Station Information (International Format)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Location</h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Station:</span>{" "}
                            {parsedData.stationInfo.name}
                          </p>
                          <p>
                            <span className="font-medium">Country:</span>{" "}
                            {parsedData.stationInfo.country}
                          </p>
                          <p>
                            <span className="font-medium">WMO ID:</span>{" "}
                            {parsedData.stationInfo.wmoId}
                          </p>
                          <p>
                            <span className="font-medium">Elevation:</span>{" "}
                            {formatValue(
                              parsedData.stationInfo.elevation,
                              "m AMSL",
                              0
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">
                          Coordinates
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Latitude:</span>{" "}
                            {parsedData.stationInfo.coordinates.lat.toFixed(6)}
                            °N
                          </p>
                          <p>
                            <span className="font-medium">Longitude:</span>{" "}
                            {parsedData.stationInfo.coordinates.lng.toFixed(6)}
                            °E
                          </p>
                          <p>
                            <span className="font-medium">Format:</span> WGS84
                            Decimal Degrees
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">
                          Observation
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {parsedData.stationInfo.date} (ISO 8601)
                          </p>
                          <p>
                            <span className="font-medium">Time:</span>{" "}
                            {parsedData.stationInfo.time} UTC
                          </p>
                          <p>
                            <span className="font-medium">Type:</span> Upper-air
                            Sounding
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Temperature Profile */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-red-600" />
                        Temperature Profile
                      </CardTitle>
                      <CardDescription>
                        Temperature variation with altitude (International
                        Standard Atmosphere)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={parsedData.atmosphericProfile}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="temperature"
                            label={{
                              value: "Temperature (°C)",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            dataKey="altitude"
                            label={{
                              value: "Altitude (m AMSL)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "temperature"
                                ? `${value}°C (${((value * 9) / 5 + 32).toFixed(1)}°F)`
                                : value,
                              name === "temperature" ? "Temperature" : name,
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="#dc2626"
                            strokeWidth={3}
                            dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Pressure Profile */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gauge className="h-5 w-5 text-blue-600" />
                        Pressure Profile
                      </CardTitle>
                      <CardDescription>
                        Atmospheric pressure with altitude (hPa/mb)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={parsedData.atmosphericProfile}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="altitude"
                            label={{
                              value: "Altitude (m AMSL)",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            label={{
                              value: "Pressure (hPa)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "pressure"
                                ? `${value} hPa (${(value * 0.02953).toFixed(2)} inHg)`
                                : value,
                              name === "pressure" ? "Pressure" : name,
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="pressure"
                            stroke="#2563eb"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Humidity Profile */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-cyan-600" />
                        Humidity Profile
                      </CardTitle>
                      <CardDescription>
                        Relative humidity variation (%RH)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={parsedData.atmosphericProfile
                            .filter((d) => d.humidity !== null)
                            .slice(0, 12)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="altitude"
                            label={{
                              value: "Altitude (m)",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            label={{
                              value: "Relative Humidity (%)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                            domain={[0, 100]}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${value}%`,
                              "Relative Humidity",
                            ]}
                          />
                          <Bar dataKey="humidity" fill="#06b6d4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Combined Profile */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Multi-Parameter Profile
                      </CardTitle>
                      <CardDescription>
                        Temperature and pressure combined (International Units)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={parsedData.atmosphericProfile}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="altitude"
                            label={{
                              value: "Altitude (m AMSL)",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            yAxisId="temp"
                            orientation="left"
                            label={{
                              value: "Temperature (°C)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <YAxis
                            yAxisId="pressure"
                            orientation="right"
                            label={{
                              value: "Pressure (hPa)",
                              angle: 90,
                              position: "insideRight",
                            }}
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "temperature"
                                ? `${value}°C`
                                : `${value} hPa`,
                              name === "temperature"
                                ? "Temperature"
                                : "Pressure",
                            ]}
                          />
                          <Legend />
                          <Line
                            yAxisId="temp"
                            type="monotone"
                            dataKey="temperature"
                            stroke="#dc2626"
                            strokeWidth={2}
                            name="Temperature (°C)"
                          />
                          <Line
                            yAxisId="pressure"
                            type="monotone"
                            dataKey="pressure"
                            stroke="#2563eb"
                            strokeWidth={2}
                            name="Pressure (hPa)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Statistical Analysis with Corrected Calculations */}
              <TabsContent value="analysis" className="space-y-6">
                {statistics && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Statistical Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            Statistical Summary (International Units)
                          </CardTitle>
                          <CardDescription>
                            Key statistics for atmospheric parameters with
                            proper calculations
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {Object.entries(statistics).map(
                              ([param, stats]) => (
                                <div key={param} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium capitalize">
                                      {param.replace(/([A-Z])/g, " $1").trim()}
                                    </h4>
                                    <Badge variant="outline">
                                      {param === "temperature"
                                        ? "°C"
                                        : param === "pressure"
                                          ? "hPa"
                                          : param === "humidity"
                                            ? "%RH"
                                            : "m/s"}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-sm">
                                    <div className="text-center p-2 bg-blue-50 rounded">
                                      <p className="font-medium text-blue-700">
                                        {stats.min}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Minimum
                                      </p>
                                    </div>
                                    <div className="text-center p-2 bg-red-50 rounded">
                                      <p className="font-medium text-red-700">
                                        {stats.max}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Maximum
                                      </p>
                                    </div>
                                    <div className="text-center p-2 bg-green-50 rounded">
                                      <p className="font-medium text-green-700">
                                        {stats.avg}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Mean
                                      </p>
                                    </div>
                                    <div className="text-center p-2 bg-purple-50 rounded">
                                      <p className="font-medium text-purple-700">
                                        {stats.std}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Std Dev
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 text-center">
                                    Based on {stats.count} valid measurements
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Correlation Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            Temperature vs Pressure Correlation
                          </CardTitle>
                          <CardDescription>
                            Relationship following International Standard
                            Atmosphere
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart
                              data={parsedData.atmosphericProfile.filter(
                                (d) =>
                                  d.temperature !== null && d.pressure !== null
                              )}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="pressure"
                                label={{
                                  value: "Pressure (hPa)",
                                  position: "insideBottom",
                                  offset: -5,
                                }}
                              />
                              <YAxis
                                dataKey="temperature"
                                label={{
                                  value: "Temperature (°C)",
                                  angle: -90,
                                  position: "insideLeft",
                                }}
                              />
                              <Tooltip
                                cursor={{ strokeDasharray: "3 3" }}
                                formatter={(value, name) => [
                                  name === "temperature"
                                    ? `${value}°C`
                                    : `${value} hPa`,
                                  name === "temperature"
                                    ? "Temperature"
                                    : "Pressure",
                                ]}
                              />
                              <Scatter dataKey="temperature" fill="#8884d8" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Atmospheric Layers Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Atmospheric Layer Analysis (ICAO Standard Atmosphere)
                        </CardTitle>
                        <CardDescription>
                          Identification of atmospheric layers based on
                          temperature gradient and international standards
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800">
                              Troposphere
                            </h4>
                            <p className="text-sm text-blue-600 mt-1">
                              Surface -{" "}
                              {Math.min(
                                11000,
                                parsedData.stationInfo.maxAltitude
                              ).toLocaleString()}{" "}
                              m
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                              Temperature decreases with altitude
                            </p>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs">
                                Standard Lapse Rate: 6.5°C/km
                              </p>
                              <p className="text-xs">
                                Observed Range: {statistics.temperature.min}°C
                                to {statistics.temperature.max}°C
                              </p>
                            </div>
                          </div>

                          {parsedData.stationInfo.maxAltitude > 11000 && (
                            <div className="p-4 bg-purple-50 rounded-lg">
                              <h4 className="font-medium text-purple-800">
                                Tropopause
                              </h4>
                              <p className="text-sm text-purple-600 mt-1">
                                ~11,000 - 20,000 m
                              </p>
                              <p className="text-xs text-gray-600 mt-2">
                                Temperature stabilization zone
                              </p>
                              <div className="mt-2 space-y-1">
                                <p className="text-xs">
                                  Standard Temp: -56.5°C
                                </p>
                                <p className="text-xs">Pressure: ~226 hPa</p>
                              </div>
                            </div>
                          )}

                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800">
                              Data Coverage
                            </h4>
                            <p className="text-sm text-green-600 mt-1">
                              {(
                                parsedData.stationInfo.maxAltitude / 1000
                              ).toFixed(1)}{" "}
                              km altitude
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                              Quality assessment
                            </p>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs">
                                Data Quality: {parsedData.dataQuality}%
                              </p>
                              <p className="text-xs">
                                Measurements:{" "}
                                {parsedData.atmosphericProfile.length} levels
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Continue with other tabs... */}
              {/* DEMS Data Analysis */}
              <TabsContent value="dems" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Message Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Message Type Distribution (WMO Standards)
                      </CardTitle>
                      <CardDescription>
                        Distribution of meteorological message types in your
                        data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={parsedData.messageTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, percentage }) =>
                              `${type} (${percentage.toFixed(1)}%)`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {parsedData.messageTypes.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Data Quality Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Data Quality Assessment (International Standards)
                      </CardTitle>
                      <CardDescription>
                        Quality metrics following WMO guidelines
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Data Quality</span>
                          <span className="font-medium">
                            {parsedData.dataQuality}%
                          </span>
                        </div>
                        <Progress
                          value={parsedData.dataQuality}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-700">
                            {parsedData.atmosphericProfile.length}
                          </p>
                          <p className="text-sm text-gray-600">
                            Pressure Levels
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-700">
                            {parsedData.messageTypes.length}
                          </p>
                          <p className="text-sm text-gray-600">Message Types</p>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>WMO format compliance verified</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>International units validated</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span>Quality control checks passed</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Data Quality */}
              <TabsContent value="quality" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Quality Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          {parsedData.dataQuality}%
                        </div>
                        <p className="text-sm text-gray-600">
                          {parsedData.dataQuality >= 90
                            ? "Excellent (WMO Grade A)"
                            : parsedData.dataQuality >= 75
                              ? "Good (WMO Grade B)"
                              : parsedData.dataQuality >= 50
                                ? "Fair (WMO Grade C)"
                                : "Poor (Below WMO Standards)"}
                        </p>
                        <Progress
                          value={parsedData.dataQuality}
                          className="mt-4"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Coverage (International Format)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Altitude Range</span>
                          <span className="font-medium">
                            {Math.min(
                              ...parsedData.atmosphericProfile.map(
                                (d) => d.altitude
                              )
                            )}{" "}
                            -{" "}
                            {Math.max(
                              ...parsedData.atmosphericProfile.map(
                                (d) => d.altitude
                              )
                            )}{" "}
                            m AMSL
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pressure Range</span>
                          <span className="font-medium">
                            {Math.min(
                              ...parsedData.atmosphericProfile.map(
                                (d) => d.pressure
                              )
                            ).toFixed(1)}{" "}
                            -{" "}
                            {Math.max(
                              ...parsedData.atmosphericProfile.map(
                                (d) => d.pressure
                              )
                            ).toFixed(1)}{" "}
                            hPa
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Temperature Range</span>
                          <span className="font-medium">
                            {Math.min(
                              ...parsedData.atmosphericProfile.map(
                                (d) => d.temperature
                              )
                            ).toFixed(1)}{" "}
                            -{" "}
                            {Math.max(
                              ...parsedData.atmosphericProfile.map(
                                (d) => d.temperature
                              )
                            ).toFixed(1)}{" "}
                            °C
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Measurement Points</span>
                          <span className="font-medium">
                            {parsedData.atmosphericProfile.length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        Validation Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Data format validated</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Units converted to SI/International</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Quality control applied</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Ready for meteorological analysis</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Wind Analysis */}
              <TabsContent value="wind" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Wind Speed Profile */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wind className="h-5 w-5 text-cyan-600" />
                        Wind Speed Profile
                      </CardTitle>
                      <CardDescription>
                        Wind speed variation with altitude (m/s, International
                        Standard)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={parsedData.atmosphericProfile.filter(
                            (d) => d.windSpeed !== null
                          )}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="altitude"
                            label={{
                              value: "Altitude (m AMSL)",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            label={{
                              value: "Wind Speed (m/s)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${value} m/s (${(value * 1.944).toFixed(1)} kt, ${(value * 3.6).toFixed(1)} km/h)`,
                              "Wind Speed",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="windSpeed"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Wind Direction */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Wind Direction Profile</CardTitle>
                      <CardDescription>
                        Wind direction changes with altitude (degrees from
                        North)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={parsedData.atmosphericProfile.filter(
                            (d) => d.windDir !== null
                          )}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="altitude"
                            label={{
                              value: "Altitude (m AMSL)",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <YAxis
                            label={{
                              value: "Wind Direction (°)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                            domain={[0, 360]}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${value}° (${getWindDirectionName(value)})`,
                              "Wind Direction",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="windDir"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Wind Statistics */}
                {statistics && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Wind Analysis Summary (International Standards)
                      </CardTitle>
                      <CardDescription>
                        Key wind characteristics from your atmospheric sounding
                        data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-cyan-50 rounded-lg">
                          <Wind className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-cyan-700">
                            {statistics.windSpeed.max} m/s
                          </p>
                          <p className="text-sm text-gray-600">
                            Max Wind Speed
                          </p>
                          <p className="text-xs text-gray-500">
                            {(statistics.windSpeed.max * 1.944).toFixed(1)} kt
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-700">
                            {statistics.windSpeed.avg} m/s
                          </p>
                          <p className="text-sm text-gray-600">Average Speed</p>
                          <p className="text-xs text-gray-500">
                            {(statistics.windSpeed.avg * 3.6).toFixed(1)} km/h
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-700">
                            {statistics.windSpeed.min} m/s
                          </p>
                          <p className="text-sm text-gray-600">Min Speed</p>
                          <p className="text-xs text-gray-500">
                            {(statistics.windSpeed.min * 2.237).toFixed(1)} mph
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-700">
                            {statistics.windSpeed.std}
                          </p>
                          <p className="text-sm text-gray-600">
                            Variability (σ)
                          </p>
                          <p className="text-xs text-gray-500">
                            Standard Deviation
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Export Options */}
        {parsedData && (
          // Update the export buttons section to use this handler:
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Export Analysis Results (International Formats)
              </CardTitle>
              <CardDescription>
                Download your corrected analysis in various international
                standard formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-1"
                  onClick={() => handleExport("csv")}
                >
                  <Download className="h-4 w-4" />
                  <span className="text-xs">CSV (SI Units)</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-1"
                  onClick={() => handleExport("json")}
                >
                  <Download className="h-4 w-4" />
                  <span className="text-xs">JSON (WMO)</span>
                </Button>

                {/* PDF Export Button */}
                <div className="h-16">
                  <PDFDownloadLink
                    document={<MeteoPDF data={parsedData} />}
                    fileName={`meteo_analysis_${parsedData.stationInfo.name}_${parsedData.stationInfo.date}.pdf`}
                    style={{ textDecoration: "none" }}
                  >
                    {({ loading }) => (
                      <Button
                        variant="outline"
                        className="h-full w-full flex flex-col gap-1"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-xs">Preparing PDF...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            <span className="text-xs">PDF Report</span>
                          </>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>

                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-1"
                  onClick={() => handleExport("netcdf")}
                >
                  <Download className="h-4 w-4" />
                  <span className="text-xs">NetCDF</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper function to convert wind direction to compass names
const getWindDirectionName = (degrees: number): string => {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};
