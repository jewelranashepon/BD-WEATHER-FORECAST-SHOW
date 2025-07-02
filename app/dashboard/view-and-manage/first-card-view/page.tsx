"use client";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CloudSun, Filter, Loader2, AlertTriangle } from 'lucide-react';
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { utcToHour } from "@/lib/utils";
import { Download } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { hygrometricTable } from "@/data/hygrometric-table";
import { stationDataMap } from "@/data/station-data-map";
import { cn } from "@/lib/utils";

// Enhanced validation schema with strict numeric validation
const meteorologicalValidationSchema = Yup.object().shape({
  subIndicator: Yup.string(),
  alteredThermometer: Yup.string(),
  barAsRead: Yup.string()
    .required("Bar As Read অবশ্যই পূরণ করতে হবে")
    .test(
      "is-exactly-5-digits",
      "ঠিক ৫টি সংখ্যা হতে হবে (যেমন: 10142)",
      (value) => {
        if (!value) return false;
        return /^\d{5}$/.test(value);
      }
    )
    .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
      if (!value) return false;
      return !value.includes(".") && !value.includes(",");
    })
    .test("no-string", "শুধুমাত্র সংখ্যা গ্রহণযোগ্য", (value) => {
      if (!value) return false;
      return /^\d+$/.test(value);
    }),
  // Remove validation for correctedForIndex as requested
  correctedForIndex: Yup.string(),
  heightDifference: Yup.string(),
  stationLevelPressure: Yup.string(),
  seaLevelReduction: Yup.string(),
  correctedSeaLevelPressure: Yup.string(),
  afternoonReading: Yup.string(),
  pressureChange24h: Yup.string(),
  dryBulbAsRead: Yup.string()
    .required("Dry-bulb অবশ্যই পূরণ করতে হবে")
    .test(
      "is-exactly-3-digits",
      "ঠিক ৩টি সংখ্যা হতে হবে (যেমন: 256)",
      (value) => {
        if (!value) return false;
        return /^\d{3}$/.test(value);
      }
    )
    .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
      if (!value) return false;
      return !value.includes(".") && !value.includes(",");
    })
    .test("no-string", "শুধুমাত্র সংখ্যা গ্রহণযোগ্য", (value) => {
      if (!value) return false;
      return /^\d+$/.test(value);
    }),
  wetBulbAsRead: Yup.string()
    .required("Wet-bulb অবশ্যই পূরণ করতে হবে")
    .test(
      "is-exactly-3-digits",
      "ঠিক ৩টি সংখ্যা হতে হবে (যেমন: 256)",
      (value) => {
        if (!value) return false;
        return /^\d{3}$/.test(value);
      }
    )
    .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
      if (!value) return false;
      return !value.includes(".") && !value.includes(",");
    })
    .test("no-string", "শুধুমাত্র সংখ্যা গ্রহণযোগ্য", (value) => {
      if (!value) return false;
      return /^\d+$/.test(value);
    }),
  maxMinTempAsRead: Yup.string()
    .required("MAX/MIN অবশ্যই পূরণ করতে হবে")
    .test(
      "is-exactly-3-digits",
      "ঠিক ৩টি সংখ্যা হতে হবে (যেমন: 256)",
      (value) => {
        if (!value) return false;
        return /^\d{3}$/.test(value);
      }
    )
    .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
      if (!value) return false;
      return !value.includes(".") && !value.includes(",");
    })
    .test("no-string", "শুধুমাত্র সংখ্যা গ্রহণযোগ্য", (value) => {
      if (!value) return false;
      return /^\d+$/.test(value);
    }),
  dryBulbCorrected: Yup.string(),
  wetBulbCorrected: Yup.string(),
  maxMinTempCorrected: Yup.string(),
  Td: Yup.string(),
  relativeHumidity: Yup.string(),
  squallConfirmed: Yup.boolean(),
  squallForce: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Force অবশ্যই পূরণ করতে হবে")
        .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
          if (!value) return false;
          return !value.includes(".") && !value.includes(",");
        })
        .test("no-string", "শুধুমাত্র সংখ্যা গ্রহণযোগ্য", (value) => {
          if (!value) return false;
          return /^\d+$/.test(value);
        }),
    otherwise: (schema) => schema,
  }),
  squallDirection: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Direction অবশ্যই পূরণ করতে হবে")
        .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
          if (!value) return false;
          return !value.includes(".") && !value.includes(",");
        })
        .test("no-string", "শুধুমাত্র সংখ্যা গ্রহণযোগ্য", (value) => {
          if (!value) return false;
          return /^\d+$/.test(value);
        }),
    otherwise: (schema) => schema,
  }),
  squallTime: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) => schema.required("Squall Time অবশ্যই পূরণ করতে হবে"),
    otherwise: (schema) => schema,
  }),
  horizontalVisibility: Yup.string()
    .required("Horizontal Visibility অবশ্যই পূরণ করতে হবে")
    .test(
      "is-exactly-3-digits",
      "ঠিক ৩টি সংখ্যা হতে হবে (যেমন: 050, 999)",
      (value) => {
        if (!value) return false;
        return /^\d{3}$/.test(value);
      }
    )
    .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
      if (!value) return false;
      return !value.includes(".") && !value.includes(",");
    })
    .test("no-string", "শুধুমাত্র সংখ্যা গ্রহণযোগ্য", (value) => {
      if (!value) return false;
      return /^\d+$/.test(value);
    }),
  miscMeteors: Yup.string(),
  pastWeatherW1: Yup.string()
    .required("Past Weather (W1) অবশ্যই পূরণ করতে হবে")
    .test("is-single-digit", "শুধুমাত্র ০-৯ এর মধ্যে একটি সংখ্যা", (value) => {
      if (!value) return false;
      return /^[0-9]$/.test(value);
    })
    .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
      if (!value) return false;
      return !value.includes(".") && !value.includes(",");
    }),
  pastWeatherW2: Yup.string()
    .required("Past Weather (W2) অবশ্যই পূরণ করতে হবে")
    .test("is-single-digit", "শুধুমাত্র ০-৯ এর মধ্যে একটি সংখ্যা", (value) => {
      if (!value) return false;
      return /^[0-9]$/.test(value);
    })
    .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
      if (!value) return false;
      return !value.includes(".") && !value.includes(",");
    }),
  presentWeatherWW: Yup.string()
    .required("Present Weather অবশ্যই পূরণ করতে হবে")
    .test(
      "is-exactly-2-digits",
      "ঠিক ২টি সংখ্যা হতে হবে (যেমন: 01, 23, 99)",
      (value) => {
        if (!value) return false;
        return /^\d{2}$/.test(value);
      }
    )
    .test("no-float", "দশমিক সংখ্যা গ্রহণযোগ্য নয়", (value) => {
      if (!value) return false;
      return !value.includes(".") && !value.includes(",");
    })
    .test("no-string", "শুধুমাত্র সংখ্যা গ্রহণযোগ্য", (value) => {
      if (!value) return false;
      return /^\d+$/.test(value);
    }),
  c2Indicator: Yup.string(),
});

