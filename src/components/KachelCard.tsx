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
  imgFitMode?: string;
  editMode: boolean;
  onEditClick?: (id: string) => void;
}

const KachelCard = ({ id, title, url, image, imgPositionX = 0, imgPositionY = 0, imgRotation = 0, imgFitMode = "fill", editMode, onEditClick }: KachelCardProps) => {
  const [imgError, setImgError] = useState(false);

  const buildImageStyle = () => {
    if (!image || imgError) return {};
    const base: React.CSSProperties = {
      position: "absolute",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      objectFit: "none",
      transformOrigin: "center center",
    };

    switch (imgFitMode) {
      case "fill":
        base.objectFit = undefined;
        break;
      case "fit-width":
        base.width = "100%";
        base.height = "auto";
        base.top = `calc(50% + ${imgPositionY}px)`;
        base.left = `${imgPositionX}px`;
        base.transformOrigin = undefined;
        break;
      case "fit-height":
        base.width = "auto";
        base.height = "100%";
        base.top = `${imgPositionY}px`;
        base.left = `calc(50% + ${imgPositionX}px)`;
        base.transformOrigin = undefined;
        break;
      case "center":
        base.width = "auto";
        base.height = "100%";
        base.top = "50%";
        base.left = "50%";
        base.transform = `translate(-50%, -50%) rotate(${imgRotation}deg)`;
        break;
    }

    if (imgFitMode === "fill") {
      base.transform = `translate(${imgPositionX}px, ${imgPositionY}px) rotate(${imgRotation}deg)`;
    } else if (imgFitMode !== "center") {
      base.transform = `rotate(${imgRotation}deg)`;
    }

    return base;
  };

  const imageStyle = buildImageStyle();

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