import "server-only";
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { connectDB, isDuplicateKeyError } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { AUTHOR_FIELDS, toAuthor, toProfile, type LeanAuthor, type LeanProfile } from "@/lib/mappers";
import { slugify } from "@/lib/text";
import { User } from "@/models/User";
import type { ProfileInput } from "@/schemas/profile";

const PROFILE_FIELDS = `${AUTHOR_FIELDS} bio skills createdAt`;

type OAuthIdentity = {
  provider: "github" | "google";
  providerAccountId: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  /** GitHub login or the email name, used to suggest a username. */
  usernameHint?: string | null;
};

async function generateUsername(hint: string) {
  const base = slugify(hint).slice(0, 24).replace(/-+$/, "") || "developer";
  const start = base.length >= 3 ? base : `${base}-dev`;

  let candidate = start;
  while (await User.exists({ username: candidate })) {
    candidate = `${start}-${randomBytes(2).toString("hex")}`;
  }
  return candidate;
}

/**
 * Called by Auth.js after a successful OAuth sign-in. The first sign-in
 * creates the user; later ones just look it up. Profile fields the user may
 * have edited since are not overwritten with the provider's values.
 */
export async function findOrCreateOAuthUser(identity: OAuthIdentity) {
  await connectDB();

  const existing = await User.findOne({
    provider: identity.provider,
    providerAccountId: identity.providerAccountId,
  })
    .select(AUTHOR_FIELDS)
    .lean<LeanAuthor>();

  if (existing) return toAuthor(existing);

  const username = await generateUsername(
    identity.usernameHint || identity.email?.split("@")[0] || identity.name || "",
  );

  const user = await User.create({
    provider: identity.provider,
    providerAccountId: identity.providerAccountId,
    email: identity.email ?? undefined,
    image: identity.image ?? undefined,
    name: identity.name?.trim().slice(0, 60) || username,
    username,
  });

  return toAuthor(user);
}

/** Fresh values for the session token after the user edits their profile. */
export async function getSessionFields(userId: string) {
  await connectDB();
  const user = await User.findById(userId).select(AUTHOR_FIELDS).lean<LeanAuthor>();
  return user ? toAuthor(user) : null;
}

export const getProfileByUsername = cache(async (username: string) => {
  await connectDB();
  const user = await User.findOne({ username: username.toLowerCase() })
    .select(PROFILE_FIELDS)
    .lean<LeanProfile>();
  return user ? toProfile(user) : null;
});

export async function getProfileById(userId: string) {
  await connectDB();
  const user = await User.findById(userId).select(PROFILE_FIELDS).lean<LeanProfile>();
  return user ? toProfile(user) : null;
}

export async function getNewestDevelopers(limit: number) {
  await connectDB();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(AUTHOR_FIELDS)
    .lean<LeanAuthor[]>();
  return users.map(toAuthor);
}

export async function updateProfile(userId: string, input: ProfileInput) {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");

  const taken = { username: ["That username is already taken"] };
  if (input.username !== user.username && (await User.exists({ username: input.username }))) {
    throw new HttpError(409, "That username is already taken", taken);
  }

  // `input` has been through profileInputSchema, so it only contains the
  // editable fields. Identity fields (provider, email...) can't be touched.
  user.set(input);

  try {
    await user.save();
  } catch (error) {
    // Someone grabbed the same username between our check and the save.
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, "That username is already taken", taken);
    }
    throw error;
  }

  return toAuthor(user);
}
