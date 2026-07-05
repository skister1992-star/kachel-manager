import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";

interface KachelCardProps {
  id: string;
  title: string;
  url: string;
  image?: string;
  editMode: boolean;
  onEditClick?: (id: string) => void;
}

const KachelCard = ({ id, title, url, image, editMode, onEditClick }: KachelCardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div>
      {editMode && onEditClick ? (
        /* ---- EDIT MODE: click opens edit dialog ---- */
        <Card
          className="overflow-hidden transition-shadow hover:shadow-lg group cursor-pointer"
          onClick={() => onEditClick(id)}
        >
          <div className="aspect-video bg-muted relative overflow-hidden">
            {!imgError && image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
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
              {!imgError && image ? (
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
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