interface Station {
  id: string;
  stationId: string;
  name: string;
  securityCode: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

interface MeteorologicalEntry {
  id: string;
  observingTimeId: string;
  stationId?: string;
  dataType: string;
  subIndicator: string;
  alteredThermometer: string;
  barAsRead: string;
  correctedForIndex: string;
  heightDifference: string;
  correctionForTemp: string;
  stationLevelPressure: string;
  seaLevelReduction: string;
  correctedSeaLevelPressure: string;
  afternoonReading: string;
  pressureChange24h: string;
  dryBulbAsRead: string;
  wetBulbAsRead: string;
  maxMinTempAsRead: string;
  dryBulbCorrected: string;
  wetBulbCorrected: string;
  maxMinTempCorrected: string;
  Td: string;
  relativeHumidity: string;
  squallConfirmed: string;
  squallForce: string;
  squallDirection: string;
  squallTime: string;
  horizontalVisibility: string;
  miscMeteors: string;
  pastWeatherW1: string;
  pastWeatherW2: string;
  presentWeatherWW: string;
  c2Indicator: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  ObservingTime?: {
    stationId: string;
    userId: string;
    utcTime: string;
    station: Station;
  };
}

interface ObservingTimeEntry {
  id: string;
  userId: string;
  stationId: string;
  utcTime: string;
  localTime: string;
  createdAt: string;
  updatedAt: string;
  station: Station;
  MeteorologicalEntry: MeteorologicalEntry[];
}

interface FirstCardTableProps {
  refreshTrigger?: number;
}

function canEditRecord(record: MeteorologicalEntry, user: any): boolean {
  if (!user) return false;

  // If no submittedAt, allow edit (newly created record)
  if (!record.createdAt) return true;

  try {
    const submissionDate = parseISO(record.createdAt);
    if (!isValid(submissionDate)) return true;

    const now = new Date();
    const daysDifference = differenceInDays(now, submissionDate);

    const role = user.role;
    const userId = user.id;
    const userStationId = user.station?.id;
    const recordStationId = record.ObservingTime?.stationId;

    const recordUserId = record.ObservingTime?.userId;

    if (role === "super_admin") return daysDifference <= 365;

    if (role === "station_admin") {
      return daysDifference <= 30 && userStationId === recordStationId;
    }

    if (role === "observer") {
      return daysDifference <= 2 && userId === recordUserId;
    }

    return false;
  } catch (e) {
    console.warn("Error in canEditRecord:", e);
    return false;
  }
}

const FirstCardTable = forwardRef(
  ({ refreshTrigger = 0 }: FirstCardTableProps, ref) => {
    const [data, setData] = useState<ObservingTimeEntry[]>([]);
    const [flattenedData, setFlattenedData] = useState<MeteorologicalEntry[]>(
      []
    );
    const [loading, setLoading] = useState(true);
    const today = format(new Date(), "yyyy-MM-dd");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [dateError, setDateError] = useState<string | null>(null);
    const [stationFilter, setStationFilter] = useState("all");
    const [stations, setStations] = useState<Station[]>([]);
    const { data: session } = useSession();
    const user = session?.user;
    const isSuperAdmin = user?.role === "super_admin";
    const isStationAdmin = user?.role === "station_admin";
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] =
      useState<MeteorologicalEntry | null>(null);
    const [selectedObservingTime, setSelectedObservingTime] =
      useState<ObservingTimeEntry | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPermissionDeniedOpen, setIsPermissionDeniedOpen] = useState(false);

    // Auto-calculation functions
    const calculateDewPointAndHumidity = (
      dryBulbInput: string,
      wetBulbInput: string
    ) => {
      if (!dryBulbInput || !wetBulbInput) return null;

      try {
        // Convert 3-digit inputs like "256" => 25.6
        const dryBulbValue = Number.parseFloat(
          `${dryBulbInput.slice(0, 2)}.${dryBulbInput.slice(2)}`
        );
        const wetBulbValue = Number.parseFloat(
          `${wetBulbInput.slice(0, 2)}.${wetBulbInput.slice(2)}`
        );

        const difference = Number(
          Math.abs(dryBulbValue - wetBulbValue).toFixed(1)
        );
        const roundedDryBulb = Math.round(dryBulbValue);

        // Validate ranges
        if (roundedDryBulb < 0 || roundedDryBulb > 50 || difference > 30.0) {
          return null;
        }

        // Find index of the difference in 'differences'
        const diffIndex = hygrometricTable.differences.indexOf(difference);
        if (diffIndex === -1) {
          return null;
        }

        // Find the dbT entry
        const dbtEntry = hygrometricTable.data.find(
          (entry) => entry.dbT === roundedDryBulb
        );
        if (!dbtEntry || !dbtEntry.values || !dbtEntry.values[diffIndex]) {
          return null;
        }

        const { DpT, RH } = dbtEntry.values[diffIndex];

        return {
          Td: DpT.toString(),
          relativeHumidity: RH.toString(),
        };
      } catch (error) {
        console.error("Error calculating dew point and humidity:", error);
        return null;
      }
    };

