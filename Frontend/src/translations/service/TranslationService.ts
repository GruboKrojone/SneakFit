export const SUPPORTED_LOCALES = ["en", "pl", "de", "es"] as const;
export const DEV_MODE = "dev";

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleOrDev = SupportedLocale | typeof DEV_MODE;

/**
 * Extracts the locale from the URL pathname
 * Expected format: /locale/path
 */
export function getLocaleFromPath(): LocaleOrDev {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const localeSegment = pathSegments[0];

  if (localeSegment === DEV_MODE) {
    return DEV_MODE;
  }

  if (SUPPORTED_LOCALES.includes(localeSegment as SupportedLocale)) {
    return localeSegment as SupportedLocale;
  }

  return "en";
}

/**
 * Checks if the current mode is developer mode
 */
export function isDevMode(): boolean {
  return getLocaleFromPath() === DEV_MODE;
}
