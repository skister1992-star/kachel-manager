import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KachelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { id?: string; title: string; url: string; image?: string }) => void;
  initialData?: { id: string; title: string; url: string; image?: string };
}

const KachelDialog = ({ open, onOpenChange, onSubmit, initialData }: KachelDialogProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [image, setImage] = useState(initialData?.image || "");

  useEffect(() => {
    if (initialData && open) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setImage(initialData.image || "");
    } else if (!open) {
      // Reset form when dialog closes
      setTimeout(() => {
        setTitle("");
        setUrl("");
        setImage("");
      }, 0);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!title.trim() || !url.trim()) return;
    
    // Close dialog immediately after submitting data
    onOpenChange(false);
    
    // Call onSubmit with the new data
    setTimeout(() => {
      onSubmit({ 
        id: initialData?.id, 
        title: title.trim(), 
        url: url.trim(), 
        image: image.trim() 
      });
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Kachel" : "New Kachel"}</DialogTitle>
          <DialogDescription>Fill in the details for your dashboard tile.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="k-title">Title</Label>
            <Input 
              id="k-title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="My Website" 
              disabled={!open} // Disable when dialog is closing
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="k-url">URL</Label>
            <Input 
              id="k-url" 
              type="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://example.com" 
              disabled={!open} // Disable when dialog is closing
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="k-image">Image URL (optional)</Label>
            <Input 
              id="k-image" 
              type="url" 
              value={image} 
              onChange={(e) => setImage(e.target.value)} 
              placeholder="https://example.com/image.png" 
              disabled={!open} // Disable when dialog is closing
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{initialData ? "Save Changes" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KachelDialog;