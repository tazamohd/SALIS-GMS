import { useState, FormEvent } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Lock, BarChart3, ArrowRight, Loader2 } from 'lucide-react';
import {
  PublicPortalShell,
  PortalError,
  usePortalError,
  portalRequest,
  safeNext,
} from '@/components/PublicPortalShell';

const OTP_ENDPOINT = '/api/public-portal/otp';
const VERIFY_PATH = '/public-portal/verify';

type Mode = 'plate' | 'jc';

export default function PublicPortalLanding() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const toMessage = usePortalError();

  const [mode, setMode] = useState<Mode>('plate');
  const [plateArea, setPlateArea] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [jobCard, setJobCard] = useState('');
  /* One phone value across both tabs, so switching never loses what was typed. */
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [invalid, setInvalid] = useState<string>('');

  const requestCode = useMutation({
    mutationFn: async () => {
      const body =
        mode === 'plate'
          ? { mode, phone: phone.trim(), plate_area: plateArea.trim(), plate_number: plateNumber.trim() }
          : { mode, phone: phone.trim(), job_card: jobCard.trim() };
      const res = await portalRequest('POST', OTP_ENDPOINT, body);
      if (!res.ok) throw Object.assign(new Error('otp'), { status: res.status });
      return res.data;
    },
    onSuccess: (data) => navigate(safeNext(data?.next, VERIFY_PATH)),
    onError: (e: any) =>
      setError(
        toMessage(
          e?.status ?? 0,
          /* Never "no such job": distinguishing a wrong code from an unknown vehicle
             would let anyone enumerate plates. */
          t('publicPortal.errFailed', 'We could not send the code. Check the details and try again.'),
        ),
      ),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (requestCode.isPending) return;
    setError('');
    setInvalid('');

    if (mode === 'plate' && !plateArea.trim()) return fail('plate-area', t('publicPortal.landing.errPlate', 'Enter your plate letters and number.'));
    if (mode === 'plate' && !plateNumber.trim()) return fail('plate-number', t('publicPortal.landing.errPlate', 'Enter your plate letters and number.'));
    if (mode === 'jc' && !jobCard.trim()) return fail('job-card', t('publicPortal.landing.errJobCard', 'Enter your job card number.'));
    if (!phone.trim()) return fail('phone', t('publicPortal.landing.errPhone', 'Enter your mobile number.'));

    requestCode.mutate();
  };

  const fail = (field: string, message: string) => {
    setInvalid(field);
    setError(message);
    document.getElementById(field)?.focus();
  };

  const trust = [
    { Icon: ShieldCheck, label: t('publicPortal.landing.trustZatca', 'ZATCA Phase 2') },
    { Icon: Lock, label: t('publicPortal.landing.trustOtp', 'OTP secured') },
    { Icon: BarChart3, label: t('publicPortal.landing.trustAudit', 'Audit trail') },
  ];

  return (
    <PublicPortalShell>
      <section className="relative overflow-hidden bg-[#0B1F3B]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_500px_at_85%_-10%,rgba(11,179,255,0.22),transparent_60%),radial-gradient(700px_400px_at_0%_100%,rgba(249,115,22,0.12),transparent_60%)]"
        />
        <div className="relative mx-auto grid max-w-[1120px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-[#0BB3FF]">
              {t('publicPortal.landing.eyebrow', 'Your car, your workshop, one place')}
            </p>
            <h1 className="mt-3 text-[clamp(30px,4.4vw,54px)] font-extrabold leading-[1.04] tracking-[-0.035em] text-white">
              {t('publicPortal.landing.titleA', 'Track your service.')}
              <br />
              <span className="text-[#F97316]">{t('publicPortal.landing.titleB', 'Approve. Pay. Done.')}</span>
            </h1>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-[#B7C4D6]">
              {t('publicPortal.landing.lede', 'Follow your vehicle from check-in to delivery.')}
            </p>
            <ul className="mt-7 flex flex-wrap gap-5 text-[13px] text-[#B7C4D6]">
              {trust.map(({ Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-[#0BB3FF]" aria-hidden />
                  <b className="font-semibold text-white">{label}</b>
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            data-testid="form-job-lookup"
            className="rounded-[20px] border border-transparent bg-white p-6 shadow-[0_30px_60px_-24px_rgba(11,31,59,0.45)] dark:bg-[#151A23]"
          >
            <h2 className="text-lg font-bold text-[#0B1F3B] dark:text-white">
              {t('publicPortal.landing.lookupTitle', 'Find your job')}
            </h2>
            <p className="mt-1 text-[13.5px] text-[#64748B]">
              {t('publicPortal.landing.lookupSub', "Two ways. We send a one-time code to confirm it's you.")}
            </p>

            <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setError(''); setInvalid(''); }} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plate" data-testid="tab-plate">
                  {t('publicPortal.landing.tabPlate', 'Plate + phone')}
                </TabsTrigger>
                <TabsTrigger value="jc" data-testid="tab-job-card">
                  {t('publicPortal.landing.tabJobCard', 'Job card ID')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-4 space-y-3.5">
              {mode === 'plate' ? (
                <div>
                  <Label htmlFor="plate-area" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#64748B]">
                    {t('publicPortal.landing.plate', 'Plate')}
                  </Label>
                  <div className="mt-1.5 grid grid-cols-[110px_1fr] gap-2">
                    <Input
                      id="plate-area"
                      value={plateArea}
                      onChange={(e) => setPlateArea(e.target.value.toUpperCase())}
                      maxLength={4}
                      placeholder="RUH"
                      aria-invalid={invalid === 'plate-area'}
                      className="h-12 text-center font-mono uppercase tracking-[0.05em]"
                      data-testid="input-plate-area"
                    />
                    <Input
                      id="plate-number"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      inputMode="numeric"
                      placeholder="4821"
                      aria-invalid={invalid === 'plate-number'}
                      className="h-12"
                      data-testid="input-plate-number"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="job-card" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#64748B]">
                    {t('publicPortal.landing.jobCard', 'Job card')}
                  </Label>
                  <Input
                    id="job-card"
                    value={jobCard}
                    onChange={(e) => setJobCard(e.target.value.toUpperCase())}
                    placeholder="JC-4F2A"
                    aria-invalid={invalid === 'job-card'}
                    className="mt-1.5 h-12 font-mono uppercase tracking-[0.05em]"
                    data-testid="input-job-card"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="phone" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#64748B]">
                  {t('publicPortal.landing.mobile', 'Mobile')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  aria-invalid={invalid === 'phone'}
                  className="mt-1.5 h-12"
                  data-testid="input-phone"
                />
              </div>

              <PortalError message={error} testId="text-lookup-error" />

              <Button
                type="submit"
                disabled={requestCode.isPending}
                className="h-12 w-full rounded-full bg-[#0A5ED7] text-[15px] font-semibold hover:bg-[#0952C0]"
                data-testid="button-send-code"
              >
                {requestCode.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t('publicPortal.landing.sending', 'Sending…')}
                  </>
                ) : (
                  <>
                    {t('publicPortal.landing.submit', 'Send one-time code')}
                    <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                  </>
                )}
              </Button>
            </div>

            <p className="mt-4 border-t border-[#D9DFE7] pt-4 text-center text-[13px] text-[#64748B] dark:border-[#232A36]">
              {t('publicPortal.landing.firstVisit', 'First visit?')}{' '}
              <a href="/public-portal/entry" className="font-medium text-[#0A5ED7] hover:underline" data-testid="link-sms-entry">
                {t('publicPortal.landing.smsLink', 'Enter with the link from your SMS')}
              </a>
            </p>
          </form>
        </div>
      </section>
    </PublicPortalShell>
  );
}
