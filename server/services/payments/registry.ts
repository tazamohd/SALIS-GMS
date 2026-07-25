/**
 * Payment provider registry.
 *
 * Holds every adapter, exposes the set that is currently enabled (keys present),
 * and resolves the right provider for a chosen method. Method → provider
 * resolution honours a configurable priority so that, when more than one
 * aggregator is enabled (e.g. Moyasar AND HyperPay both have keys), a
 * deterministic one wins for Mada/cards.
 *
 * Priority is read from PAYMENT_GATEWAY_PRIORITY (comma-separated gateway ids),
 * defaulting to moyasar > hyperpay > tap > stripe for cards/Mada/wallets.
 */
import type { GatewayId, PaymentMethodType, PaymentMethodInfo, PaymentProvider } from './types';
import { manualProvider } from './providers/manual';
import { moyasarProvider } from './providers/moyasar';
import { hyperpayProvider } from './providers/hyperpay';
import { tapProvider } from './providers/tap';
import { tabbyProvider } from './providers/tabby';
import { tamaraProvider } from './providers/tamara';
import { paypalProvider } from './providers/paypal';
import { stripeProvider } from './providers/stripe';

const ALL_PROVIDERS: PaymentProvider[] = [
  moyasarProvider,
  hyperpayProvider,
  tapProvider,
  tabbyProvider,
  tamaraProvider,
  paypalProvider,
  stripeProvider,
  manualProvider,
];

const DEFAULT_PRIORITY: GatewayId[] = ['moyasar', 'hyperpay', 'tap', 'stripe', 'tabby', 'tamara', 'paypal', 'manual'];

function priority(): GatewayId[] {
  const raw = process.env.PAYMENT_GATEWAY_PRIORITY;
  if (!raw) return DEFAULT_PRIORITY;
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean) as GatewayId[];
  // Append any defaults not listed so every gateway has a deterministic rank.
  return [...ids, ...DEFAULT_PRIORITY.filter((g) => !ids.includes(g))];
}

export function allProviders(): PaymentProvider[] {
  return ALL_PROVIDERS;
}

export function enabledProviders(): PaymentProvider[] {
  return ALL_PROVIDERS.filter((p) => {
    try {
      return p.isEnabled();
    } catch {
      return false;
    }
  });
}

export function getProviderById(id: GatewayId): PaymentProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}

/**
 * Resolve which enabled provider should fulfil a method. When several enabled
 * providers offer the same method, the configured priority decides.
 */
export function getProviderForMethod(method: PaymentMethodType): PaymentProvider | undefined {
  const ranked = priority();
  const candidates = enabledProviders().filter((p) => p.methods.includes(method));
  candidates.sort((a, b) => ranked.indexOf(a.id) - ranked.indexOf(b.id));
  return candidates[0];
}

const METHOD_META: Record<PaymentMethodType, Omit<PaymentMethodInfo, 'gateway'>> = {
  mada:          { id: 'mada',          label: 'Mada',            labelAr: 'مدى',            category: 'card' },
  visa:          { id: 'visa',          label: 'Visa',            labelAr: 'فيزا',           category: 'card' },
  mastercard:    { id: 'mastercard',    label: 'Mastercard',      labelAr: 'ماستركارد',      category: 'card' },
  amex:          { id: 'amex',          label: 'Amex',            labelAr: 'أمريكان إكسبريس', category: 'card' },
  apple_pay:     { id: 'apple_pay',     label: 'Apple Pay',       labelAr: 'أبل باي',        category: 'wallet' },
  stc_pay:       { id: 'stc_pay',       label: 'STC Pay',         labelAr: 'إس تي سي باي',   category: 'wallet' },
  tabby:         { id: 'tabby',         label: 'Tabby',           labelAr: 'تابي',           category: 'bnpl' },
  tamara:        { id: 'tamara',        label: 'Tamara',          labelAr: 'تمارا',          category: 'bnpl' },
  paypal:        { id: 'paypal',        label: 'PayPal',          labelAr: 'باي بال',        category: 'wallet' },
  cash:          { id: 'cash',          label: 'Cash',            labelAr: 'نقدي',           category: 'cash' },
  bank_transfer: { id: 'bank_transfer', label: 'Bank Transfer',   labelAr: 'تحويل بنكي',     category: 'bank' },
  cheque:        { id: 'cheque',        label: 'Cheque',          labelAr: 'شيك',            category: 'bank' },
};

/**
 * The list of methods to show in the customer-facing selector — the union of
 * methods across enabled providers, de-duplicated, each tagged with the
 * provider that will fulfil it. Manual methods (cash/transfer/cheque) are
 * always present.
 */
export function enabledMethods(): PaymentMethodInfo[] {
  const seen = new Map<PaymentMethodType, PaymentMethodInfo>();
  for (const provider of enabledProviders()) {
    for (const method of provider.methods) {
      if (seen.has(method)) continue;
      const resolved = getProviderForMethod(method) || provider;
      seen.set(method, { ...METHOD_META[method], gateway: resolved.id });
    }
  }
  // Deterministic display order: cards, wallets, bnpl, bank, cash.
  const order = ['card', 'wallet', 'bnpl', 'bank', 'cash'];
  return Array.from(seen.values()).sort(
    (a, b) => order.indexOf(a.category) - order.indexOf(b.category),
  );
}

/** Summary for the boot diagnostics / admin payments page. */
export function gatewayStatus(): Array<{ id: GatewayId; label: string; enabled: boolean; methods: PaymentMethodType[] }> {
  return ALL_PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    enabled: (() => { try { return p.isEnabled(); } catch { return false; } })(),
    methods: p.methods,
  }));
}
