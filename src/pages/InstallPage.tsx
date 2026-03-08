import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Download, Smartphone, Monitor, CheckCircle2, Wifi, WifiOff, Bell, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const onlineHandler = () => setIsOnline(true);
    const offlineHandler = () => setIsOnline(false);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Smartphone, title: "Works Like a Native App", desc: "Install on your home screen — no app store needed" },
    { icon: WifiOff, title: "Offline Support", desc: "View jobs, add notes, and capture data without internet" },
    { icon: Wifi, title: "Auto Sync", desc: "Data syncs automatically when connection restores" },
    { icon: Bell, title: "Push Notifications", desc: "Get alerts for new jobs, escalations, and reminders" },
    { icon: Shield, title: "Secure & Fast", desc: "Encrypted data with instant load times" },
    { icon: Download, title: "Always Updated", desc: "Updates automatically — always the latest version" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Zap className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">MAXDAX FSM</h1>
            <p className="text-sm text-muted-foreground">Field Service Management</p>
          </div>
          <Badge variant={isOnline ? "default" : "secondary"} className="gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Install Card */}
        <Card className="glass-card">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg">
              {isInstalled ? "App Installed ✓" : "Install MAXDAX FSM"}
            </CardTitle>
            <CardDescription>
              {isInstalled
                ? "You're running the installed version. Enjoy the full experience!"
                : "Install the app for the best experience with offline support and instant access."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isInstalled ? (
              <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium text-sm">App is installed and ready</span>
              </div>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full gap-2" size="lg">
                <Download className="h-5 w-5" /> Install App
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" /> iPhone / iPad
                  </p>
                  <ol className="text-xs text-muted-foreground space-y-1 pl-4 list-decimal">
                    <li>Tap the <strong>Share</strong> button (box with arrow) in Safari</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>"Add"</strong> to confirm</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5" /> Android / Desktop
                  </p>
                  <ol className="text-xs text-muted-foreground space-y-1 pl-4 list-decimal">
                    <li>Tap the <strong>browser menu</strong> (⋮ three dots)</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></li>
                    <li>Confirm the installation</li>
                  </ol>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/50">
              <CardContent className="p-3">
                <f.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs font-medium">{f.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          MAXDAX FSM v2.0 • Progressive Web App
        </p>
      </div>
    </div>
  );
};

export default InstallPage;
