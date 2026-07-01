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

interface ServerSettings {
  port: number;
  networkMode: boolean; // true = network (0.0.0.0), false = local (127.0.0.1)
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

  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem("server-settings");
        if (saved) setSettings(JSON.parse(saved));
      } catch {}
    }
  }, [open]);

  const handleChange = (key: keyof ServerSettings, value: number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
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
          <DialogDescription>Konfiguriere den Server-Port und die Netzwerk-Erreichbarkeit.</DialogDescription>
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

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
            <p><span className="font-medium">Zugriff:</span> {settings.networkMode ? "Im Netzwerk" : "Nur Lokal"}</p>
            <p><span className="font-medium">Host:</span> {settings.networkMode ? "0.0.0.0" : "127.0.0.1"}</p>
            <p><span className="font-medium">Port:</span> {settings.port}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Zurücksetzen
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Speichern
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;