import { z } from "zod";

// Shared by the post form (instant feedback) and the API (the real check).
// strictObject rejects unknown keys, so a request can't sneak in fields like
// `author` or `slug` that the server is supposed to decide.
export const postInputSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title can be at most 120 characters"),
  content: z
    .string()
    .trim()
    .min(30, "Write a little more — at least 30 characters")
    .max(20000, "Content can be at most 20,000 characters"),
  communityId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a community"),
  // Whether each tag belongs to the chosen community is checked on the
  // server, because that needs the database.
  tags: z
    .array(z.string().trim().toLowerCase().max(40))
    .max(5, "Choose up to 5 topics"),
  status: z.enum(["draft", "published"]),
});

export const postUpdateSchema = postInputSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Nothing to update");

export type PostInput = z.infer<typeof postInputSchema>;
export type PostUpdate = z.infer<typeof postUpdateSchema>;
