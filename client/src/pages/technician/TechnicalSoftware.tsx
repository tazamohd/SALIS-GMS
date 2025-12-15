import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Cpu,
  Cable,
  Database,
  FileCode,
  ExternalLink,
  Star,
  Download,
  Info,
  Zap,
  Settings,
  Monitor,
  HardDrive,
  Wifi,
  Shield,
  Clock,
} from "lucide-react";

interface TechnicalSoftware {
  id: number;
  name: string;
  shortName: string;
  description: string;
  category: "diagnostic" | "wiring" | "epc" | "programming" | "calibration";
  brands: string[];
  version: string;
  lastUpdated: string;
  status: "active" | "subscription" | "trial";
  rating: number;
  icon: string;
}

const softwareList: TechnicalSoftware[] = [
  {
    id: 1,
    name: "Workshop Information System",
    shortName: "WIS",
    description: "Complete workshop documentation, repair procedures, and technical data for Mercedes-Benz vehicles",
    category: "diagnostic",
    brands: ["Mercedes-Benz"],
    version: "2024.12",
    lastUpdated: "2024-12-15",
    status: "active",
    rating: 4.9,
    icon: "🔧",
  },
  {
    id: 2,
    name: "Electronic Parts Catalogue",
    shortName: "EPC",
    description: "Parts catalog with diagrams, part numbers, and compatibility information for all vehicle systems",
    category: "epc",
    brands: ["Mercedes-Benz", "BMW", "Audi", "VW"],
    version: "2024.12",
    lastUpdated: "2024-12-10",
    status: "active",
    rating: 4.8,
    icon: "📦",
  },
  {
    id: 3,
    name: "Wiring Diagrams Pro",
    shortName: "WD-PRO",
    description: "Interactive wiring diagrams with component location, connector pinouts, and circuit tracing",
    category: "wiring",
    brands: ["All Brands"],
    version: "5.2.1",
    lastUpdated: "2025-01-05",
    status: "active",
    rating: 4.7,
    icon: "🔌",
  },
  {
    id: 4,
    name: "BMW ISTA Diagnostic",
    shortName: "ISTA",
    description: "Official BMW diagnostic software for vehicle diagnostics, coding, and programming",
    category: "diagnostic",
    brands: ["BMW", "MINI", "Rolls-Royce"],
    version: "4.45.30",
    lastUpdated: "2024-12-20",
    status: "subscription",
    rating: 4.9,
    icon: "🚗",
  },
  {
    id: 5,
    name: "VAG ODIS Service",
    shortName: "ODIS-S",
    description: "Volkswagen Group diagnostic and service software for VW, Audi, Skoda, and SEAT",
    category: "diagnostic",
    brands: ["VW", "Audi", "Skoda", "SEAT", "Porsche"],
    version: "23.0.1",
    lastUpdated: "2024-11-30",
    status: "active",
    rating: 4.6,
    icon: "🔍",
  },
  {
    id: 6,
    name: "Toyota Techstream",
    shortName: "TIS",
    description: "Toyota/Lexus diagnostic and reprogramming software with factory-level access",
    category: "diagnostic",
    brands: ["Toyota", "Lexus"],
    version: "18.20.024",
    lastUpdated: "2024-12-05",
    status: "active",
    rating: 4.5,
    icon: "🛠️",
  },
  {
    id: 7,
    name: "Ford IDS",
    shortName: "IDS",
    description: "Ford Integrated Diagnostic System for all Ford, Lincoln, and Mercury vehicles",
    category: "diagnostic",
    brands: ["Ford", "Lincoln", "Mercury"],
    version: "130.01",
    lastUpdated: "2024-12-18",
    status: "subscription",
    rating: 4.4,
    icon: "🚙",
  },
  {
    id: 8,
    name: "XENTRY Diagnostics",
    shortName: "XENTRY",
    description: "Mercedes-Benz official diagnostic software with full system access",
    category: "diagnostic",
    brands: ["Mercedes-Benz", "Smart", "Maybach"],
    version: "2024.12",
    lastUpdated: "2024-12-20",
    status: "active",
    rating: 4.9,
    icon: "⭐",
  },
  {
    id: 9,
    name: "AutoData Wiring",
    shortName: "AUTODATA",
    description: "Multi-brand wiring diagrams, service schedules, and technical specifications",
    category: "wiring",
    brands: ["All Brands"],
    version: "2024.4",
    lastUpdated: "2024-12-01",
    status: "active",
    rating: 4.6,
    icon: "📊",
  },
  {
    id: 10,
    name: "Mitchell ProDemand",
    shortName: "MITCHELL",
    description: "Comprehensive repair information with OEM procedures and real-world fixes",
    category: "diagnostic",
    brands: ["All Brands"],
    version: "2024.12",
    lastUpdated: "2024-12-15",
    status: "subscription",
    rating: 4.7,
    icon: "📚",
  },
  {
    id: 11,
    name: "ALLDATA Repair",
    shortName: "ALLDATA",
    description: "Factory-accurate repair information and OEM service procedures",
    category: "diagnostic",
    brands: ["All Brands"],
    version: "2024.Q4",
    lastUpdated: "2024-12-10",
    status: "active",
    rating: 4.5,
    icon: "🔧",
  },
  {
    id: 12,
    name: "ECU Calibration Suite",
    shortName: "ECU-CAL",
    description: "Advanced ECU programming, calibration, and tuning software",
    category: "calibration",
    brands: ["All Brands"],
    version: "3.5.0",
    lastUpdated: "2025-01-01",
    status: "active",
    rating: 4.8,
    icon: "⚙️",
  },
];