    const calculatePressureValues = (
      dryBulb: string,
      barAsRead: string,
      stationId: string
    ) => {
      if (!dryBulb || !barAsRead || !stationId) return null;

      try {
        const userStationData = stationDataMap[stationId];
        if (!userStationData) {
          return null;
        }

        const correctionTable = userStationData.station.correction_table;
        const dryBulbValue = Number.parseFloat(dryBulb) / 10;
        const roundedDryBulb = Math.round(dryBulbValue);

        const barAsReadValue = Number.parseFloat(barAsRead) / 10;

        const correctionEntry = correctionTable.find(
          (entry) => entry.dry_bulb_temp_c === roundedDryBulb
        );

        if (!correctionEntry) {
          return null;
        }

        const availablePressures = Object.keys(
          correctionEntry.cistern_level_pressure
        )
          .map(Number)
          .sort((a, b) => a - b);

        const closestPressure = availablePressures.reduce((prev, curr) =>
          Math.abs(curr - barAsReadValue) < Math.abs(prev - barAsReadValue)
            ? curr
            : prev
        );

        const heightCorrection =
          correctionEntry.cistern_level_pressure[closestPressure.toString()];
        const stationLevelPressure = barAsReadValue + heightCorrection;

        return {
          stationLevelPressure: Math.round(stationLevelPressure * 10)
            .toString()
            .padStart(5, "0"),
          heightDifference: `+${Math.round(heightCorrection * 100)}`,
        };
      } catch (error) {
        console.error("Error calculating pressure values:", error);
        return null;
      }
    };

    const calculateSeaLevelPressure = (
      dryBulb: string,
      stationLevelPressure: string,
      stationId: string
    ) => {
      if (!dryBulb || !stationLevelPressure || !stationId) return null;

      try {
        const userStationData = stationDataMap[stationId];
        if (!userStationData) {
          return null;
        }

        const seaCorrectionTable = userStationData.sea.correction_table;
        const dryBulbValue = Number.parseFloat(dryBulb) / 10;
        const roundedDryBulb = Math.round(dryBulbValue);

        // Convert 5-digit string pressure to decimal (e.g., "10041" → 1004.1)
        const stationPressureValue =
          Number.parseFloat(stationLevelPressure) / 10;

        const correctionEntry = seaCorrectionTable.find(
          (entry) => entry.dry_bulb_temp_c === roundedDryBulb
        );

        if (!correctionEntry) {
          return null;
        }

        const availablePressures = Object.keys(
          correctionEntry.station_level_pressure
        )
          .map(Number)
          .sort((a, b) => a - b);

        const closestPressure = availablePressures.reduce((prev, curr) =>
          Math.abs(curr - stationPressureValue) <
            Math.abs(prev - stationPressureValue)
            ? curr
            : prev
        );

        const seaLevelReduction =
          correctionEntry.station_level_pressure[closestPressure.toString()];
        const seaLevelPressure = stationPressureValue + seaLevelReduction;

        return {
          seaLevelReduction: `+${Math.round(seaLevelReduction * 100)}`,
          correctedSeaLevelPressure: Math.round(seaLevelPressure * 10)
            .toString()
            .padStart(5, "0"),
        };
      } catch (error) {
        console.error("Error calculating sea level pressure:", error);
        return null;
      }
    };

    // Expose getData method via ref
    useImperativeHandle(ref, () => ({
      getData: () => {
        return flattenedData.map((record) => {
          const observingTime = data.find(
            (ot) => ot.id === record.observingTimeId
          );
          return {
            ...record,
            stationId: observingTime?.stationId || "",
            stationName: observingTime?.station?.name || "",
            utcTime: observingTime?.utcTime || "",
            localTime: observingTime?.localTime || "",
          };
        });
      },
    }));

