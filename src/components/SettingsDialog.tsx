import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ServerSettings {
  port: number;
  networkMode: boolean;
}

const defaultSettings: ServerSettings = {
  port: 8080,
  networkMode: false,
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState<ServerSettings>(() => {
    try {
      const saved = localStorage.getItem("server-settings");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      // Load server settings
      try {
        const saved = localStorage.getItem("server-settings");
        if (saved) setSettings(JSON.parse(saved));
      } catch {}

      // Fetch current credentials from server
      fetch("/api/auth")
        .then((res) => res.json())
        .then((data) => {
          setUsername(data.username || "");
          setPassword(data.password || "");
        })
        .catch(() => {
          setUsername("admin");
          setPassword("123we456");
        });
    }
  }, [open]);

  const handleChange = (key: keyof ServerSettings, value: number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveCredentials = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error("Bitte Benutzername und Passwort eingeben.");
      return;
    }
    try {
      const res = await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      if (!res.ok) throw new Error("Failed to save credentials");
      toast.success("Anmeldeinformationen gespeichert!");
    } catch {
      toast.error("Fehler beim Speichern der Anmeldeinformationen.");
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("server-settings", JSON.stringify(settings));
    onOpenChange(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("server-settings");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Einstellungen</DialogTitle>
          <DialogDescription>Konfiguriere den Server-Port, die Netzwerk-Erreichbarkeit und deine Anmeldeinformationen.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Port */}
          <div className="space-y-3">
            <Label htmlFor="port" className="text-base font-medium">Server-Port</Label>
            <Input
              id="port"
              type="number"
              min={1024}
              max={65535}
              value={settings.port}
              onChange={(e) => handleChange("port", parseInt(e.target.value, 10) || 8080)}
            />
            <p className="text-xs text-muted-foreground">Empfohlen: 8080 (Standard)</p>
          </div>

          <Separator />

          {/* Network Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="network" className="text-base font-medium">Netzwerk-Erreichbarkeit</Label>
              <p className="text-xs text-muted-foreground leading-tight">
                {settings.networkMode ? "Server ist im Netzwerk erreichbar (0.0.0.0)" : "Nur lokal erreichbar (127.0.0.1)"}
              </p>
            </div>
            <Switch
              id="network"
              checked={settings.networkMode}
              onCheckedChange={(v: boolean) => handleChange("networkMode", v)}
            />
          </div>

          <Separator />

          {/* Credentials */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Anmeldeinformationen</Label>
            <div className="space-y-2">
              <Label htmlFor="settings-username" className="text-sm">Benutzername</Label>
              <Input
                id="settings-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Benutzername"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-password" className="text-sm">Passwort</Label>
              <Input
                id="settings-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
              />
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
            <p><span className="font-medium">Zugriff:</span> {settings.networkMode ? "Im Netzwerk" : "Nur Lokal"}</p>
            <p><span className="font-medium">Host:</span> {settings.networkMode ? "0.0.0.0" : "127.0.0.1"}</p>
            <p><span className="font-medium">Port:</span> {settings.port}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 gap-3 flex-wrap">
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Zurücksetzen
            </button>
            <Button variant="outline" size="sm" onClick={handleSaveCredentials}>
              Anmeldeinformationen speichern
            </Button>
            <Button size="sm" onClick={handleSaveSettings}>
              Speichern & Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;