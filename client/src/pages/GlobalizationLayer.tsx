import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Globe, Languages, DollarSign, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Locale, TranslationResource, CurrencyRate, TaxRegion, InsertLocale, InsertTranslationResource, InsertCurrencyRate, InsertTaxRegion } from "@shared/schema";
import { insertLocaleSchema, insertTranslationResourceSchema, insertCurrencyRateSchema, insertTaxRegionSchema } from "@shared/schema";

export default function GlobalizationLayer() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("locales");
  const [showLocaleDialog, setShowLocaleDialog] = useState(false);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showTaxDialog, setShowTaxDialog] = useState(false);

  const { data: locales = [] } = useQuery<Locale[]>({ queryKey: ["/api/locales"] });
  const { data: translations = [] } = useQuery<TranslationResource[]>({ queryKey: ["/api/translation-resources"] });
  const { data: currencies = [] } = useQuery<CurrencyRate[]>({ queryKey: ["/api/currency-rates"] });
  const { data: taxRegions = [] } = useQuery<TaxRegion[]>({ queryKey: ["/api/tax-regions"] });

  const localeForm = useForm<InsertLocale>({ 
    resolver: zodResolver(insertLocaleSchema),
    defaultValues: { code: "", name: "" } 
  });
  const translationForm = useForm<InsertTranslationResource>({ 
    resolver: zodResolver(insertTranslationResourceSchema),
    defaultValues: { localeId: "", translationKey: "", translationValue: "" } 
  });
  const currencyForm = useForm<InsertCurrencyRate>({ 
    resolver: zodResolver(insertCurrencyRateSchema),
    defaultValues: { fromCurrency: "", toCurrency: "", rate: "1.0", effectiveDate: new Date() } 
  });
  const taxForm = useForm<InsertTaxRegion>({ 
    resolver: zodResolver(insertTaxRegionSchema),
    defaultValues: { countryCode: "", regionName: "", taxRate: "0" } 
  });

  const createLocaleMutation = useMutation({
    mutationFn: (data: InsertLocale) => apiRequest("/api/locales", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/locales"] }); setShowLocaleDialog(false); toast({ title: "Locale created" }); },
  });

  const createTranslationMutation = useMutation({
    mutationFn: (data: InsertTranslationResource) => apiRequest("/api/translation-resources", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/translation-resources"] }); setShowTranslationDialog(false); toast({ title: "Translation created" }); },
  });

  const createCurrencyMutation = useMutation({
    mutationFn: (data: InsertCurrencyRate) => apiRequest("/api/currency-rates", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/currency-rates"] }); setShowCurrencyDialog(false); toast({ title: "Currency rate created" }); },
  });

  const createTaxMutation = useMutation({
    mutationFn: (data: InsertTaxRegion) => apiRequest("/api/tax-regions", "POST", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/tax-regions"] }); setShowTaxDialog(false); toast({ title: "Tax region created" }); },
  });

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="font-montserrat font-semibold text-2xl text-gray-900 dark:text-white" data-testid="text-page-title">Globalization Layer</h1>
        <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 mt-1" data-testid="text-page-description">
          Manage multi-language support, currency rates, and tax regions for global operations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white dark:bg-salis-black/50 border border-gray-200 dark:border-salis-gray-dark" data-testid="tabs-navigation">
          <TabsTrigger value="locales" data-testid="tab-locales" className="gap-2">
            <Languages className="h-4 w-4" />
            Locales
          </TabsTrigger>
          <TabsTrigger value="translations" data-testid="tab-translations" className="gap-2">
            <Globe className="h-4 w-4" />
            Translations
          </TabsTrigger>
          <TabsTrigger value="currencies" data-testid="tab-currencies" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Currency Rates
          </TabsTrigger>
          <TabsTrigger value="tax" data-testid="tab-tax" className="gap-2">
            <MapPin className="h-4 w-4" />
            Tax Regions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locales" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Language Locales</h2>
            <Button onClick={() => { localeForm.reset(); setShowLocaleDialog(true); }} data-testid="button-add-locale">
              <Plus className="h-4 w-4 mr-2" />
              Add Locale
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>English Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locales.map((locale) => (
                    <TableRow key={locale.id}>
                      <TableCell className="font-mono">{locale.code}</TableCell>
                      <TableCell>{locale.name}</TableCell>
                      <TableCell>{locale.englishName || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${locale.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                          {locale.isActive ? '✅ Active' : '○ Inactive'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Translation Resources</h2>
            <Button onClick={() => { translationForm.reset(); setShowTranslationDialog(true); }} data-testid="button-add-translation">
              <Plus className="h-4 w-4 mr-2" />
              Add Translation
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Locale</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {translations.map((trans) => (
                    <TableRow key={trans.id}>
                      <TableCell className="font-mono">{locales.find(l => l.id === trans.localeId)?.code || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-sm">{trans.translationKey}</TableCell>
                      <TableCell>{trans.translationValue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currencies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Currency Exchange Rates</h2>
            <Button onClick={() => { currencyForm.reset(); setShowCurrencyDialog(true); }} data-testid="button-add-currency">
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((curr) => (
                    <TableRow key={curr.id}>
                      <TableCell className="font-mono font-semibold">{curr.fromCurrency}</TableCell>
                      <TableCell className="font-mono font-semibold">{curr.toCurrency}</TableCell>
                      <TableCell>{parseFloat(curr.rate).toFixed(4)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          ✅ {curr.source || 'Manual'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white">Tax Regions</h2>
            <Button onClick={() => { taxForm.reset(); setShowTaxDialog(true); }} data-testid="button-add-tax">
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Region
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-salis-gray-dark bg-white dark:bg-salis-black">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRegions.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-mono">{tax.regionCode}</TableCell>
                      <TableCell>{tax.regionName}</TableCell>
                      <TableCell>{parseFloat(tax.taxRate).toFixed(2)}%</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${tax.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                          {tax.isActive ? '✅ Active' : '○ Inactive'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Locale Dialog */}
      <Dialog open={showLocaleDialog} onOpenChange={setShowLocaleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Language Locale</DialogTitle>
          </DialogHeader>
          <Form {...localeForm}>
            <form onSubmit={localeForm.handleSubmit((data) => createLocaleMutation.mutate(data))} className="space-y-4">
              <FormField control={localeForm.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Locale Code (e.g., en-US, es-ES)</FormLabel>
                  <FormControl><Input {...field} placeholder="en-US" /></FormControl>
                </FormItem>
              )} />
              <FormField control={localeForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} placeholder="English (United States)" /></FormControl>
                </FormItem>
              )} />
              <FormField control={localeForm.control} name="englishName" render={({ field }) => (
                <FormItem>
                  <FormLabel>English Name</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} placeholder="English (United States)" /></FormControl>
                </FormItem>
              )} />
              <FormField control={localeForm.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createLocaleMutation.isPending}>
                {createLocaleMutation.isPending ? "Creating..." : "Create Locale"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
