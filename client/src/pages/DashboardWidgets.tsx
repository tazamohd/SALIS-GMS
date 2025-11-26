import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  GripVertical,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Wrench,
  Clock,
  Settings,
  Eye,
  EyeOff,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Widget = {
  id: string;
  garageId: string;
  userId: string;
  widgetType: string;
  title: string;
  dataSource: string;
  configuration: any;
  position: any;
  refreshInterval: number | null;
  isActive: boolean;
  createdAt: string;
};

type DefaultWidget = {
  widgetType: string;
  title: string;
  dataSource: string;
  configuration: any;
};

const widgetTypeIcons: Record<string, typeof BarChart3> = {
  kpi: TrendingUp,
  chart: BarChart3,
  table: Table,
  metric: DollarSign,
};

const dataSourceIcons: Record<string, typeof Users> = {
  customers: Users,
  invoices: DollarSign,
  job_cards: Wrench,
  inventory: Package,
};

function SortableWidget({ widget, onToggle, onDelete }: { 
  widget: Widget; 
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = widgetTypeIcons[widget.widgetType] || BarChart3;
  const SourceIcon = dataSourceIcons[widget.dataSource] || Package;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg border ${
        widget.isActive 
          ? 'bg-white dark:bg-salis-gray-dark/50 border-gray-200 dark:border-salis-gray-dark' 
          : 'bg-gray-100 dark:bg-salis-gray-dark/20 border-gray-200 dark:border-salis-gray-dark/50 opacity-60'
      }`}
      data-testid={`widget-item-${widget.id}`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${widget.isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <Icon className={`h-5 w-5 ${widget.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{widget.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                <SourceIcon className="h-3 w-3 mr-1" />
                {widget.dataSource}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {widget.widgetType}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {widget.isActive ? (
              <Eye className="h-4 w-4 text-green-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            <Switch
              checked={widget.isActive}
              onCheckedChange={(checked) => onToggle(widget.id, checked)}
              data-testid={`toggle-widget-${widget.id}`}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => onDelete(widget.id)}
            data-testid={`delete-widget-${widget.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardWidgets() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newWidget, setNewWidget] = useState({
    title: '',
    widgetType: 'kpi',
    dataSource: 'invoices',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: widgets = [], isLoading } = useQuery<Widget[]>({
    queryKey: ['/api/dashboard/widgets'],
  });

  const { data: defaultWidgets = [] } = useQuery<DefaultWidget[]>({
    queryKey: ['/api/dashboard/widgets/defaults'],
  });

  const createWidgetMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/dashboard/widgets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/widgets'] });
      setIsAddDialogOpen(false);
      setNewWidget({ title: '', widgetType: 'kpi', dataSource: 'invoices' });
      toast({
        title: "Widget Created",
        description: "Your new dashboard widget has been added.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create widget. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateWidgetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/dashboard/widgets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/widgets'] });
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/dashboard/widgets/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/widgets'] });
      toast({
        title: "Widget Deleted",
        description: "The widget has been removed from your dashboard.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete widget. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePositionsMutation = useMutation({
    mutationFn: async (positions: { id: string; position: any }[]) => {
      return apiRequest('/api/dashboard/widgets/positions', {
        method: 'PATCH',
        body: JSON.stringify({ positions }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Layout Saved",
        description: "Widget positions have been updated.",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newOrder = arrayMove(widgets, oldIndex, newIndex);
      const positions = newOrder.map((widget, index) => ({
        id: widget.id,
        position: { order: index },
      }));

      updatePositionsMutation.mutate(positions);
    }
  };

  const handleToggleWidget = (id: string, isActive: boolean) => {
    updateWidgetMutation.mutate({ id, data: { isActive } });
    toast({
      title: isActive ? "Widget Enabled" : "Widget Disabled",
      description: isActive ? "Widget will now appear on your dashboard." : "Widget has been hidden from your dashboard.",
    });
  };

  const handleDeleteWidget = (id: string) => {
    deleteWidgetMutation.mutate(id);
  };

  const handleAddWidget = () => {
    if (!newWidget.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a widget title.",
        variant: "destructive",
      });
      return;
    }

    createWidgetMutation.mutate({
      ...newWidget,
      configuration: {},
    });
  };

  const handleAddDefaultWidget = (defaultWidget: DefaultWidget) => {
    createWidgetMutation.mutate({
      ...defaultWidget,
      configuration: defaultWidget.configuration || {},
    });
  };

  const activeWidgetsCount = widgets.filter(w => w.isActive).length;

  return (
    <StandardPageLayout
      title={t('dashboard.customizeWidgets', 'Customize Dashboard Widgets')}
      description="Personalize your dashboard by adding, removing, and rearranging widgets"
      icon={LayoutDashboard}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark" data-testid="stat-total-widgets">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Widgets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{widgets.length}</p>
                </div>
                <LayoutDashboard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark" data-testid="stat-active-widgets">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Widgets</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeWidgetsCount}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark" data-testid="stat-hidden-widgets">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hidden Widgets</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{widgets.length - activeWidgetsCount}</p>
                </div>
                <EyeOff className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark" data-testid="card-widgets-list">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Your Widgets
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Drag to reorder, toggle visibility, or remove widgets
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-widget">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.addWidget', 'Add Widget')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Add New Widget</DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                      Create a custom widget for your dashboard
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Widget Title</Label>
                      <Input
                        value={newWidget.title}
                        onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                        placeholder="e.g., Monthly Revenue"
                        className="mt-1 bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark"
                        data-testid="input-widget-title"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Widget Type</Label>
                      <Select value={newWidget.widgetType} onValueChange={(v) => setNewWidget({ ...newWidget, widgetType: v })}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark" data-testid="select-widget-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                          <SelectItem value="kpi">
                            <span className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" /> KPI Card
                            </span>
                          </SelectItem>
                          <SelectItem value="chart">
                            <span className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" /> Chart
                            </span>
                          </SelectItem>
                          <SelectItem value="table">
                            <span className="flex items-center gap-2">
                              <Table className="h-4 w-4" /> Table
                            </span>
                          </SelectItem>
                          <SelectItem value="metric">
                            <span className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" /> Metric
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Data Source</Label>
                      <Select value={newWidget.dataSource} onValueChange={(v) => setNewWidget({ ...newWidget, dataSource: v })}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark" data-testid="select-data-source">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                          <SelectItem value="invoices">
                            <span className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" /> Invoices
                            </span>
                          </SelectItem>
                          <SelectItem value="customers">
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" /> Customers
                            </span>
                          </SelectItem>
                          <SelectItem value="job_cards">
                            <span className="flex items-center gap-2">
                              <Wrench className="h-4 w-4" /> Job Cards
                            </span>
                          </SelectItem>
                          <SelectItem value="inventory">
                            <span className="flex items-center gap-2">
                              <Package className="h-4 w-4" /> Inventory
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-200 dark:border-salis-gray-dark">
                      Cancel
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700" 
                      onClick={handleAddWidget}
                      disabled={createWidgetMutation.isPending}
                      data-testid="button-save-widget"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Widget
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <RotateCcw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : widgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                  <LayoutDashboard className="h-12 w-12 mb-4 opacity-50" />
                  <p>No widgets configured</p>
                  <p className="text-sm">Add widgets to customize your dashboard</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={widgets.map(w => w.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {widgets.map((widget) => (
                        <SortableWidget
                          key={widget.id}
                          widget={widget}
                          onToggle={handleToggleWidget}
                          onDelete={handleDeleteWidget}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark" data-testid="card-preset-widgets">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Preset Widgets
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Quick-add popular widget configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {defaultWidgets.map((preset, index) => {
                  const Icon = widgetTypeIcons[preset.widgetType] || BarChart3;
                  return (
                    <div 
                      key={index}
                      className="p-3 rounded-lg border border-gray-200 dark:border-salis-gray-dark hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                      onClick={() => handleAddDefaultWidget(preset)}
                      data-testid={`preset-widget-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{preset.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {preset.widgetType} • {preset.dataSource}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-salis-gray-dark/30 border-gray-200 dark:border-salis-gray-dark" data-testid="card-widget-tips">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Widget Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <GripVertical className="h-4 w-4" />
                  {t('dashboard.dragToReorder', 'Drag to Reorder')}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Use the drag handle to rearrange widgets in your preferred order.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Toggle Visibility
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Toggle widgets on or off without deleting them for easy customization.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Widget Types
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Choose from KPI cards, charts, tables, and metrics to display your data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
