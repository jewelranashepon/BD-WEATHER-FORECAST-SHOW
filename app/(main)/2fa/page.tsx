"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { twoFactor } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, Key } from "lucide-react";
import { toast } from "sonner";

const TwoFactor = () => {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showBackupCodeInput, setShowBackupCodeInput] = useState(false);
    const [backupCode, setBackupCode] = useState("");

    const handleVerifyTotp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) {
            setError("Please enter the verification code");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const { error } = await twoFactor.verifyTotp({ code });
            
            if (error) {
                setError(error.message || "Invalid verification code. Please try again.");
            } else {
                toast.success("Verification successful");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Invalid verification code. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyBackupCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!backupCode) {
            setError("Please enter a backup code");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const { error } = await twoFactor.verifyBackupCode({ code: backupCode });
            
            if (error) {
                setError(error.message || "Invalid backup code. Please try again.");
            } else {
                toast.success("Backup code verified successfully");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Invalid backup code. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleBackupCodeInput = () => {
        setShowBackupCodeInput(!showBackupCodeInput);
        setError("");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter the verification code from your authenticator app
                    </p>
                </div>

                {!showBackupCodeInput ? (
                    <form onSubmit={handleVerifyTotp} className="mt-8 space-y-6">
                        <div>
                            <Label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Verification Code
                            </Label>
                            <div className="mt-1">
                                <Input
                                    id="code"
                                    name="code"
                                    type="text"
                                    autoComplete="one-time-code"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {isLoading ? "Verifying..." : "Verify"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={toggleBackupCodeInput}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Use backup code instead
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyBackupCode} className="mt-8 space-y-6">
                        <div>
                            <Label htmlFor="backupCode" className="block text-sm font-medium text-gray-700">
                                Backup Code
                            </Label>
                            <div className="mt-1">
                                <Input
                                    id="backupCode"
                                    name="backupCode"
                                    type="text"
                                    required
                                    value={backupCode}
                                    onChange={(e) => setBackupCode(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter backup code"
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {isLoading ? "Verifying..." : "Verify Backup Code"}
                                <Key className="ml-2 h-4 w-4" />
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={toggleBackupCodeInput}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Use authenticator app instead
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TwoFactor;