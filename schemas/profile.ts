import { z } from "zod";

// 3-30 chars, lowercase letters/numbers/dashes, no dash at the start or end.
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export const profileInputSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name can be at most 60 characters"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      USERNAME_PATTERN,
      "Use 3-30 lowercase letters, numbers or dashes (no dash at the start or end)",
    ),
  bio: z.string().trim().max(280, "Bio can be at most 280 characters"),
  skills: z
    .array(z.string().trim().min(1).max(30, "Each skill can be at most 30 characters"))
    .max(10, "Add up to 10 skills")
    .transform((skills) => Array.from(new Set(skills))),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