    const exportToCSV = () => {
      if (flattenedData.length === 0 || data.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create CSV header
      const headers = [
        "Time (GMT)",
        "Indicator",
        "Date",
        "Station Name & ID",
        "Station Name",
        "Attached Thermometer (°C)",
        "Bar As Read (hPa)",
        "Corrected for Index",
        "Height Difference Correction (hPa)",
        "Station Level Pressure (QFE)",
        "Sea Level Reduction",
        "Sea Level Pressure (QNH)",
        "Afternoon Reading",
        "24-Hour Pressure Change",
        "Dry Bulb As Read (°C)",
        "Wet Bulb As Read (°C)",
        "MAX/MIN Temp As Read (°C)",
        "Dry Bulb Corrected (°C)",
        "Wet Bulb Corrected (°C)",
        "MAX/MIN Temp Corrected (°C)",
        "Dew Point Temperature (°C)",
        "Relative Humidity (%)",
        "Squall Force (KTS)",
        "Squall Direction (°)",
        "Squall Time",
        "Horizontal Visibility (km)",
        "Misc Meteors (Code)",
        "Past Weather (W₁)",
        "Past Weather (W₂)",
        "Present Weather (ww)",
        "C2 Indicator",
      ];

      // Create CSV rows
      const rows = flattenedData.map((record) => {
        const observingTime = data.find(
          (ot) => ot.id === record.observingTimeId
        );
        return [
          utcToHour(observingTime?.utcTime || ""),
          record.subIndicator || "--",
          observingTime?.utcTime
            ? format(new Date(observingTime.utcTime), "yyyy-MM-dd")
            : "--",
          observingTime?.station?.name +
          " " +
          observingTime?.station?.stationId || "--",
          observingTime?.station?.name || "--",
          record.alteredThermometer || "--",
          record.barAsRead || "--",
          record.correctedForIndex || "--",
          record.heightDifference || "--",
          record.stationLevelPressure || "--",
          record.seaLevelReduction || "--",
          record.correctedSeaLevelPressure || "--",
          record.afternoonReading || "--",
          record.pressureChange24h || "--",
          record.dryBulbAsRead || "--",
          record.wetBulbAsRead || "--",
          record.maxMinTempAsRead || "--",
          record.dryBulbCorrected || "--",
          record.wetBulbCorrected || "--",
          record.maxMinTempCorrected || "--",
          record.Td || "--",
          record.relativeHumidity || "--",
          record.squallForce || "--",
          record.squallDirection || "--",
          record.squallTime || "--",
          record.horizontalVisibility || "--",
          record.miscMeteors || "--",
          record.pastWeatherW1 || "--",
          record.pastWeatherW2 || "--",
          record.presentWeatherWW || "--",
          record.c2Indicator || "--",
        ];
      });

      // Combine header and rows
      const csvContent = [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `meteorological_data_${startDate}_to_${endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV export started");
    };

    // Add this function alongside your exportToCSV function
    const exportToTXT = () => {
      if (flattenedData.length === 0 || data.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create TXT header
      let txtContent = `Meteorological Data Report\n`;
      txtContent += `Date Range: ${startDate} to ${endDate}\n`;
      txtContent += `Station: ${user?.station?.name || "All Stations"}\n`;
      txtContent += `Generated: ${new Date().toLocaleString()}\n\n`;

      // Create column headers
      const headers = [
        "Time (GMT)", "Indicator", "Date", "Station",
        "Attached Thermometer", "Bar As Read", "Corrected for Index",
        "Height Diff", "Station Level Pressure", "Sea Level Reduction",
        "Sea Level Pressure", "Afternoon Reading", "24h Pressure Change",
        "Dry Bulb", "Wet Bulb", "MAX/MIN Temp", "Dry Bulb Corrected",
        "Wet Bulb Corrected", "MAX/MIN Corrected", "Dew Point",
        "Relative Humid", "Squall Force", "Squall Direction", "Squall Time",
        "Visibility", "Misc Meteors", "Past W1", "Past W2", "Present WW",
        "C2 Indicator"
      ];

      // Format headers as fixed-width columns
      txtContent += headers.map(h => h.padEnd(20)).join("") + "\n";
      txtContent += "-".repeat(headers.length * 20) + "\n";

      // Create TXT rows with fixed-width formatting
      const rows = flattenedData.map((record) => {
        const observingTime = data.find(ot => ot.id === record.observingTimeId);
        const rowData = [
          utcToHour(observingTime?.utcTime || "").padEnd(20),
          (record.subIndicator || "--").padEnd(20),
          (observingTime?.utcTime
            ? format(new Date(observingTime.utcTime), "yyyy-MM-dd")
            : "--").padEnd(20),
          ((observingTime?.station?.name || "--") +
            " " +
            (observingTime?.station?.stationId || "--")).padEnd(20),
          (record.alteredThermometer || "--").padEnd(20),
          (record.barAsRead || "--").padEnd(20),
          (record.correctedForIndex || "--").padEnd(20),
          (record.heightDifference || "--").padEnd(20),
          (record.stationLevelPressure || "--").padEnd(20),
          (record.seaLevelReduction || "--").padEnd(20),
          (record.correctedSeaLevelPressure || "--").padEnd(20),
          (record.afternoonReading || "--").padEnd(20),
          (record.pressureChange24h || "--").padEnd(20),
          (record.dryBulbAsRead || "--").padEnd(20),
          (record.wetBulbAsRead || "--").padEnd(20),
          (record.maxMinTempAsRead || "--").padEnd(20),
          (record.dryBulbCorrected || "--").padEnd(20),
          (record.wetBulbCorrected || "--").padEnd(20),
          (record.maxMinTempCorrected || "--").padEnd(20),
          (record.Td || "--").padEnd(20),
          (record.relativeHumidity || "--").padEnd(20),
          (record.squallForce || "--").padEnd(20),
          (record.squallDirection || "--").padEnd(20),
          (record.squallTime || "--").padEnd(20),
          (record.horizontalVisibility
            ? (Number.parseInt(record.horizontalVisibility) % 10 === 0
              ? (Number.parseInt(record.horizontalVisibility) / 10).toString()
              : (Number.parseInt(record.horizontalVisibility) / 10).toFixed(1)
            ).padEnd(20)
            : "--".padEnd(20)),
          (record.miscMeteors || "--").padEnd(20),
          (record.pastWeatherW1 || "--").padEnd(20),
          (record.pastWeatherW2 || "--").padEnd(20),
          (record.presentWeatherWW || "--").padEnd(20),
          (record.c2Indicator || "--").padEnd(20)
        ];
        return rowData.join("");
      });

      // Combine all content
      txtContent += rows.join("\n");

      // Create download link
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `meteorological_data_${startDate}_to_${endDate}.txt`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("TXT export started");
    };

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch meteorological data with date range
        const response = await fetch(
          `/api/first-card-data?startDate=${startDate}&endDate=${endDate}${stationFilter !== "all" ? `&stationId=${stationFilter}` : ""}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result.entries || []);

        // Flatten the data for easier display
        const flattened: MeteorologicalEntry[] = [];
        result.entries.forEach((observingTime: ObservingTimeEntry) => {
          observingTime.MeteorologicalEntry.forEach(
            (entry: MeteorologicalEntry) => {
              flattened.push({
                ...entry,
                observingTimeId: observingTime.id,
                stationId: observingTime.stationId,
                stationCode: observingTime.station?.stationId,
              });
            }
          );
        });
        setFlattenedData(flattened);

        // Fetch stations if super admin
        if (isSuperAdmin) {
          const stationsResponse = await fetch("/api/stations");
          if (!stationsResponse.ok) {
            throw new Error("Failed to fetch stations");
          }
          const stationsResult = await stationsResponse.json();
          setStations(stationsResult);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch meteorological data");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, [refreshTrigger, startDate, endDate, stationFilter]);

    const goToPreviousWeek = () => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysInRange = differenceInDays(end, start);

      // Calculate the new date range
      const newStart = new Date(start);
      newStart.setDate(start.getDate() - (daysInRange + 1));

      const newEnd = new Date(start);
      newEnd.setDate(start.getDate() - 1);

      // Always update the dates when going back
      setStartDate(format(newStart, "yyyy-MM-dd"));
      setEndDate(format(newEnd, "yyyy-MM-dd"));
      setDateError(null);
    };

    const goToNextWeek = () => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysInRange = differenceInDays(end, start);

      // Calculate the new date range
      const newStart = new Date(start);
      newStart.setDate(start.getDate() + (daysInRange + 1));

      const newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + daysInRange);

      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // If the new range would go beyond today, adjust it
      if (newEnd > today) {
        // If we're already at or beyond today, don't go further
        if (end >= today) {
          return;
        }
        // Otherwise, set the end to today and adjust the start accordingly
        const adjustedEnd = new Date(today);
        const adjustedStart = new Date(adjustedEnd);
        adjustedStart.setDate(adjustedEnd.getDate() - daysInRange);

        setStartDate(format(adjustedStart, "yyyy-MM-dd"));
        setEndDate(format(adjustedEnd, "yyyy-MM-dd"));
      } else {
        // Update to the new range if it's valid
        setStartDate(format(newStart, "yyyy-MM-dd"));
        setEndDate(format(newEnd, "yyyy-MM-dd"));
      }

      setDateError(null);
    };

