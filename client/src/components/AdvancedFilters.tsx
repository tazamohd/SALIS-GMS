import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Filter, Save, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SavedFilterPreset } from "@shared/schema";

interface AdvancedFiltersProps {
  garageId: string;
  module: string;
  onApplyFilter: (config: any) => void;
  currentFilter?: any;
}

export function AdvancedFilters({ garageId, module, onApplyFilter, currentFilter }: AdvancedFiltersProps) {
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);

  // Fetch saved presets
  const { data: presets } = useQuery<SavedFilterPreset[]>({
    queryKey: ['/api/filter-presets', { garageId, module }],
  });

  // Save preset mutation
  const savePresetMutation = useMutation({
    mutationFn: async (data: { name: string; filterConfig: any; isGlobal: boolean }) => {
      return apiRequest("POST", "/api/filter-presets", {
        garageId,
        module,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/filter-presets')
      });
      toast({ title: "Filter preset saved successfully" });
      setSaveDialogOpen(false);
      setPresetName("");
      setIsGlobal(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save filter preset", variant: "destructive" });
    },
  });

  // Delete preset mutation
  const deletePresetMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/filter-presets/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/filter-presets')
      });
      toast({ title: "Filter preset deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete preset", variant: "destructive" });
    },
  });

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({ title: "Error", description: "Please enter a preset name", variant: "destructive" });
      return;
    }

    if (!currentFilter) {
      toast({ title: "Error", description: "No filter to save", variant: "destructive" });
      return;
    }

    savePresetMutation.mutate({
      name: presetName,
      filterConfig: currentFilter,
      isGlobal,
    });
  };

  const handleApplyPreset = (preset: SavedFilterPreset) => {
    onApplyFilter(preset.filterConfig);
    toast({ title: "Filter preset applied" });
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this filter preset?")) {
      deletePresetMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Saved Filters</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          disabled={!currentFilter}
          data-testid="button-save-filter"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Current Filter
        </Button>
      </div>

      <div className="grid gap-2">
        {!presets || presets.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No saved filters yet
          </div>
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer group"
              onClick={() => handleApplyPreset(preset)}
              data-testid={`filter-preset-${preset.id}`}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{preset.name}</span>
                    {preset.isGlobal && (
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(preset.createdAt as unknown as string).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDeletePreset(preset.id, e)}
                data-testid={`button-delete-preset-${preset.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription className="sr-only">
              Save current filter configuration as a reusable preset
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Completed Jobs This Month"
                data-testid="input-preset-name"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share with team</Label>
                <div className="text-xs text-muted-foreground">
                  Make this filter available to all users in your garage
                </div>
              </div>
              <Switch
                checked={isGlobal}
                onCheckedChange={setIsGlobal}
                data-testid="switch-global-filter"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              data-testid="button-cancel-save"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreset}
              disabled={savePresetMutation.isPending}
              data-testid="button-confirm-save"
            >
              {savePresetMutation.isPending ? "Saving..." : "Save Preset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
