export const SUPPORTED_LOCALES = ["en", "pl", "de", "es"] as const;
export const DEV_MODE = "dev";

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleOrDev = SupportedLocale | typeof DEV_MODE;


export function getLocaleFromPath(): LocaleOrDev {
  const localeSegment = globalThis.location.pathname.split("/").find(Boolean);

  if (localeSegment === DEV_MODE) {
    return DEV_MODE;
  }

  if (SUPPORTED_LOCALES.includes(localeSegment as SupportedLocale)) {
    return localeSegment as SupportedLocale;
  }

  return "en";
}


export function isDevMode(): boolean {
  return getLocaleFromPath() === DEV_MODE;
}
