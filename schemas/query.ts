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
