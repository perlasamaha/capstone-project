import { z } from "zod";

export const commentInputSchema = z.strictObject({
  body: z
    .string()
    .trim()
    .min(2, "Comment is too short")
    .max(2000, "Comment can be at most 2000 characters"),
});

export type CommentInput = z.infer<typeof commentInputSchema>;
