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

interface ServerConfig {
  hostMode: "local" | "network";
  host: string;
  port: number;
}

const defaultServerConfig: ServerConfig = {
  hostMode: "local",
  host: "127.0.0.1",
  port: 3000,
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [serverConfig, setServerConfig] = useState<ServerConfig>(defaultServerConfig);
  const [lanIp, setLanIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/server-config");
      if (!res.ok) throw new Error("Failed to load config");
      const data = await res.json();
      setServerConfig({
        hostMode: data.hostMode || "local",
        host: data.host || "127.0.0.1",
        port: data.port || 3000,
      });
      setLanIp(data.lanIp || null);
    } catch {
      // Fallback to defaults
      setServerConfig(defaultServerConfig);
    } finally {
      setLoading(false);
    }

    // Load credentials from server
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username || "");
        setPassword(data.password || "");
      }
    } catch {}
  };

  const handleSaveServerConfig = async () => {
    try {
      const res = await fetch("/api/server-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostMode: serverConfig.hostMode,
          port: serverConfig.port,
        }),
      });

      if (!res.ok) throw new Error("Failed to save config");
      
      const data = await res.json();
      setServerConfig(data.config);
      toast.success("Konfiguration gespeichert! Neustart erforderlich.");
    } catch {
      toast.error("Fehler beim Speichern der Konfiguration.");
    }
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

  const handleReset = () => {
    setServerConfig(defaultServerConfig);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="p-6 text-center">Lädt Einstellungen...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Einstellungen</DialogTitle>
          <DialogDescription>Konfiguriere Servereinstellungen und Anmeldeinformationen.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Server Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Server</h3>
            
            <div className="space-y-4">
              {/* Host Mode */}
              <div className="flex items-center justify-between">
                <Label htmlFor="host-mode" className="text-base font-medium">Host-Modus</Label>
                <Switch
                  id="host-mode"
                  checked={serverConfig.hostMode === "network"}
                  onCheckedChange={(checked: boolean) => {
                    setServerConfig({
                      ...serverConfig,
                      hostMode: checked ? "network" : "local",
                      host: checked ? "0.0.0.0" : "127.0.0.1",
                    });
                  }}
                />
              </div>

              {/* Port */}
              <div className="space-y-2">
                <Label htmlFor="port" className="text-base font-medium">Port</Label>
                <Input
                  id="port"
                  type="number"
                  min={1}
                  max={65535}
                  value={serverConfig.port || ""}
                  onChange={(e) => {
                    const port = parseInt(e.target.value, 10);
                    if (!isNaN(port)) {
                      setServerConfig({ ...serverConfig, port });
                    }
                  }}
                />
              </div>

              {/* Connection Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <h4 className="font-medium mb-2">Aktuelle Verbindung</h4>
                <p><span className="text-muted-foreground">Hostmodus:</span> {serverConfig.hostMode === "local" ? "Lokal" : "Netzwerk"}</p>
                <p><span className="text-muted-foreground">Host:</span> {serverConfig.host}</p>
                <p><span className="text-muted-foreground">Port:</span> {serverConfig.port}</p>
                <p><span className="text-muted-foreground">Lokale URL:</span> http://{serverConfig.host === "0.0.0.0" ? "127.0.0.1" : serverConfig.host}:{serverConfig.port}</p>
                
                {lanIp && (
                  <div>
                    <p className="mt-2"><span className="text-muted-foreground">LAN-Adresse:</span></p>
                    <p className="ml-4">http://{lanIp}:{serverConfig.port}</p>
                  </div>
                )}

                {/* Restart Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3 text-xs text-yellow-800">
                  Hinweis: Die Änderungen werden nach einem Neustart der Anwendung aktiv.
                </div>
              </div>

              {/* Server Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" onClick={handleSaveServerConfig}>Speichern</Button>
                <button
                  onClick={handleReset}
                  className="text-sm text-muted-foreground hover:text-foreground underline px-3 py-2"
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Auth Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Anmeldeinformationen</h3>
            
            <div className="space-y-4">
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

              {/* Auth Actions */}
              <Button size="sm" onClick={handleSaveCredentials}>Anmeldeinformationen speichern</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;