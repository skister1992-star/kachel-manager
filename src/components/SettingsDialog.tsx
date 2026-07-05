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
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface ServerConfig {
  hostMode: "local" | "network";
  host: string;
  port: number;
  allowedHosts?: string[];
}

const defaultServerConfig: ServerConfig = {
  hostMode: "local",
  host: "127.0.0.1",
  port: 3000,
  allowedHosts: [],
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [serverConfig, setServerConfig] = useState<ServerConfig>(defaultServerConfig);
  const [currentRunning, setCurrentRunning] = useState<ServerConfig | null>(null);
  const [savedConfig, setSavedConfig] = useState<ServerConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // New host input for adding one at a time
  const [newHost, setNewHost] = useState("");

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const parseHosts = (hostsStr: string | undefined): string[] => {
    if (!hostsStr || !hostsStr.trim()) return [];
    return hostsStr.split(",").map((h) => h.trim()).filter(Boolean);
  };

  const loadConfig = async () => {
    try {
      // Load server config with running vs saved state
      const res = await fetch("/api/server-config");
      if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
      const data = await res.json();

      setCurrentRunning({
        hostMode: data.running?.hostMode || "local",
        host: data.running?.host || "127.0.0.1",
        port: Number(data.running?.port) || 3000,
        allowedHosts: [],
      });

      if (data.saved) {
        const savedAllowedHosts = parseHosts(data.saved.allowedHosts);
        setSavedConfig({
          hostMode: data.saved.hostMode || "local",
          host: data.saved.networkMode ? "::" : "127.0.0.1",
          port: Number(data.saved.port) || 8080,
          allowedHosts: savedAllowedHosts,
        });
      }

      // Pre-fill form with saved config (or running if no file yet)
      const formConfig = data.saved ? {
        hostMode: data.saved.hostMode || "local",
        host: data.saved.networkMode ? "::" : "127.0.0.1",
        port: Number(data.saved.port) || 8080,
        allowedHosts: parseHosts(data.saved.allowedHosts),
      } as ServerConfig : defaultServerConfig;
      setServerConfig(formConfig);
    } catch (err) {
      console.error("Failed to load server config:", err);
      setCurrentRunning(defaultServerConfig);
      setSavedConfig(null);
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

  const handleAddHost = () => {
    const host = newHost.trim();
    if (!host) return;
    setServerConfig((prev) => ({
      ...prev,
      allowedHosts: [...(prev.allowedHosts || []), host],
    }));
    setNewHost("");
  };

  const handleRemoveHost = (index: number) => {
    setServerConfig((prev) => ({
      ...prev,
      allowedHosts: prev.allowedHosts?.filter((_h, i) => i !== index),
    }));
  };

  const handleSaveServerConfig = async () => {
    try {
      console.log("[SettingsDialog] Sending config:", { hostMode: serverConfig.hostMode, port: serverConfig.port });

      const res = await fetch("/api/server-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostMode: serverConfig.hostMode,
          port: serverConfig.port,
          allowedHosts: (serverConfig.allowedHosts || []).join(","),
        }),
      });

      const text = await res.text();
      console.log("[SettingsDialog] Response status:", res.status);
      console.log("[SettingsDialog] Response body:", text);

      if (!res.ok) throw new Error(`Server returned ${res.status}: ${text}`);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response format");
      }

      if (data.success) {
        toast.success("Konfiguration gespeichert! Neustart erforderlich.");
        setSavedConfig({ ...serverConfig }); // Update saved config locally
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error: any) {
      console.error("[SettingsDialog] Save failed:", error);
      toast.error(`Fehler beim Speichern: ${error.message}`);
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

              {/* Allowed Hosts */}
              <div className="space-y-2">
                <Label htmlFor="allowed-hosts" className="text-base font-medium">Erlaubte Hosts</Label>
                <div className="flex gap-2">
                  <Input
                    id="allowed-hosts"
                    type="text"
                    value={newHost}
                    onChange={(e) => setNewHost(e.target.value)}
                    placeholder="Neuen Host eingeben..."
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddHost(); } }}
                  />
                  <Button variant="outline" size="icon" onClick={handleAddHost}>
                    <Plus size={16} />
                  </Button>
                </div>

                {/* Current Saved Hosts Display */}
                {(serverConfig.allowedHosts && serverConfig.allowedHosts.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {serverConfig.allowedHosts.map((host, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs py-1 px-3 cursor-pointer hover:bg-destructive/80 hover:text-white transition-colors" onClick={() => handleRemoveHost(idx)} title="Klicken zum Entfernen">
                        {host}
                        <X size={12} className="ml-1 inline" />
                      </Badge>
                    ))}
                  </div>
                )}

                {!serverConfig.allowedHosts || serverConfig.allowedHosts.length === 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">Keine Hosts eingetragen.</p>
                ) : null}
              </div>

              {/* Connection Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <h4 className="font-medium mb-2">Aktuell läuft</h4>
                <p><span className="text-muted-foreground">Hostmodus:</span> {currentRunning?.hostMode === "local" ? "Lokal" : "Netzwerk"}</p>
                <p><span className="text-muted-foreground">Host:</span> {currentRunning?.host}</p>
                <p><span className="text-muted-foreground">Port:</span> {currentRunning?.port}</p>
                <p><span className="text-muted-foreground">URL:</span> http://{currentRunning?.host === "::" ? "127.0.0.1" : currentRunning?.host}:{currentRunning?.port}</p>

                {/* Restart Notice */}
                {savedConfig && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3 text-xs text-yellow-800">
                    Hinweis: Die Änderungen werden nach einem Neustart der Anwendung aktiv. Der Server liest dann die Konfiguration aus <code>data/server-settings.json</code>.
                  </div>
                )}

                {!savedConfig && (
                  <p className="text-xs text-muted-foreground mt-2">Noch keine Konfigurationsdatei vorhanden.</p>
                )}
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