import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  BookOpen,
  FileText,
  Wrench,
  Car,
  Download,
  ExternalLink,
  Star,
  Clock,
  ChevronRight,
  Bookmark,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceGuide {
  id: number;
  title: string;
  brand: string;
  model?: string;
  year?: string;
  category: string;
  type: "manual" | "guide" | "bulletin" | "video";
  language: string;
  lastUpdated: string;
  size?: string;
  rating?: number;
  views?: number;
  isFavorite?: boolean;
}

const carBrands = [
  { name: "Toyota", logo: "🚗", count: 245 },
  { name: "Honda", logo: "🚙", count: 198 },
  { name: "Mercedes-Benz", logo: "🚘", count: 312 },
  { name: "BMW", logo: "🚗", count: 287 },
  { name: "Audi", logo: "🚙", count: 234 },
  { name: "Volkswagen", logo: "🚘", count: 176 },
  { name: "Ford", logo: "🚗", count: 203 },
  { name: "Chevrolet", logo: "🚙", count: 189 },
  { name: "Nissan", logo: "🚘", count: 167 },
  { name: "Hyundai", logo: "🚗", count: 145 },
  { name: "Kia", logo: "🚙", count: 134 },
  { name: "Lexus", logo: "🚘", count: 98 },
  { name: "Porsche", logo: "🚗", count: 156 },
  { name: "Land Rover", logo: "🚙", count: 123 },
  { name: "Jeep", logo: "🚘", count: 112 },
  { name: "GMC", logo: "🚗", count: 87 },
];

const serviceGuides: ServiceGuide[] = [
  {
    id: 1,
    title: "Engine Oil Change Procedure",
    brand: "Toyota",
    model: "Camry",
    year: "2020-2024",
    category: "Maintenance",
    type: "guide",
    language: "English",
    lastUpdated: "2025-01-15",
    rating: 4.8,
    views: 1234,
  },
  {
    id: 2,
    title: "Complete Service Manual",
    brand: "Mercedes-Benz",
    model: "C-Class W206",
    year: "2022-2024",
    category: "Workshop Manual",
    type: "manual",
    language: "English",
    lastUpdated: "2024-12-01",
    size: "45 MB",
    rating: 4.9,
    views: 2567,
  },
  {
    id: 3,
    title: "Brake System Diagnosis & Repair",
    brand: "BMW",
    model: "3 Series G20",
    year: "2019-2024",
    category: "Brakes",
    type: "guide",
    language: "English",
    lastUpdated: "2025-01-10",
    rating: 4.7,
    views: 987,
  },
  {
    id: 4,
    title: "Technical Service Bulletin - TSB-2024-089",
    brand: "Honda",
    model: "Accord",
    year: "2023-2024",
    category: "Electrical",
    type: "bulletin",
    language: "English",
    lastUpdated: "2024-11-20",
    rating: 4.5,
    views: 654,
  },
  {
    id: 5,
    title: "A/C System Recharge Video Guide",
    brand: "Ford",
    model: "F-150",
    year: "2021-2024",
    category: "HVAC",
    type: "video",
    language: "English",
    lastUpdated: "2025-01-05",
    rating: 4.6,
    views: 3421,
  },
  {
    id: 6,
    title: "Transmission Fluid Service",
    brand: "Audi",
    model: "A4",
    year: "2020-2024",
    category: "Transmission",
    type: "guide",
    language: "English",
    lastUpdated: "2024-12-15",
    rating: 4.4,
    views: 789,
  },
];

const categories = [
  "All Categories",
  "Maintenance",
  "Workshop Manual",
  "Electrical",
  "Engine",
  "Transmission",
  "Brakes",
  "Suspension",
  "HVAC",
  "Body & Paint",
];

export default function ServiceGuides() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeTab, setActiveTab] = useState("guides");

  const filteredGuides = serviceGuides.filter((guide) => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (guide.model?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBrand = selectedBrand === "all" || guide.brand === selectedBrand;
    const matchesCategory = selectedCategory === "All Categories" || guide.category === selectedCategory;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const getTypeBadge = (type: ServiceGuide["type"]) => {
    switch (type) {
      case "manual":
        return <Badge className="bg-blue-600">Manual</Badge>;
      case "guide":
        return <Badge className="bg-green-600">Guide</Badge>;
      case "bulletin":
        return <Badge className="bg-yellow-600">TSB</Badge>;
      case "video":
        return <Badge className="bg-purple-600">Video</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Guides & Manuals</h1>
        <p className="text-gray-500 dark:text-gray-400">Access technical documentation for all vehicle brands</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search guides, manuals, bulletins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-guides"
          />
        </div>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-brand">
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {carBrands.map((brand) => (
              <SelectItem key={brand.name} value={brand.name}>
                {brand.logo} {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides" data-testid="tab-guides">
            <BookOpen className="h-4 w-4 mr-2" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="manuals" data-testid="tab-manuals">
            <FileText className="h-4 w-4 mr-2" />
            Manuals
          </TabsTrigger>
          <TabsTrigger value="brands" data-testid="tab-brands">
            <Car className="h-4 w-4 mr-2" />
            By Brand
          </TabsTrigger>
          <TabsTrigger value="favorites" data-testid="tab-favorites">
            <Bookmark className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-6">
          <div className="grid gap-4">
            {filteredGuides.map((guide) => (
              <Card 
                key={guide.id} 
                className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray hover:border-blue-500 transition-colors cursor-pointer"
                data-testid={`card-guide-${guide.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(guide.type)}
                        <span className="text-sm text-gray-500">{guide.brand}</span>
                        {guide.model && <span className="text-sm text-gray-400">• {guide.model}</span>}
                        {guide.year && <span className="text-sm text-gray-400">• {guide.year}</span>}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{guide.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {guide.lastUpdated}
                        </span>
                        {guide.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {guide.rating}
                          </span>
                        )}
                        {guide.size && <span>{guide.size}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" data-testid={`button-bookmark-${guide.id}`}>
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`button-download-${guide.id}`}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`button-open-${guide.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manuals" className="mt-6">
          <div className="grid gap-4">
            {filteredGuides.filter(g => g.type === "manual").map((guide) => (
              <Card 
                key={guide.id} 
                className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray"
                data-testid={`card-manual-${guide.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{guide.title}</h3>
                      <p className="text-sm text-gray-500">{guide.brand} {guide.model} ({guide.year})</p>
                    </div>
                    <Button data-testid={`button-view-manual-${guide.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Manual
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="brands" className="mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            {carBrands.map((brand) => (
              <Card 
                key={brand.name}
                className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedBrand(brand.name);
                  setActiveTab("guides");
                }}
                data-testid={`card-brand-${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{brand.logo}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{brand.name}</h3>
                      <p className="text-sm text-gray-500">{brand.count} documents</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
            <CardContent className="p-8 text-center">
              <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
              <p className="text-gray-500">Bookmark guides and manuals for quick access</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Wrench className="h-5 w-5 text-orange-500" />
            Quick Access - Popular Procedures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {[
              "Oil Change Procedure",
              "Brake Pad Replacement",
              "Battery Replacement",
              "A/C Recharge",
              "Timing Belt Replacement",
              "Transmission Fluid Change",
              "Coolant Flush",
              "Spark Plug Replacement",
              "Wheel Alignment Guide",
            ].map((procedure, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start"
                data-testid={`button-procedure-${index}`}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                {procedure}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
