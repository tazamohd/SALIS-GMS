import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { MapPin, Check } from "lucide-react";
import logoImage from "@assets/Logo_blue_orange_1760743036292.png";

/**
 * First-run region selection (design: RegionSelection.dc.html).
 * Second step of the onboarding chain: Language -> Region -> Login.
 * Persists the choice to localStorage `salis-region`.
 */

const REGION_KEY = "salis-region";
const CITIES = ["Riyadh", "Jeddah", "Dammam", "Makkah", "Madinah"];

export default function RegionSelection() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const isRTL = (i18n.language || "en").split("-")[0] === "ar";

  const [picked, setPicked] = useState<string>(
    () => localStorage.getItem(REGION_KEY) || "Riyadh",
  );

  const choose = (city: string) => {
    localStorage.setItem(REGION_KEY, city);
    setPicked(city);
  };

  const handleContinue = () => {
    localStorage.setItem("salis-onboarding-done", "1");
    setLocation("/login");
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="page-region-selection"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F8FAFC] dark:bg-[#0E1117] font-sans"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 h-[700px] w-[700px] rounded-full blur-[64px] bg-[radial-gradient(circle,rgba(11,179,255,0.10),transparent_65%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[420px] flex-col gap-5 p-4 animate-[fadeUp_0.3s_ease]">
        <div className="text-center">
          <img
            src={logoImage}
            alt={t("app.name", "SALIS AUTO")}
            className="mx-auto w-[100px] h-auto"
            data-testid="logo-salis-auto"
          />
          <h1 className="mt-3 text-[20px] font-montserrat font-extrabold text-[#0B1F3B] dark:text-white">
            {t("regionSelection.selectRegion", "Select your region")}
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          {CITIES.map((city) => {
            const on = picked === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => choose(city)}
                data-testid={`button-region-${city.toLowerCase()}`}
                className={`box-border flex h-12 w-full items-center gap-2.5 rounded-lg px-4 font-poppins text-sm font-medium transition-all duration-150 ${
                  on
                    ? "border-[1.5px] border-[#0A5ED7] bg-[rgba(10,94,215,0.06)] text-[#0A5ED7]"
                    : "border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131A24] text-[#334155] dark:text-gray-200"
                }`}
              >
                <MapPin size={16} />
                <span>{t(`regionSelection.cities.${city}`, city)}</span>
                <span className="flex-1" />
                {on && <Check size={16} />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          data-testid="button-continue"
          className="box-border flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] font-poppins text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(10,94,215,0.25)]"
        >
          {t("regionSelection.continue", "Continue")}
        </button>
      </div>
    </div>
  );
}
