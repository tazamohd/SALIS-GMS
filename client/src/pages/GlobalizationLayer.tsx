import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Globe, Languages, DollarSign, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

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

  const localesContent = (
    <div className="space-y-4">
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
    </div>
  );

  const translationsContent = (
    <div className="space-y-4">
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
    </div>
  );

  const currenciesContent = (
    <div className="space-y-4">
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
    </div>
  );

  const taxContent = (
    <div className="space-y-4">
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
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title="Globalization Layer"
        description="Manage multi-language support, currency rates, and tax regions for global operations"
        icon={Globe}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: "locales",
            label: "Locales",
            icon: Languages,
            content: localesContent,
          },
          {
            id: "translations",
            label: "Translations",
            icon: Globe,
            content: translationsContent,
          },
          {
            id: "currencies",
            label: "Currency Rates",
            icon: DollarSign,
            content: currenciesContent,
          },
          {
            id: "tax",
            label: "Tax Regions",
            icon: MapPin,
            content: taxContent,
          },
        ]}
      />

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

      <Dialog open={showTranslationDialog} onOpenChange={setShowTranslationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Translation</DialogTitle>
          </DialogHeader>
          <Form {...translationForm}>
            <form onSubmit={translationForm.handleSubmit((data) => createTranslationMutation.mutate(data))} className="space-y-4">
              <FormField control={translationForm.control} name="localeId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Locale</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select locale" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locales.map((locale) => (
                        <SelectItem key={locale.id} value={locale.id}>
                          {locale.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={translationForm.control} name="translationKey" render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl><Input {...field} placeholder="welcome.message" /></FormControl>
                </FormItem>
              )} />
              <FormField control={translationForm.control} name="translationValue" render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Welcome to our application" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createTranslationMutation.isPending}>
                {createTranslationMutation.isPending ? "Creating..." : "Create Translation"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Currency Rate</DialogTitle>
          </DialogHeader>
          <Form {...currencyForm}>
            <form onSubmit={currencyForm.handleSubmit((data) => createCurrencyMutation.mutate(data))} className="space-y-4">
              <FormField control={currencyForm.control} name="fromCurrency" render={({ field }) => (
                <FormItem>
                  <FormLabel>From Currency</FormLabel>
                  <FormControl><Input {...field} placeholder="USD" /></FormControl>
                </FormItem>
              )} />
              <FormField control={currencyForm.control} name="toCurrency" render={({ field }) => (
                <FormItem>
                  <FormLabel>To Currency</FormLabel>
                  <FormControl><Input {...field} placeholder="EUR" /></FormControl>
                </FormItem>
              )} />
              <FormField control={currencyForm.control} name="rate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Rate</FormLabel>
                  <FormControl><Input {...field} type="number" step="0.0001" placeholder="1.0" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createCurrencyMutation.isPending}>
                {createCurrencyMutation.isPending ? "Creating..." : "Create Rate"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showTaxDialog} onOpenChange={setShowTaxDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tax Region</DialogTitle>
          </DialogHeader>
          <Form {...taxForm}>
            <form onSubmit={taxForm.handleSubmit((data) => createTaxMutation.mutate(data))} className="space-y-4">
              <FormField control={taxForm.control} name="countryCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code</FormLabel>
                  <FormControl><Input {...field} placeholder="US" /></FormControl>
                </FormItem>
              )} />
              <FormField control={taxForm.control} name="regionName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Region Name</FormLabel>
                  <FormControl><Input {...field} placeholder="California" /></FormControl>
                </FormItem>
              )} />
              <FormField control={taxForm.control} name="taxRate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl><Input {...field} type="number" step="0.01" placeholder="7.25" /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createTaxMutation.isPending}>
                {createTaxMutation.isPending ? "Creating..." : "Create Tax Region"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
