"use client";

import { useState } from "react";
import { useSession, twoFactor } from "@/lib/auth-client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Settings as SettingsIcon } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Settings = () => {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupStep, setSetupStep] = useState<"password" | "qrcode" | "verify">("password");
  const [totpUri, setTotpUri] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Get 2FA status from session
  const isTwoFactorEnabled = session?.user?.twoFactorEnabled || false;
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState("");
  const [isDisableLoading, setIsDisableLoading] = useState(false);

  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      // If turning on 2FA, open the password dialog
      setIsDialogOpen(true);
    } else {
      // If turning off 2FA, open disable confirmation dialog
      setDisableDialogOpen(true);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError("Password is required");
      return;
    }

    setIsDisableLoading(true);
    setDisableError("");

    try {
      const { error } = await twoFactor.disable({
        password: disablePassword,
      });

      if (error) {
        setDisableError(error.message || "Failed to disable 2FA");
      } else {
        toast.success("Two-factor authentication disabled successfully");
        setDisableDialogOpen(false);
        setDisablePassword("");
      }
    } catch (err: unknown) {
      setDisableError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDisableLoading(false);
    }
  };

  const handleInitiate2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await twoFactor.enable({
        password,
      });

      if (error) {
        setError(error.message || "Failed to initiate 2FA setup");
      } else if (data) {
        // Store the TOTP URI and backup codes
        setTotpUri(data.totpURI);
        setBackupCodes(data.backupCodes || []);
        // Move to QR code scanning step
        setSetupStep("qrcode");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError("Verification code is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error } = await twoFactor.verifyTotp({
        code: verificationCode
      });

      if (error) {
        setError(error.message || "Failed to verify code");
      } else {
        toast.success("Two-factor authentication enabled successfully!");
        setIsDialogOpen(false);
        // Reset the setup state
        setSetupStep("password");
        setPassword("");
        setVerificationCode("");
        setTotpUri("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Security</h2>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 mt-0.5 text-blue-600" />
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account by requiring a verification code
              </p>
            </div>
          </div>
          <Switch 
            checked={isTwoFactorEnabled} 
            onCheckedChange={handleToggle2FA}
            disabled={isLoading}
          />
        </div>
      </div>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Reset state when dialog is closed
            setSetupStep("password");
            setPassword("");
            setVerificationCode("");
            setTotpUri("");
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {setupStep === "password" && "Enable Two-Factor Authentication"}
              {setupStep === "qrcode" && "Scan QR Code"}
              {setupStep === "verify" && "Verify Authentication Code"}
            </DialogTitle>
            <DialogDescription>
              {setupStep === "password" && "Enter your password to enable two-factor authentication."}
              {setupStep === "qrcode" && "Scan this QR code with your authenticator app."}
              {setupStep === "verify" && "Enter the 6-digit code from your authenticator app."}
            </DialogDescription>
          </DialogHeader>

          {setupStep === "password" && (
            <form onSubmit={handleInitiate2FA}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {setupStep === "qrcode" && (
            <div className="space-y-6">
              <div className="flex justify-center py-4">
                {totpUri && (
                  <div className="p-2 bg-white border rounded-md">
                    <QRCode value={totpUri} size={200} />
                  </div>
                )}
              </div>
              
              <p className="text-sm text-center text-gray-500">
                After scanning the QR code, your authenticator app will display a 6-digit code.
              </p>

              {backupCodes.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Backup Codes</h4>
                  <p className="text-xs text-gray-500 mb-2">Save these backup codes in a secure place. You can use them to sign in if you lose access to your authenticator app.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="text-xs font-mono bg-white p-1 border rounded">{code}</div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setSetupStep("verify")}>
                  Continue to Verification
                </Button>
              </DialogFooter>
            </div>
          )}

          {setupStep === "verify" && (
            <form onSubmit={handleVerifyTotp}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSetupStep("qrcode")}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Enable 2FA"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog 
        open={disableDialogOpen} 
        onOpenChange={(open) => {
          setDisableDialogOpen(open);
          if (!open) {
            setDisablePassword("");
            setDisableError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable two-factor authentication. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDisable2FA}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="disablePassword">Password</Label>
                <Input
                  id="disablePassword"
                  type="password"
                  placeholder="Enter your password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              {disableError && <p className="text-sm text-red-500">{disableError}</p>}
            </div>

            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDisableDialogOpen(false)}
                disabled={isDisableLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isDisableLoading}>
                {isDisableLoading ? "Disabling..." : "Disable 2FA"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;