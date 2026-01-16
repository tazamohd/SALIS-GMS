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
          ? 'bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]' 
          : 'bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] opacity-60'
      }`}
      data-testid={`widget-item-${widget.id}`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#64748B] hover:text-[#0B1F3B] dark:hover:text-white"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        <div className="flex-1 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${widget.isActive ? 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20' : 'bg-[#F8FAFC] dark:bg-[#0E1117]'}`}>
            <Icon className={`h-5 w-5 ${widget.isActive ? 'text-[#0A5ED7] dark:text-[#0BB3FF]' : 'text-[#64748B]'}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-[#0B1F3B] dark:text-white">{widget.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs bg-[#F8FAFC] dark:bg-[#0E1117] text-[#64748B]">
                <SourceIcon className="h-3 w-3 mr-1" />
                {widget.dataSource}
              </Badge>
              <Badge variant="outline" className="text-xs border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">
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
              <EyeOff className="h-4 w-4 text-[#64748B]" />
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
      return apiRequest('/api/dashboard/widgets', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/widgets'] });
      setIsAddDialogOpen(false);
      setNewWidget({ title: '', widgetType: 'kpi', dataSource: 'invoices' });
      toast({
        title: t('dashboardWidgets.widgetCreated', 'Widget Created'),
        description: t('dashboardWidgets.widgetCreatedDesc', 'Your new dashboard widget has been added.'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('dashboardWidgets.failedToCreateWidget', 'Failed to create widget. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const updateWidgetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/dashboard/widgets/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/widgets'] });
    },
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/dashboard/widgets/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/widgets'] });
      toast({
        title: t('dashboardWidgets.widgetDeleted', 'Widget Deleted'),
        description: t('dashboardWidgets.widgetDeletedDesc', 'The widget has been removed from your dashboard.'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('dashboardWidgets.failedToDeleteWidget', 'Failed to delete widget. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const updatePositionsMutation = useMutation({
    mutationFn: async (positions: { id: string; position: any }[]) => {
      return apiRequest('/api/dashboard/widgets/positions', 'PATCH', { positions });
    },
    onSuccess: () => {
      toast({
        title: t('dashboardWidgets.layoutSaved', 'Layout Saved'),
        description: t('dashboardWidgets.layoutSavedDesc', 'Widget positions have been updated.'),
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
      title: isActive ? t('dashboardWidgets.widgetEnabled', 'Widget Enabled') : t('dashboardWidgets.widgetDisabled', 'Widget Disabled'),
      description: isActive ? t('dashboardWidgets.widgetEnabledDesc', 'Widget will now appear on your dashboard.') : t('dashboardWidgets.widgetDisabledDesc', 'Widget has been hidden from your dashboard.'),
    });
  };

  const handleDeleteWidget = (id: string) => {
    deleteWidgetMutation.mutate(id);
  };

  const handleAddWidget = () => {
    if (!newWidget.title.trim()) {
      toast({
        title: t('common.error', 'Error'),
        description: t('dashboardWidgets.pleaseEnterTitle', 'Please enter a widget title.'),
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
      description={t('dashboardWidgets.personalizeDescription', 'Personalize your dashboard by adding, removing, and rearranging widgets')}
      icon={LayoutDashboard}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-total-widgets">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">{t('dashboardWidgets.totalWidgets', 'Total Widgets')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{widgets.length}</p>
                </div>
                <LayoutDashboard className="h-8 w-8 text-[#0A5ED7]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-active-widgets">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">{t('dashboardWidgets.activeWidgets', 'Active Widgets')}</p>
                  <p className="text-2xl font-bold text-green-600">{activeWidgetsCount}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-hidden-widgets">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">{t('dashboardWidgets.hiddenWidgets', 'Hidden Widgets')}</p>
                  <p className="text-2xl font-bold text-[#64748B]">{widgets.length - activeWidgetsCount}</p>
                </div>
                <EyeOff className="h-8 w-8 text-[#64748B]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-widgets-list">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#64748B]" />
                  {t('dashboardWidgets.yourWidgets', 'Your Widgets')}
                </CardTitle>
                <CardDescription className="text-[#64748B]">
                  {t('dashboardWidgets.dragToReorder', 'Drag to reorder, toggle visibility, or remove widgets')}
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-add-widget">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.addWidget', 'Add Widget')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <DialogHeader>
                    <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('dashboardWidgets.addNewWidget', 'Add New Widget')}</DialogTitle>
                    <DialogDescription className="text-[#64748B]">
                      {t('dashboardWidgets.createCustomWidget', 'Create a custom widget for your dashboard')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-[#0B1F3B] dark:text-white">{t('dashboardWidgets.widgetTitle', 'Widget Title')}</Label>
                      <Input
                        value={newWidget.title}
                        onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                        placeholder={t('dashboardWidgets.widgetTitlePlaceholder', 'e.g., Monthly Revenue')}
                        className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                        data-testid="input-widget-title"
                      />
                    </div>
                    <div>
                      <Label className="text-[#0B1F3B] dark:text-white">{t('dashboardWidgets.widgetType', 'Widget Type')}</Label>
                      <Select value={newWidget.widgetType} onValueChange={(v) => setNewWidget({ ...newWidget, widgetType: v })}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-widget-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="kpi">
                            <span className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" /> {t('widgets.widgetTypes.kpi', 'KPI')}
                            </span>
                          </SelectItem>
                          <SelectItem value="chart">
                            <span className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" /> {t('dashboardWidgets.chart', 'Chart')}
                            </span>
                          </SelectItem>
                          <SelectItem value="table">
                            <span className="flex items-center gap-2">
                              <Table className="h-4 w-4" /> {t('dashboardWidgets.table', 'Table')}
                            </span>
                          </SelectItem>
                          <SelectItem value="metric">
                            <span className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" /> {t('dashboardWidgets.metric', 'Metric')}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#0B1F3B] dark:text-white">{t('dashboardWidgets.dataSource', 'Data Source')}</Label>
                      <Select value={newWidget.dataSource} onValueChange={(v) => setNewWidget({ ...newWidget, dataSource: v })}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-data-source">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="invoices">
                            <span className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" /> {t('dashboardWidgets.invoices', 'Invoices')}
                            </span>
                          </SelectItem>
                          <SelectItem value="customers">
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" /> {t('dashboardWidgets.customers', 'Customers')}
                            </span>
                          </SelectItem>
                          <SelectItem value="job_cards">
                            <span className="flex items-center gap-2">
                              <Wrench className="h-4 w-4" /> {t('dashboardWidgets.jobCards', 'Job Cards')}
                            </span>
                          </SelectItem>
                          <SelectItem value="inventory">
                            <span className="flex items-center gap-2">
                              <Package className="h-4 w-4" /> {t('dashboardWidgets.inventory', 'Inventory')}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" 
                      onClick={handleAddWidget}
                      disabled={createWidgetMutation.isPending}
                      data-testid="button-save-widget"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {t('common.save', 'Save')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <RotateCcw className="h-8 w-8 animate-spin text-[#0A5ED7]" />
                </div>
              ) : widgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[#64748B]">
                  <LayoutDashboard className="h-12 w-12 mb-4 opacity-50" />
                  <p>{t('dashboardWidgets.noWidgetsConfigured', 'No widgets configured')}</p>
                  <p className="text-sm">{t('dashboardWidgets.addWidgetsToCustomize', 'Add widgets to customize your dashboard')}</p>
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

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-preset-widgets">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                {t('presetWidgets.title', 'Preset Widgets')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('presetWidgets.description', 'Quick-add common widget configurations')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {defaultWidgets.map((preset, index) => {
                  const Icon = widgetTypeIcons[preset.widgetType] || BarChart3;
                  return (
                    <div 
                      key={index}
                      className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] hover:bg-[#0A5ED7]/5 dark:hover:bg-[#0A5ED7]/10 transition-colors cursor-pointer"
                      onClick={() => handleAddDefaultWidget(preset)}
                      data-testid={`preset-widget-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-[#0B1F3B] dark:text-white text-sm">{preset.title}</h4>
                          <p className="text-xs text-[#64748B]">
                            {preset.widgetType} • {preset.dataSource}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-[#64748B]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-widget-tips">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('dashboard.widgetTips', 'Widget Tips')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20">
                <h4 className="font-medium text-[#0A5ED7] dark:text-[#0BB3FF] mb-2 flex items-center gap-2">
                  <GripVertical className="h-4 w-4" />
                  {t('dashboard.dragToReorder', 'Drag to Reorder')}
                </h4>
                <p className="text-sm text-[#0A5ED7]/70 dark:text-[#0BB3FF]/70">
                  {t('dashboard.dragToReorderDesc', 'Use the drag handle to reorder widgets according to your preference.')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t('dashboard.toggleVisibility', 'Toggle Visibility')}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {t('dashboard.toggleVisibilityDesc', 'Hide widgets you do not need without deleting them.')}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('dashboard.quickAdd', 'Quick Add')}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  {t('dashboard.quickAddDesc', 'Click on preset widgets to add them instantly to your dashboard.')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
