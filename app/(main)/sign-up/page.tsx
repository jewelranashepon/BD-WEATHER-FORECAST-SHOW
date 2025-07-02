"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Cloud,
  CloudRain,
  Sun,
  Droplets,
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { FormError } from "@/components/ui/form-error";
import { Station } from "@prisma/client";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string>("");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const role = "super_admin";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const stationId = formData.get("stationId") as string;

    await signUp.email(
      {
        name,
        email,
        role,
        password,
        stationId,
        division: "default-division",
        district: "default-district",
        upazila: "default-upazila",
      },
      {
        onRequest: () => {
          setLoading(true);
          setFormError("");
        },
        onSuccess: () => {
          toast.success("Registration successful");
          router.push("/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          setFormError(ctx.error.message);
        },
      }
    );

    setLoading(false);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-cyan-300/30 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-400/30 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 rounded-full bg-purple-300/20 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        <motion.div
          className="absolute top-[15%] left-[10%]"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
        >
          <Cloud className="h-10 w-10 text-cyan-500/40" />
        </motion.div>
        <motion.div
          className="absolute top-[25%] right-[15%]"
          animate={{ y: [0, -20, 0], rotate: [0, -5, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
        >
          <CloudRain className="h-12 w-12 text-blue-500/40" />
        </motion.div>
        <motion.div
          className="absolute bottom-[30%] left-[20%]"
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        >
          <Sun className="h-14 w-14 text-amber-500/40" />
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] right-[25%]"
          animate={{ y: [0, -15, 0], rotate: [0, -8, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        >
          <Droplets className="h-10 w-10 text-cyan-500/40" />
        </motion.div>
      </div>

      {/* Sign up form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg"
      >
        <div className="flex justify-center mb-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" />
            <Cloud className="h-12 w-12 text-white absolute inset-0" />
          </div>
        </div>

        <motion.h1
          className="text-4xl text-center font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700"
          variants={fadeIn}
        >
          Create Account
        </motion.h1>
        <p className="text-center text-sm text-gray-500">
          Join us today! It&apos;s quick and easy.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              className="pl-10 w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="stationId" className="block text-sm font-medium text-gray-700 mb-1">
              Weather Station
            </Label>
            {fetchError ? (
              <div className="text-red-500 text-sm mb-2">{fetchError}</div>
            ) : null}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Select name="stationId" required>
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue placeholder="Select your station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.stationId} value={station.id}>
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
            <Label htmlFor="role">Role</Label>
            <input
              id="role"
              name="role"
              value="super_admin"
              readOnly
              className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1 bg-gray-100 cursor-not-allowed"
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

        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="terms" />
          <Label htmlFor="terms">
            I agree to the{" "}
            <a href="#" className="text-black underline">
              terms and conditions
            </a>
          </Label>
        </div>

        <FormError message={formError} />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 text-white shadow-md flex items-center justify-center gap-2"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="font-medium text-blue-700 hover:underline"
          >
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}
