import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, FileText, User, Car, Receipt, FileSpreadsheet, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface GlobalSearchProps {
  garageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResults {
  jobCards: any[];
  customers: any[];
  vehicles: any[];
  invoices: any[];
  estimates: any[];
  spareParts: any[];
}

export function GlobalSearch({ garageId, open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: results, isLoading } = useQuery<SearchResults>({
    queryKey: ['/api/global-search', { garageId, query }],
    enabled: open && query.length >= 2,
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'jobCards':
        return <FileText className="h-4 w-4" />;
      case 'customers':
        return <User className="h-4 w-4" />;
      case 'vehicles':
        return <Car className="h-4 w-4" />;
      case 'invoices':
        return <Receipt className="h-4 w-4" />;
      case 'estimates':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'spareParts':
        return <Package className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getModuleLabel = (module: string) => {
    const labels: Record<string, string> = {
      jobCards: "Job Cards",
      customers: "Customers",
      vehicles: "Vehicles",
      invoices: "Invoices",
      estimates: "Estimates",
      spareParts: "Spare Parts",
    };
    return labels[module] || module;
  };

  const navigateToItem = (module: string, item: any) => {
    onOpenChange(false);
    
    switch (module) {
      case 'jobCards':
        navigate('/job-cards');
        break;
      case 'customers':
        navigate('/customers');
        break;
      case 'vehicles':
        navigate('/vehicles');
        break;
      case 'invoices':
        navigate('/invoices');
        break;
      case 'estimates':
        navigate('/estimates');
        break;
      case 'spareParts':
        navigate('/spare-parts');
        break;
    }
  };

  const renderResult = (module: string, items: any[]) => {
    if (!items || items.length === 0) return null;

    return (
      <div key={module} className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-2">
          {getModuleIcon(module)}
          <h3 className="text-sm font-semibold">{getModuleLabel(module)}</h3>
          <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
        </div>
        <div className="space-y-1">
          {items.map((item: any, index: number) => (
            <button
              key={index}
              onClick={() => navigateToItem(module, item)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
              data-testid={`search-result-${module}-${index}`}
            >
              <div className="font-medium text-sm">
                {item.jobNumber || item.fullName || item.licensePlate || 
                 item.invoiceNumber || item.estimateNumber || item.name}
              </div>
              {item.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {item.description}
                </div>
              )}
              {item.email && (
                <div className="text-xs text-muted-foreground">
                  {item.email}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const totalResults = results ? 
    Object.values(results).reduce((sum: number, items: any) => sum + (items?.length || 0), 0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all modules..."
            className="pl-9 pr-9"
            autoFocus
            data-testid="input-global-search"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8"
              onClick={() => setQuery("")}
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {query.length < 2 && (
            <div className="text-center text-muted-foreground py-8">
              Type at least 2 characters to search
            </div>
          )}

          {query.length >= 2 && isLoading && (
            <div className="text-center text-muted-foreground py-8">
              Searching...
            </div>
          )}

          {query.length >= 2 && !isLoading && totalResults === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No results found
            </div>
          )}

          {query.length >= 2 && !isLoading && totalResults > 0 && results && (
            <div>
              {renderResult('jobCards', results.jobCards)}
              {renderResult('customers', results.customers)}
              {renderResult('vehicles', results.vehicles)}
              {renderResult('invoices', results.invoices)}
              {renderResult('estimates', results.estimates)}
              {renderResult('spareParts', results.spareParts)}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
