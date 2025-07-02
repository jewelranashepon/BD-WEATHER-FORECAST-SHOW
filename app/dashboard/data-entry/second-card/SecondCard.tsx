"use client";

import React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CloudIcon,
  CloudRainIcon,
  Wind,
  User,
  Sun,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { useWeatherObservationForm } from "@/stores/useWeatherObservationForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useHour } from "@/contexts/hourContext";
import HourSelector from "@/components/hour-selector";
import { TimeInfo } from "@/lib/data-type";

// Define the form data type
type WeatherObservationFormData = {
  clouds: {
    low: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
    medium: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
    high: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
  };
  totalCloud: {
    "total-cloud-amount"?: string;
  };
  significantClouds: {
    layer1: {
      form?: string;
      amount?: string;
      height?: string;
    };
    layer2: {
      form?: string;
      amount?: string;
      height?: string;
    };
    layer3: {
      form?: string;
      amount?: string;
      height?: string;
    };
    layer4: {
      form?: string;
      amount?: string;
      height?: string;
    };
  };
  rainfall: {
    "time-start"?: string;
    "time-end"?: string;
    "since-previous"?: string;
    "during-previous"?: string;
    "last-24-hours"?: string;
    isIntermittentRain?: boolean; // ← এখানে অবশ্যই যোগ করুন
  };
  wind: {
    "first-anemometer"?: string;
    "second-anemometer"?: string;
    speed?: string;
    "wind-direction"?: string;
  };
  observer: {
    "observer-initial"?: string;
    "observation-time"?: string;
  };
  metadata: {
    stationId?: string;
    submittedAt?: string;
  };
};

// Updated validation schema with HH:MM format for rainfall times
const rainfallSchema = Yup.object({
  rainfall: Yup.object({
    // "time-start": Yup.string()
    //   .required("Start time is required")
    //   .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:MM 24-hour format"),
    // "date-start": Yup.string().required("Start date is required"),
    // "time-end": Yup.string()
    //   .required("End time is required")
    //   .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:MM 24-hour format"),
    // "date-end": Yup.string().required("End date is required"),

    "since-previous": Yup.string()
      .required("Since previous observation is required")
      .test(
        "is-non-negative-number",
        "Please enter a non-negative number",
        (value) =>
          !value ||
          (Number.parseFloat(value) >= 0 && !isNaN(Number.parseFloat(value)))
      ),

    "during-previous": Yup.string()
      .required("During previous 6 hours is required")
      .matches(/^\d{4}$/, "Must be a 4-digit integer between 0000 and 9999"),

    "last-24-hours": Yup.string()
      .required("Last 24 hours precipitation is required")
      .test(
        "is-non-negative-number",
        "Please enter a non-negative number",
        (value) =>
          !value ||
          (Number.parseFloat(value) >= 0 && !isNaN(Number.parseFloat(value)))
      ),
  }),
});

// Update the windSchema to enforce the specific validation requirements
const windSchema = Yup.object({
  wind: Yup.object({
    "first-anemometer": Yup.string()
      .required("1st Anemometer reading is required")
      .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10123)"),

    "second-anemometer": Yup.string()
      .required("2nd Anemometer reading is required")
      .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10123)"),

    speed: Yup.string()
      .required("Wind speed is required")
      .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 025, 100)"),

    "wind-direction": Yup.string()
      .required("Wind direction is required")
      .test(
        "is-valid-direction",
        "Must be wind direction between 5 to 360 degrees",
        (value) => {
          if (!value) return false;
          if (value === "00") return true;
          const num = Number(value);
          return Number.isInteger(num) && num >= 5 && num <= 360;
        }
      ),
  }),
});

// Update the cloudSchema to use English error messages
const cloudSchema = Yup.object({
  clouds: Yup.object({
    low: Yup.object({
      form: Yup.string().required("Low cloud form is required"),
      amount: Yup.string().required("Low cloud amount is required"),
      height: Yup.string().required("Low cloud height is required"),
      direction: Yup.string().required("Low cloud direction is required"),
    }),
    medium: Yup.object({
      form: Yup.string().required("Medium cloud form is required"),
      amount: Yup.string().required("Medium cloud amount is required"),
      height: Yup.string().required("Medium cloud height is required"),
      direction: Yup.string().required("Medium cloud direction is required"),
    }),
    high: Yup.object({
      form: Yup.string().required("High cloud form is required"),
      amount: Yup.string().required("High cloud amount is required"),
      direction: Yup.string().required("High cloud direction is required"),
    }),
  }),
});

// Update the totalCloudSchema to use English error messages
const totalCloudSchema = Yup.object({
  totalCloud: Yup.object({
    "total-cloud-amount": Yup.string().required(
      "Total cloud amount is required"
    ),
  }),
});

// Update the significantCloudSchema to use English error messages
const significantCloudSchema = Yup.object({
  significantClouds: Yup.object({
    layer1: Yup.object({
      form: Yup.string().required("Layer 1 form is required"),
      amount: Yup.string().required("Layer 1 amount is required"),
      height: Yup.string()
        .required("Layer 1 height is required")
        .matches(/^[0-9]+$/, "Please enter numbers only"),
    }),
    layer2: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9]*$/, "Please enter numbers only"),
    }),
    layer3: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9]*$/, "Please enter numbers only"),
    }),
    layer4: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9]*$/, "Please enter numbers only"),
    }),
  }),
});

// Update the observerSchema to use English error messages
const observerSchema = Yup.object({
  observer: Yup.object({
    "observer-initial": Yup.string().required("Observer initials are required"),
    "observation-time": Yup.string().required("Observation time is required"),
  }),
});

// Combined schema for the entire form
const validationSchema = Yup.object({
  ...cloudSchema.fields,
  ...totalCloudSchema.fields,
  ...significantCloudSchema.fields,
  ...rainfallSchema.fields,
  ...windSchema.fields,
  ...observerSchema.fields,
});

