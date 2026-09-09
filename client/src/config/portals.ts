/**
 * Portal registry — the single source of truth for "who can enter the platform,
 * where do they enter, and what does each audience have to tell us".
 *
 * The access pages (chooser, login, register) are generated from this table, so
 * adding an audience is a data change, not a new set of near-duplicate pages.
 *
 * Server-side counterparts:
 *  - customer    -> POST /api/customer/register  (userType 'customer')
 *  - garage      -> POST /api/garage-applications (providerType 'garage')
 *  - parts_store -> POST /api/garage-applications (providerType 'parts_store')
 *  - insurance   -> POST /api/garage-applications (providerType 'insurance')
 *  - staff       -> POST /api/staff/join | /api/staff/apply
 */

export type PortalId = "customer" | "garage" | "parts_store" | "insurance" | "staff";

/** Business portals share the provider-application intake. */
export type ProviderType = "garage" | "parts_store" | "insurance";

export const PROVIDER_PORTAL_IDS: readonly ProviderType[] = ["garage", "parts_store", "insurance"];

export interface PortalDefinition {
  id: PortalId;
  /** Route segment: /customer/login, /business/login?type=garage, /staff/login. */
  loginPath: string;
  registerPath: string;
  /** Where a signed-in member of this audience belongs. */
  home: string;
  /** i18n key + English fallback, kept together so the pages stay translatable. */
  titleKey: string;
  title: string;
  taglineKey: string;
  tagline: string;
  /** lucide-react icon name, resolved in the chooser. */
  icon: "Car" | "Wrench" | "Package" | "ShieldCheck" | "IdCard";
  /** Tailwind gradient stops for the card + header accent. */
  accent: string;
  /** True when the audience registers a business (CR/VAT, plan, branding). */
  isBusiness: boolean;
}

export const PORTALS: Record<PortalId, PortalDefinition> = {
  customer: {
    id: "customer",
    loginPath: "/customer/login",
    registerPath: "/customer/register",
    home: "/client",
    titleKey: "portals.customer.title",
    title: "Car owner",
    taglineKey: "portals.customer.tagline",
    tagline: "Book service, track repairs and keep every vehicle's history in one place.",
    icon: "Car",
    accent: "from-[#0A5ED7] to-[#0BB3FF]",
    isBusiness: false,
  },
  garage: {
    id: "garage",
    loginPath: "/business/login?type=garage",
    registerPath: "/business/register?type=garage",
    home: "/dashboard",
    titleKey: "portals.garage.title",
    title: "Garage / workshop",
    taglineKey: "portals.garage.tagline",
    tagline: "Run the whole workshop — job cards, bays, technicians, invoicing and reports.",
    icon: "Wrench",
    accent: "from-[#0A5ED7] to-[#6366F1]",
    isBusiness: true,
  },
  parts_store: {
    id: "parts_store",
    loginPath: "/business/login?type=parts_store",
    registerPath: "/business/register?type=parts_store",
    home: "/my-offerings",
    titleKey: "portals.partsStore.title",
    title: "Parts store / supplier",
    taglineKey: "portals.partsStore.tagline",
    tagline: "List your catalogue, receive orders from garages and manage fulfilment.",
    icon: "Package",
    accent: "from-[#F97316] to-[#FBBF24]",
    isBusiness: true,
  },
  insurance: {
    id: "insurance",
    loginPath: "/business/login?type=insurance",
    registerPath: "/business/register?type=insurance",
    home: "/insurance-claims",
    titleKey: "portals.insurance.title",
    title: "Insurance company",
    taglineKey: "portals.insurance.tagline",
    tagline: "Quote repairs, approve claims and work with your accredited garage network.",
    icon: "ShieldCheck",
    accent: "from-[#059669] to-[#34D399]",
    isBusiness: true,
  },
  staff: {
    id: "staff",
    loginPath: "/staff/login",
    registerPath: "/staff/join",
    home: "/dashboard",
    titleKey: "portals.staff.title",
    title: "Team member",
    taglineKey: "portals.staff.tagline",
    tagline: "Technicians, advisors, accountants and managers — join your workplace.",
    icon: "IdCard",
    accent: "from-[#7C3AED] to-[#A78BFA]",
    isBusiness: false,
  },
};

/** Order shown on the chooser page. */
export const PORTAL_ORDER: readonly PortalId[] = [
  "customer",
  "garage",
  "parts_store",
  "insurance",
  "staff",
];

export function getPortal(id: string | null | undefined): PortalDefinition {
  return PORTALS[(id ?? "") as PortalId] ?? PORTALS.customer;
}

export function isProviderType(value: string | null | undefined): value is ProviderType {
  return PROVIDER_PORTAL_IDS.includes(value as ProviderType);
}

/**
 * Where a signed-in user belongs, derived from what the server tells us.
 *
 * `primaryPortal` (computed in GET /api/auth/user from the RBAC roles) wins when
 * present; otherwise fall back to the coarse `userType`, then the guard `role`.
 * Everything unknown lands on the garage dashboard, which is what the app did
 * before this table existed.
 */
export function resolveUserHome(user: {
  primaryPortal?: string | null;
  userType?: string | null;
  role?: string | null;
} | null | undefined): string {
  if (!user) return "/login";
  if (user.primaryPortal) return user.primaryPortal;

  switch (user.userType) {
    case "customer":
      return PORTALS.customer.home;
    case "technician":
      return "/technician-portal";
    case "supplier":
    case "vendor":
      return PORTALS.parts_store.home;
    case "insurer":
      return PORTALS.insurance.home;
    default:
      break;
  }

  switch (user.role) {
    case "TECHNICIAN":
      return "/technician-portal";
    case "CUSTOMER":
      return PORTALS.customer.home;
    case "ACCOUNTANT":
      return "/general-ledger";
    default:
      return "/dashboard";
  }
}
