export const LOCALES = {
  en: "en_US",
  de: "de_DE",
} as const;

export type LocaleCode = keyof typeof LOCALES;
export type LocaleFile = (typeof LOCALES)[LocaleCode];

export const DEFAULT_LOCALE_CODE: LocaleCode = "en";
export const DEFAULT_LOCALE_FILE: LocaleFile = LOCALES[DEFAULT_LOCALE_CODE];

export function isLocaleCode(value: string): value is LocaleCode {
  return value in LOCALES;
}

export function resolveLocaleCode(value: string | null | undefined): LocaleCode {
  if (!value) {
    return DEFAULT_LOCALE_CODE;
  }

  return isLocaleCode(value) ? value : DEFAULT_LOCALE_CODE;
}

export function resolveLocaleFile(value: string | null | undefined): LocaleFile {
  return LOCALES[resolveLocaleCode(value)];
}
