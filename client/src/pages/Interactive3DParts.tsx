import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Box,
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Eye,
  ShoppingCart,
  Info,
  Layers,
  Settings2,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Grid3X3,
  Package,
  Wrench,
  Car,
  Cog,
  Battery,
  Disc,
  CircleDot,
  Filter,
  Download,
  Share2,
  Bookmark,
  MousePointer2,
  Hand,
} from "lucide-react";

interface Part3DModel {
  id: string;
  partName: string;
  partNumber: string | null;
  category: string | null;
  manufacturer: string | null;
  modelFileUrl: string;
  textureFileUrl: string | null;
  fileSize: number | null;
  polygonCount: number | null;
  compatibility: any;
  explosionViewUrl: string | null;
  annotations: any;
  viewCount: number | null;
  downloadCount: number | null;
  isPublic: boolean | null;
  uploadedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const categoryIcons: Record<string, React.ElementType> = {
  engine: Cog,
  transmission: Settings2,
  brakes: Disc,
  suspension: CircleDot,
  electrical: Battery,
  body: Car,
  exhaust: Wrench,
  cooling: RefreshCw,
  default: Package,
};

const sampleParts: Part3DModel[] = [
  {
    id: "1",
    partName: "Engine Block V8",
    partNumber: "ENG-V8-001",
    category: "engine",
    manufacturer: "OEM",
    modelFileUrl: "/models/engine-block.glb",
    textureFileUrl: null,
    fileSize: 2500,
    polygonCount: 45000,
    compatibility: { makes: ["Ford", "Chevrolet"], years: ["2018-2024"] },
    explosionViewUrl: null,
    annotations: [
      { id: 1, name: "Cylinder Head", position: { x: 0, y: 50, z: 0 } },
      { id: 2, name: "Crankshaft", position: { x: 0, y: -30, z: 0 } },
    ],
    viewCount: 1250,
    downloadCount: 89,
    isPublic: true,
    uploadedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    partName: "Brake Rotor Front",
    partNumber: "BRK-RTR-F01",
    category: "brakes",
    manufacturer: "Brembo",
    modelFileUrl: "/models/brake-rotor.glb",
    textureFileUrl: null,
    fileSize: 850,
    polygonCount: 12000,
    compatibility: { makes: ["Toyota", "Honda"], years: ["2020-2024"] },
    explosionViewUrl: null,
    annotations: [
      { id: 1, name: "Ventilation Slots", position: { x: 20, y: 0, z: 0 } },
    ],
    viewCount: 890,
    downloadCount: 45,
    isPublic: true,
    uploadedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    partName: "Transmission Assembly",
    partNumber: "TRN-AUTO-6S",
    category: "transmission",
    manufacturer: "ZF",
    modelFileUrl: "/models/transmission.glb",
    textureFileUrl: null,
    fileSize: 3200,
    polygonCount: 58000,
    compatibility: { makes: ["BMW", "Audi"], years: ["2019-2024"] },
    explosionViewUrl: "/models/transmission-exploded.glb",
    annotations: [
      { id: 1, name: "Torque Converter", position: { x: -40, y: 0, z: 0 } },
      { id: 2, name: "Gear Set", position: { x: 20, y: 0, z: 0 } },
    ],
    viewCount: 650,
    downloadCount: 32,
    isPublic: true,
    uploadedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    partName: "Alternator 150A",
    partNumber: "ELC-ALT-150",
    category: "electrical",
    manufacturer: "Denso",
    modelFileUrl: "/models/alternator.glb",
    textureFileUrl: null,
    fileSize: 720,
    polygonCount: 8500,
    compatibility: { makes: ["All"], years: ["Universal"] },
    explosionViewUrl: null,
    annotations: [],
    viewCount: 420,
    downloadCount: 28,
    isPublic: true,
    uploadedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    partName: "Shock Absorber Front",
    partNumber: "SUS-SHK-F01",
    category: "suspension",
    manufacturer: "Bilstein",
    modelFileUrl: "/models/shock-absorber.glb",
    textureFileUrl: null,
    fileSize: 480,
    polygonCount: 6200,
    compatibility: { makes: ["Mercedes", "BMW"], years: ["2018-2024"] },
    explosionViewUrl: null,
    annotations: [
      { id: 1, name: "Piston Rod", position: { x: 0, y: 60, z: 0 } },
      { id: 2, name: "Spring Seat", position: { x: 0, y: 30, z: 0 } },
    ],
    viewCount: 380,
    downloadCount: 19,
    isPublic: true,
    uploadedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    partName: "Catalytic Converter",
    partNumber: "EXH-CAT-UNI",
    category: "exhaust",
    manufacturer: "MagnaFlow",
    modelFileUrl: "/models/catalytic-converter.glb",
    textureFileUrl: null,
    fileSize: 620,
    polygonCount: 7800,
    compatibility: { makes: ["Universal"], years: ["2015-2024"] },
    explosionViewUrl: null,
    annotations: [
      { id: 1, name: "Honeycomb Core", position: { x: 0, y: 0, z: 0 } },
    ],
    viewCount: 290,
    downloadCount: 15,
    isPublic: true,
    uploadedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function Interactive3DParts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [selectedPart, setSelectedPart] = useState<Part3DModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isExplodedView, setIsExplodedView] = useState(false);
  const [interactionMode, setInteractionMode] = useState<"rotate" | "pan">("rotate");
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const { data: partsFromApi, isLoading } = useQuery<Part3DModel[]>({
    queryKey: ["/api/parts-3d-models"],
  });

  const parts: Part3DModel[] = (partsFromApi && Array.isArray(partsFromApi) && partsFromApi.length > 0) ? partsFromApi : sampleParts;

  useEffect(() => {
    let animationFrame: number;
    if (isAutoRotate && selectedPart) {
      const animate = () => {
        setRotation((prev) => ({
          ...prev,
          y: (prev.y + 0.5) % 360,
        }));
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isAutoRotate, selectedPart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    if (interactionMode === "rotate") {
      setRotation((prev) => ({
        x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
        y: prev.y + deltaX * 0.5,
      }));
    } else {
      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    }
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setRotation({ x: -20, y: 45 });
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || part.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(parts.map((p) => p.category).filter((c): c is string => c !== null)));

  const handleAddToCart = () => {
    if (!selectedPart) return;
    toast({
      title: t("interactive3d.addedToCart", "Added to Cart"),
      description: `${orderQuantity}x ${selectedPart.partName} added to your cart.`,
    });
    setIsOrderDialogOpen(false);
    setOrderQuantity(1);
  };

  const getCategoryIcon = (category: string | null) => {
    const Icon = categoryIcons[category || "default"] || categoryIcons.default;
    return Icon;
  };

  return (
    <div className="min-h-screen bg-[#E6E9ED] dark:bg-[#0E1117] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
              {t("interactive3d.title", "Interactive 3D Parts Viewer")}
            </h1>
            <p className="text-[#6B7280] dark:text-[#9BA4B0] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t("interactive3d.subtitle", "Explore, identify, and order vehicle parts with interactive 3D models")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="border-[#C9D1DA] dark:border-[#232A36]"
              data-testid="button-toggle-view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 space-y-4">
            <Card className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#2A2F3A] dark:text-[#E6EAF0]">
                  {t("interactive3d.partsCatalog", "Parts Catalog")}
                </CardTitle>
                <CardDescription className="text-[#6B7280] dark:text-[#9BA4B0]">
                  {t("interactive3d.selectPart", "Select a part to view in 3D")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <Input
                    placeholder={t("interactive3d.searchParts", "Search parts...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#E6E9ED] dark:bg-[#0E1117] border-[#C9D1DA] dark:border-[#232A36]"
                    data-testid="input-search-parts"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-[#E6E9ED] dark:bg-[#0E1117] border-[#C9D1DA] dark:border-[#232A36]" data-testid="select-category">
                    <Filter className="h-4 w-4 mr-2 text-[#6B7280]" />
                    <SelectValue placeholder={t("interactive3d.allCategories", "All Categories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("interactive3d.allCategories", "All Categories")}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat || ""}>
                        {cat?.charAt(0).toUpperCase() + cat?.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))
                  ) : filteredParts.length === 0 ? (
                    <div className="text-center py-8 text-[#6B7280] dark:text-[#9BA4B0]">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>{t("interactive3d.noPartsFound", "No parts found")}</p>
                    </div>
                  ) : (
                    filteredParts.map((part) => {
                      const CategoryIcon = getCategoryIcon(part.category);
                      return (
                        <button
                          key={part.id}
                          onClick={() => {
                            setSelectedPart(part);
                            resetView();
                          }}
                          className={`w-full p-3 rounded-lg border transition-all text-left ${
                            selectedPart?.id === part.id
                              ? "border-[#0A5ED7] bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10"
                              : "border-[#C9D1DA] dark:border-[#232A36] hover:border-[#0A5ED7]/50 hover:bg-[#E6E9ED] dark:hover:bg-[#1A1F2A]"
                          }`}
                          data-testid={`button-part-${part.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedPart?.id === part.id
                                ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF]"
                                : "bg-[#E6E9ED] dark:bg-[#232A36]"
                            }`}>
                              <CategoryIcon className={`h-5 w-5 ${
                                selectedPart?.id === part.id
                                  ? "text-white"
                                  : "text-[#0A5ED7] dark:text-[#0BB3FF]"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-[#2A2F3A] dark:text-[#E6EAF0] truncate">
                                {part.partName}
                              </h4>
                              <p className="text-xs text-[#6B7280] dark:text-[#9BA4B0]">
                                {part.partNumber}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs bg-[#E6E9ED] dark:bg-[#232A36] text-[#0A5ED7] dark:text-[#0BB3FF]">
                                  {part.category}
                                </Badge>
                                <span className="text-xs text-[#9BA4B0]">
                                  {part.manufacturer}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-2/3 space-y-4">
            <Card className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36]">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-[#2A2F3A] dark:text-[#E6EAF0]">
                    {selectedPart
                      ? selectedPart.partName
                      : t("interactive3d.viewer", "3D Viewer")}
                  </CardTitle>
                  {selectedPart && (
                    <CardDescription className="text-[#6B7280] dark:text-[#9BA4B0]">
                      {selectedPart.partNumber} • {selectedPart.manufacturer}
                    </CardDescription>
                  )}
                </div>
                {selectedPart && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setIsOrderDialogOpen(true)}
                      className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
                      data-testid="button-order-part"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {t("interactive3d.order", "Order")}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div
                  ref={viewerRef}
                  className="relative h-[400px] bg-gradient-to-br from-[#E6E9ED] to-[#C9D1DA] dark:from-[#0E1117] dark:to-[#151A23] rounded-b-lg overflow-hidden cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                  data-testid="viewer-3d-canvas"
                >
                  {selectedPart ? (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                      }}
                    >
                      <div
                        className="relative"
                        style={{
                          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
                          transformStyle: "preserve-3d",
                          perspective: "1000px",
                        }}
                      >
                        <div className={`relative w-48 h-48 ${isExplodedView ? "scale-125" : ""} transition-transform duration-500`}>
                          <div
                            className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0A5ED7]/20 to-[#0BB3FF]/20 border-2 border-[#0A5ED7]/30 backdrop-blur-sm"
                            style={{
                              transform: "rotateX(0deg) translateZ(60px)",
                              boxShadow: "0 25px 50px -12px rgba(10, 94, 215, 0.25)",
                            }}
                          >
                            <div className="absolute inset-4 bg-gradient-to-br from-[#0A5ED7]/40 to-[#0BB3FF]/40 rounded-lg flex items-center justify-center">
                              {(() => {
                                const Icon = getCategoryIcon(selectedPart.category);
                                return <Icon className="h-16 w-16 text-white/80" />;
                              })()}
                            </div>
                          </div>
                          
                          <div
                            className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0B1F3B]/60 to-[#0B1F3B]/40 border border-[#0A5ED7]/20"
                            style={{
                              transform: "rotateX(0deg) translateZ(-60px)",
                            }}
                          />
                          
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-[#0A5ED7]/30 to-transparent"
                            style={{
                              transform: "rotateY(-90deg) translateZ(96px)",
                              width: "120px",
                            }}
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-l from-[#0BB3FF]/30 to-transparent"
                            style={{
                              transform: "rotateY(90deg) translateZ(96px)",
                              width: "120px",
                            }}
                          />

                          {showAnnotations && selectedPart.annotations?.length > 0 && (
                            <>
                              {selectedPart.annotations.map((annotation: any, index: number) => (
                                <div
                                  key={annotation.id}
                                  className="absolute bg-[#0A5ED7] text-white text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap"
                                  style={{
                                    top: `${30 + index * 25}%`,
                                    left: index % 2 === 0 ? "110%" : "-10%",
                                    transform: index % 2 === 0 ? "translateX(0)" : "translateX(-100%)",
                                  }}
                                >
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    {annotation.name}
                                  </span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6B7280] dark:text-[#9BA4B0]">
                      <Box className="h-16 w-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {t("interactive3d.selectPartPrompt", "Select a part to view in 3D")}
                      </p>
                      <p className="text-sm mt-1">
                        {t("interactive3d.chooseFromCatalog", "Choose from the catalog on the left")}
                      </p>
                    </div>
                  )}

                  {selectedPart && (
                    <>
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 dark:bg-[#151A23]/80 backdrop-blur-sm rounded-lg p-1 border border-[#C9D1DA] dark:border-[#232A36]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInteractionMode("rotate")}
                          className={interactionMode === "rotate" ? "bg-[#0A5ED7]/20 text-[#0A5ED7]" : ""}
                          data-testid="button-mode-rotate"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInteractionMode("pan")}
                          className={interactionMode === "pan" ? "bg-[#0A5ED7]/20 text-[#0A5ED7]" : ""}
                          data-testid="button-mode-pan"
                        >
                          <Hand className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-[#C9D1DA] dark:bg-[#232A36]" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                          data-testid="button-zoom-in"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
                          data-testid="button-zoom-out"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-[#C9D1DA] dark:bg-[#232A36]" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetView}
                          data-testid="button-reset-view"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-[#151A23]/80 backdrop-blur-sm rounded-lg p-1 border border-[#C9D1DA] dark:border-[#232A36]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAutoRotate(!isAutoRotate)}
                          className={isAutoRotate ? "bg-[#0A5ED7]/20 text-[#0A5ED7]" : ""}
                          data-testid="button-auto-rotate"
                        >
                          {isAutoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAnnotations(!showAnnotations)}
                          className={showAnnotations ? "bg-[#0A5ED7]/20 text-[#0A5ED7]" : ""}
                          data-testid="button-toggle-annotations"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        {selectedPart.explosionViewUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExplodedView(!isExplodedView)}
                            className={isExplodedView ? "bg-[#0A5ED7]/20 text-[#0A5ED7]" : ""}
                            data-testid="button-exploded-view"
                          >
                            <Layers className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 bg-white/80 dark:bg-[#151A23]/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#C9D1DA] dark:border-[#232A36]">
                        <div className="flex items-center gap-4 text-xs text-[#6B7280] dark:text-[#9BA4B0]">
                          <span>{t("interactive3d.zoom", "Zoom:")} {Math.round(zoom * 100)}%</span>
                          <span>{t("interactive3d.xAxis", "X:")} {Math.round(rotation.x)}°</span>
                          <span>{t("interactive3d.yAxis", "Y:")} {Math.round(rotation.y)}°</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedPart && (
              <Card className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#2A2F3A] dark:text-[#E6EAF0]">
                    {t("interactive3d.partDetails", "Part Details")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="specs" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-[#E6E9ED] dark:bg-[#0E1117]">
                      <TabsTrigger value="specs" data-testid="tab-specs">
                        {t("interactive3d.specifications", "Specifications")}
                      </TabsTrigger>
                      <TabsTrigger value="compatibility" data-testid="tab-compatibility">
                        {t("interactive3d.compatibility", "Compatibility")}
                      </TabsTrigger>
                      <TabsTrigger value="stats" data-testid="tab-stats">
                        {t("interactive3d.stats", "Stats")}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="specs" className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#E6E9ED] dark:bg-[#0E1117] p-3 rounded-lg">
                          <p className="text-xs text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.partNumber", "Part Number")}</p>
                          <p className="text-sm font-medium text-[#2A2F3A] dark:text-[#E6EAF0]">
                            {selectedPart.partNumber || t("interactive3d.notAvailable", "N/A")}
                          </p>
                        </div>
                        <div className="bg-[#E6E9ED] dark:bg-[#0E1117] p-3 rounded-lg">
                          <p className="text-xs text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.manufacturer", "Manufacturer")}</p>
                          <p className="text-sm font-medium text-[#2A2F3A] dark:text-[#E6EAF0]">
                            {selectedPart.manufacturer || t("interactive3d.notAvailable", "N/A")}
                          </p>
                        </div>
                        <div className="bg-[#E6E9ED] dark:bg-[#0E1117] p-3 rounded-lg">
                          <p className="text-xs text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.category", "Category")}</p>
                          <p className="text-sm font-medium text-[#2A2F3A] dark:text-[#E6EAF0] capitalize">
                            {selectedPart.category || t("interactive3d.notAvailable", "N/A")}
                          </p>
                        </div>
                        <div className="bg-[#E6E9ED] dark:bg-[#0E1117] p-3 rounded-lg">
                          <p className="text-xs text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.polygonCount", "Polygon Count")}</p>
                          <p className="text-sm font-medium text-[#2A2F3A] dark:text-[#E6EAF0]">
                            {selectedPart.polygonCount?.toLocaleString() || t("interactive3d.notAvailable", "N/A")}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="compatibility" className="mt-4">
                      <div className="space-y-3">
                        {selectedPart.compatibility?.brands && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.brands", "Brands:")}</span>
                            {selectedPart.compatibility.brands.map((brand: string) => (
                              <Badge key={brand} variant="secondary" className="bg-[#0A5ED7]/10 text-[#0A5ED7] dark:text-[#0BB3FF]">
                                {brand}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {selectedPart.compatibility?.classes && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.vehicleClasses", "Vehicle Classes:")}</span>
                            {selectedPart.compatibility.classes.map((vehicleClass: string) => (
                              <Badge key={vehicleClass} variant="outline" className="border-[#0A5ED7]/30 text-[#0A5ED7]">
                                {vehicleClass}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {selectedPart.compatibility?.modelYears && (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.modelYears", "Model Years:")}</span>
                            <span className="text-sm text-[#2A2F3A] dark:text-[#E6EAF0]">
                              {selectedPart.compatibility.modelYears[0]} - {selectedPart.compatibility.modelYears[selectedPart.compatibility.modelYears.length - 1]}
                            </span>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="stats" className="mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#E6E9ED] dark:bg-[#0E1117] p-4 rounded-lg text-center">
                          <Eye className="h-6 w-6 mx-auto mb-2 text-[#0A5ED7] dark:text-[#0BB3FF]" />
                          <p className="text-2xl font-bold text-[#2A2F3A] dark:text-[#E6EAF0]">
                            {selectedPart.viewCount?.toLocaleString() || 0}
                          </p>
                          <p className="text-xs text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.totalViews", "Total Views")}</p>
                        </div>
                        <div className="bg-[#E6E9ED] dark:bg-[#0E1117] p-4 rounded-lg text-center">
                          <Download className="h-6 w-6 mx-auto mb-2 text-[#0A5ED7] dark:text-[#0BB3FF]" />
                          <p className="text-2xl font-bold text-[#2A2F3A] dark:text-[#E6EAF0]">
                            {selectedPart.downloadCount?.toLocaleString() || 0}
                          </p>
                          <p className="text-xs text-[#6B7280] dark:text-[#9BA4B0]">{t("interactive3d.downloads", "Downloads")}</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-[#E6EAF0]">
              {t("interactive3d.orderPart", "Order Part")}
            </DialogTitle>
            <DialogDescription className="text-[#64748B] dark:text-[#9BA4B0]">
              {selectedPart?.partName} ({selectedPart?.partNumber})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between bg-[#F8FAFC] dark:bg-[#0E1117] p-4 rounded-lg">
              <div>
                <p className="font-medium text-[#0B1F3B] dark:text-[#E6EAF0]">
                  {selectedPart?.partName}
                </p>
                <p className="text-sm text-[#64748B] dark:text-[#9BA4B0]">
                  {selectedPart?.manufacturer}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8"
                  data-testid="button-quantity-minus"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium text-[#0B1F3B] dark:text-[#E6EAF0]">
                  {orderQuantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setOrderQuantity((q) => q + 1)}
                  className="h-8 w-8"
                  data-testid="button-quantity-plus"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("interactive3d.addToCart", "Add to Cart")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
