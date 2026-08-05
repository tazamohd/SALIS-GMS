import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";
import { supportedLanguages } from "@/i18n/config";

/**
 * First-run language selection screen (design: LanguageSelection.dc.html).
 *
 * A dedicated pre-login onboarding step: pick English or Arabic, optionally
 * opt into notifications, then Continue. Unlike the header LanguageSwitcher,
 * this drives react-i18next AND writes the app's existing `preferred-language`
 * key so the whole app (and the switcher) stay in sync — no forked state.
 */

// localStorage keys — `preferred-language` is the app's canonical i18n key
// (see i18n/config.ts and LanguageSwitcher.tsx); the others are local prefs.
const LANG_KEY = "preferred-language";
const NOTIF_KEY = "notifications-opt-in";

export default function LanguageSelection() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();

  const current = (i18n.language || "en").split("-")[0];
  const [lang, setLang] = useState<string>(current === "ar" ? "ar" : "en");
  const [notif, setNotif] = useState<boolean>(
    () => (localStorage.getItem(NOTIF_KEY) ?? "on") === "on",
  );

  const chooseLanguage = (code: "en" | "ar") => {
    const cfg = supportedLanguages.find((l) => l.code === code);
    i18n.changeLanguage(code);
    document.documentElement.dir = cfg?.dir || (code === "ar" ? "rtl" : "ltr");
    document.documentElement.lang = code;
    localStorage.setItem(LANG_KEY, code);
    setLang(code);
  };

  const toggleNotif = () => {
    const next = !notif;
    localStorage.setItem(NOTIF_KEY, next ? "on" : "off");
    setNotif(next);
  };

  const handleContinue = () => {
    // Next onboarding step is region selection, which finalizes onboarding.
    setLocation("/region");
  };

  // Keep local selection in sync if the language changes elsewhere.
  useEffect(() => {
    const c = (i18n.language || "en").split("-")[0];
    setLang(c === "ar" ? "ar" : "en");
  }, [i18n.language]);

  const isRTL = lang === "ar";

  const langCardBase =
    "flex-1 flex flex-col items-center gap-2 px-5 py-5 rounded-xl cursor-pointer font-poppins border transition-all duration-150";
  const selected =
    "border-[#0A5ED7] bg-[#EFF4FD] dark:bg-[#10233D] text-[#0A5ED7]";
  const unselected =
    "border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131A24] text-[#334155] dark:text-gray-200";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="page-language-selection"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F8FAFC] dark:bg-[#0E1117] font-sans"
    >
      {/* Decorative blurred brand glow (top / inline-end) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 w-[800px] h-[800px] rounded-full blur-[64px] bg-[radial-gradient(circle,rgba(10,94,215,0.10),transparent_65%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center gap-[22px] px-4 py-6 animate-[fadeUp_0.3s_ease]">
        <img
          src={logoImage}
          alt={t("app.name", "SALIS AUTO")}
          className="w-28 h-auto drop-shadow"
          data-testid="logo-salis-auto"
        />

        <h1 className="m-0 text-[22px] font-montserrat font-extrabold text-center text-[#0B1F3B] dark:text-white">
          {t("languageSelection.choose", "Choose your language")}
        </h1>

        {/* Language buttons */}
        <div className="flex w-full gap-3.5">
          <button
            type="button"
            onClick={() => chooseLanguage("en")}
            data-testid="button-lang-en"
            className={`${langCardBase} ${lang === "en" ? selected : unselected}`}
          >
            <span className="text-2xl">🇬🇧</span>
            <span className="font-poppins font-semibold text-sm">
              {t("languageSelection.english", "English")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => chooseLanguage("ar")}
            data-testid="button-lang-ar"
            className={`${langCardBase} ${lang === "ar" ? selected : unselected}`}
          >
            <span className="text-2xl">🇸🇦</span>
            <span className="font-poppins font-semibold text-sm">
              {t("languageSelection.arabic", "Arabic")}
            </span>
          </button>
        </div>

        {/* Notification opt-in card */}
        <div className="flex w-full flex-col gap-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131A24] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#0A5ED7] to-[#0BB3FF] text-white shadow-[0_4px_10px_rgba(10,94,215,0.25)]">
              <Bell size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 font-poppins text-sm font-bold text-[#0B1F3B] dark:text-white">
                {t("languageSelection.stay", "Stay in the loop")}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#64748B] dark:text-gray-400">
                {t(
                  "languageSelection.stayDesc",
                  "Turn on notifications to receive news, appointment reminders and job updates.",
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleNotif}
            data-testid="button-toggle-notifications"
            aria-pressed={notif}
            className={`flex w-full items-center justify-between gap-3 rounded-[10px] border px-3.5 py-3 font-poppins text-[13.5px] font-semibold transition-all duration-150 ${
              notif
                ? "border-[#0A5ED7] bg-[#EFF4FD] dark:bg-[#10233D] text-[#0A5ED7]"
                : "border-[#E2E8F0] dark:border-[#1E293B] bg-[#F1F5F9] dark:bg-[#0E1117] text-[#334155] dark:text-gray-200"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${
                  notif ? "bg-[#0A5ED7]" : "bg-[#94A3B8]"
                }`}
              />
              <span>
                {t("languageSelection.enable", "Enable notifications")}
              </span>
            </span>
            <span
              className={`relative h-[22px] w-[38px] flex-shrink-0 rounded-full transition-colors duration-150 ${
                notif ? "bg-[#0A5ED7]" : "bg-[#CBD5E1]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-150 ${
                  isRTL
                    ? notif
                      ? "right-0.5"
                      : "right-[18px]"
                    : notif
                      ? "left-[18px]"
                      : "left-0.5"
                }`}
              />
            </span>
          </button>

          <p className="m-0 text-center text-[11px] text-[#64748B] dark:text-gray-400">
            {t(
              "languageSelection.later",
              "You can change this later in Settings.",
            )}
          </p>
        </div>

        {/* Continue */}
        <button
          type="button"
          onClick={handleContinue}
          data-testid="button-continue"
          className="box-border flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] font-poppins text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(10,94,215,0.25)]"
        >
          {t("languageSelection.continue", "Continue")}
        </button>
      </div>
    </div>
  );
}
