import { useState, useEffect, useRef } from "react";
import KachelCard from "@/components/KachelCard";
import SettingsDialog from "@/components/SettingsDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Plus, Minus, LogOut, Settings as SettingsIcon, Upload, X, MoveHorizontal, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";

interface Kachel {
  id: string;
  title: string;
  url: string;
  image?: string;
  imgFit?: "fill" | "contain" | "cover" | "fit-width" | "fit-height";
  imgPositionX?: number; // 0-100, horizontal offset of the image
  imgZoom?: number; // zoom percentage, default 100
}

type ImgFit = NonNullable<Kachel["imgFit"]>;

const FIT_OPTIONS: { value: ImgFit; label: string }[] = [
  { value: "cover", label: "Deckend" },
  { value: "fill", label: "Ausfüllen" },
  { value: "contain", label: "Zentrieren" },
  { value: "fit-width", label: "Breite anpassen" },
  { value: "fit-height", label: "Höhe anpassen" },
];

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
  const [imgPositionX, setImgPositionX] = useState(50); // default center (50%)
  const [imgFit, setImgFit] = useState<ImgFit>("cover");
  const [imgZoom, setImgZoom] = useState(100);
  const [uploading, setUploading] = useState(false);

  // File input ref for triggering the native file picker
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImgPositionX(50);
    setImgFit("cover");
    setImgZoom(100);
    setDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const k = kachels.find((item) => item.id === id);
    if (!k) return;
    setEditingKachel(k);
    setFormTitle(k.title);
    setFormUrl(k.url);
    setFormImage(k.image || "");
    setImgPositionX(k.imgPositionX ?? 50);
    setImgFit((k.imgFit as ImgFit) || "cover");
    setImgZoom(k.imgZoom ?? 100);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setEditingKachel(null), 200); // clear after animation
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Nur Bilddateien sind erlaubt.");
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
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
          body: JSON.stringify({ id: editingKachel.id, title: formTitle.trim(), url: formUrl.trim(), image: formImage.trim(), imgPositionX, imgFit, imgZoom }),
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
          body: JSON.stringify({ title: formTitle.trim(), url: formUrl.trim(), image: formImage.trim(), imgPositionX, imgFit, imgZoom }),
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
      closeDialog();
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

  // Build background-style for the preview based on imgFit, position and zoom
  const buildBgStyle = () => {
    if (!formImage) return {};
    const posX = `${imgPositionX}%`;
    const zoomedSize = `calc(${Math.max(imgZoom, 5)}% / ${imgZoom > 100 ? imgZoom / 100 : 1})`;

    switch (imgFit) {
      case "fill":
        return { backgroundImage: `url(${formImage})`, backgroundSize: "100% 100%", backgroundPosition: `${posX} center`, backgroundRepeat: "no-repeat" };
      case "contain":
        return { backgroundImage: `url(${formImage})`, backgroundSize: zoomedSize, backgroundPosition: `center center`, backgroundRepeat: "no-repeat" };
      case "cover":
        return { backgroundImage: `url(${formImage})`, backgroundSize: `${Math.max(imgZoom, 100)}%`, backgroundPosition: `${posX} center`, backgroundRepeat: "no-repeat" };
      case "fit-width":
        return { backgroundImage: `url(${formImage})`, backgroundSize: `calc(100% * ${Math.max(imgZoom, 100) / 100}) auto`, backgroundPosition: `${posX} top`, backgroundRepeat: "no-repeat" };
      case "fit-height":
        return { backgroundImage: `url(${formImage})`, backgroundSize: `auto calc(100% * ${Math.max(imgZoom, 100) / 100})`, backgroundPosition: `${posX} top`, backgroundRepeat: "no-repeat" };
      default:
        return { backgroundImage: `url(${formImage})`, backgroundSize: "cover", backgroundPosition: `${posX} center`, backgroundRepeat: "no-repeat" };
    }
  };

  const bgStyle = buildBgStyle();

  const zoomIn = () => setImgZoom((prev) => Math.min(prev + 10, 500));
  const zoomOut = () => setImgZoom((prev) => Math.max(prev - 10, 5));
  const resetImage = () => {
    setImgFit("cover");
    setImgPositionX(50);
    setImgZoom(100);
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
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(open); }}>
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

            {/* Image section */}
            <div className="space-y-2">
              <Label>Bild</Label>

              {formImage && (
                <>
                  {/* Preview with applied style */}
                  <div className="rounded-lg overflow-hidden border mb-2 aspect-video relative group" style={bgStyle}>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => setFormImage("")}
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  {/* Fit mode buttons */}
                  <div className="flex flex-wrap gap-2">
                    {FIT_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={imgFit === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setImgFit(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="img-zoom" className="text-xs flex items-center gap-1 whitespace-nowrap">
                      Vergrößerung: {imgZoom}%
                    </Label>
                    <Input
                      id="img-zoom"
                      type="range"
                      min={5}
                      max={500}
                      value={imgZoom}
                      onChange={(e) => setImgZoom(Number(e.target.value))}
                    />
                    <Button variant="outline" size="icon" onClick={zoomOut}><ZoomOut size={14} /></Button>
                    <Button variant="outline" size="icon" onClick={zoomIn}><ZoomIn size={14} /></Button>
                  </div>

                  {/* Horizontal position slider */}
                  {imgFit !== "contain" && (
                    <div className="space-y-1">
                      <Label htmlFor="img-position-x" className="text-xs flex items-center gap-1">
                        <MoveHorizontal size={12} /> Bildposition horizontal
                      </Label>
                      <Input
                        id="img-position-x"
                        type="range"
                        min={0}
                        max={100}
                        value={imgPositionX}
                        onChange={(e) => setImgPositionX(Number(e.target.value))}
                      />
                    </div>
                  )}

                  {/* Reset button */}
                  <Button variant="outline" size="sm" onClick={resetImage}>
                    <Maximize2 size={14} className="mr-1" /> Zurücksetzen
                  </Button>
                </>
              )}

              {!formImage ? (
                <>
                  {/* Hidden native file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />

                  {/* Upload button that triggers the file picker */}
                  <Button
                    variant="outline"
                    className="w-full h-24 flex-col gap-1 border-dashed cursor-pointer"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <>Wird hochgeladen...</>
                    ) : (
                      <>
                        <Upload size={24} />
                        <span className="text-sm">Bild auswählen</span>
                      </>
                    )}
                  </Button>

                  {/* Alternative: URL input */}
                  <div className="flex gap-2 items-center mt-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">oder URL:</span>
                    <Input
                      placeholder="Bild-URL eingeben..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </>
              ) : null}
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