import { useState, useEffect } from "react";
import KachelCard from "@/components/KachelCard";
import SettingsDialog from "@/components/SettingsDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Plus, Minus, LogOut, Settings as SettingsIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";

interface Kachel {
  id: string;
  title: string;
  url: string;
  image?: string;
}

const Dashboard = () => {
  const { username, logout, editMode } = useAuth();
  const [kachels, setKachels] = useState<Kachel[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKachel, setEditingKachel] = useState<Kachel | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formImage, setFormImage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Delete menu state
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);

  const fetchKachels = async () => {
    try {
      const res = await fetch("/api/kachel");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setKachels(data || []);
    } catch {
      toast.error("Konnte Kacheln nicht laden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKachels();
  }, []);

  const openCreateDialog = () => {
    setEditingKachel(null);
    setFormTitle("");
    setFormUrl("");
    setFormImage("");
    setDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const k = kachels.find((item) => item.id === id);
    if (!k) return;
    setEditingKachel(k);
    setFormTitle(k.title);
    setFormUrl(k.url);
    setFormImage(k.image || "");
    setDialogOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Nur Bilddateien sind erlaubt.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        setFormImage(result.url);
        toast.success("Bild hochgeladen!");
      } else {
        toast.error(result.error || "Upload fehlgeschlagen.");
      }
    } catch {
      toast.error("Server-Verbindung fehlgeschlagen.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveDialog = async () => {
    if (!formTitle.trim() || !formUrl.trim()) {
      toast.error("Titel und Link sind erforderlich.");
      return;
    }

    try {
      if (editingKachel) {
        // Update existing
        const res = await fetch("/api/kachel", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingKachel.id, title: formTitle.trim(), url: formUrl.trim(), image: formImage.trim() }),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Kachel aktualisiert!");
          fetchKachels();
        } else {
          toast.error(result.error || "Konnte Kachel nicht aktualisieren.");
        }
      } else {
        // Create new
        const res = await fetch("/api/kachel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: formTitle.trim(), url: formUrl.trim(), image: formImage.trim() }),
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Kachel erstellt!");
          fetchKachels();
        } else {
          toast.error(result.error || "Konnte Kachel nicht erstellen.");
        }
      }
    } catch {
      toast.error("Server-Verbindung fehlgeschlagen.");
    } finally {
      setDialogOpen(false);
    }
  };

  const handleDeleteKachel = async (id: string) => {
    try {
      const res = await fetch("/api/kachel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Kachel gelöscht.");
        fetchKachels();
      } else {
        toast.error(result.error || "Konnte Kachel nicht löschen.");
      }
    } catch {
      toast.error("Server-Verbindung fehlgeschlagen.");
    } finally {
      setDeleteMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold">Kachel Manager</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{username}</span>

            {/* Edit mode buttons: only visible when editMode is true */}
            {editMode && (
              <>
                <Button size="icon" variant="outline" onClick={openCreateDialog} title="Neue Kachel erstellen">
                  <Plus size={18} />
                </Button>

                {kachels.length > 0 && (
                  <DropdownMenu open={deleteMenuOpen} onOpenChange={setDeleteMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline">
                        <Minus size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 max-h-[50vh] overflow-y-auto">
                      <DropdownMenuLabel>Kachel löschen</DropdownMenuLabel>
                      {kachels.map((k) => (
                        <DropdownMenuItem key={k.id} onClick={() => handleDeleteKachel(k.id)} className="text-sm">
                          {k.title || "(Ohne Titel)"}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}

            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} title="Einstellungen">
              <SettingsIcon size={18} />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card animate-pulse h-[280px]" />
            ))}
          </div>
        ) : kachels.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">Noch keine Kacheln vorhanden.</p>
            {editMode && <Button variant="outline" onClick={openCreateDialog}>Erstelle deine erste</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kachels.map((k) => (
              <KachelCard key={k.id} {...k} editMode={editMode} onEditClick={() => openEditDialog(k.id)} />
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setEditingKachel(null); else setDialogOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingKachel ? "Kachel bearbeiten" : "Neue Kachel erstellen"}</DialogTitle>
            <DialogDescription>Gib Titel, Link und optional ein Bild an.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="kachel-title">Titel</Label>
              <Input id="kachel-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="z.B. Google" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kachel-url">Link</Label>
              <Input id="kachel-url" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="z.B. https://google.com" />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label htmlFor="kachel-image">Bild</Label>
              {formImage && (
                <div className="rounded-lg overflow-hidden border mb-2 aspect-video relative">
                  <img src={formImage} alt="Vorschau" className="w-full h-full object-cover" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setFormImage("")}>×</Button>
                </div>
              )}
              <div className="flex gap-2">
                <Input id="kachel-image" value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="Bild-URL oder Datei hochladen..." readOnly />
                <label htmlFor="file-upload" className="shrink-0">
                  <Button variant="outline" size="icon" disabled={uploading}>
                    <Upload size={18} />
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
              </div>
            </div>

            <Button className="w-full" onClick={handleSaveDialog}>
              {editingKachel ? "Speichern" : "Erstellen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Dashboard;