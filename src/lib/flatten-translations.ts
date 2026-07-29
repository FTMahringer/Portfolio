type TranslationRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is TranslationRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function flattenTranslations(
  input: unknown,
  prefix = "",
  output: TranslationRecord = {},
): TranslationRecord {
  if (!isPlainObject(input)) {
    if (prefix) {
      output[prefix] = input;
    }

    return output;
  }

  for (const [key, value] of Object.entries(input)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      flattenTranslations(value, nextKey, output);
      continue;
    }

    output[nextKey] = value;
  }

  return output;
}
