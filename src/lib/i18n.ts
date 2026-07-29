import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { load as loadYaml } from "js-yaml";

import {
  DEFAULT_LOCALE_FILE,
  resolveLocaleFile,
  type LocaleFile,
} from "./locale-registry";
import { flattenTranslations } from "./flatten-translations";
import type { TranslationMap } from "./translation-types";



const LANG_DIRECTORY = join(process.cwd(), "config", "lang");
const translationFileCache = new Map<LocaleFile, Promise<TranslationMap>>();

function translationFilePath(localeFile: LocaleFile): string {
  return join(LANG_DIRECTORY, `${localeFile}.yaml`);
}

async function readLocaleFile(localeFile: LocaleFile): Promise<TranslationMap> {
  const filePath = translationFilePath(localeFile);
  const raw = await readFile(filePath, "utf8");
  const parsed = loadYaml(raw);

  if (typeof parsed !== "object" || parsed === null) {
    return {};
  }

  return flattenTranslations(parsed);
}

async function loadLocaleFile(localeFile: LocaleFile): Promise<TranslationMap> {
  const cached = translationFileCache.get(localeFile);
  if (cached) {
    return cached;
  }

  const loader = readLocaleFile(localeFile).catch((error: unknown) => {
    if (localeFile === DEFAULT_LOCALE_FILE) {
      throw error;
    }

    return {};
  });

  translationFileCache.set(localeFile, loader);
  return loader;
}

export async function getTranslations(locale: string | null | undefined): Promise<TranslationMap> {
  const localeFile = resolveLocaleFile(locale);

  if (localeFile === DEFAULT_LOCALE_FILE) {
    return loadLocaleFile(DEFAULT_LOCALE_FILE);
  }

  const [defaultTranslations, localizedTranslations] = await Promise.all([
    loadLocaleFile(DEFAULT_LOCALE_FILE),
    loadLocaleFile(localeFile),
  ]);

  return {
    ...defaultTranslations,
    ...localizedTranslations,
  };
}

export async function t(
  locale: string | null | undefined,
  key: string,
  fallback = key,
): Promise<string> {
  const translations = await getTranslations(locale);
  const value = translations[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

export { LOCALES } from "./locale-registry";
export type { LocaleCode, LocaleFile } from "./locale-registry";
