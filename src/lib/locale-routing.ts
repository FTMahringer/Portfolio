import { DEFAULT_LOCALE_CODE, isLocaleCode, type LocaleCode } from "./locale-registry";

function stripTrailingSlash(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function splitPath(pathname: string): string[] {
  return stripTrailingSlash(pathname)
    .split("/")
    .filter(Boolean);
}

function isLocaleLikeSegment(segment: string | undefined): boolean {
  return typeof segment === "string" && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segment);
}

export function isSupportedLocaleCode(value: string | null | undefined): value is LocaleCode {
  return typeof value === "string" && isLocaleCode(value);
}

export function getLocaleFromPath(pathname: string): LocaleCode | null {
  const [first] = splitPath(pathname);
  return isSupportedLocaleCode(first) ? first : null;
}

export function stripLocaleFromPath(pathname: string): string {
  const segments = splitPath(pathname);
  if (!segments.length) {
    return "/";
  }

  if (isSupportedLocaleCode(segments[0])) {
    const nextPath = `/${segments.slice(1).join("/")}`;
    return nextPath === "/" ? "/" : nextPath;
  }

  return stripTrailingSlash(pathname);
}

export function buildLocalePath(locale: LocaleCode, pathname: string): string {
  const normalized = stripTrailingSlash(pathname);
  if (normalized === "/") {
    return `/${locale}`;
  }

  const segments = splitPath(normalized);
  if (isSupportedLocaleCode(segments[0])) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  if (isLocaleLikeSegment(segments[0])) {
    segments.shift();
    return segments.length > 0 ? `/${locale}/${segments.join("/")}` : `/${locale}`;
  }

  return `/${locale}${normalized}`;
}

export function normalizeLocalePath(pathname: string, locale: LocaleCode = DEFAULT_LOCALE_CODE): string | null {
  const normalized = stripTrailingSlash(pathname);

  if (normalized === "/") {
    return `/${locale}`;
  }

  if (normalized.startsWith("/api/")) {
    return null;
  }

  const segments = splitPath(normalized);
  const [first] = segments;

  if (isSupportedLocaleCode(first)) {
    return null;
  }

  if (isLocaleLikeSegment(first)) {
    segments.shift();
    return segments.length > 0 ? `/${locale}/${segments.join("/")}` : `/${locale}`;
  }

  return `/${locale}${normalized}`;
}

export function localeForPath(pathname: string): LocaleCode {
  return getLocaleFromPath(pathname) ?? DEFAULT_LOCALE_CODE;
}
