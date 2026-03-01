import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getVendorServices,
  createService,
  updateService,
  deleteService,
  getErrorMessage,
} from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ListSkeleton, EmptyState, ConfirmDialog } from "@/components/dashboard";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

const categories: { value: ServiceCategory; label: string }[] = [
  { value: "plumbing", label: "Plumbing" }, { value: "electrical", label: "Electrical" },
  { value: "carpentry", label: "Carpentry" }, { value: "cleaning", label: "Cleaning" },
  { value: "painting", label: "Painting" }, { value: "gardening", label: "Gardening" },
  { value: "pest_control", label: "Pest Control" }, { value: "appliance_repair", label: "Appliance Repair" },
  { value: "other", label: "Other" },
];

export default function VendorServices() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("other");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: services, isLoading, isError, error } = useQuery({
    queryKey: ["vendor-services", user?.id],
    queryFn: async () => {
      const result = await getVendorServices(user!.id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
  });

  const resetForm = () => { setName(""); setDescription(""); setCategory("other"); setPrice(""); setDuration("60"); setEditing(null); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        vendor_id: user!.id,
        name,
        description: description || null,
        category,
        price: parseFloat(price),
        duration_minutes: parseInt(duration, 10) || 60,
        is_available: true,
      };
      if (editing) {
        const result = await updateService(editing.id, payload);
        if (result.error) throw result.error;
      } else {
        const result = await createService(payload);
        if (result.error) throw result.error;
      }
    },
    onSuccess: () => {
      if (user?.id) qc.invalidateQueries({ queryKey: ["vendor-services", user.id] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success(editing ? "Service updated" : "Service added");
      setOpen(false);
      resetForm();
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteService(id);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      if (user?.id) qc.invalidateQueries({ queryKey: ["vendor-services", user.id] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted");
      setDeleteId(null);
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const result = await updateService(id, { is_available: available });
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      if (user?.id) qc.invalidateQueries({ queryKey: ["vendor-services", user.id] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const openEdit = (s: any) => {
    setEditing(s);
    setName(s.name);
    setDescription(s.description || "");
    setCategory(s.category);
    setPrice(String(s.price));
    setDuration(String(s.duration_minutes));
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My services</h1>
          <p className="text-muted-foreground mt-1">Add and manage your offerings</p>
        </div>
        <ListSkeleton rows={4} height="h-20" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My services</h1>
          <p className="text-muted-foreground mt-1">Add and manage your offerings</p>
        </div>
        <EmptyState icon={Package} title="Could not load services" description={getErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">My services</h1>
          <p className="text-muted-foreground mt-1">Add and manage your offerings</p>
        </div>
        <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />Add service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit service" : "Add new service"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pipe Repair" className="h-11" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your service…" className="h-11" /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={v => setCategory(v as ServiceCategory)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-11" /></div>
                <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="h-11" /></div>
              </div>
              <Button className="w-full h-11" onClick={() => saveMutation.mutate()} disabled={!name || !price || saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editing ? "Update service" : "Add service"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {services?.length === 0 ? (
        <EmptyState icon={Package} title="No services yet" description="Add your first service to get started" />
      ) : (
        <div className="space-y-4">
          {services?.map(s => (
            <Card key={s.id} className="border-border/80 shadow-card hover:shadow-card-hover transition-all duration-200 rounded-xl card-hover-scale">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 md:p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{s.name}</h3>
                    <Badge variant="secondary">{categories.find(c => c.value === s.category)?.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">₹{s.price} • {s.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{s.is_available ? "Available" : "Unavailable"}</span>
                    <Switch checked={s.is_available} onCheckedChange={v => toggleAvailability.mutate({ id: s.id, available: v })} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete service?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}
