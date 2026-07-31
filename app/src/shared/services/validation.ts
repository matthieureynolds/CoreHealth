import type { ZodType } from "zod";
import { logger } from "../utils/logger";

/**
 * Validation at the network boundary.
 *
 * Service code used to write `const data: SomeResponse = await res.json()`,
 * which is a cast, not a check — TypeScript believes it and the runtime does
 * not. When a provider changes a field, the failure surfaces far away as an
 * undefined property or a NaN in the UI, with nothing pointing back at the
 * response that caused it.
 *
 * `parseOrNull` turns that into a contained, logged null at the point of entry.
 * Callers already handle null from these services (they return null on HTTP
 * errors today), so adopting it needs no change at the call site.
 */
export function parseOrNull<T>(
  schema: ZodType<T>,
  data: unknown,
  context: string,
): T | null {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  // Only the first few issues: a wholesale shape change produces hundreds and
  // the first ones identify it just as well.
  const issues = result.error.issues.slice(0, 3).map((i) => {
    const path = i.path.length ? i.path.join(".") : "(root)";
    return `${path}: ${i.message}`;
  });
  logger.warn(
    `${context}: unexpected API response shape — ${issues.join("; ")}`,
  );
  return null;
}
