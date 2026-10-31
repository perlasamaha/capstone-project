import { z } from "zod";

// "?search=" (empty input) should behave like no search at all.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const page = z.coerce.number().int().min(1).max(1000).default(1);

export const postQuerySchema = z.object({
  search: optionalText(100),
  community: optionalText(60),
  topic: optionalText(40),
  author: optionalText(30),
  page,
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const communityQuerySchema = z.object({
  search: optionalText(60),
  page,
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type PostQuery = z.infer<typeof postQuerySchema>;
export type CommunityQuery = z.infer<typeof communityQuerySchema>;

/**
 * For pages: drop the params that are invalid (so they fall back to their
 * defaults) instead of ignoring the whole URL. `/blogs?search=react&page=0`
 * still searches for "react". The API is strict and answers 400 instead.
 */
export function parseLenient<T extends z.ZodType>(schema: T, input: Record<string, string>): z.output<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const invalid = new Set(result.error.issues.map((issue) => String(issue.path[0])));
  const valid = Object.fromEntries(Object.entries(input).filter(([key]) => !invalid.has(key)));
  return schema.parse(valid);
}

type RawParams = Record<string, string | string[] | undefined>;

/** Next gives repeated params as arrays; for our filters the first value wins. */
export function firstValues(params: RawParams) {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) result[key] = first;
  }
  return result;
}
