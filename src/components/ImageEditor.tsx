"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, RotateCw, Maximize2, MoveHorizontal, MoveVertical, AlignCenter, ZoomIn } from "lucide-react";

interface ImageEditorProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  imgPositionX: number;
  imgPositionY: number;
  imgRotation: number;
  imgFitMode: string;
  imgZoom?: number;
  onImgPositionChange: (x: number, y: number) => void;
  onImgRotationChange: (rotation: number) => void;
  onImgFitModeChange: (mode: string) => void;
  onImgZoomChange?: (zoom: number) => void;
}

const ImageEditor = ({
  imageUrl,
  onImageUrlChange,
  imgPositionX,
  imgPositionY,
  imgRotation,
  imgFitMode,
  imgZoom = 0,
  onImgPositionChange,
  onImgRotationChange,
  onImgFitModeChange,
  onImgZoomChange,
}: ImageEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Disable dragging/panning in "fill" mode since the image is locked
  const canPan = imgFitMode !== "fill";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Nur Bilddateien sind erlaubt.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (result.success) {
        onImageUrlChange(result.url);
      } else {
        alert(result.error || "Upload fehlgeschlagen.");
      }
    } catch {
      alert("Server-Verbindung fehlgeschlagen.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canPan) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: imgPositionX, posY: imgPositionY };
  }, [imgPositionX, imgPositionY, canPan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canPan) return;
    const dx = (e.clientX - dragStart.current.x);
    const dy = (e.clientY - dragStart.current.y);
    onImgPositionChange(dragStart.current.posX + dx, dragStart.current.posY + dy);
  }, [isDragging, canPan, onImgPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Image preview window */}
      <Label className="text-sm font-medium block">Vorschau</Label>
      <div
        ref={previewRef}
        className={`aspect-video bg-muted border rounded-lg relative overflow-hidden select-none ${canPan ? "cursor-move" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: "none" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Vorschau"
            className={`absolute pointer-events-none select-none ${canPan ? "" : "w-full h-full object-cover"}`}
            draggable={false}
            style={{
              // For non-fill modes: center + pan + zoom
              top: imgFitMode !== "fill" ? "50%" : undefined,
              left: imgFitMode !== "fill" ? "50%" : undefined,
              transformOrigin: "center center",
              transform: imgFitMode === "fill"
                ? undefined
                : `translate(calc(-50% + ${imgPositionX}px), calc(-50% + ${imgPositionY}px)) rotate(${imgRotation}deg) scale(${1 + imgZoom / 100})`,
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            Kein Bild geladen
          </div>
        )}
      </div>

      {/* Upload button */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
        <Upload size={16} className="mr-2" />
        Bild hochladen
      </Button>

      {/* Fit mode buttons */}
      <div className="space-y-2">
        <Label className="text-sm font-medium block">Anpassung</Label>
        <div className="grid grid-cols-4 gap-1">
          <Button
            variant={imgFitMode === "fill" ? "default" : "outline"}
            size="sm"
            onClick={() => onImgFitModeChange("fill")}
            title="An Kachel füllen (kein Verschieben)"
          >
            <Maximize2 size={14} />
            <span className="ml-1 text-xs">Füllen</span>
          </Button>
          <Button
            variant={imgFitMode === "fit-width" ? "default" : "outline"}
            size="sm"
            onClick={() => onImgFitModeChange("fit-width")}
            title="Breite anpassen & zentrieren"
          >
            <MoveHorizontal size={14} />
            <span className="ml-1 text-xs">Breite</span>
          </Button>
          <Button
            variant={imgFitMode === "fit-height" ? "default" : "outline"}
            size="sm"
            onClick={() => onImgFitModeChange("fit-height")}
            title="Höhe anpassen & zentrieren"
          >
            <MoveVertical size={14} />
            <span className="ml-1 text-xs">Höhe</span>
          </Button>
          <Button
            variant={imgFitMode === "center" ? "default" : "outline"}
            size="sm"
            onClick={() => onImgFitModeChange("center")}
            title="Originalgröße mittig"
          >
            <AlignCenter size={14} />
            <span className="ml-1 text-xs">Mitte</span>
          </Button>
        </div>
      </div>

      {/* Zoom slider */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ZoomIn size={14} />
            Vergrößerung: {imgZoom > 0 ? `+${imgZoom}` : imgZoom}%
          </span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onImgZoomChange && onImgZoomChange(0)}>
            Nullen
          </Button>
        </Label>
        <Slider
          value={[imgZoom]}
          onValueChange={(vals) => onImgZoomChange && onImgZoomChange(vals[0])}
          min={-100}
          max={100}
          step={1}
        />
      </div>

      {/* Rotation slider */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <RotateCw size={14} />
          Rotation: {imgRotation}°
        </Label>
        <Slider
          value={[imgRotation]}
          onValueChange={(vals) => onImgRotationChange(vals[0])}
          min={0}
          max={360}
          step={1}
        />
      </div>
    </div>
  );
};

export default ImageEditor;