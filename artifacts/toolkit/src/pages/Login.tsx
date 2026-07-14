import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, LogIn } from "lucide-react";
import {
  firebaseConfigured,
  signInWithGoogle,
  startPhoneSignIn,
  resetRecaptcha,
  type ConfirmationResult,
} from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

export function Login() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    navigate("/");
    return null;
  }

  if (!firebaseConfigured) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Sign in unavailable</CardTitle>
            <CardDescription>
              Firebase authentication is not configured yet. Add the Firebase keys to enable login.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const sendCode = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await startPhoneSignIn(phone.trim(), "recaptcha-container");
      setConfirmation(result);
    } catch (err) {
      resetRecaptcha();
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!confirmation) return;
    setError("");
    setBusy(true);
    try {
      await confirmation.confirm(code.trim());
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LogIn className="h-5 w-5" /> Sign in</CardTitle>
          <CardDescription>Sign in with your mobile number or Google account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!confirmation ? (
            <div className="space-y-3">
              <Label htmlFor="phone">Mobile number (with country code)</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-testid="input-phone"
                />
                <Button onClick={sendCode} disabled={busy || phone.trim().length < 8} data-testid="button-send-code">
                  <Phone className="h-4 w-4 mr-1" /> Send code
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="otp">Enter the 6-digit code sent to {phone}</Label>
              <div className="flex gap-2">
                <Input
                  id="otp"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  data-testid="input-otp"
                />
                <Button onClick={verifyCode} disabled={busy || code.trim().length < 6} data-testid="button-verify-code">
                  Verify
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setConfirmation(null); setCode(""); resetRecaptcha(); }}>
                Use a different number
              </Button>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={googleSignIn} disabled={busy} data-testid="button-google-signin">
            Continue with Google
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div id="recaptcha-container" />
        </CardContent>
      </Card>
    </div>
  );
}
