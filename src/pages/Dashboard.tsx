import { useState, useEffect } from "react";
import { useAuth } from "@/App";
import KachelCard from "@/components/KachelCard";
import KachelDialog from "@/components/KachelDialog";
import SettingsDialog from "@/components/SettingsDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

interface Kachel {
  id: string;
  title: string;
  url: string;
  image?: string;
}

const Dashboard = () => {
  const { username, logout } = useAuth();
  const [kachels, setKachels] = useState<Kachel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Kachel | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fetchKachels = async () => {
    try {
      const res = await fetch("/api/kachel");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setKachels(data || []);
    } catch {
      toast.error("Could not load kachels from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKachels();
  }, []);

  const handleCreate = async (data: { title: string; url: string; image?: string }) => {
    try {
      const res = await fetch("/api/kachel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Kachel created!");
        fetchKachels();
      } else {
        toast.error(result.error || "Could not create kachel.");
      }
    } catch {
      toast.error("Could not reach the server.");
    }
  };

  const handleUpdate = async (data: { id?: string; title: string; url: string; image?: string }) => {
    if (!data.id) return;
    try {
      const res = await fetch("/api/kachel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Kachel updated!");
        fetchKachels();
      } else {
        toast.error(result.error || "Could not update kachel.");
      }
    } catch {
      toast.error("Could not reach the server.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this kachel?")) return;
    try {
      const res = await fetch("/api/kachel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Kachel deleted.");
        fetchKachels();
      } else {
        toast.error(result.error || "Could not delete kachel.");
      }
    } catch {
      toast.error("Could not reach the server.");
    }
  };

  const openEdit = (id: string) => {
    const item = kachels.find((k) => k.id === id);
    if (item) {
      setEditingItem(item);
      setDialogOpen(true);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold">Kachel Manager</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{username}</span>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Kachels</h2>
          <Button onClick={openCreate}>
            <Plus size={16} className="mr-1" /> Add Kachel
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card animate-pulse h-[280px]" />
            ))}
          </div>
        ) : kachels.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No kachels yet.</p>
            <Button variant="outline" onClick={openCreate}>Create your first one</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kachels.map((k) => (
              <KachelCard key={k.id} {...k} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <KachelDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingItem(null); }}
        onSubmit={(data) => editingItem ? handleUpdate(data) : handleCreate(data)}
        initialData={editingItem || undefined}
      />

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Dashboard;