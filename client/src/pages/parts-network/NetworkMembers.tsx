import PartsNetworkLayout from "./PartsNetworkLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  CheckCircle,
  Package,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";

interface NetworkMember {
  id: string;
  companyName: string;
  companyNameAr: string | null;
  memberType: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  region: string | null;
  specializedBrands: string[];
  rating: number;
  totalQuotations: number;
  responseRate: number;
  isVerified: boolean;
  isActive: boolean;
}

const sampleMembers: NetworkMember[] = [
  {
    id: "1",
    companyName: "Al-Faisal Auto Parts",
    companyNameAr: "قطع غيار الفيصل",
    memberType: "supplier",
    contactPerson: "Ahmed Al-Faisal",
    email: "info@alfaisal.com",
    phone: "+966 50 123 4567",
    city: "Riyadh",
    region: "Riyadh",
    specializedBrands: ["Toyota", "Honda", "Nissan"],
    rating: 4.8,
    totalQuotations: 156,
    responseRate: 95,
    isVerified: true,
    isActive: true,
  },
  {
    id: "2",
    companyName: "Saudi Parts Company",
    companyNameAr: "شركة القطع السعودية",
    memberType: "dealer",
    contactPerson: "Mohammed Al-Saud",
    email: "sales@saudiparts.com",
    phone: "+966 55 987 6543",
    city: "Jeddah",
    region: "Makkah",
    specializedBrands: ["Mercedes-Benz", "BMW", "Audi"],
    rating: 4.5,
    totalQuotations: 89,
    responseRate: 88,
    isVerified: true,
    isActive: true,
  },
  {
    id: "3",
    companyName: "Eastern Auto Warehouse",
    companyNameAr: "مستودع الشرقية للسيارات",
    memberType: "store",
    contactPerson: "Khalid Al-Rashid",
    email: "contact@eastern-auto.com",
    phone: "+966 53 456 7890",
    city: "Dammam",
    region: "Eastern Province",
    specializedBrands: ["Hyundai", "Kia", "Chevrolet"],
    rating: 4.2,
    totalQuotations: 45,
    responseRate: 82,
    isVerified: false,
    isActive: true,
  },
  {
    id: "4",
    companyName: "Premium Auto Services",
    companyNameAr: "خدمات بريميوم للسيارات",
    memberType: "garage_keeper",
    contactPerson: "Omar Hassan",
    email: "service@premiumauto.com",
    phone: "+966 56 789 0123",
    city: "Riyadh",
    region: "Riyadh",
    specializedBrands: [],
    rating: 4.6,
    totalQuotations: 78,
    responseRate: 0,
    isVerified: true,
    isActive: true,
  },
];

export default function NetworkMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const { data: members } = useQuery<NetworkMember[]>({
    queryKey: ["/api/parts-network/members"],
  });

  const displayMembers = members || sampleMembers;

  const filteredMembers = displayMembers.filter(member => {
    const matchesSearch = 
      member.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.companyNameAr && member.companyNameAr.includes(searchTerm)) ||
      (member.contactPerson && member.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "all" || member.memberType === typeFilter;
    const matchesRegion = regionFilter === "all" || member.region === regionFilter;
    
    return matchesSearch && matchesType && matchesRegion;
  });

  const getMemberTypeLabel = (type: string) => {
    switch (type) {
      case "supplier": return "Supplier";
      case "dealer": return "Dealer";
      case "store": return "Store";
      case "authorized_seller": return "Authorized Seller";
      case "garage_keeper": return "Garage";
      default: return type;
    }
  };

  const getMemberTypeColor = (type: string) => {
    switch (type) {
      case "supplier": return "bg-blue-500/20 text-blue-400";
      case "dealer": return "bg-purple-500/20 text-purple-400";
      case "store": return "bg-green-500/20 text-green-400";
      case "authorized_seller": return "bg-orange-500/20 text-orange-400";
      case "garage_keeper": return "bg-cyan-500/20 text-cyan-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getMemberTypeIcon = (type: string) => {
    switch (type) {
      case "supplier": return <Package className="h-4 w-4" />;
      case "dealer": return <Building2 className="h-4 w-4" />;
      case "store": return <Building2 className="h-4 w-4" />;
      case "garage_keeper": return <Truck className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const regions = Array.from(new Set(displayMembers.map(m => m.region).filter(Boolean))) as string[];

  return (
    <PartsNetworkLayout 
      title="Network Members" 
      description="أعضاء شبكة قطع الغيار - Suppliers, Dealers & Partners"
    >
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by company name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700" data-testid="select-type-filter">
              <SelectValue placeholder="Member Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="supplier">Suppliers</SelectItem>
              <SelectItem value="dealer">Dealers</SelectItem>
              <SelectItem value="store">Stores</SelectItem>
              <SelectItem value="authorized_seller">Authorized Sellers</SelectItem>
              <SelectItem value="garage_keeper">Garages</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700" data-testid="select-region-filter">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-900/20 border-blue-700/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {displayMembers.filter(m => m.memberType === "supplier").length}
            </p>
            <p className="text-sm text-gray-400">Suppliers</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/20 border-purple-700/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">
              {displayMembers.filter(m => m.memberType === "dealer").length}
            </p>
            <p className="text-sm text-gray-400">Dealers</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-700/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-400">
              {displayMembers.filter(m => m.memberType === "store").length}
            </p>
            <p className="text-sm text-gray-400">Stores</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-900/20 border-cyan-700/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">
              {displayMembers.filter(m => m.memberType === "garage_keeper").length}
            </p>
            <p className="text-sm text-gray-400">Garages</p>
          </CardContent>
        </Card>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card 
            key={member.id} 
            className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
            data-testid={`member-card-${member.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 bg-gray-700">
                  <AvatarFallback className="bg-gray-700 text-white">
                    {member.companyName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base truncate">{member.companyName}</CardTitle>
                    {member.isVerified && (
                      <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  {member.companyNameAr && (
                    <p className="text-sm text-gray-400 truncate" dir="rtl">{member.companyNameAr}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Type & Location */}
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${getMemberTypeColor(member.memberType)} flex items-center gap-1`}>
                  {getMemberTypeIcon(member.memberType)}
                  {getMemberTypeLabel(member.memberType)}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="h-3 w-3" />
                  {member.city}
                </span>
              </div>

              {/* Rating & Stats */}
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{member.rating}</span>
                </span>
                <span className="text-gray-400">
                  {member.totalQuotations} quotes
                </span>
                {member.responseRate > 0 && (
                  <span className="text-green-400">
                    {member.responseRate}% response
                  </span>
                )}
              </div>

              {/* Specialized Brands */}
              {member.specializedBrands.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {member.specializedBrands.slice(0, 3).map((brand) => (
                    <Badge key={brand} variant="outline" className="text-xs border-gray-600">
                      {brand}
                    </Badge>
                  ))}
                  {member.specializedBrands.length > 3 && (
                    <Badge variant="outline" className="text-xs border-gray-600">
                      +{member.specializedBrands.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Contact */}
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                {member.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {member.phone}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-gray-600" size="sm">
                  View Profile
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMembers.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 col-span-full">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="font-medium text-lg mb-2">No Members Found</h3>
              <p className="text-gray-400">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PartsNetworkLayout>
  );
}
