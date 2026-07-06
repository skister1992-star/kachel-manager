import { useState, useEffect, useRef } from "react";
import KachelCard from "@/components/KachelCard";
import SettingsDialog from "@/components/SettingsDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Plus, Minus, LogOut, Settings as SettingsIcon, Upload, X, RotateCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";

interface Kachel {
  id: string;
  title: string;
  url: string;
  image?: string;
  imgFit?: "fill" | "contain" | "cover" | "fit-width" | "fit-height";
  imgPositionX?: number;
  imgPositionY?: number;
  imgZoom?: number;
  imgRotation?: number;
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
  const [imgPositionX, setImgPositionX] = useState(50);
  const [imgPositionY, setImgPositionY] = useState(50);
  const [imgFit, setImgFit] = useState<ImgFit>("cover");
  const [imgZoom, setImgZoom] = useState(100);
  const [imgRotation, setImgRotation] = useState(0);
  const [uploading, setUploading] = useState(false);

  // File input ref for triggering the native file picker
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete menu state
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);

  // Dragging state for free image movement in preview
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragPosStartRef = useRef({ x: 50, y: 50 });

  // Preview container ref for drag calculations
  const previewRef = useRef<HTMLDivElement>(null);

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
    resetImageSettings();
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
    setImgPositionY(k.imgPositionY ?? 50);
    setImgFit((k.imgFit as ImgFit) || "cover");
    setImgZoom(k.imgZoom ?? 100);
    setImgRotation(k.imgRotation ?? 0);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setEditingKachel(null), 200);
  };

  const resetImageSettings = () => {
    setImgFit("cover");
    setImgPositionX(50);
    setImgPositionY(50);
    setImgZoom(100);
    setImgRotation(0);
  };

  // Drag handlers for free image movement in preview
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!formImage || imgFit === "contain") return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragPosStartRef.current = { x: imgPositionX, y: imgPositionY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !previewRef.current) return;

      const rect = previewRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Convert pixel delta to percentage of container size
      const pctX = (dx / rect.width) * 100;
      const pctY = (dy / rect.height) * 100;

      setImgPositionX(Math.max(0, Math.min(100, dragPosStartRef.current.x - pctX)));
      setImgPositionY(Math.max(0, Math.min(100, dragPosStartRef.current.y - pctY)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

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
          body: JSON.stringify({ id: editingKachel.id, title: formTitle.trim(), url: formUrl.trim(), image: formImage.trim(), imgPositionX, imgPositionY, imgFit, imgZoom, imgRotation }),
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
          body: JSON.stringify({ title: formTitle.trim(), url: formUrl.trim(), image: formImage.trim(), imgPositionX, imgPositionY, imgFit, imgZoom, imgRotation }),
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
  const buildPreviewStyle = () => {
    if (!formImage) return {};
    const posX = `${imgPositionX}%`;
    const posY = `${imgPositionY}%`;
    const rotationDeg = `rotate(${imgRotation}deg)`;

    let bgSize: string;
    switch (imgFit) {
      case "fill":
        bgSize = "100% 100%";
        break;
      case "contain":
        bgSize = `calc(${Math.max(imgZoom, 5)}% / ${imgZoom > 100 ? imgZoom / 100 : 1})`;
        break;
      case "cover":
        bgSize = `${Math.max(imgZoom, 100)}%`;
        break;
      case "fit-width":
        bgSize = `calc(100% * ${Math.max(imgZoom, 100) / 100}) auto`;
        break;
      case "fit-height":
        bgSize = `auto calc(100% * ${Math.max(imgZoom, 100) / 100})`;
        break;
      default:
        bgSize = `${Math.max(imgZoom, 100)}%`;
    }

    return {
      backgroundImage: `url(${formImage})`,
      backgroundPosition: `${posX} ${posY}`,
      backgroundRepeat: "no-repeat",
      backgroundSize: bgSize,
      transformOrigin: "center center",
      transform: imgFit !== "contain" ? rotationDeg : undefined,
    };
  };

  const previewStyle = buildPreviewStyle();

  // For the main card display, we need to account for rotation in the aspect-video container
  const getCardImageStyle = (kachel: Kachel) => {
    if (!kachel.image || !kachel.imgFit) return {};
    
    const posX = `${kachel.imgPositionX ?? 50}%`;
    const posY = `${kachel.imgPositionY ?? 50}%`;
    const zoom = kachel.imgZoom ?? 100;
    const rotationDeg = `rotate(${kachel.imgRotation ?? 0}deg)`;

    let bgSize: string;
    switch (kachel.imgFit) {
      case "fill":
        bgSize = "100% 100%";
        break;
      case "contain":
        bgSize = `calc(${Math.max(zoom, 5)}% / ${zoom > 100 ? zoom / 100 : 1})`;
        break;
      case "cover":
        bgSize = `${Math.max(zoom, 100)}%`;
        break;
      case "fit-width":
        bgSize = `calc(100% * ${Math.max(zoom, 100) / 100}) auto`;
        break;
      case "fit-height":
        bgSize = `auto calc(100% * ${Math.max(zoom, 100) / 100})`;
        break;
      default:
        bgSize = `${Math.max(zoom, 100)}%`;
    }

    return {
      backgroundPosition: `${posX} ${posY}`,
      backgroundRepeat: "no-repeat",
      backgroundSize: bgSize,
      transformOrigin: "center center",
      transform: kachel.imgFit !== "contain" ? rotationDeg : undefined,
    };
  };

  const zoomIn = () => setImgZoom((prev) => Math.min(prev + 10, 500));
  const zoomOut = () => setImgZoom((prev) => Math.max(prev - 10, 5));

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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                  {/* Preview with applied style and drag support — visible tile window clips image at edges */}
                  <div 
                    ref={previewRef}
                    className={`rounded-lg overflow-hidden border mb-2 aspect-video relative group ${isDragging ? "cursor-grabbing" : imgFit !== "contain" ? "cursor-grab" : ""}`}
                    onMouseDown={handleMouseDown}
                    style={previewStyle}
                  >
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

                  {/* Rotation slider */}
                  {imgFit !== "contain" && (
                    <div className="space-y-1">
                      <Label htmlFor="img-rotation" className="text-xs flex items-center gap-1">
                        <RotateCw size={12} /> Bildrotation: {imgRotation}°
                      </Label>
                      <Input
                        id="img-rotation"
<dyad-problem-report summary="15 problems">
<problem file="src/pages/Dashboard.tsx" line="523" column="2" code="1005">'}' expected.</problem>
<problem file="src/pages/Dashboard.tsx" line="523" column="72" code="1002">Unterminated string literal.</problem>
<problem file="src/pages/Dashboard.tsx" line="536" column="23" code="17015">Expected corresponding closing tag for JSX fragment.</problem>
<problem file="src/pages/Dashboard.tsx" line="536" column="26" code="1382">Unexpected token. Did you mean `{'>'}` or `&gt;`?</problem>
<problem file="src/pages/Dashboard.tsx" line="559" column="21" code="1003">Identifier expected.</problem>
<problem file="src/pages/Dashboard.tsx" line="560" column="18" code="1381">Unexpected token. Did you mean `{'}'}` or `&rbrace;`?</problem>
<problem file="src/pages/Dashboard.tsx" line="607" column="15" code="17002">Expected corresponding JSX closing tag for 'DialogContent'.</problem>
<problem file="src/pages/Dashboard.tsx" line="608" column="13" code="17002">Expected corresponding JSX closing tag for 'Dialog'.</problem>
<problem file="src/pages/Dashboard.tsx" line="609" column="11" code="17002">Expected corresponding JSX closing tag for 'div'.</problem>
<problem file="src/pages/Dashboard.tsx" line="611" column="9" code="1005">')' expected.</problem>
<problem file="src/pages/Dashboard.tsx" line="613" column="7" code="1128">Declaration or statement expected.</problem>
<problem file="src/pages/Dashboard.tsx" line="614" column="5" code="1109">Expression expected.</problem>
<problem file="src/pages/Dashboard.tsx" line="615" column="3" code="1128">Declaration or statement expected.</problem>
<problem file="src/pages/Dashboard.tsx" line="523" column="1" code="2304">Cannot find name 'I'.</problem>
<problem file="src/pages/Dashboard.tsx" line="613" column="9" code="2304">Cannot find name 'div'.</problem>
</dyad-problem-report><think>

</think>

Looking at the errors, it seems like the Dashboard.tsx file got corrupted with some extra text ("I'll continue from where I left off...") and has structural issues. Let me rewrite the complete file properly:

<dyad-write path="src/pages/Dashboard.tsx" description="Fixing all TypeScript errors in Dashboard.tsx">
import { useState, useEffect, useRef } from "react";
import KachelCard from "@/components/KachelCard";
import SettingsDialog from "@/components/SettingsDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Plus, Minus, LogOut, Settings as SettingsIcon, Upload, X, RotateCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";

interface Kachel {
  id: string;
  title: string;
  url: string;
  image?: string;
  imgFit?: "fill" | "contain" | "cover" | "fit-width" | "fit-height";
  imgPositionX?: number;
  imgPositionY?: number;
  imgZoom?: number;
  imgRotation?: number;
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
  const [imgPositionX, setImgPositionX] = useState(50);
  const [imgPositionY, setImgPositionY] = useState(50);
  const [imgFit, setImgFit] = useState<ImgFit>("cover");
  const [imgZoom, setImgZoom] = useState(100);
  const [imgRotation, setImgRotation] = useState(0);
  const [uploading, setUploading] = useState(false);

  // File input ref for triggering the native file picker
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete menu state
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);

  // Dragging state for free image movement in preview
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragPosStartRef = useRef({ x: 50, y: 50 });

  // Preview container ref for drag calculations
  const previewRef = useRef<HTMLDivElement>(null);

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
    resetImageSettings();
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
    setImgPositionY(k.imgPositionY ?? 50);
    setImgFit((k.imgFit as ImgFit) || "cover");
    setImgZoom(k.imgZoom ?? 100);
    setImgRotation(k.imgRotation ?? 0);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setTimeout(() => setEditingKachel(null), 200);
  };

  const resetImageSettings = () => {
    setImgFit("cover");
    setImgPositionX(50);
    setImgPositionY(50);
    setImgZoom(100);
    setImgRotation(0);
  };

  // Drag handlers for free image movement in preview
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!formImage || imgFit === "contain") return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragPosStartRef.current = { x: imgPositionX, y: imgPositionY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !previewRef.current) return;

      const rect = previewRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Convert pixel delta to percentage of container size
      const pctX = (dx / rect.width) * 100;
      const pctY = (dy / rect.height) * 100;

      setImgPositionX(Math.max(0, Math.min(100, dragPosStartRef.current.x - pctX)));
      setImgPositionY(Math.max(0, Math.min(100, dragPosStartRef.current.y - pctY)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

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
          body: JSON.stringify({ id: editingKachel.id, title: formTitle.trim(), url: formUrl.trim(), image: formImage.trim(), imgPositionX, imgPositionY, imgFit, imgZoom, imgRotation }),
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
          body: JSON.stringify({ title: formTitle.trim(), url: formUrl.trim(), image: formImage.trim(), imgPositionX, imgPositionY, imgFit, imgZoom, imgRotation }),
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
  const buildPreviewStyle = () => {
    if (!formImage) return {};
    const posX = `${imgPositionX}%`;
    const posY = `${imgPositionY}%`;
    const rotationDeg = `rotate(${imgRotation}deg)`;

    let bgSize: string;
    switch (imgFit) {
      case "fill":
        bgSize = "100% 100%";
        break;
      case "contain":
        bgSize = `calc(${Math.max(imgZoom, 5)}% / ${imgZoom > 100 ? imgZoom / 100 : 1})`;
        break;
      case "cover":
        bgSize = `${Math.max(imgZoom, 100)}%`;
        break;
      case "fit-width":
        bgSize = `calc(100% * ${Math.max(imgZoom, 100) / 100}) auto`;
        break;
      case "fit-height":
        bgSize = `auto calc(100% * ${Math.max(imgZoom, 100) / 100})`;
        break;
      default:
        bgSize = `${Math.max(imgZoom, 100)}%`;
    }

    return {
      backgroundImage: `url(${formImage})`,
      backgroundPosition: `${posX} ${posY}`,
      backgroundRepeat: "no-repeat",
      backgroundSize: bgSize,
      transformOrigin: "center center",
      transform: imgFit !== "contain" ? rotationDeg : undefined,
    };
  };

  const previewStyle = buildPreviewStyle();

  const zoomIn = () => setImgZoom((prev) => Math.min(prev + 10, 500));
  const zoomOut = () => setImgZoom((prev) => Math.max(prev - 10, 5));

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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                  {/* Preview with applied style and drag support — visible tile window clips image at edges */}
                  <div 
                    ref={previewRef}
                    className={`rounded-lg overflow-hidden border mb-2 aspect-video relative group ${isDragging ? "cursor-grabbing" : imgFit !== "contain" ? "cursor-grab" : ""}`}
                    onMouseDown={handleMouseDown}
                    style={previewStyle}
                  >
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

                  {/* Rotation slider */}
                  {imgFit !== "contain" && (
                    <div className="space-y-1">
                      <Label htmlFor="img-rotation" className="text-xs flex items-center gap-1">
                        <RotateCw size={12} /> Bildrotation: {imgRotation}°
                      </Label>
                      <Input
                        id="img-rotation"
                        type="range"
                        min={0}
                        max={360}
                        value={imgRotation}
                        onChange={(e) => setImgRotation(Number(e.target.value))}
                      />
                    </div>
                  )}

                  {/* Reset button */}
                  <Button variant="outline" size="sm" onClick={resetImageSettings}>
                    <Maximize2 size={14} className="mr-1" /> Zurücksetzen
                  </Button>
                </>
              )}

              {!formImage && (
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
              )}
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