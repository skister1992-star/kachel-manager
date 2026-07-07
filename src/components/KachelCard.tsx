import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";

interface KachelCardProps {
  id: string;
  title: string;
  url: string;
  image?: string;
  imgPositionX?: number;
  imgPositionY?: number;
  imgRotation?: number;
  imgZoom?: number;
  imgFitMode?: string;
  editMode: boolean;
  onEditClick?: (id: string) => void;
}

const KachelCard = ({ id, title, url, image, imgPositionX = 0, imgPositionY = 0, imgRotation = 0, imgZoom = 0, imgFitMode = "center", editMode, onEditClick }: KachelCardProps) => {
  const [imgError, setImgError] = useState(false);

  // Determine image CSS based on fit mode — same logic as ImageEditor
  const getImageStyle = (): React.CSSProperties => {
    if (!image || imgError) return {};

    if (imgFitMode === "fill") {
      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "none",
      };
    }

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transformOrigin: "center center",
      pointerEvents: "none",
      userSelect: "none",
    };

    if (imgFitMode === "fit-width") {
      baseStyle.width = "100%";
      baseStyle.height = "auto";
    } else if (imgFitMode === "fit-height") {
      baseStyle.width = "auto";
      baseStyle.height = "100%";
    } else {
      // "center" — natural size, but cap to container so it doesn't overflow too much
      baseStyle.maxWidth = "100%";
      baseStyle.maxHeight = "100%";
    }

    const scale = 1 + imgZoom / 100;
    baseStyle.transform = `translate(calc(-50% + ${imgPositionX}px), calc(-50% + ${imgPositionY}px)) rotate(${imgRotation}deg) scale(${scale})`;

    return baseStyle;
  };

  const imageStyle = getImageStyle();

  return (
    <div>
      {editMode && onEditClick ? (
        /* ---- EDIT MODE: click opens edit dialog ---- */
        <Card
          className="overflow-hidden transition-shadow hover:shadow-lg group cursor-pointer"
          onClick={() => onEditClick(id)}
        >
          <div className="aspect-video bg-muted relative overflow-hidden">
            {image && !imgError ? (
              <img
                src={image}
                alt={title}
                style={imageStyle}
                onError={() => setImgError(true)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
            {(imgError || !image) && (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                <span className="text-lg font-medium">{title.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <CardContent className="p-3 space-y-2 relative">
            <h3 className="font-semibold leading-tight line-clamp-2">{title}</h3>
            {/* Pencil overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Pencil size={28} className="text-white" />
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ---- VIEW MODE: click opens link in new tab ---- */
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Card className="overflow-hidden transition-shadow hover:shadow-lg group cursor-pointer">
            <div className="aspect-video bg-muted relative overflow-hidden">
              {image && !imgError ? (
                <img
                  src={image}
                  alt={title}
                  style={imageStyle}
                  onError={() => setImgError(true)}
                />
              ) : null}
              {(imgError || !image) && (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                  <span className="text-lg font-medium">{title.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <CardContent className="p-3 space-y-2">
              <h3 className="font-semibold leading-tight line-clamp-2">{title}</h3>
            </CardContent>
          </Card>
        </a>
      )}
    </div>
  );
};

export default KachelCard;