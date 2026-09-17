import { useEffect, useRef, useState, FormEvent } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  PublicPortalShell,
  PortalError,
  usePortalError,
  portalRequest,
  safeNext,
} from '@/components/PublicPortalShell';

const VERIFY_ENDPOINT = '/api/public-portal/otp/verify';
const RESEND_ENDPOINT = '/api/public-portal/otp/resend';
const JOB_PATH = '/public-portal/job';
const LANDING_PATH = '/public-portal/landing';
const COOLDOWN_S = 45;
const CODE_LEN = 6;

/* A Saudi keyboard produces Arabic-Indic (٠١٢) and Persian (۰۱۲) digits; the endpoint
   wants ASCII. */
function toAsciiDigits(s: string) {
  return s
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48))
    .replace(/\D/g, '');
}

export default function PublicPortalVerify() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const toMessage = usePortalError();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  /* Starts on cooldown: a code was just sent, and an instant resend invites a second SMS
     the customer has not waited for. */
  const [left, setLeft] = useState(COOLDOWN_S);
  /* Stops a rejected code from re-submitting itself on every keystroke. */
  const autoSent = useRef(false);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const verify = useMutation({
    mutationFn: async (value: string) => {
      const res = await portalRequest('POST', VERIFY_ENDPOINT, { code: value });
      if (!res.ok) throw Object.assign(new Error('verify'), { status: res.status });
      return res.data;
    },
    onSuccess: (data) => navigate(safeNext(data?.next, JOB_PATH)),
    onError: (e: any) => {
      const status = e?.status ?? 0;
      setError(
        status === 410
          ? t('publicPortal.verify.errExpired', 'That code has expired. Ask for a new one.')
          : toMessage(status, t('publicPortal.verify.errWrong', 'That code is not right. Check the message and try again.')),
      );
      setCode('');
      autoSent.current = false;
    },
  });

  const resend = useMutation({
    mutationFn: async () => {
      const res = await portalRequest('POST', RESEND_ENDPOINT, {});
      if (!res.ok) throw Object.assign(new Error('resend'), { status: res.status });
      return res.data;
    },
    onSuccess: () => {
      setCode('');
      setError('');
      autoSent.current = false;
      setLeft(COOLDOWN_S);
    },
    onError: (e: any) => {
      const status = e?.status ?? 0;
      setError(toMessage(status, t('publicPortal.verify.errResend', 'Could not send a new code. Try again shortly.')));
      if (status === 401 || status === 404) setTimeout(() => navigate(LANDING_PATH), 2500);
    },
  });

  const onChange = (value: string) => {
    const clean = toAsciiDigits(value).slice(0, CODE_LEN);
    setCode(clean);
    if (clean.length < CODE_LEN) {
      autoSent.current = false;
      setError('');
      return;
    }
    /* Autofill and paste both land a whole code at once, so submitting for them saves a
       tap. InputOTP keeps autocomplete="one-time-code" working. */
    if (!autoSent.current && !verify.isPending) {
      autoSent.current = true;
      verify.mutate(clean);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (verify.isPending) return;
    if (code.length < CODE_LEN) {
      setError(t('publicPortal.verify.errShort', 'Enter all 6 digits.'));
      return;
    }
    autoSent.current = true;
    verify.mutate(code);
  };

  return (
    <PublicPortalShell>
      <section className="relative overflow-hidden bg-[#0B1F3B]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_500px_at_85%_-10%,rgba(11,179,255,0.22),transparent_60%)]"
        />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1120px] items-center justify-center px-4 py-14 sm:px-6">
          <div className="w-full max-w-[432px] rounded-[20px] bg-white p-8 shadow-[0_30px_60px_-24px_rgba(11,31,59,0.45)] dark:bg-[#151A23]">
            <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-[#0A5ED7]">
              {t('publicPortal.verify.step', 'Step 2 of 2')}
            </p>
            <h1 className="mt-2.5 text-[26px] font-extrabold leading-tight text-[#0B1F3B] dark:text-white">
              {t('publicPortal.verify.title', 'Enter the code we sent you.')}
            </h1>
            {/* The masked number comes from the challenge the server already holds; the
                full number is never echoed back to the page. */}
            <p className="mt-2 text-[13.5px] text-[#64748B]" data-testid="text-sent-to">
              {t('publicPortal.verify.sentTo', 'Sent by SMS to {{phone}}. It expires in 10 minutes.', {
                phone: '•••',
              })}
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-6" data-testid="form-verify">
              <Label htmlFor="otp-code" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#64748B]">
                {t('publicPortal.verify.codeLabel', '6-digit code')}
              </Label>
              <InputOTP
                id="otp-code"
                maxLength={CODE_LEN}
                value={code}
                onChange={onChange}
                autoFocus
                containerClassName="mt-2 justify-center"
                data-testid="input-otp"
              >
                <InputOTPGroup dir="ltr">
                  {Array.from({ length: CODE_LEN }, (_, i) => (
                    <InputOTPSlot key={i} index={i} className="h-14 w-11 text-xl" />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <div className="mt-4">
                <PortalError message={error} testId="text-verify-error" />
              </div>

              <Button
                type="submit"
                disabled={verify.isPending}
                className="mt-4 h-12 w-full rounded-full bg-[#0A5ED7] text-[15px] font-semibold hover:bg-[#0952C0]"
                data-testid="button-verify"
              >
                {verify.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t('publicPortal.verify.checking', 'Checking…')}
                  </>
                ) : (
                  <>
                    {t('publicPortal.verify.submit', 'Verify and continue')}
                    <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 grid justify-items-center gap-2 border-t border-[#D9DFE7] pt-4 text-center text-[13px] text-[#64748B] dark:border-[#232A36]">
              <div>
                <button
                  type="button"
                  onClick={() => resend.mutate()}
                  disabled={left > 0 || resend.isPending || verify.isPending}
                  className="font-medium text-[#0A5ED7] hover:underline disabled:cursor-default disabled:text-[#94A3B8] disabled:no-underline"
                  data-testid="button-resend"
                >
                  {t('publicPortal.verify.resend', 'Send a new code')}
                </button>
                {left > 0 && (
                  <span className="ms-2 font-mono text-xs text-[#94A3B8]" data-testid="text-cooldown">
                    {t('publicPortal.verify.resendIn', 'in {{count}}s', { count: left })}
                  </span>
                )}
              </div>
              <div>
                {t('publicPortal.verify.wrongNumber', 'Wrong number?')}{' '}
                <a href={LANDING_PATH} className="font-medium text-[#0A5ED7] hover:underline" data-testid="link-start-again">
                  {t('publicPortal.verify.startAgain', 'Start again')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPortalShell>
  );
}
