"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  CloudRain,
  Sun,
  Droplets,
  Shield,
  ChevronRight,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
// Authentication is now handled by our custom API route
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FormError } from "@/components/ui/form-error";
import { Station } from "@/data/stations";

// Available roles
const roles = [
  { value: "super_admin", label: "Super Admin" },
  { value: "station_admin", label: "Station Admin" },
  { value: "observer", label: "Observer" },
];

export default function SignInForm() {
  const [step, setStep] = useState("station"); // "station" | "security" | "credentials"
  const [selectedStation, setSelectedStation] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityCode, setShowSecurityCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [fetchError, setFetchError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("/api/stationlocation");
        if (!response.ok) {
          throw new Error("Failed to fetch stations");
        }
        const data = await response.json();
        setStations(data);
      } catch (err) {
        console.error("Error fetching stations:", err);
        setFetchError("Could not load stations. Please try again later.");
      }
    };

    fetchStations();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleSecurityCodeVisibility = () => {
    setShowSecurityCode((prev) => !prev);
  };

  const handleStationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) {
      setFormError("Please select a station");
      return;
    }
    setStep("security");
    setFormError("");
  };

  const handleSecurityCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Find the selected station
    const station = stations.find((s) => s.name === selectedStation);

    if (!station) {
      setFormError("Invalid station selection");
      setLoading(false);
      return;
    }

    // Check if security code matches
    if (securityCode === station.securityCode) {
      setStep("credentials");
      setFormError("");
    } else {
      setFormError("Invalid security code. Please try again.");
    }

    setLoading(false);
  };

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Client-side validation first
    if (!role) {
      setFormError("Please select a role");
      return;
    }

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setFormError("Please enter both email and password");
      return;
    }

    // Find the selected station
    const station = stations.find((s) => s.name === selectedStation);
    if (!station) {
      setFormError("Invalid station selection");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      // Call our custom API route for comprehensive authentication
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          securityCode,
          stationId: station.stationId,
          stationName: station.name,
        }),
        // Important: include credentials to allow cookies to be set
        credentials: "include",
      });

      const data = await response.json();

      if (data.twoFactorRedirect) {
        router.push("/2fa");
        return;
      }

      // If the response is successful, redirect to dashboard
      if (response.ok) {
        // Success - show toast and redirect to dashboard
        toast.success("Login successful");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Handle error responses
      let errorMessage =
        data.error || data.message || "An error occurred during sign in";

      // Provide user-friendly error messages
      if (errorMessage.includes("credentials")) {
        errorMessage = "Invalid email or password";
      } else if (
        errorMessage.includes("permission") ||
        errorMessage.includes("role")
      ) {
        errorMessage =
          "You don't have permission to access this station with the selected role";
      } else if (errorMessage.includes("security code")) {
        errorMessage = "The security code doesn't match your account";
      } else if (errorMessage.includes("station")) {
        errorMessage = "Your account is not associated with this station";
      }

      setFormError(errorMessage);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter roles based on station (you can customize this logic)
  const getAvailableRoles = () => {
    // For demo purposes, all roles are available
    // In a real app, you might filter based on station type or other criteria
    return roles;
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Background animations and decorations
  const BackgroundDecorations = () => (
    <>
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-cyan-300/30 dark:bg-cyan-700/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 rounded-full bg-purple-300/20 dark:bg-purple-700/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        <motion.div
          className="absolute top-[15%] left-[10%]"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Cloud className="h-10 w-10 text-cyan-500/40 dark:text-cyan-400/30" />
        </motion.div>
        <motion.div
          className="absolute top-[25%] right-[15%]"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -5, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <CloudRain className="h-12 w-12 text-blue-500/40 dark:text-blue-400/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-[30%] left-[20%]"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Sun className="h-14 w-14 text-amber-500/40 dark:text-amber-400/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] right-[25%]"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Droplets className="h-10 w-10 text-cyan-500/40 dark:text-cyan-400/30" />
        </motion.div>
      </div>
    </>
  );

  // Logo and Header
  const LogoHeader = () => (
    <>
      <div className="flex justify-center mb-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
          <Cloud className="h-12 w-12 text-white absolute inset-0" />
        </div>
      </div>

      <motion.h1
        className="text-4xl text-center font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400"
        variants={fadeIn}
      >
        BD Weather
      </motion.h1>
    </>
  );

  // Station Selection Form (Step 1)
  if (step === "station") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundDecorations />

        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          onSubmit={handleStationSubmit}
          className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-lg"
        >
          <LogoHeader />
          <p className="text-center text-sm text-gray-500">
            Select your weather station to continue.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <Label
                htmlFor="station"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Weather Station
              </Label>
              {fetchError ? (
                <div className="text-red-500 text-sm mb-2">{fetchError}</div>
              ) : null}
              <Select
                value={selectedStation}
                onValueChange={setSelectedStation}
                required
                disabled={stations.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      stations.length === 0
                        ? "Loading stations..."
                        : "Select your station"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {stations.map((station) => (
                    <SelectItem key={station.stationId} value={station.name}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {station.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <FormError message={formError} />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400 text-white shadow-md flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-blue-700 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </motion.form>
      </div>
    );
  }

  // Security Code Form (Step 2)
  if (step === "security") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundDecorations />

        <motion.form
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          onSubmit={handleSecurityCodeSubmit}
          className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-lg"
        >
          <LogoHeader />
          <p className="text-center text-sm text-gray-500">
            Enter security code for{" "}
            <span className="font-semibold">{selectedStation}</span> station.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <Label htmlFor="securityCode" className="sr-only">
                Security Code
              </Label>
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="securityCode"
                name="securityCode"
                type={showSecurityCode ? "text" : "password"}
                placeholder="Enter your station security code"
                className="pl-10 pr-10"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={toggleSecurityCodeVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showSecurityCode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <FormError message={formError} />

          <div className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400 text-white shadow-md flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setStep("station");
                setFormError("");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Station Selection
            </Button>
          </div>
        </motion.form>
      </div>
    );
  }

  // Credentials Form (Step 3)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundDecorations />

      <motion.form
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        onSubmit={handleCredentialsSubmit}
        className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-lg"
      >
        <LogoHeader />
        <p className="text-center text-sm text-gray-500">
          Enter your credentials to sign in to{" "}
          <span className="font-semibold">{selectedStation}</span>.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role
            </Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableRoles().map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">Remember me</Label>
          </div>
          <a href="#" className="text-sm text-black hover:underline">
            Forgot password
          </a>
        </div>

        <FormError message={formError} />

        <div className="flex flex-col space-y-3">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400 text-white shadow-md flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            )}
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              setStep("security");
              setFormError("");
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Security Code
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
