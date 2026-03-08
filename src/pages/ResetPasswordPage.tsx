import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Loader2, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Contains special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const ResetPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      setValidToken(false);
      toast({ title: "Invalid link", description: "This reset link is invalid or expired.", variant: "destructive" });
    }
  }, []);

  const ruleResults = useMemo(() => PASSWORD_RULES.map(r => ({ ...r, passed: r.test(password) })), [password]);
  const allPassed = ruleResults.every(r => r.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) {
      toast({ title: "Weak password", description: "Please meet all password requirements.", variant: "destructive" });
      return;
    }
    if (!passwordsMatch) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      // Sign out all sessions so user must re-login
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth"), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">MAXDAX</span>
        </div>

        {success ? (
          <Card>
            <CardContent className="py-8 text-center space-y-3">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-semibold">Password Reset Successful</h2>
              <p className="text-sm text-muted-foreground">Your password has been updated. All sessions have been logged out. Redirecting to sign in...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Set New Password</CardTitle>
              <CardDescription>Create a strong password for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required placeholder="Enter new password" />
                </div>

                {/* Password strength indicators */}
                {password.length > 0 && (
                  <div className="space-y-1 bg-muted/30 rounded-lg p-3">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">PASSWORD REQUIREMENTS</p>
                    {ruleResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        {r.passed ? (
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-destructive" />
                        )}
                        <span className={r.passed ? "text-emerald-600" : "text-muted-foreground"}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm new password" />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Passwords do not match
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading || !allPassed || !passwordsMatch || !validToken}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
