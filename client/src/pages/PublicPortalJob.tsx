import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import {
  PublicPortalShell,
  PortalError,
  usePortalError,
  portalRequest,
} from '@/components/PublicPortalShell';

const JOB_ENDPOINT = '/api/public-portal/job';
const LANDING_PATH = '/public-portal/landing';
const POLL_MS = 30000;

/**
 * Human-readable strings arrive as {en, ar} pairs because they are workshop-entered
 * (advisor names, part names, photo captions) and exist only in those two. Identifiers,
 * timestamps and URLs are plain strings. If more languages are ever needed here the
 * server should localise instead, since pairs do not scale to the app's seven.
 */
type Pair = { en: string; ar: string };

interface JobPayload {
  job: {
    id: string;
    vehicle: string;
    plate: string;
    eta?: string;
    branch: Pair;
    advisor: Pair;
    status: { tone?: 'wait' | 'done'; label: Pair };
  };
  stages: Array<{ state: 'done' | 'now' | 'pending'; label: Pair; at?: string | null; by?: Pair }>;
  approvals?: Array<{ id: string; status: 'pending' | 'approved' | 'declined'; title: Pair; amount?: Pair; note?: Pair }>;
  photos?: Array<{ url: string; thumb?: string; caption: Pair; at?: string; by?: Pair }>;
  history?: Array<{ ref: string; date: string; summary: Pair; invoice_url?: string }>;
  invoice?: { status: 'paid' | 'unpaid'; total: Pair; pdf_url?: string; xml_url?: string; pay_url?: string } | null;
  workshop?: { whatsapp_e164?: string; phone_e164?: string };
}