export default function SecondCardForm({ timeInfo }: { timeInfo: TimeInfo[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("cloud");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // cloud, n, significant-cloud, rainfall, wind, observer
  const { data: session } = useSession();

  const {
    isHourSelected,
    secondCardError,
    selectedHour,
    isLoading,
    resetStates,
  } = useHour();

  // Get the persistent form store
  const { formData, updateFields, resetForm } = useWeatherObservationForm();

  // Tab styles with gradients and more vibrant colors
  const tabStyles = {
    cloud: {
      tab: "from-blue-500 to-blue-600",
      icon: <CloudIcon className="w-4 h-4" />,
      iconColor: "text-blue-500",
      iconBg: "from-blue-100 to-blue-50",
      originalTab:
        "border border-blue-500 px-4 py-3 !bg-blue-50 text-blue-800 hover:opacity-90 shadow-sm shadow-blue-500/50",
      card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
    },
    n: {
      tab: "from-yellow-500 to-yellow-600",
      icon: <Sun className="w-4 h-4" />,
      iconColor: "text-yellow-500",
      iconBg: "from-yellow-100 to-yellow-50",
      originalTab:
        "border border-yellow-500 px-4 py-3 !bg-yellow-50 text-yellow-800 hover:opacity-90 shadow-sm shadow-yellow-500/50",
      card: "bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-200 shadow-sm",
    },
    "significant-cloud": {
      tab: "from-purple-500 to-purple-600",
      icon: <CloudIcon className="w-4 h-4" />,
      iconColor: "text-purple-500",
      iconBg: "from-purple-100 to-purple-50",
      originalTab:
        "border border-purple-500 px-4 py-3 !bg-purple-50 text-purple-800 hover:opacity-90 shadow-sm shadow-purple-500/50",
      card: "bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-200 shadow-sm",
    },
    rainfall: {
      tab: "from-cyan-500 to-cyan-600",
      icon: <CloudRainIcon className="w-4 h-4" />,
      iconColor: "text-cyan-500",
      iconBg: "from-cyan-100 to-cyan-50",
      originalTab:
        "border border-cyan-500 px-4 py-3 !bg-cyan-50 text-cyan-800 hover:opacity-90 shadow-sm shadow-cyan-500/50",
      card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
    },
    wind: {
      tab: "from-green-500 to-green-600",
      icon: <Wind className="w-4 h-4" />,
      iconColor: "text-green-500",
      iconBg: "from-green-100 to-green-50",
      originalTab:
        "border border-green-500 px-4 py-3 !bg-green-50 text-green-800 hover:opacity-90 shadow-sm shadow-green-500/50",
      card: "bg-gradient-to-br from-green-50 to-white border-l-4 border-green-200 shadow-sm",
    },
    observer: {
      tab: "from-orange-500 to-orange-600",
      icon: <User className="w-4 h-4" />,
      iconColor: "text-orange-500",
      iconBg: "from-orange-100 to-orange-50",
      originalTab:
        "border border-orange-500 px-4 py-3 !bg-orange-50 text-orange-800 hover:opacity-90 shadow-sm shadow-orange-500/50",
      card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
    },
  };

  // Initialize Formik
  const formik = useFormik<WeatherObservationFormData>({
    initialValues: {
      clouds: {
        low: formData?.clouds?.low || {},
        medium: formData?.clouds?.medium || {},
        high: formData?.clouds?.high || {},
      },
      totalCloud: formData?.totalCloud || {},
      significantClouds: {
        layer1: formData?.significantClouds?.layer1 || {},
        layer2: formData?.significantClouds?.layer2 || {},
        layer3: formData?.significantClouds?.layer3 || {},
        layer4: formData?.significantClouds?.layer4 || {},
      },
      rainfall: {
        // "date-start": formData?.rainfall?.["date-start"] || "",
        // "time-start": formData?.rainfall?.["time-start"] || "",
        // "date-end": formData?.rainfall?.["date-end"] || "",
        // "time-end": formData?.rainfall?.["time-end"] || "",
        "since-previous": formData?.rainfall?.["since-previous"] || "",
        "during-previous": formData?.rainfall?.["during-previous"] || "",
        "last-24-hours": formData?.rainfall?.["last-24-hours"] || "",
        isIntermittentRain: formData?.rainfall?.isIntermittentRain || false,
      },

      wind: formData?.wind || {},
      observer: {
        "observer-initial": session?.user?.name || "",
        "observation-time": new Date()
          .getUTCHours()
          .toString()
          .padStart(2, "0"),
        ...formData?.observer,
      },
      metadata: {
        stationId: session?.user?.station?.stationId || "",
        ...formData?.metadata,
      },
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  // Function to check if a tab is valid
  const isTabValid = (tabName: string) => {
    const errors = formik.errors;
    const touched = formik.touched;

    switch (tabName) {
      case "cloud":
        return !(
          (touched.clouds?.low && errors.clouds?.low) ||
          (touched.clouds?.medium && errors.clouds?.medium) ||
          (touched.clouds?.high && errors.clouds?.high)
        );
      case "n":
        return !(
          touched.totalCloud?.["total-cloud-amount"] &&
          errors.totalCloud?.["total-cloud-amount"]
        );
      case "significant-cloud":
        return !(
          touched.significantClouds?.layer1 && errors.significantClouds?.layer1
        );
      case "rainfall":
        return !(
          // (touched.rainfall?.["time-start"] &&
          //   errors.rainfall?.["time-start"]) ||
          // (touched.rainfall?.["time-end"] && errors.rainfall?.["time-end"]) ||
          (
            (touched.rainfall?.["since-previous"] &&
              errors.rainfall?.["since-previous"]) ||
            (touched.rainfall?.["during-previous"] &&
              errors.rainfall?.["during-previous"]) ||
            (touched.rainfall?.["last-24-hours"] &&
              errors.rainfall?.["last-24-hours"])
          )
        );
      case "wind":
        return !(
          (touched.wind?.["first-anemometer"] &&
            errors.wind?.["first-anemometer"]) ||
          (touched.wind?.["second-anemometer"] &&
            errors.wind?.["second-anemometer"]) ||
          (touched.wind?.speed && errors.wind?.speed) ||
          (touched.wind?.["wind-direction"] && errors.wind?.["wind-direction"])
        );
      case "observer":
        return !(
          (touched.observer?.["observer-initial"] &&
            errors.observer?.["observer-initial"]) ||
          (touched.observer?.["observation-time"] &&
            errors.observer?.["observation-time"])
        );
      default:
        return true;
    }
  };

  // Function to validate current tab before proceeding
  // Update the validateTab function to validate all fields in the tab
  const validateTab = (tabName: string) => {
    let fieldsToValidate: string[] = [];

    switch (tabName) {
      case "cloud":
        fieldsToValidate = [
          "clouds.low.form",
          "clouds.low.amount",
          "clouds.low.height",
          "clouds.low.direction",
          "clouds.medium.form",
          "clouds.medium.amount",
          "clouds.medium.height",
          "clouds.medium.direction",
          "clouds.high.form",
          "clouds.high.amount",
          "clouds.high.height",
          "clouds.high.direction",
        ];
        break;
      case "n":
        fieldsToValidate = ["totalCloud.total-cloud-amount"];
        break;
      case "significant-cloud":
        fieldsToValidate = [
          "significantClouds.layer1.form",
          "significantClouds.layer1.amount",
          "significantClouds.layer1.height",
          "significantClouds.layer2.height",
          "significantClouds.layer3.height",
          "significantClouds.layer4.height",
        ];
        break;
      case "rainfall":
        fieldsToValidate = [
          // "rainfall.time-start",
          // "rainfall.time-end",
          "rainfall.since-previous",
          "rainfall.during-previous",
          "rainfall.last-24-hours",
        ];
        break;
      case "wind":
        fieldsToValidate = [
          "wind.first-anemometer",
          "wind.second-anemometer",
          "wind.speed",
          "wind.wind-direction",
        ];
        break;
      case "observer":
        fieldsToValidate = [
          "observer.observer-initial",
          "observer.observation-time",
        ];
        break;
    }

    // Touch all fields in the current tab to trigger validation
    const touchedFields = {};
    fieldsToValidate.forEach((field) => {
      const fieldParts = field.split(".");
      if (fieldParts.length === 2) {
        touchedFields[fieldParts[0]] = {
          ...formik.touched[fieldParts[0]],
          [fieldParts[1]]: true,
        };
      } else if (fieldParts.length === 3) {
        touchedFields[fieldParts[0]] = {
          ...formik.touched[fieldParts[0]],
          [fieldParts[1]]: {
            ...formik.touched[fieldParts[0]]?.[fieldParts[1]],
            [fieldParts[2]]: true,
          },
        };
      }
    });

    formik.setTouched({ ...formik.touched, ...touchedFields }, true);

    // Check if there are any errors in the validated fields
    return !fieldsToValidate.some((field) => {
      const fieldParts = field.split(".");
      if (fieldParts.length === 2) {
        return formik.errors[fieldParts[0]]?.[fieldParts[1]];
      } else if (fieldParts.length === 3) {
        return formik.errors[fieldParts[0]]?.[fieldParts[1]]?.[fieldParts[2]];
      }
      return false;
    });
  };

  // Enhanced setActiveTab function that validates before changing tabs
  const handleTabChange = (tabName: string) => {
    // If trying to navigate away from current tab, validate it first
    if (activeTab !== tabName) {
      if (!validateTab(activeTab)) {
        toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন", {
          description:
            "অন্য ট্যাবে যাওয়ার আগে বর্তমান ট্যাবের সকল তথ্য পূরণ করুন",
        });
        return;
      }
    }
    setActiveTab(tabName);
  };

  // Initialize session-specific values when session is available
  useEffect(() => {
    if (session?.user) {
      formik.setFieldValue(
        "observer.observer-initial",
        session.user.name || ""
      );
      formik.setFieldValue(
        "metadata.stationId",
        session.user.station?.stationId || ""
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Set observation time on initial load (only runs once)
  useEffect(() => {
    if (!formik.values.observer["observation-time"]) {
      const utcHour = new Date().getUTCHours().toString().padStart(2, "0");
      formik.setFieldValue("observer.observation-time", utcHour);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync formik values with the store
  useEffect(() => {
    updateFields(formik.values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values]);

  // Update the handleNext function to validate the current tab before proceeding
  const handleNext = () => {
    // Validate current tab before proceeding
    if (validateTab(activeTab)) {
      const nextStep = Math.min(currentStep + 1, totalSteps);
      setCurrentStep(nextStep);
      setActiveTab(getTabForStep(nextStep));
    } else {
      toast.error("Please fill in all required fields correctly", {
        description: "You need to complete the current tab before proceeding",
      });
    }
  };

  const handlePrevious = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    setActiveTab(getTabForStep(prevStep));
  };

  const getTabForStep = (step: number) => {
    const steps = [
      "cloud",
      "n",
      "significant-cloud",
      "rainfall",
      "wind",
      "observer",
    ];
    return steps[step - 1] || "cloud";
  };

  // Handle input changes and update the form data state
  // Update the handleInputChange function to validate time fields immediately
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldTouched(name, true, true);

    // For numeric fields, validate immediately
    const numericFields = [
      "since-previous",
      "during-previous",
      "last-24-hours",
      "first-anemometer",
      "second-anemometer",
      "speed",
      "wind-direction",
    ];

    // Check if this is a numeric field and contains non-numeric characters
    const isNumericField = numericFields.some((field) => name.includes(field));
    if (isNumericField && value !== "" && !/^[0-9]+(\.[0-9]+)?$/.test(value)) {
      // Touch the field to trigger validation
      const fieldPath = name.includes("rainfall")
        ? `rainfall.${name.replace("rainfall-", "")}`
        : `wind.${name}`;

      formik.setFieldTouched(fieldPath, true, false);

      // Show toast for immediate feedback
      formik.setFieldTouched(name, true, false);

      toast.error("Please enter numbers only", {
        description: `${name} field should contain numbers only`,
        duration: 3000,
      });
    }

    // Validate time fields for HH:MM format
    // if (name === "time-start" || name === "time-end") {
    //   if (value !== "" && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    //     formik.setFieldTouched(`rainfall.${name}`, true, false);
    //     toast.error("Invalid time format", {
    //       description: "Please enter time in HH:MM format (00:00 to 23:59)",
    //       duration: 3000,
    //     });
    //   }
    // }

    // Update the appropriate section of the form data based on the input name
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "");
      formik.setFieldValue(`clouds.low.${field}`, value);
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "");
      formik.setFieldValue(`clouds.medium.${field}`, value);
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "");
      formik.setFieldValue(`clouds.high.${field}`, value);
    } else if (name.startsWith("sig-cloud-layer1-")) {
      const field = name.replace("sig-cloud-layer1-", "");
      formik.setFieldValue(`significantClouds.layer1.${field}`, value);
    } else if (name.startsWith("sig-cloud-layer2-")) {
      const field = name.replace("sig-cloud-layer2-", "");
      formik.setFieldValue(`significantClouds.layer2.${field}`, value);
    } else if (name.startsWith("sig-cloud-layer3-")) {
      const field = name.replace("sig-cloud-layer3-", "");
      formik.setFieldValue(`significantClouds.layer3.${field}`, value);
    } else if (name.startsWith("sig-cloud-layer4-")) {
      const field = name.replace("sig-cloud-layer4-", "");
      formik.setFieldValue(`significantClouds.layer4.${field}`, value);
    } else if (
      name.startsWith("rainfall-") ||
      name === "date-start" ||
      name === "time-start" ||
      name === "date-end" ||
      name === "time-end" ||
      name === "since-previous" ||
      name === "during-previous" ||
      name === "last-24-hours" ||
      name === "isIntermittentRain"
    ) {
      const field = name.startsWith("rainfall-")
        ? name.replace("rainfall-", "")
        : name;

      formik.setFieldValue(`rainfall.${field}`, value);
    } else if (
      name === "first-anemometer" ||
      name === "second-anemometer" ||
      name === "speed" ||
      name === "wind-direction"
    ) {
      formik.setFieldValue(`wind.${name}`, value);
      // formik.setFieldTouched(`wind.${name}`, true, true);
    } else if (name === "observer-initial") {
      formik.setFieldValue("observer.observer-initial", value);
    }
  };

  // Handle select changes for dropdown fields
  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "");
      formik.setFieldValue(`clouds.low.${field}`, value);
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "");
      formik.setFieldValue(`clouds.medium.${field}`, value);
    } else if (name === "observation-time") {
      formik.setFieldValue("observer.observation-time", value);
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "");
      formik.setFieldValue(`clouds.high.${field}`, value);
    } else if (name.startsWith("layer1-")) {
      const field = name.replace("layer1-", "");
      formik.setFieldValue(`significantClouds.layer1.${field}`, value);
    } else if (name.startsWith("layer2-")) {
      const field = name.replace("layer2-", "");
      formik.setFieldValue(`significantClouds.layer2.${field}`, value);
    } else if (name.startsWith("layer3-")) {
      const field = name.replace("layer3-", "");
      formik.setFieldValue(`significantClouds.layer3.${field}`, value);
    } else if (name.startsWith("layer4-")) {
      const field = name.replace("layer4-", "");
      formik.setFieldValue(`significantClouds.layer4.${field}`, value);
    } else if (name === "total-cloud-amount") {
      formik.setFieldValue("totalCloud.total-cloud-amount", value);
    } else if (
      name.startsWith("time-") ||
      name.startsWith("since-") ||
      name.startsWith("during-") ||
      name.startsWith("last-")
    ) {
      formik.setFieldValue(`rainfall.${name}`, value);
    }
  };

  // Reset form function
  const handleReset = () => {
    // Clear all form data except station info
    const resetValues = {
      clouds: {
        low: {},
        medium: {},
        high: {},
      },
      totalCloud: {},
      significantClouds: {
        layer1: {},
        layer2: {},
        layer3: {},
        layer4: {},
      },
      rainfall: {},
      wind: {},
      observer: {
        "observer-initial": session?.user?.name || "",
        "observation-time": new Date()
          .getUTCHours()
          .toString()
          .padStart(2, "0"),
      },
      metadata: {
        stationId: session?.user?.station?.stationId || "",
      },
    };

    formik.resetForm({ values: resetValues });
    resetForm();

    // Show toast notification
    toast.info("All form data has been cleared.");

    // Reset to first tab
    setCurrentStep(1);
    setActiveTab("cloud");
  };

  async function handleSubmit(values: WeatherObservationFormData) {
    // Prevent duplicate submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...values,
        observingTimeId: selectedHour || "",
        metadata: {
          ...values.metadata,
          submittedAt: new Date().toISOString(),
          stationId: session?.user?.station?.id || "",
        },
      };

      const response = await fetch("/api/save-observation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message, {
        description: `Entry #${data.dataCount} saved`,
      });

      resetForm();
      formik.resetForm();
      resetStates();
      setCurrentStep(1);
      setActiveTab("cloud");
      updateFields({});
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Helper function to render error message
  const renderErrorMessage = (fieldPath: string) => {
    const fieldParts = fieldPath.split(".");
    let error = null;

    if (fieldParts.length === 2) {
      error =
        formik.touched[fieldParts[0]]?.[fieldParts[1]] &&
        formik.errors[fieldParts[0]]?.[fieldParts[1]];
    } else if (fieldParts.length === 3) {
      error =
        formik.touched[fieldParts[0]]?.[fieldParts[1]]?.[fieldParts[2]] &&
        formik.errors[fieldParts[0]]?.[fieldParts[1]]?.[fieldParts[2]];
    }

    return error ? (
      <div className="text-red-500 text-sm mt-1 flex items-start">
        <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    ) : null;
  };

  const cloudAmountOptions = [
    { value: "0", label: "0 - No cloud" },
    { value: "1", label: "1 - 1 octa or less (1/10 or less but not zero)" },
    { value: "2", label: "2 - 2 octas (2/10 to 3/10)" },
    { value: "3", label: "3 - 3 octas (4/10)" },
    { value: "4", label: "4 - 4 octas (5/10)" },
    { value: "5", label: "5 - 5 octas (6/10)" },
    { value: "6", label: "6 - 6 octas (7/10 to 8/10)" },
    { value: "7", label: "7 - 7 octas (9/10 or more but not 10/10)" },
    { value: "8", label: "8 - 8 octas (10/10)" },
    {
      value: "9",
      label: "9 - sky obscured or cloud amount cannot be estimated.",
    },
    {
      value: "/",
      label: "/ - Key obscured or cloud amount cannot be estimated",
    },
  ];

  // Prevent form submission on Enter key and other unwanted submissions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Check if current tab is the last one
  // const isLastTab = currentStep === totalSteps;
  const isFirstTab = currentStep === 1;

  // Update the Tabs component to prevent direct tab navigation when current tab is invalid
  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading || secondCardError || !isHourSelected ? (
          <motion.div
            key="hour-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-white backdrop-blur-sm z-[5] px-6"
          >
            <HourSelector type="second" timeInfo={timeInfo} />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={formik.handleSubmit}
            className="w-full"
            onKeyDown={handleKeyDown}
          >
            <div className="relative rounded-xl">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  const currentTabIndex =
                    Object.keys(tabStyles).indexOf(activeTab);
                  const newTabIndex = Object.keys(tabStyles).indexOf(value);

                  if (
                    newTabIndex <= currentTabIndex ||
                    validateTab(activeTab)
                  ) {
                    setActiveTab(value);
                    setCurrentStep(newTabIndex + 1);
                  } else {
                    toast.error(
                      "Please fill in all required fields correctly",
                      {
                        description:
                          "You need to complete the current tab before proceeding",
                      }
                    );
                  }
                }}
                className="w-full"
              >
                {/* Responsive tabs list */}
                <div className="relative">
                  <div className="relative p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 max-w-max mx-auto">
                    <div className="relative flex flex-wrap justify-center items-center gap-1 p-1.5 rounded-full bg-gray-100/50">
                      {Object.entries(tabStyles).map(([key, style], index) => {
                        const isActive = activeTab === key;
                        const iconColor = style.iconColor || "text-blue-500";

                        return (
                          <motion.button
                            key={key}
                            type="button"
                            onClick={() => {
                              if (
                                activeTab !== key &&
                                !validateTab(activeTab)
                              ) {
                                toast.error("Complete required fields", {
                                  description:
                                    "Please fill all required information before switching tabs",
                                });
                                return false;
                              }
                              handleTabChange(key);
                            }}
                            className={cn(
                              "relative flex items-center justify-center px-6 py-2 rounded-full transition-all duration-300 transform",
                              "focus:outline-none min-w-[80px]",
                              isActive
                                ? "bg-white shadow shadow-blue-300 text-gray-900 font-semibold"
                                : "text-gray-600 hover:text-gray-800 hover:bg-white/50",
                              !isTabValid(key) &&
                                formik.submitCount > 0 &&
                                "!border-2 !border-red-400 !bg-red-50"
                            )}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              scale: isActive ? 1.05 : 1,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                              delay: index * 0.05,
                            }}
                          >
                            <div className="relative z-10 flex items-center gap-1">
                              <div
                                className={cn(
                                  "p-1.5 rounded-full transition-all duration-200",
                                  {
                                    "scale-110": isActive,
                                    [iconColor]: !isActive,
                                    "bg-white/20": isActive,
                                  }
                                )}
                              >
                                {React.cloneElement(style.icon, {
                                  className: cn("w-4 h-4", {
                                    "text-blue-500": isActive,
                                    [iconColor]: !isActive,
                                  }),
                                })}
                              </div>
                              <span className="text-base capitalize font-medium">
                                {key === "n"
                                  ? "Total Cloud"
                                  : key === "V.V"
                                    ? "VV"
                                    : key}
                              </span>
                            </div>

                            {isActive && (
                              <motion.div
                                className="absolute inset-0 bg-white rounded-full border border-gray-200 z-0"
                                layoutId="activePill"
                                transition={{
                                  type: "spring",
                                  bounce: 0.2,
                                  duration: 0.6,
                                }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {/* CLOUD Tab */}
                  <TabsContent
                    value="cloud"
                    className="mt-4 sm:mt-6 transition-all duration-500"
                  >
                    <Card
                      className={cn("overflow-hidden", tabStyles.cloud.card)}
                    >
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <CloudIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />{" "}
                          Cloud Observation
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="space-y-6 sm:space-y-8">
                          <CloudLevelSection
                            title="Low Cloud"
                            prefix="low-cloud"
                            color="blue"
                            data={formik.values.clouds.low}
                            onChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            renderError={(field) =>
                              renderErrorMessage(`clouds.low.${field}`)
                            }
                          />
                          <CloudLevelSection
                            title="Medium Cloud"
                            prefix="medium-cloud"
                            color="purple"
                            data={formik.values.clouds.medium}
                            onChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            renderError={(field) =>
                              renderErrorMessage(`clouds.medium.${field}`)
                            }
                          />
                          <CloudLevelSection
                            title="High Cloud"
                            prefix="high-cloud"
                            color="cyan"
                            data={formik.values.clouds.high}
                            onChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            renderError={(field) =>
                              renderErrorMessage(`clouds.high.${field}`)
                            }
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Next{" "}
                          <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* TOTAL CLOUD Tab */}
                  <TabsContent
                    value="n"
                    className="mt-4 sm:mt-6 transition-all duration-500"
                  >
                    <Card className={cn("overflow-hidden", tabStyles.n.card)}>
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <Sun className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Total
                          Cloud Amount
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="grid gap-4 sm:gap-6">
                          <SelectField
                            id="total-cloud-amount"
                            name="total-cloud-amount"
                            label="Total Cloud Amount (Octa)"
                            accent="yellow"
                            value={
                              formik.values.totalCloud["total-cloud-amount"] ||
                              ""
                            }
                            onValueChange={(value) =>
                              handleSelectChange("total-cloud-amount", value)
                            }
                            options={cloudAmountOptions.map((opt) => opt.value)}
                            optionLabels={cloudAmountOptions.map(
                              (opt) => opt.label
                            )}
                            error={renderErrorMessage(
                              "totalCloud.total-cloud-amount"
                            )}
                            required
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Next{" "}
                          <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* SIGNIFICANT CLOUD Tab */}
                  <TabsContent
                    value="significant-cloud"
                    className="mt-4 sm:mt-6 transition-all duration-500"
                  >
                    <Card
                      className={cn(
                        "overflow-hidden",
                        tabStyles["significant-cloud"].card
                      )}
                    >
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <CloudIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />{" "}
                          Significant Cloud
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="space-y-6 sm:space-y-8">
                          <SignificantCloudSection
                            title="1st Layer"
                            prefix="layer1"
                            color="purple"
                            data={formik.values.significantClouds.layer1}
                            onSelectChange={handleSelectChange}
                            renderError={(field) =>
                              renderErrorMessage(
                                `significantClouds.layer1.${field}`
                              )
                            }
                          />
                          <SignificantCloudSection
                            title="2nd Layer"
                            prefix="layer2"
                            color="fuchsia"
                            data={formik.values.significantClouds.layer2}
                            onSelectChange={handleSelectChange}
                            renderError={(field) =>
                              renderErrorMessage(
                                `significantClouds.layer2.${field}`
                              )
                            }
                          />
                          <SignificantCloudSection
                            title="3rd Layer"
                            prefix="layer3"
                            color="violet"
                            data={formik.values.significantClouds.layer3}
                            onSelectChange={handleSelectChange}
                            renderError={(field) =>
                              renderErrorMessage(
                                `significantClouds.layer3.${field}`
                              )
                            }
                          />
                          <SignificantCloudSection
                            title="4th Layer"
                            prefix="layer4"
                            color="indigo"
                            data={formik.values.significantClouds.layer4}
                            onSelectChange={handleSelectChange}
                            renderError={(field) =>
                              renderErrorMessage(
                                `significantClouds.layer4.${field}`
                              )
                            }
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Next{" "}
                          <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* RAINFALL Tab */}
                  <TabsContent
                    value="rainfall"
                    className="mt-4 sm:mt-6 transition-all duration-500"
                  >
                    <Card
                      className={cn("overflow-hidden", tabStyles.rainfall.card)}
                    >
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-cyan-200 to-cyan-300 text-cyan-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <CloudRainIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />{" "}
                          Rainfall Measurement (mm)
                        </h3>
                      </div>

                      <CardContent className="pt-4 sm:pt-6">
                        <p className="mb-3 text-xs sm:text-sm text-yellow-800">
                          📅 Please select the{" "}
                          <span className="font-medium underline">
                            previous date from calender
                          </span>{" "}
                          for
                          <span className="text-blue-700 font-semibold">
                            {" "}
                            00 UTC{" "}
                          </span>{" "}
                          report submission.
                        </p>
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label
                              htmlFor="time-start"
                              className="font-medium text-gray-700 text-xs sm:text-sm"
                            >
                              Time of Start (HH:MM UTC){" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                id="date-start"
                                name="date-start"
                                type="date"
                                value={
                                  formik.values.rainfall["date-start"] || ""
                                }
                                onChange={handleInputChange}
                                className="text-xs sm:text-sm"
                                required
                              />
                              <Input
                                id="time-start"
                                name="time-start"
                                type="text"
                                placeholder="set this ( HH:MM 00:00 )"
                                step="60"
                                value={
                                  formik.values.rainfall["time-start"] || ""
                                }
                                onChange={handleInputChange}
                                className="text-xs sm:text-sm"
                                required
                              />
                            </div>

                            {renderErrorMessage("rainfall.time-start")}
                            <p className="text-xs text-gray-500 mt-1">
                              Format: HH:MM (e.g., 03:30, 06:15, 23:45)
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label
                              htmlFor="time-end"
                              className="font-medium text-gray-700 text-xs sm:text-sm"
                            >
                              Time of Ending (HH:MM UTC){" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                id="date-end"
                                name="date-end"
                                type="date"
                                value={formik.values.rainfall["date-end"] || ""}
                                onChange={handleInputChange}
                                className="text-xs sm:text-sm"
                                required
                              />
                              <Input
                                id="time-end"
                                name="time-end"
                                type="text"
                                placeholder="set this ( HH:MM 00:00 )"
                                step="60"
                                value={formik.values.rainfall["time-end"] || ""}
                                onChange={handleInputChange}
                                className="text-xs sm:text-sm"
                                required
                              />
                            </div>

                            {renderErrorMessage("rainfall.time-end")}
                            <p className="text-xs text-gray-500 mt-1">
                              Format: HH:MM (e.g., 03:30, 06:15, 23:45)
                            </p>
                          </div>

                          <InputField
                            id="since-previous"
                            name="since-previous"
                            label="Since Previous Observation"
                            accent="cyan"
                            value={
                              formik.values.rainfall["since-previous"] || ""
                            }
                            onChange={handleInputChange}
                            error={renderErrorMessage(
                              "rainfall.since-previous"
                            )}
                            required
                            numeric={true}
                          />
                          <div className="grid gap-2">
                            <Label
                              htmlFor="during-previous"
                              className="font-medium text-gray-700 text-xs sm:text-sm"
                            >
                              During Previous 6 Hours Rainfall (At 00, 06, 12,
                              18 UTC)
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="during-previous"
                              name="during-previous"
                              placeholder="Enter 4 digits (e.g., 0000)"
                              value={
                                formik.values.rainfall["during-previous"] || ""
                              }
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-cyan-300 bg-cyan-50 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500":
                                    formik.errors.rainfall?.["during-previous"],
                                }
                              )}
                              required
                            />
                            <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-start">
                              {formik.errors.rainfall?.["during-previous"]}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <InputField
                              id="last-24-hours"
                              name="last-24-hours"
                              label="Last 24 Hours Precipitation"
                              accent="cyan"
                              value={
                                formik.values.rainfall["last-24-hours"] || ""
                              }
                              onChange={handleInputChange}
                              error={renderErrorMessage(
                                "rainfall.last-24-hours"
                              )}
                              required
                              numeric={true}
                            />
                          </div>

                          <div className="md:col-span-2 flex items-center gap-2 mt-2 sm:mt-4">
                            <input
                              id="is-intermittent-rain"
                              name="isIntermittentRain"
                              type="checkbox"
                              checked={
                                formik.values.rainfall?.isIntermittentRain ||
                                false
                              }
                              onChange={(e) => {
                                formik.setFieldValue(
                                  "rainfall.isIntermittentRain",
                                  e.target.checked
                                );
                              }}
                              className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                            <Label
                              htmlFor="is-intermittent-rain"
                              className="font-medium text-cyan-800 text-xs sm:text-sm"
                            >
                              Intermittent Rain? (বিরতিযুক্ত বৃষ্টি)
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Next{" "}
                          <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* WIND Tab */}
                  <TabsContent
                    value="wind"
                    className="mt-4 sm:mt-6 transition-all duration-500"
                  >
                    <Card
                      className={cn("overflow-hidden", tabStyles.wind.card)}
                    >
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-green-200 to-green-300 text-green-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <Wind className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Wind
                          Measurement
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label
                              htmlFor="first-anemometer"
                              className="font-medium text-gray-700 text-xs sm:text-sm"
                            >
                              First Anenometer
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="first-anemometer"
                              name="first-anemometer"
                              placeholder="Enter 5 Digit"
                              value={
                                formik.values.wind?.["first-anemometer"] || ""
                              }
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-cyan-300 bg-cyan-50 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500":
                                    formik.errors.wind?.["first-anemometer"],
                                }
                              )}
                              required
                            />
                            <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-start">
                              {formik.errors.wind?.["first-anemometer"]}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label
                              htmlFor="second-anemometer"
                              className="font-medium text-gray-700 text-xs sm:text-sm"
                            >
                              Second Anenometer
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="second-anemometer"
                              name="second-anemometer"
                              placeholder="Enter 5 Digit"
                              value={
                                formik.values.wind?.["second-anemometer"] || ""
                              }
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-cyan-300 bg-cyan-50 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500":
                                    formik.errors.wind?.["second-anemometer"],
                                }
                              )}
                              required
                            />
                            <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-start">
                              {formik.errors.wind?.["second-anemometer"]}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label
                              htmlFor="speed"
                              className="font-medium text-gray-700 text-xs sm:text-sm"
                            >
                              Speed (KTS)
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="speed"
                              name="speed"
                              placeholder="Enter 3 Digit"
                              value={formik.values.wind?.["speed"] || ""}
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-cyan-300 bg-cyan-50 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500":
                                    formik.errors.wind?.["speed"],
                                }
                              )}
                              required
                            />
                            <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-start">
                              {formik.errors.wind?.["speed"]}
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label
                              htmlFor="wind-direction"
                              className="font-medium text-gray-700 text-xs sm:text-sm"
                            >
                              Direction (Degrees){" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="wind-direction"
                              name="wind-direction"
                              type="number"
                              min="0"
                              max="360"
                              value={formik.values.wind["wind-direction"] || ""}
                              onChange={handleInputChange}
                              className={cn(
                                "border-2 border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500/30 rounded-lg py-2 px-3 text-xs sm:text-sm",
                                {
                                  "border-red-500": renderErrorMessage(
                                    "wind.wind-direction"
                                  ),
                                }
                              )}
                              placeholder="wind direction 5 degree to 364 degree from code book"
                              required
                              inputMode="numeric"
                            />
                            {renderErrorMessage("wind.wind-direction")}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 sm:p-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                        >
                          Next{" "}
                          <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* OBSERVER Tab */}
                  <TabsContent
                    value="observer"
                    className="mt-4 sm:mt-6 transition-all duration-500"
                  >
                    <Card
                      className={cn("overflow-hidden", tabStyles.observer.card)}
                    >
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center">
                          <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />{" "}
                          Observer Information
                        </h3>
                      </div>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                          <InputField
                            id="observer-initial"
                            name="observer-initial"
                            label="Observer Initials"
                            accent="orange"
                            value={
                              formik.values.observer["observer-initial"] || ""
                            }
                            onChange={handleInputChange}
                            required
                            error={renderErrorMessage(
                              "observer.observer-initial"
                            )}
                          />
                          <InputField
                            id="station-id"
                            name="station-id"
                            label="Station ID"
                            accent="orange"
                            value={session?.user?.station?.stationId || ""}
                            onChange={handleInputChange}
                            disabled
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row justify-between p-4 sm:p-6 gap-3 sm:gap-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isFirstTab}
                          className="text-xs sm:text-sm w-full sm:w-auto flex justify-center items-center"
                        >
                          <ChevronLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                          Previous
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-slate-600 hover:bg-slate-100 transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto"
                            onClick={handleReset}
                          >
                            Reset
                          </Button>

                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm text-xs sm:text-sm w-full sm:w-auto flex justify-center items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <CloudIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                                Submit Observation
                              </>
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}