    const getWeatherStatusColor = (humidity: string) => {
      const humidityValue = Number.parseInt(humidity || "0");
      if (humidityValue >= 80) return "bg-blue-500";
      if (humidityValue >= 60) return "bg-green-500";
      if (humidityValue >= 40) return "bg-yellow-500";
      if (humidityValue >= 20) return "bg-orange-500";
      return "bg-red-500";
    };


    const handleDateChange = (type: "start" | "end", newDate: string) => {
      const date = new Date(newDate);
      const otherDate =
        type === "start" ? new Date(endDate) : new Date(startDate);

      if (isNaN(date.getTime())) {
        setDateError("Invalid date format");
        return;
      }

      // Reset error if dates are valid
      setDateError(null);

      if (type === "start") {
        if (date > otherDate) {
          setDateError("Start date cannot be after end date");
          return;
        }
        setStartDate(newDate);
      } else {
        if (date < otherDate) {
          setDateError("End date cannot be before start date");
          return;
        }
        setEndDate(newDate);
      }
    };

    const handleSaveEdit = async (values: any) => {
      if (!selectedRecord) return;

      setIsSaving(true);
      try {
        const response = await fetch("/api/first-card-data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedRecord.id,
            ...values,
            squallConfirmed: values.squallConfirmed ? "true" : "false",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update record");
        }

        const updatedRecord = await response.json();

        // Update the local state
        setFlattenedData((prevData) =>
          prevData.map((item) =>
            item.id === selectedRecord.id
              ? {
                ...item,
                ...values,
                squallConfirmed: values.squallConfirmed ? "true" : "false",
              }
              : item
          )
        );

        // Also update the main data state
        setData((prevData) =>
          prevData.map((observingTime) => ({
            ...observingTime,
            MeteorologicalEntry: observingTime.MeteorologicalEntry.map(
              (entry) =>
                entry.id === selectedRecord.id
                  ? {
                    ...entry,
                    ...values,
                    squallConfirmed: values.squallConfirmed
                      ? "true"
                      : "false",
                  }
                  : entry
            ),
          }))
        );

        toast.success("Record updated successfully");
        setIsEditDialogOpen(false);
        setSelectedRecord(null);
        setSelectedObservingTime(null);
      } catch (error) {
        console.error("Error updating record:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update record"
        );
      } finally {
        setIsSaving(false);
      }
    };

    const getStationNameById = (stationId: string): string => {
      const station = stations.find((s) => s.stationId === stationId);
      return station ? station.name : stationId;
    };

    const getInitialValues = () => {
      if (!selectedRecord) return {};

      return {
        subIndicator: selectedRecord.subIndicator || "",
        alteredThermometer: selectedRecord.alteredThermometer || "",
        barAsRead: selectedRecord.barAsRead || "",
        correctedForIndex: selectedRecord.correctedForIndex || "",
        heightDifference: selectedRecord.heightDifference || "",
        stationLevelPressure: selectedRecord.stationLevelPressure || "",
        seaLevelReduction: selectedRecord.seaLevelReduction || "",
        correctedSeaLevelPressure:
          selectedRecord.correctedSeaLevelPressure || "",
        afternoonReading: selectedRecord.afternoonReading || "",
        pressureChange24h: selectedRecord.pressureChange24h || "",
        dryBulbAsRead: selectedRecord.dryBulbAsRead || "",
        wetBulbAsRead: selectedRecord.wetBulbAsRead || "",
        maxMinTempAsRead: selectedRecord.maxMinTempAsRead || "",
        dryBulbCorrected: selectedRecord.dryBulbCorrected || "",
        wetBulbCorrected: selectedRecord.wetBulbCorrected || "",
        maxMinTempCorrected: selectedRecord.maxMinTempCorrected || "",
        Td: selectedRecord.Td || "",
        relativeHumidity: selectedRecord.relativeHumidity || "",
        squallConfirmed: selectedRecord.squallConfirmed === "true",
        squallForce: selectedRecord.squallForce || "",
        squallDirection: selectedRecord.squallDirection || "",
        squallTime: selectedRecord.squallTime || "",
        horizontalVisibility: selectedRecord.horizontalVisibility || "",
        miscMeteors: selectedRecord.miscMeteors || "",
        pastWeatherW1: selectedRecord.pastWeatherW1 || "",
        pastWeatherW2: selectedRecord.pastWeatherW2 || "",
        presentWeatherWW: selectedRecord.presentWeatherWW || "",
        c2Indicator: selectedRecord.c2Indicator || "",
      };
    };