export default function PublicPortalJob() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const toMessage = usePortalError();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');

  const lang = i18n.language?.split('-')[0] === 'ar' ? 'ar' : 'en';
  const pick = (p?: Pair) => (p ? p[lang] || p.en : '');

  const decide = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'approve' | 'decline' }) => {
      const res = await portalRequest('POST', `${JOB_ENDPOINT}/approvals/${encodeURIComponent(id)}`, { decision });
      if (!res.ok) throw Object.assign(new Error('decide'), { status: res.status });
      return res.data;
    },
    onSuccess: () => {
      setActionError('');
      queryClient.invalidateQueries({ queryKey: [JOB_ENDPOINT] });
    },
    onError: (e: any) =>
      setActionError(toMessage(e?.status ?? 0, t('publicPortal.job.errAction', 'That did not go through. Try again.'))),
  });

  const job = useQuery<JobPayload>({
    queryKey: [JOB_ENDPOINT],
    queryFn: async () => {
      const res = await portalRequest('GET', JOB_ENDPOINT);
      if (!res.ok) throw Object.assign(new Error('job'), { status: res.status });
      return res.data;
    },
    /* The design promises a live view rather than a screenshot, so it re-reads itself —
       but not in a background tab, and not while an approval is in flight. */
    refetchInterval: () => (decide.isPending ? false : POLL_MS),
    refetchIntervalInBackground: false,
    retry: false,
  });

  /* A dead session belongs back at the start, not on an error page. */
  const status = (job.error as any)?.status;
  useEffect(() => {
    if (status === 401 || status === 404) {
      const id = setTimeout(() => navigate(LANDING_PATH), 2500);
      return () => clearTimeout(id);
    }
  }, [status, navigate]);

  if (job.isLoading) {
    return (
      <PublicPortalShell>
        <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6" data-testid="status-job-loading">
          <p className="mb-6 text-center text-sm text-[#64748B]">{t('publicPortal.job.loading', 'Loading your job…')}</p>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="mt-3 h-3.5 w-2/3" />
          <Skeleton className="mt-2 h-3.5 w-1/3" />
        </div>
      </PublicPortalShell>
    );
  }

  if (job.isError || !job.data?.job) {
    return (
      <PublicPortalShell>
        <div className="mx-auto max-w-[520px] px-4 py-16 sm:px-6">
          <PortalError
            message={toMessage(status ?? 0, t('publicPortal.job.errLoad', 'We could not load your job. Try again shortly.'))}
            testId="text-job-error"
          />
        </div>
      </PublicPortalShell>
    );
  }

  const { job: j, stages, approvals, photos, history, invoice, workshop } = job.data;

  return (
    <PublicPortalShell>
      {/* summary band */}
      <section className="relative overflow-hidden bg-[#0B1F3B]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_440px_at_85%_-20%,rgba(11,179,255,0.2),transparent_60%)]"
        />
        <div className="relative mx-auto max-w-[1120px] px-4 pb-9 pt-8 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.06em] text-[#B7C4D6]">
                {t('publicPortal.job.jobCard', 'Job card')} ·{' '}
                <span dir="ltr" data-testid="text-job-ref">{j.id}</span> · {pick(j.branch)}
              </p>
              <h1 className="mt-1.5 text-[clamp(22px,3.2vw,32px)] font-extrabold tracking-[-0.025em] text-white" data-testid="text-vehicle">
                {j.vehicle}
              </h1>
            </div>
            <Badge
              data-testid="badge-job-status"
              className={
                j.status.tone === 'done'
                  ? 'bg-[#E4F5EC] text-[#166534] hover:bg-[#E4F5EC]'
                  : 'bg-[#FFF1E8] text-[#C2410C] hover:bg-[#FFF1E8]'
              }
            >
              {pick(j.status.label)}
            </Badge>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t border-white/15 pt-5 md:grid-cols-4">
            {[
              [t('publicPortal.job.plate', 'Plate'), j.plate, true],
              [t('publicPortal.job.advisor', 'Service advisor'), pick(j.advisor), false],
              [t('publicPortal.job.eta', 'Est. delivery'), j.eta || '—', true],
              [t('publicPortal.job.branch', 'Branch'), pick(j.branch), false],
            ].map(([label, value, ltr]) => (
              <div key={label as string}>
                <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#B7C4D6]">{label}</dt>
                <dd className="mt-0.5 text-[14.5px] font-semibold text-white" dir={ltr ? 'ltr' : undefined}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1120px] items-start gap-7 px-4 py-9 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          {/* progress */}
          <Card className="dark:bg-[#151A23]">
            <CardHeader className="border-b border-[#D9DFE7] py-4 dark:border-[#232A36]">
              <CardTitle className="text-base">{t('publicPortal.job.progress', 'Progress')}</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <ol data-testid="list-stages">
                {stages.map((s, i) => (
                  <li
                    key={i}
                    data-testid={`stage-${s.state}`}
                    className="grid grid-cols-[26px_1fr_auto] items-start gap-3 border-b border-dashed border-[#D9DFE7] py-3.5 last:border-0 dark:border-[#232A36]"
                  >
                    <span
                      aria-hidden
                      className={
                        'mt-1 ms-1.5 h-3.5 w-3.5 rounded-full border-[3px] ' +
                        (s.state === 'done'
                          ? 'border-[#0A5ED7] bg-[#0A5ED7]'
                          : s.state === 'now'
                            ? 'border-[#F97316] bg-[#F97316] ring-4 ring-[#F97316]/20'
                            : 'border-[#C3CBD6] bg-white dark:bg-[#151A23]')
                      }
                    />
                    <div>
                      <b className={'block font-semibold ' + (s.state === 'pending' ? 'text-[#94A3B8]' : 'text-[#0B1F3B] dark:text-white')}>
                        {pick(s.label)}
                      </b>
                      {/* "Every stage records who signed and when" — so the signature shows. */}
                      {s.by && <span className="text-[12.5px] text-[#64748B]">{pick(s.by)}</span>}
                    </div>
                    <span dir="ltr" className="pt-0.5 font-mono text-[11.5px] whitespace-nowrap text-[#64748B]">
                      {s.at || (s.state === 'now' ? t('publicPortal.job.now', 'now') : '—')}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* photos */}
          {!!photos?.length && (
            <Card className="dark:bg-[#151A23]">
              <CardHeader className="flex-row items-center justify-between border-b border-[#D9DFE7] py-4 dark:border-[#232A36]">
                <CardTitle className="text-base">{t('publicPortal.job.photos', 'Photos from the bay')}</CardTitle>
                <span className="font-mono text-xs text-[#64748B]">{photos.length}</span>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2.5 py-4 sm:grid-cols-3">
                {photos.map((ph, i) => (
                  <a
                    key={i}
                    href={ph.url}
                    target="_blank"
                    rel="noopener"
                    className="overflow-hidden rounded-xl border border-[#D9DFE7] dark:border-[#232A36]"
                    data-testid={`link-photo-${i}`}
                  >
                    <img src={ph.thumb || ph.url} loading="lazy" alt="" className="aspect-[4/3] w-full bg-[#E9EEF4] object-cover" />
                    <span className="block px-2.5 py-2 text-xs font-medium leading-snug text-[#0B1F3B] dark:text-white">
                      {pick(ph.caption)}
                      {/* timestamped and signed — both are the point */}
                      <i className="mt-0.5 block font-mono text-[10.5px] not-italic text-[#64748B]">
                        {[ph.at, ph.by && pick(ph.by)].filter(Boolean).join(' · ')}
                      </i>
                    </span>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {/* approvals */}
          {!!approvals?.length && (
            <div className="space-y-4" data-testid="list-approvals">
              {approvals.map((a) => (
                <div
                  key={a.id}
                  data-testid={`approval-${a.status}`}
                  className="grid gap-2 rounded-2xl border border-[#FBD3B0] bg-gradient-to-br from-[#FFF1E8] to-[#FFE4D0] p-5 dark:border-[#7C4A22] dark:from-[#3A2110] dark:to-[#2A1708]"
                >
                  <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#C2410C] dark:text-[#FDBA74]">
                    {a.status === 'pending'
                      ? t('publicPortal.job.waitingOnYou', 'Waiting on you')
                      : t('publicPortal.job.alreadyAnswered', 'Already answered')}
                  </span>
                  <b className="text-base font-bold text-[#0B1F3B] dark:text-white">{pick(a.title)}</b>
                  {a.amount && <span className="font-semibold text-[#0B1F3B] dark:text-white">{pick(a.amount)}</span>}
                  {a.note && <p className="text-[13.5px] text-[#7C4A22] dark:text-[#FDBA74]">{pick(a.note)}</p>}

                  {a.status === 'pending' ? (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {(['approve', 'decline'] as const).map((decision) => (
                        <Button
                          key={decision}
                          type="button"
                          variant={decision === 'approve' ? 'default' : 'outline'}
                          /* Both disable together: the answer is recorded once. */
                          disabled={decide.isPending}
                          onClick={() => decide.mutate({ id: a.id, decision })}
                          className={
                            'h-9 rounded-full px-4 text-[13.5px] ' +
                            (decision === 'approve' ? 'bg-[#0A5ED7] hover:bg-[#0952C0]' : 'bg-transparent')
                          }
                          data-testid={`button-${decision}-${a.id}`}
                        >
                          {decision === 'approve'
                            ? t('publicPortal.job.approve', 'Approve')
                            : t('publicPortal.job.decline', 'Decline')}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[13px] font-semibold text-[#C2410C] dark:text-[#FDBA74]">
                      {a.status === 'approved'
                        ? t('publicPortal.job.youApproved', 'You approved this.')
                        : t('publicPortal.job.youDeclined', 'You declined this.')}
                    </span>
                  )}
                </div>
              ))}
              <PortalError message={actionError} testId="text-action-error" />
            </div>
          )}

          {/* invoice */}
          {invoice && (
            <Card className="dark:bg-[#151A23]">
              <CardHeader className="flex-row items-center justify-between border-b border-[#D9DFE7] py-4 dark:border-[#232A36]">
                <CardTitle className="text-base">{t('publicPortal.job.invoice', 'Invoice')}</CardTitle>
                <Badge
                  data-testid="badge-invoice-status"
                  className={
                    invoice.status === 'paid'
                      ? 'bg-[#E4F5EC] text-[#166534] hover:bg-[#E4F5EC]'
                      : 'bg-[#E9F0FB] text-[#173963] hover:bg-[#E9F0FB]'
                  }
                >
                  {invoice.status === 'paid'
                    ? t('publicPortal.job.invoicePaid', 'Paid')
                    : t('publicPortal.job.invoiceDue', 'Due')}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-baseline justify-between gap-3 bg-[#E9EEF4] px-5 py-4 dark:bg-[#0E1117]">
                  <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#64748B]">
                    {t('publicPortal.job.totalInclVat', 'Total incl. VAT')}
                  </span>
                  <span className="text-[22px] font-extrabold text-[#0B1F3B] dark:text-white" data-testid="text-invoice-total">
                    {pick(invoice.total)}
                  </span>
                </div>
                {/* ZATCA Phase 2: the customer is owed the XML as well as a printable copy. */}
                <div className="flex flex-wrap gap-2 px-5 py-3.5">
                  {invoice.pdf_url && (
                    <a href={invoice.pdf_url} target="_blank" rel="noopener" className="rounded-full border-[1.5px] border-[#C3CBD6] px-3.5 py-2 text-[13px] font-semibold text-[#0B1F3B] hover:border-[#0A5ED7] hover:text-[#0A5ED7] dark:border-[#2E3746] dark:text-white" data-testid="link-invoice-pdf">
                      {t('publicPortal.job.downloadPdf', 'Download PDF')}
                    </a>
                  )}
                  {invoice.xml_url && (
                    <a href={invoice.xml_url} target="_blank" rel="noopener" className="rounded-full border-[1.5px] border-[#C3CBD6] px-3.5 py-2 text-[13px] font-semibold text-[#0B1F3B] hover:border-[#0A5ED7] hover:text-[#0A5ED7] dark:border-[#2E3746] dark:text-white" data-testid="link-invoice-xml">
                      {t('publicPortal.job.downloadXml', 'XML (UBL 2.1)')}
                    </a>
                  )}
                </div>
                {invoice.status !== 'paid' && invoice.pay_url && (
                  <a
                    href={invoice.pay_url}
                    className="mx-5 mb-5 flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#0A5ED7] text-[15px] font-semibold text-white hover:bg-[#0952C0]"
                    data-testid="link-pay-now"
                  >
                    {t('publicPortal.job.payNow', 'Pay now')}
                    <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* history */}
          {!!history?.length && (
            <Card className="dark:bg-[#151A23]">
              <CardHeader className="border-b border-[#D9DFE7] py-4 dark:border-[#232A36]">
                <CardTitle className="text-base">{t('publicPortal.job.history', 'Service history')}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <ul data-testid="list-history">
                  {history.map((h) => (
                    <li key={h.ref} className="flex items-center justify-between gap-3 border-b border-dashed border-[#D9DFE7] py-3 text-[13.5px] last:border-0 dark:border-[#232A36]">
                      <div>
                        <b className="font-semibold text-[#0B1F3B] dark:text-white">{pick(h.summary)}</b>
                        <span dir="ltr" className="block font-mono text-[11.5px] text-[#64748B]">
                          {h.ref} · {h.date}
                        </span>
                      </div>
                      {h.invoice_url && (
                        <a href={h.invoice_url} target="_blank" rel="noopener" className="font-medium text-[#0A5ED7] hover:underline">
                          {t('publicPortal.job.invoice', 'Invoice')}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* helpline — only where a workshop is actually known */}
      {(workshop?.whatsapp_e164 || workshop?.phone_e164) && (
        <section className="mx-auto max-w-[1120px] px-4 pb-16 sm:px-6">
          <div className="relative grid items-center gap-8 overflow-hidden rounded-3xl bg-[#0B1F3B] px-7 py-8 sm:px-11 sm:py-10 lg:grid-cols-[1.4fr_auto]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(400px_240px_at_100%_0%,rgba(11,179,255,0.2),transparent_60%)]"
            />
            <div className="relative">
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-[#0BB3FF]">
                {t('publicPortal.job.helplineEyebrow', 'Questions about this job?')}
              </p>
              <h2 className="mt-2.5 text-[clamp(22px,2.6vw,30px)] font-bold tracking-[-0.02em] text-white">
                {t('publicPortal.job.helplineTitle', 'Talk to the people working on your car.')}
              </h2>
              <p className="mt-2.5 max-w-[56ch] text-[#B7C4D6]">
                {t('publicPortal.job.helplineBody', 'Your service advisor has this job card open in front of them. No queue, no explaining it again.')}
              </p>
            </div>
            <div className="relative flex flex-wrap gap-3">
              {workshop.whatsapp_e164 && (
                <a
                  href={`https://wa.me/${workshop.whatsapp_e164}`}
                  className="inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-5 text-[15px] font-semibold text-[#0B1F3B]"
                  data-testid="link-whatsapp"
                >
                  {t('publicPortal.job.whatsapp', 'Chat on WhatsApp')}
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                </a>
              )}
              {workshop.phone_e164 && (
                <a
                  href={`tel:${workshop.phone_e164}`}
                  className="inline-flex h-12 items-center rounded-full border-[1.5px] border-white/35 px-5 text-[15px] font-semibold text-white hover:border-white hover:bg-white/10"
                  data-testid="link-call-workshop"
                >
                  {t('publicPortal.job.callWorkshop', 'Call the workshop')}
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </PublicPortalShell>
  );
}