const categories = [
  { value: "all", label: "All Software", icon: Monitor },
  { value: "diagnostic", label: "Diagnostics", icon: Cpu },
  { value: "wiring", label: "Wiring Diagrams", icon: Cable },
  { value: "epc", label: "Parts Catalogs", icon: Database },
  { value: "programming", label: "Programming", icon: FileCode },
  { value: "calibration", label: "Calibration", icon: Settings },
];

export default function TechnicalSoftware() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredSoftware = softwareList.filter((sw) => {
    const matchesSearch = sw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sw.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sw.brands.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || sw.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: TechnicalSoftware["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "subscription":
        return <Badge className="bg-blue-600">Subscription</Badge>;
      case "trial":
        return <Badge className="bg-yellow-600">Trial</Badge>;
    }
  };

  const getCategoryIcon = (category: TechnicalSoftware["category"]) => {
    switch (category) {
      case "diagnostic":
        return <Cpu className="h-5 w-5 text-blue-500" />;
      case "wiring":
        return <Cable className="h-5 w-5 text-orange-500" />;
      case "epc":
        return <Database className="h-5 w-5 text-green-500" />;
      case "programming":
        return <FileCode className="h-5 w-5 text-purple-500" />;
      case "calibration":
        return <Settings className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Technical Software Hub</h1>
        <p className="text-gray-500 dark:text-gray-400">Access diagnostic tools, wiring diagrams, EPC, and more</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Active Software</p>
                <p className="text-2xl font-bold">{softwareList.filter(s => s.status === "active").length}</p>
              </div>
              <Monitor className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Brands Covered</p>
                <p className="text-2xl font-bold">25+</p>
              </div>
              <Shield className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Tools</p>
                <p className="text-2xl font-bold">{softwareList.length}</p>
              </div>
              <Zap className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Last Updated</p>
                <p className="text-2xl font-bold">Today</p>
              </div>
              <Clock className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search software, tools, or brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-software"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap h-auto gap-2">
          {categories.map((cat) => (
            <TabsTrigger 
              key={cat.value} 
              value={cat.value}
              className="flex items-center gap-2"
              data-testid={`tab-${cat.value}`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSoftware.map((software) => (
              <Card 
                key={software.id}
                className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray hover:border-blue-500 transition-colors"
                data-testid={`card-software-${software.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{software.icon}</span>
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">{software.shortName}</CardTitle>
                        <CardDescription className="text-xs">{software.name}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(software.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{software.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {software.brands.slice(0, 3).map((brand) => (
                      <Badge key={brand} variant="outline" className="text-xs">{brand}</Badge>
                    ))}
                    {software.brands.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{software.brands.length - 3}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {software.rating}
                    </span>
                    <span>v{software.version}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {software.lastUpdated}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm" data-testid={`button-launch-${software.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Launch
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-info-${software.id}`}>
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Launch - Most Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {softwareList.slice(0, 4).map((sw) => (
              <Button
                key={sw.id}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                data-testid={`button-quick-launch-${sw.id}`}
              >
                <span className="text-2xl">{sw.icon}</span>
                <span>{sw.shortName}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <HardDrive className="h-5 w-5 text-gray-500" />
            System Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-salis-gray">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Hardware</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Intel i5 or higher</li>
                <li>• 16GB RAM minimum</li>
                <li>• 500GB SSD storage</li>
                <li>• USB 3.0 ports</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-salis-gray">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Connectivity</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Stable internet connection</li>
                <li>• VCI/PassThru device</li>
                <li>• J2534 compatible interface</li>
                <li>• OBD-II diagnostic cable</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-salis-gray">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Software</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Windows 10/11 64-bit</li>
                <li>• .NET Framework 4.8</li>
                <li>• Java Runtime 8+</li>
                <li>• Admin privileges</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
