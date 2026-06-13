// design-sync barrel: every UI component export, bundled to window.SalisUI.
// Regenerate by adding a line when a new component file lands in client/src/components/ui/.
export * from "../client/src/components/ui/accordion";
export * from "../client/src/components/ui/alert-dialog";
export * from "../client/src/components/ui/alert";
export * from "../client/src/components/ui/aspect-ratio";
export * from "../client/src/components/ui/avatar";
export * from "../client/src/components/ui/badge";
export * from "../client/src/components/ui/brand-card";
export * from "../client/src/components/ui/breadcrumb";
export * from "../client/src/components/ui/button";
export * from "../client/src/components/ui/calendar";
export * from "../client/src/components/ui/card";
export * from "../client/src/components/ui/carousel";
export * from "../client/src/components/ui/chart-card";
export * from "../client/src/components/ui/chart";
export * from "../client/src/components/ui/checkbox";
export * from "../client/src/components/ui/collapsible";
export * from "../client/src/components/ui/command";
export * from "../client/src/components/ui/context-menu";
export * from "../client/src/components/ui/dialog";
export * from "../client/src/components/ui/drawer";
export * from "../client/src/components/ui/dropdown-menu";
export * from "../client/src/components/ui/empty-state";
export * from "../client/src/components/ui/form";
export * from "../client/src/components/ui/hover-card";
export * from "../client/src/components/ui/input-otp";
export * from "../client/src/components/ui/input";
export * from "../client/src/components/ui/label";
export * from "../client/src/components/ui/linear-loader";
export * from "../client/src/components/ui/menubar";
export * from "../client/src/components/ui/navigation-menu";
export * from "../client/src/components/ui/pagination";
export * from "../client/src/components/ui/popover";
export * from "../client/src/components/ui/progress";
export * from "../client/src/components/ui/radio-group";
export * from "../client/src/components/ui/resizable";
export * from "../client/src/components/ui/scroll-area";
export * from "../client/src/components/ui/select";
export * from "../client/src/components/ui/separator";
export * from "../client/src/components/ui/sheet";
export * from "../client/src/components/ui/sidebar";
export * from "../client/src/components/ui/skeleton";
export * from "../client/src/components/ui/slider";
export * from "../client/src/components/ui/status-badge";
export * from "../client/src/components/ui/status-pill";
export * from "../client/src/components/ui/switch";
export * from "../client/src/components/ui/table";
export * from "../client/src/components/ui/tabs";
export * from "../client/src/components/ui/textarea";
export * from "../client/src/components/ui/toast";
export * from "../client/src/components/ui/toaster";
export * from "../client/src/components/ui/toggle-group";
export * from "../client/src/components/ui/toggle";
export * from "../client/src/components/ui/tooltip";

// Toast state lives in this hook module — exporting it from the bundle lets
// previews and designs fire toasts against the same instance Toaster reads.
export { useToast, toast } from "../client/src/hooks/use-toast";
