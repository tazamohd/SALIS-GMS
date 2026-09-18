import { useTranslation } from 'react-i18next';
import { ArrowRight, LinkIcon } from 'lucide-react';
import { PublicPortalShell } from '@/components/PublicPortalShell';

/**
 * What /track/:token renders now that public tracking links are retired.
 *
 * Those links are already in customers' phones, so the route stays and explains itself
 * rather than 404ing or bouncing them to a login screen they cannot use. The token in the
 * URL is deliberately ignored — treating it as proof of identity is the thing being
 * retired, so it is not read, echoed, or sent anywhere.
 */
export default function TrackingLinkRetired() {
  const { t } = useTranslation();

  return (
    <PublicPortalShell>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[560px] items-center px-4 py-14 sm:px-6">
        <div className="w-full rounded-[20px] border border-[#D9DFE7] bg-white p-8 text-center dark:border-[#232A36] dark:bg-[#151A23]">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#E9F0FB] text-[#0A5ED7] dark:bg-[#132846]">
            <LinkIcon className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-[#0B1F3B] dark:text-white">
            {t('publicPortal.retired.title', 'This tracking link has been replaced.')}
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-[#64748B]">
            {t(
              'publicPortal.retired.body',
              'Your job is still here. Look it up with your plate or job card number and we will text a one-time code to the mobile your workshop has on file — so only you can open it.',
            )}
          </p>
          <a
            href="/public-portal/landing"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#0A5ED7] px-6 text-[15px] font-semibold text-white hover:bg-[#0952C0]"
            data-testid="link-go-to-portal"
          >
            {t('publicPortal.retired.cta', 'Find your job')}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </a>
          <p className="mt-4 text-[13px] text-[#94A3B8]">
            {t('publicPortal.retired.hint', "You will need the mobile number you gave the workshop.")}
          </p>
        </div>
      </div>
    </PublicPortalShell>
  );
}