    return (
      <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
        <div className="text-center font-bold text-xl border-b-2 border-indigo-600 pb-2 text-indigo-800">
          First Card Data Table
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between mb-6 gap-4 bg-slate-100 p-3 sm:p-4 rounded-lg">

            {/* Date Navigation Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">

              {/* Navigation Controls - Responsive Layout */}
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 w-full sm:w-auto">

                {/* Previous/Next Buttons with Date Inputs */}
                <div className="flex items-center gap-2 w-full xs:w-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousWeek}
                    className="hover:bg-slate-200 flex-shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Date Range Inputs - Responsive */}

                  <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleDateChange("start", e.target.value)}
                      max={endDate}
                      className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
                    />
                    <span className="text-sm text-slate-600 whitespace-nowrap">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => handleDateChange("end", e.target.value)}
                      min={startDate}
                      max={format(new Date(), "yyyy-MM-dd")}
                      className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
                    />
                  </div>


                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextWeek}
                    className="hover:bg-slate-200 flex-shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions and Filters Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
              {/* Export Button */}
              {(isSuperAdmin || isStationAdmin) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    className="flex items-center gap-2 hover:bg-green-50 border-green-200 text-green-700 w-full sm:w-auto justify-center sm:justify-start"
                    disabled={flattenedData.length === 0}
                  >
                    <Download className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Export CSV</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToTXT}
                    className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 w-full sm:w-auto justify-center sm:justify-start"
                    disabled={flattenedData.length === 0}
                  >
                    <Download className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Export TXT</span>
                  </Button>
                </div>
              )}


              {/* Station Filter - Super Admin Only */}
              {isSuperAdmin && (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-purple-500 flex-shrink-0" />
                    <Label
                      htmlFor="stationFilter"
                      className="whitespace-nowrap font-medium text-slate-700 text-sm"
                    >
                      Station:
                    </Label>
                  </div>
                  <Select
                    value={stationFilter}
                    onValueChange={setStationFilter}
                  >
                    <SelectTrigger className="w-full xs:w-[180px] sm:w-[200px] border-slate-300 focus:ring-purple-500 text-sm">
                      <SelectValue placeholder="All Stations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stations</SelectItem>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          <span className="block truncate">
                            {station.name} ({station.stationId})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">

            <div className="flex flex-col md:flex-row md:justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300 gap-3 sm:gap-4">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                <div className="flex flex-col items-center min-w-[100px]">
                  <Label className="text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2 text-center">
                    DATA TYPE
                  </Label>
                  <div className="flex gap-1">
                    {["S", "Y"].map((char, i) => (
                      <Input
                        key={`dataType-${i}`}
                        className="w-8 sm:w-10 h-8 sm:h-9 text-center p-1 bg-slate-100 border border-slate-400 shadow-sm text-xs sm:text-sm"
                        defaultValue={char}
                        readOnly
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                    STATION NO
                  </div>
                  <div className="flex h-8 sm:h-9 w-full min-w-[80px] sm:min-w-[100px] border border-slate-400 rounded-lg px-2 items-center justify-center bg-white text-xs sm:text-sm font-mono truncate">
                    {user?.station?.stationId || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                    YEAR
                  </div>
                  <div className="flex">
                    <div className="w-8 sm:w-10 h-8 sm:h-9 border border-slate-400 flex items-center justify-center p-1 font-mono rounded-l-md bg-white text-xs sm:text-sm">
                      {new Date().getFullYear().toString().slice(-2, -1)}
                    </div>
                    <div className="w-8 sm:w-10 h-8 sm:h-9 border-t border-r border-b border-slate-400 flex items-center justify-center p-1 font-mono rounded-r-md bg-white text-xs sm:text-sm">
                      {new Date().getFullYear().toString().slice(-1)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center min-w-[120px] sm:min-w-[150px]">
                  <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                    STATION
                  </div>
                  <div className="h-8 sm:h-9 w-full border border-slate-400 px-2 flex items-center justify-center font-mono rounded-md bg-white text-xs sm:text-sm text-center truncate">
                    {user?.station?.name || "N/A"}
                  </div>
                </div>
              </div>
            </div>


            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th
                        rowSpan={2}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        GG
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        CI
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        Date
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        Station
                      </th>
                      <th
                        rowSpan={2}
                        colSpan={9}
                        className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 p-1 text-purple-800"
                      >
                        BAR PRESSURE
                      </th>
                      <th
                        colSpan={6}
                        className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 p-1 text-cyan-800"
                      >
                        TEMPERATURE
                      </th>
                      <th
                        rowSpan={2}
                        colSpan={1}
                        className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                      >
                        Td
                      </th>
                      <th
                        rowSpan={2}
                        colSpan={1}
                        className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                      >
                        R.H.
                      </th>
                      <th
                        rowSpan={2}
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                      >
                        SQUALL
                      </th>
                      <th
                        rowSpan={2}
                        colSpan={1}
                        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                      >
                        VV
                      </th>
                      <th
                        rowSpan={2}
                        colSpan={1}
                        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                      ></th>
                      <th
                        rowSpan={2}
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                      >
                        WEATHER
                      </th>
                     
                    </tr>
                    <tr>
                      {/* Row for temperature column groups */}
                      <th
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1 text-cyan-800 text-center"
                      >
                        As Read
                      </th>
                      <th
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1 text-cyan-800 text-center"
                      >
                        Corrected
                      </th>
                    </tr>
                    <tr>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                        <div className="h-16 text-indigo-800">
                          Time of Observation (UTC)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                        <div className="h-16 text-indigo-800">Indicator</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                        <div className="h-16 text-indigo-800">Date</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                        <div className="h-16 text-indigo-800">
                          Station Name & ID
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          Attached Thermometer (°C)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          Bar As Read (hPa)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          Corrected for Index
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          Height Difference Correction (hPa)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          Station Level Pressure (QFE)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          Sea Level Reduction
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          Sea Level Pressure (QNH)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          Altimeter setting (QNH)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                        <div className="h-16 text-purple-800">
                          24-Hour Pressure Change
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                        <div className="h-16 text-cyan-800">Dry Bulb (°C)</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                        <div className="h-16 text-cyan-800">Wet Bulb (°C)</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                        <div className="h-16 text-cyan-800">MAX/MIN (°C)</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                        <div className="h-16 text-cyan-800">Dry Bulb (°C)</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                        <div className="h-16 text-cyan-800">Wet Bulb (°C)</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                        <div className="h-16 text-cyan-800">MAX/MIN (°C)</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                        <div className="h-16 text-teal-800">
                          Dew Point Temperature (°C)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                        <div className="h-16 text-teal-800">
                          Relative Humidity (%)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                        <div className="h-16 text-amber-800">Force (KTS)</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                        <div className="h-16 text-amber-800">
                          Direction (dq)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                        <div className="h-16 text-amber-800">Time (q1)</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                        <div className="h-16 text-blue-800">
                          Horizontal Visibility (km)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                        <div className="h-16 text-blue-800">
                          Misc. Meteors (Code)
                        </div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                        <div className="h-16 text-emerald-800">Past W₁</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                        <div className="h-16 text-emerald-800">Past W2</div>
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                        <div className="h-16 text-emerald-800">Present ww</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={27} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="ml-3 text-indigo-600 font-medium">
                              Loading data...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td colSpan={27} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center text-slate-500">
                            <CloudSun
                              size={48}
                              className="text-slate-400 mb-3"
                            />
                            <p className="text-lg font-medium">
                              No meteorological data found
                            </p>
                            <p className="text-sm">
                              Try selecting a different date or station
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.flatMap((observingTime, obsIndex) =>
                        observingTime.MeteorologicalEntry.map(
                          (record, entryIndex) => {
                            const humidityClass = getWeatherStatusColor(
                              record.relativeHumidity
                            );
                            const recordDate = observingTime.utcTime
                              ? format(
                                new Date(observingTime.utcTime),
                                "yyyy-MM-dd"
                              )
                              : "--";
                            const canEdit = user && canEditRecord(record, user);
                            const rowIndex =
                              obsIndex *
                              observingTime.MeteorologicalEntry.length +
                              entryIndex;

                            return (
                              <tr
                                key={record.id}
                                className={`text-center font-mono hover:bg-slate-50 transition-colors ${rowIndex % 2 === 0
                                  ? "bg-white"
                                  : "bg-slate-50"
                                  }`}
                              >
                                <td className="border border-slate-300 p-1 font-medium text-indigo-700">
                                  {utcToHour(observingTime.utcTime.toString())}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.subIndicator || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-indigo-700 whitespace-nowrap">
                                  {" "}
                                  {new Date(
                                    observingTime.utcTime
                                  ).toLocaleDateString()}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  <Badge
                                    variant="outline"
                                    className="font-mono"
                                  >
                                    {observingTime.station?.name +
                                      " " +
                                      observingTime.station?.stationId || "--"}
                                  </Badge>
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.alteredThermometer || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                  {record.barAsRead || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.correctedForIndex || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.heightDifference || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                  {record.stationLevelPressure || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.seaLevelReduction || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-purple-700">
                                  {record.correctedSeaLevelPressure || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.afternoonReading || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.pressureChange24h || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                                  {record.dryBulbAsRead || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.wetBulbAsRead || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.maxMinTempAsRead || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                                  {record.dryBulbCorrected || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.wetBulbCorrected || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.maxMinTempCorrected || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-teal-700">
                                  {record.Td || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  <Badge
                                    variant="outline"
                                    className={`${humidityClass} text-white`}
                                  >
                                    {record.relativeHumidity || "--"}
                                  </Badge>
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-amber-700">
                                  {record.squallForce || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.squallDirection || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.squallTime || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-blue-700">
                                  {record.horizontalVisibility
                                    ? Number.parseInt(
                                      record.horizontalVisibility
                                    ) %
                                      10 ===
                                      0
                                      ? Number.parseInt(
                                        record.horizontalVisibility,
                                        10
                                      ) / 10
                                      : (
                                        Number.parseInt(
                                          record.horizontalVisibility,
                                          10
                                        ) / 10
                                      ).toFixed(1)
                                    : "--"}
                                </td>

                                <td className="border border-slate-300 p-1">
                                  {record.miscMeteors || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.pastWeatherW1 || "--"}
                                </td>
                                <td className="border border-slate-300 p-1">
                                  {record.pastWeatherW2 || "--"}
                                </td>
                                <td className="border border-slate-300 p-1 font-medium text-emerald-700">
                                  {record.presentWeatherWW || "--"}
                                </td>
                               
                              </tr>
                            );
                          }
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Edit Dialog with Formik and Auto-calculations */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="w-[90vw] !max-w-[95vw] rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-indigo-800">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Meteorological Data
                  </div>
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Editing record from{" "}
                  {selectedObservingTime?.station?.name || "Unknown Station"} (
                  {selectedObservingTime?.station?.stationId || "Unknown"}) on{" "}
                  {selectedObservingTime?.utcTime
                    ? format(
                      new Date(selectedObservingTime.utcTime),
                      "MMMM d, yyyy"
                    )
                    : "Unknown Date"}
                </DialogDescription>
                <div className="h-1 w-20 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400 mt-2"></div>
              </DialogHeader>

              {selectedRecord && (
                <Formik
                  initialValues={getInitialValues()}
                  validationSchema={meteorologicalValidationSchema}
                  onSubmit={handleSaveEdit}
                  enableReinitialize
                >
                  {({ errors, touched, values, setFieldValue }) => {
                    // Auto-calculation effect for temperature fields
                    useEffect(() => {
                      if (values.dryBulbAsRead && values.wetBulbAsRead) {
                        const result = calculateDewPointAndHumidity(
                          values.dryBulbAsRead,
                          values.wetBulbAsRead
                        );
                        if (result) {
                          setFieldValue("Td", result.Td);
                          setFieldValue(
                            "relativeHumidity",
                            result.relativeHumidity
                          );
                        }
                      }
                    }, [
                      values.dryBulbAsRead,
                      values.wetBulbAsRead,
                      setFieldValue,
                    ]);

                    // Auto-calculation effect for pressure fields
                    useEffect(() => {
                      if (
                        values.dryBulbAsRead &&
                        values.barAsRead &&
                        selectedObservingTime?.station?.stationId
                      ) {
                        const stationId =
                          selectedObservingTime.station.stationId;
                        const pressureResult = calculatePressureValues(
                          values.dryBulbAsRead,
                          values.barAsRead,
                          stationId
                        );

                        if (pressureResult) {
                          setFieldValue(
                            "stationLevelPressure",
                            pressureResult.stationLevelPressure
                          );
                          setFieldValue(
                            "heightDifference",
                            pressureResult.heightDifference
                          );

                          // Calculate sea level pressure
                          const seaResult = calculateSeaLevelPressure(
                            values.dryBulbAsRead,
                            pressureResult.stationLevelPressure,
                            stationId
                          );

                          if (seaResult) {
                            setFieldValue(
                              "seaLevelReduction",
                              seaResult.seaLevelReduction
                            );
                            setFieldValue(
                              "correctedSeaLevelPressure",
                              seaResult.correctedSeaLevelPressure
                            );
                          }
                        }
                      }
                    }, [
                      values.dryBulbAsRead,
                      values.barAsRead,
                      setFieldValue,
                      selectedObservingTime,
                    ]);

                    return (
                      <Form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                          {/* Input Fields */}
                          {[
                            {
                              id: "subIndicator",
                              label: "Indicator",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "alteredThermometer",
                              label: "Attached Thermometer (°C)",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "barAsRead",
                              label: "Bar As Read (hPa)",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "correctedForIndex",
                              label: "Corrected for Index",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "heightDifference",
                              label: "Height Difference Correction (hPa)",
                              bg: "bg-indigo-50",
                              readOnly: true,
                            },
                            {
                              id: "stationLevelPressure",
                              label: "Station Level Pressure (QFE)",
                              bg: "bg-blue-50",
                              readOnly: true,
                            },
                            {
                              id: "seaLevelReduction",
                              label: "Sea Level Reduction",
                              bg: "bg-indigo-50",
                              readOnly: true,
                            },
                            {
                              id: "correctedSeaLevelPressure",
                              label: "Sea Level Pressure (QNH)",
                              bg: "bg-blue-50",
                              readOnly: true,
                            },
                            {
                              id: "afternoonReading",
                              label: "Altimeter setting (QNH)",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "pressureChange24h",
                              label: "24-Hour Pressure Change",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "dryBulbAsRead",
                              label: "Dry Bulb As Read (°C)",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "wetBulbAsRead",
                              label: "Wet Bulb As Read (°C)",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "maxMinTempAsRead",
                              label: "MAX/MIN Temp As Read (°C)",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "dryBulbCorrected",
                              label: "Dry Bulb Corrected (°C)",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "wetBulbCorrected",
                              label: "Wet Bulb Corrected (°C)",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "maxMinTempCorrected",
                              label: "MAX/MIN Temp Corrected (°C)",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "Td",
                              label: "Dew Point Temperature (°C)",
                              bg: "bg-indigo-50",
                              readOnly: true,
                            },
                            {
                              id: "relativeHumidity",
                              label: "Relative Humidity (%)",
                              bg: "bg-blue-50",
                              readOnly: true,
                            },
                            {
                              id: "squallForce",
                              label: "Squall Force (KTS)",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "squallDirection",
                              label: "Squall Direction (°)",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "horizontalVisibility",
                              label: "Horizontal Visibility (km)",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "miscMeteors",
                              label: "Misc Meteors (Code)",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "pastWeatherW1",
                              label: "Past Weather (W₁)",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "pastWeatherW2",
                              label: "Past Weather (W₂)",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                            {
                              id: "presentWeatherWW",
                              label: "Present Weather (ww)",
                              bg: "bg-blue-50",
                              readOnly: false,
                            },
                            {
                              id: "c2Indicator",
                              label: "C2 Indicator",
                              bg: "bg-indigo-50",
                              readOnly: false,
                            },
                          ].map((field) => (
                            <div
                              key={field.id}
                              className={`space-y-1 p-3 rounded-lg ${field.bg} border border-white shadow-sm`}
                            >
                              <Label
                                htmlFor={field.id}
                                className="text-sm font-medium text-gray-700"
                              >
                                {field.label}
                                {field.readOnly && (
                                  <span className="ml-1 text-xs text-gray-500">
                                    (Auto-calculated)
                                  </span>
                                )}
                              </Label>
                              <Field
                                as={Input}
                                id={field.id}
                                name={field.id}
                                readOnly={field.readOnly}
                                className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${field.readOnly
                                  ? "opacity-70 cursor-not-allowed bg-gray-50"
                                  : ""
                                  } ${errors[field.id as keyof typeof errors] &&
                                    touched[field.id as keyof typeof touched]
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                    : ""
                                  }`}
                              />
                              <ErrorMessage
                                name={field.id}
                                component="div"
                                className="text-red-500 text-xs mt-1 font-medium"
                              />
                            </div>
                          ))}

                          {/* Squall Time Dropdown */}
                          <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                            <Label
                              htmlFor="squallTime"
                              className="text-sm font-medium text-gray-700"
                            >
                              Squall Time (qt)
                            </Label>
                            <Field name="squallTime">
                              {({ field, form }: any) => (
                                <select
                                  id="squallTime"
                                  name="squallTime"
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    form.setFieldValue("squallTime", e.target.value)
                                  }
                                  onBlur={field.onBlur}
                                  className={cn(
                                    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white",
                                    {
                                      "border-red-500 focus:border-red-500 focus:ring-red-200":
                                        errors.squallTime && touched.squallTime,
                                    }
                                  )}
                                >
                                  <option value="">-- Select Time (qt) --</option>
                                  <option value="0">
                                    0 → 0 to ½ hour before observation
                                  </option>
                                  <option value="1">
                                    1 → ½ to 1 hour before observation
                                  </option>
                                  <option value="2">
                                    2 → 1 to 1¼ hour before observation
                                  </option>
                                  <option value="3">
                                    3 → 1¼ to 2 hour before observation
                                  </option>
                                  <option value="4">
                                    4 → 2 to 2½ hour before observation
                                  </option>
                                  <option value="5">
                                    5 → 2½ to 3 hour before observation
                                  </option>
                                  <option value="6">
                                    6 → 3 to 4 hour before observation
                                  </option>
                                  <option value="7">
                                    7 → 4 to 5 hour before observation
                                  </option>
                                  <option value="8">
                                    8 → 5 to 6 hour before observation
                                  </option>
                                  <option value="9">
                                    9 → More than 6 hour before observation
                                  </option>
                                </select>
                              )}
                            </Field>
                            <ErrorMessage
                              name="squallTime"
                              component="div"
                              className="text-red-500 text-xs mt-1 font-medium"
                            />
                          </div>

                          {/* Squall Confirmed Checkbox */}
                          <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                            <Label
                              htmlFor="squallConfirmed"
                              className="text-sm font-medium text-gray-700"
                            >
                              Squall Confirmed
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Field
                                type="checkbox"
                                id="squallConfirmed"
                                name="squallConfirmed"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <Label
                                htmlFor="squallConfirmed"
                                className="text-sm text-gray-600"
                              >
                                Check if squall is confirmed
                              </Label>
                            </div>
                            <ErrorMessage
                              name="squallConfirmed"
                              component="div"
                              className="text-red-500 text-xs mt-1 font-medium"
                            />
                          </div>
                        </div>

                        <DialogFooter className="mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md transition-all"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="mr-2 h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Save Changes
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </Form>
                    );
                  }}
                </Formik>
              )}
            </DialogContent>
          </Dialog>

          {/* Permission Denied Dialog */}
          <Dialog
            open={isPermissionDeniedOpen}
            onOpenChange={setIsPermissionDeniedOpen}
          >
            <DialogContent className="max-w-md rounded-xl border-0 bg-white p-6 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Permission Denied
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-slate-700">
                  You don't have permission to edit this record. This could be
                  because:
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>The record is too old to edit</li>
                  <li>The record belongs to a different station</li>
                  <li>You don't have the required role permissions</li>
                </ul>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsPermissionDeniedOpen(false)}
                  className="bg-slate-200 text-slate-800 hover:bg-slate-300"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }
);

FirstCardTable.displayName = "FirstCardTable";
export default FirstCardTable;
