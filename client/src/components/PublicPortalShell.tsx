import { ReactNode } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';

/**
 * Chrome for the unauthenticated customer portal: sticky header, footer, skip link.
 *
 * Deliberately not CustomerPortalLayout — that one assumes an authenticated app user with
 * a sidebar and navigation. Everyone here has only a job card and a phone number.
 */
export function PublicPortalShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] dark:bg-[#0E1117]">
      {/* Clipped rather than parked off-screen: a left:-9999px skip link is not off-screen
          in RTL, where leftward overflow is scrollable. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:rounded-full focus:border-[1.5px] focus:border-[#0A5ED7] focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#0B1F3B] dark:focus:bg-[#151A23] dark:focus:text-white"
        data-testid="link-skip-to-content"
      >
        {t('publicPortal.skip', 'Skip to content')}
      </a>

      <header className="sticky top-0 z-10 border-b border-[#D9DFE7] bg-[#F4F6F9]/90 backdrop-blur dark:border-[#232A36] dark:bg-[#0E1117]/90">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/public-portal/landing"
            className="inline-flex items-baseline gap-1.5 text-[17px] font-extrabold tracking-tight text-[#0B1F3B] dark:text-white sm:text-[18px]"
            data-testid="link-portal-home"
          >
            SALIS
            <span className="inline-block h-[0.42em] w-[0.42em] rounded-full bg-[#F97316]" />
            AUTO
            {/* The badge carries no action, so it is the first thing to go when narrow. */}
            <span className="ms-3 hidden border-s border-[#C3CBD6] ps-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#64748B] dark:border-[#2E3746] sm:inline">
              {t('publicPortal.badge', 'Customer portal')}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <a
              href="/login"
              className="rounded-full px-2 py-2 text-[13px] font-semibold text-[#0B1F3B] hover:bg-[#E9F0FB] hover:text-[#0A5ED7] dark:text-white dark:hover:bg-[#132846] sm:px-3.5 sm:text-sm"
              data-testid="link-workshop-signin"
            >
              {t('publicPortal.signIn', 'Workshop sign in')}
            </a>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-[#D9DFE7] bg-white py-8 text-[13px] text-[#64748B] dark:border-[#232A36] dark:bg-[#151A23]">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div>
            <span className="font-bold text-[#0B1F3B] dark:text-white">SALIS AUTO</span>
            {' · '}
            {t('publicPortal.footerPortal', 'Public portal')}
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="/privacy-policy" className="hover:text-[#0A5ED7]">{t('publicPortal.privacy', 'Privacy')}</a>
            <a href="/terms-conditions" className="hover:text-[#0A5ED7]">{t('publicPortal.terms', 'Terms')}</a>
            <a href="/cookie-policy" className="hover:text-[#0A5ED7]">{t('publicPortal.cookies', 'Cookies')}</a>
            <a href="mailto:info@salisauto.app" dir="ltr" className="hover:text-[#0A5ED7]">info@salisauto.app</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Inline error used by all three portal pages. */
export function PortalError({ message, testId = 'text-portal-error' }: { message: string; testId?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      data-testid={testId}
      className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-[13px] text-[#B91C1C] dark:border-[#7F1D1D] dark:bg-[#450A0A] dark:text-[#FCA5A5]"
    >
      {message}
    </p>
  );
}

/**
 * Maps a failed request to portal copy. Kept in one place so every page says the same
 * thing, and so none of them ever distinguishes "no such job" from "wrong code" — that
 * difference is a plate-enumeration oracle.
 */
export function usePortalError() {
  const { t } = useTranslation();
  return (status: number, fallback: string) => {
    if (status === 0) return t('publicPortal.errNetwork', 'No connection. Check your network and try again.');
    if (status === 429) return t('publicPortal.errRate', 'Too many attempts. Try again in a few minutes.');
    if (status === 401 || status === 404) return t('publicPortal.errStale', 'This session has expired. Start again.');
    return fallback;
  };
}

/** Same-origin absolute paths only: "//host" and "/\host" are protocol-relative. */
export function safeNext(next: unknown, fallback: string): string {
  return typeof next === 'string' && next.startsWith('/') && next[1] !== '/' && next[1] !== '\\'
    ? next
    : fallback;
}

/** Status code from a fetch, or 0 for a network failure — the shape usePortalError wants. */
export async function portalRequest(
  method: 'GET' | 'POST',
  url: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} };
  }
}