// Reusable Components
function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`border-2 ${className} shadow-sm`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Update the InputField component to support disabled state and error display

function InputField({
  id,
  name,
  label,
  type = "text",
  accent = "blue",
  value,
  disabled = false,
  required = false,
  onChange,
  error,
  numeric = false,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  accent?: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: React.ReactNode;
  numeric?: boolean;
}) {
  const focusClasses: Record<string, string> = {
    blue: "focus:ring-blue-500 focus:border-blue-500",
    yellow: "focus:ring-yellow-500 focus:border-yellow-500",
    purple: "focus:ring-purple-500 focus:border-purple-500",
    cyan: "focus:ring-cyan-500 focus:border-cyan-500",
    green: "focus:ring-green-500 focus:border-green-500",
    orange: "focus:ring-orange-500 focus:border-orange-500",
    fuchsia: "focus:ring-fuchsia-500 focus:border-fuchsia-500",
    violet: "focus:ring-violet-500 focus:border-violet-500",
    indigo: "focus:ring-indigo-500 focus:border-indigo-500",
  };

  // Handle input validation for numeric fields
  const handleInputValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // For numeric fields, validate immediately
    if (numeric && value !== "" && !/^[0-9]+(\.[0-9]+)?$/.test(value)) {
      // Show error styling immediately
      e.target.classList.add("border-red-500");
    } else {
      e.target.classList.remove("border-red-500");
    }

    onChange(e);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={numeric ? handleInputValidation : onChange}
        className={cn(
          `${focusClasses[accent]} border-gray-300 rounded-lg py-2 px-3`,
          {
            "bg-gray-100 cursor-not-allowed": disabled,
            "border-red-500": error,
          }
        )}
        disabled={disabled}
        required={required}
        inputMode={numeric ? "decimal" : "text"}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectField({
  id,
  name,
  label,
  accent = "blue",
  value,
  onValueChange,
  options,
  optionLabels,
  error,
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  accent?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  optionLabels?: string[];
  error?: React.ReactNode;
  required?: boolean;
}) {
  const accentColors: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/50 focus-within:ring-blue-500 focus-within:border-blue-500",
    yellow:
      "border-yellow-200 bg-yellow-50/50 focus-within:ring-yellow-500 focus-within:border-yellow-500",
    purple:
      "border-purple-200 bg-purple-50/50 focus-within:ring-purple-500 focus-within:border-purple-500",
    cyan: "border-cyan-200 bg-cyan-50/50 focus-within:ring-cyan-500 focus-within:border-cyan-500",
    green:
      "border-green-200 bg-green-50/50 focus-within:ring-green-500 focus-within:border-green-500",
    orange:
      "border-orange-200 bg-orange-50/50 focus-within:ring-orange-500 focus-within:border-orange-500",
    fuchsia:
      "border-fuchsia-200 bg-fuchsia-50/50 focus-within:ring-fuchsia-500 focus-within:border-fuchsia-500",
    violet:
      "border-violet-200 bg-violet-50/50 focus-within:ring-violet-500 focus-within:border-violet-500",
    indigo:
      "border-indigo-200 bg-indigo-50/50 focus-within:ring-indigo-500 focus-within:border-indigo-500",
  };

  return (
    <div className="grid gap-2 w-full">
      <Label htmlFor={id} className="font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select name={name} value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(
            `w-full border-2 ${accentColors[accent]} rounded-lg py-2.5 px-4 transition-all duration-200 shadow-sm hover:bg-white focus:shadow-md`,
            {
              "border-red-500": error,
            }
          )}
        >
          <SelectValue placeholder="Select..." className="text-gray-600" />
        </SelectTrigger>
        <SelectContent className="max-h-80 overflow-y-auto rounded-lg border-2 border-gray-200 shadow-lg">
          {options.map((option, index) => (
            <SelectItem
              key={option}
              value={option}
              className="py-2.5 px-4 focus:bg-gray-100 focus:text-gray-900 rounded-md cursor-pointer"
            >
              {optionLabels ? optionLabels[index] : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function CloudLevelSection({
  title,
  prefix,
  color = "blue",
  data,
  onChange,
  onSelectChange,
  renderError,
}: {
  title: string;
  prefix: string;
  color?: string;
  data: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  renderError: (field: string) => React.ReactNode;
}) {
  const cloudFormOptions = [
    { value: "0", label: "0 - No Sc, St, Cu or Cb" },
    { value: "1", label: "1 - Cu with little vertical extent" },
    { value: "2", label: "2 - Cu of moderate/strong vertical extent" },
    { value: "3", label: "3 - Cb lacking sharp outlines" },
    { value: "4", label: "4 - Sc formed from spreading Cu" },
    { value: "5", label: "5 - Sc not from spreading Cu" },
    { value: "6", label: "6 - St in continuous sheet or ragged shreds" },
    { value: "7", label: "7 - Stratus fractus or Cu fractus of bad weather" },
    { value: "8", label: "8 - Cu and Sc at different levels" },
    { value: "9", label: "9 - Cb with fibrous upper part/anvil" },
    { value: "/", label: "/ - Not visible" },
  ];

  const cloudDirectionOptions = [
    { value: "0", label: "0 - Stationary or no direction" },
    { value: "1", label: "1 - Cloud coming from NE" },
    { value: "2", label: "2 - Cloud coming from E" },
    { value: "3", label: "3 - Cloud coming from SE" },
    { value: "4", label: "4 - Cloud coming from S" },
    { value: "5", label: "5 - Cloud coming from SW" },
    { value: "6", label: "6 - Cloud coming from W" },
    { value: "7", label: "7 - Cloud coming from NW" },
    { value: "8", label: "8 - Cloud coming from N" },
    { value: "9", label: "9 - No definite direction or direction unknown" },
  ];

  const cloudHeightOptions = [
    { value: "0", label: "0 - 0 to 50 m" },
    { value: "1", label: "1 - 50 to 100 m" },
    { value: "2", label: "2 - 100 to 200 m" },
    { value: "3", label: "3 - 200 to 300 m" },
    { value: "4", label: "4 - 300 to 600 m" },
    { value: "5", label: "5 - 600 to 1000 m" },
    { value: "6", label: "6 - 1000 to 1500 m" },
    { value: "7", label: "7 - 1500 to 2000 m" },
    { value: "8", label: "8 - 2000 to 2500 m" },
    { value: "9", label: "9 - 2500 m or more or no cloud" },
    { value: "/", label: "/ - Height of base of cloud not known" },
  ];

  const cloudAmountOptions = [
    { value: "0", label: "0 - No cloud" },
    { value: "1", label: "1 - 1 octa or less (1/10 or less but not zero)" },
    { value: "2", label: "2 - 2 octas (2/10 to 3/10)" },
    { value: "3", label: "3 - 3 octas (4/10)" },
    { value: "4", label: "4 - 4 octas (5/10)" },
    { value: "5", label: "5 - 5 octas (6/10)" },
    { value: "6", label: "6 - 6 octas (7/10 to 8/10)" },
    { value: "7", label: "7 - 7 octas (9/10 or more but not 10/10)" },
    { value: "8", label: "8 - 8 octas (10/10)" },
    {
      value: "9",
      label: "9 - sky obscured or cloud amount cannot be estimated.",
    },
    {
      value: "/",
      label: "/ - Key obscured or cloud amount cannot be estimated",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label="Form (Code)"
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-form`, value)}
          options={cloudFormOptions.map((opt) => opt.value)}
          optionLabels={cloudFormOptions.map((opt) => opt.label)}
          error={renderError("form")}
          required
        />

        <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label="Amount (Octa)"
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-amount`, value)}
          options={cloudAmountOptions.map((opt) => opt.value)}
          optionLabels={cloudAmountOptions.map((opt) => opt.label)}
          error={renderError("amount")}
          required
        />

        {prefix !== "high-cloud" && (
          <SelectField
            id={`${prefix}-height`}
            name={`${prefix}-height`}
            label="Height of Base (Code)"
            accent={color}
            value={data["height"] || ""}
            onValueChange={(value) => onSelectChange(`${prefix}-height`, value)}
            options={cloudHeightOptions.map((opt) => opt.value)}
            optionLabels={cloudHeightOptions.map((opt) => opt.label)}
            error={renderError("height")}
            required
          />
        )}

        <SelectField
          id={`${prefix}-direction`}
          name={`${prefix}-direction`}
          label="Direction (Code)"
          accent={color}
          value={data["direction"] || ""}
          onValueChange={(value) =>
            onSelectChange(`${prefix}-direction`, value)
          }
          options={cloudDirectionOptions.map((opt) => opt.value)}
          optionLabels={cloudDirectionOptions.map((opt) => opt.label)}
          error={renderError("direction")}
          required
        />
      </div>
    </div>
  );
}

function SignificantCloudSection({
  title,
  prefix,
  color = "purple",
  data,
  onSelectChange,
  renderError,
}: {
  title: string;
  prefix: string;
  color?: string;
  data: Record<string, string>;
  onSelectChange: (name: string, value: string) => void;
  renderError: (field: string) => React.ReactNode;
}) {
  // Generate height options from 0 to 99
  const heightOptions = Array.from({ length: 100 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const cloudFormOptions = [
    { value: "0", label: "0 - Cirrus (Ci)" },
    { value: "1", label: "1 - Cirrocumulus (Cc)" },
    { value: "2", label: "2 - Cirrostratus (Cs)" },
    { value: "3", label: "3 - Altocumulus (Ac)" },
    { value: "4", label: "4 - Altostratus (As)" },
    { value: "5", label: "5 - Nimbostratus (Ns)" },
    { value: "6", label: "6 - Stratocumulus (Sc)" },
    { value: "7", label: "7 - Stratus (St)" },
    { value: "8", label: "8 - Cumulus (Cu)" },
    { value: "9", label: "9 - Cumulonimbus (Cb)" },
    { value: "/", label: "/ - Clouds not visible (darkness, fog, etc.)" },
  ];

  const SigcloudAmountOptions = [
    { value: "0", label: "0 - No cloud" },
    { value: "1", label: "1 - 1 octa or less (1/10 or less but not zero)" },
    { value: "2", label: "2 - 2 octas (2/10 to 3/10)" },
    { value: "3", label: "3 - 3 octas (4/10)" },
    { value: "4", label: "4 - 4 octas (5/10)" },
    { value: "5", label: "5 - 5 octas (6/10)" },
    { value: "6", label: "6 - 6 octas (7/10 to 8/10)" },
    { value: "7", label: "7 - 7 octas (9/10 or more but not 10/10)" },
    { value: "8", label: "8 - 8 octas (10/10)" },
    {
      value: "/",
      label: "/ - Key obscured or cloud amount cannot be estimated",
    },
  ];

  // Determine if this is the first layer (required) or other layers (optional)
  const isRequired = prefix === "layer1";

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label="Form (Code)"
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-form`, value)}
          options={cloudFormOptions.map((opt) => opt.value)}
          optionLabels={cloudFormOptions.map((opt) => opt.label)}
          error={renderError("form")}
          required={isRequired}
        />
        <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label="Amount (Octa)"
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-amount`, value)}
          options={SigcloudAmountOptions.map((opt) => opt.value)}
          optionLabels={SigcloudAmountOptions.map((opt) => opt.label)}
          error={renderError("amount")}
          required={isRequired}
        />
        <SelectField
          id={`${prefix}-height`}
          name={`${prefix}-height`}
          label="Height of Base (Code)"
          accent={color}
          value={data["height"] || ""}
          onValueChange={(value) => onSelectChange(`${prefix}-height`, value)}
          options={heightOptions}
          error={renderError("height")}
          required={isRequired}
        />
      </div>
    </div>
  );
}
