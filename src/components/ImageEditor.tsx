"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, RotateCw, Maximize2, MoveHorizontal, MoveVertical, AlignCenter, ZoomIn, Undo2 } from "lucide-react";

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

  // Pan is only possible when not in fill mode
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
    if (!canPan || !imageUrl) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: imgPositionX, posY: imgPositionY };
  }, [imgPositionX, imgPositionY, canPan, imageUrl]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canPan) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    onImgPositionChange(dragStart.current.posX + dx, dragStart.current.posY + dy);
  }, [isDragging, canPan, onImgPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset position when switching fit modes for clean transitions
  const handleFitModeChange = (mode: string) => {
    if (mode !== imgFitMode) {
      onImgPositionChange(0, 0);
    }
    onImgFitModeChange(mode);
  };

  // Build the image style based on fit mode and transforms
  const getImageStyle = (): React.CSSProperties => {
    if (!imageUrl) return {};

    // Füllen: fill the tile while preserving aspect ratio (crop overflow)
    if (imgFitMode === "fill") {
      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center center",
      };
    }

    // Other modes: centered with transform for pan/rotation/zoom
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transformOrigin: "center center",
      pointerEvents: "none",
      userSelect: "none",
    };

    if (imgFitMode === "fit-width") {
      // Scale so image width = tile width, keep aspect ratio, center vertically
      baseStyle.width = "100%";
      baseStyle.height = "auto";
    } else if (imgFitMode === "fit-height") {
      // Scale so image height = tile height, keep aspect ratio, center horizontally
      baseStyle.width = "auto";
      baseStyle.height = "100%";
    } else {
      // Center: original size, centered in tile
      baseStyle.maxWidth = "100%";
      baseStyle.maxHeight = "100%";
    }

    const scale = 1 + imgZoom / 100;
    baseStyle.transform = `translate(calc(-50% + ${imgPositionX}px), calc(-50% + ${imgPositionY}px)) rotate(${imgRotation}deg) scale(${scale})`;

    return baseStyle;
  };

  const imageStyle = getImageStyle();

  return (
    <div className="space-y-4">
      {/* Image preview */}
      <Label className="text-sm font-medium block">Vorschau</Label>
      <div
        ref={previewRef}
        className={`aspect-video bg-muted border rounded-lg relative overflow-hidden select-none ${canPan && imageUrl ? "cursor-grab active:cursor-grabbing" : ""}`}
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
            draggable={false}
            className="select-none"
            style={imageStyle}
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
            onClick={() => handleFitModeChange("fill")}
            title="Kachel füllen (Seitenverhältnis beibehalten)"
          >
            <Maximize2 size={14} />
            <span className="ml-1 text-xs">Füllen</span>
          </Button>
          <Button
            variant={imgFitMode === "fit-width" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFitModeChange("fit-width")}
            title="Breite anpassen & zentrieren"
          >
            <MoveHorizontal size={14} />
            <span className="ml-1 text-xs">Breite</span>
          </Button>
          <Button
            variant={imgFitMode === "fit-height" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFitModeChange("fit-height")}
            title="Höhe anpassen & zentrieren"
          >
            <MoveVertical size={14} />
            <span className="ml-1 text-xs">Höhe</span>
          </Button>
          <Button
            variant={imgFitMode === "center" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFitModeChange("center")}
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
            <Undo2 size={12} className="mr-1" />
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