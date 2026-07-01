import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface KachelCardProps {
  id: string;
  title: string;
  url: string;
  image?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const KachelCard = ({ id, title, url, image, onEdit, onDelete }: KachelCardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg group">
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
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold leading-tight line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground truncate" title={url}>
          {url}
        </p>
        <div className="flex items-center justify-between pt-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Visit <ExternalLink size={14} />
          </a>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => onEdit(id)} title="Edit">
              <Pencil size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(id)} title="Delete" className="text-destructive">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KachelCard;