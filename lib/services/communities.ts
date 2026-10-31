import "server-only";
import { cache } from "react";
import type { Types } from "mongoose";
import { connectDB, isDuplicateKeyError } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import {
  AUTHOR_FIELDS,
  toAuthor,
  toCommunityCard,
  type LeanAuthor,
  type LeanCommunity,
} from "@/lib/mappers";
import { Community } from "@/models/Community";
import { Membership } from "@/models/Membership";
import type { CommunityQuery } from "@/schemas/query";
import type { Author, CommunityCard, CommunityOption, Paginated } from "@/types";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listCommunities({
  search,
  page,
  limit,
}: CommunityQuery): Promise<Paginated<CommunityCard>> {
  await connectDB();

  // Communities are a small curated collection, so a case-insensitive regex
  // is cheap here and gives partial matches ("lara" finds Laravel). Posts use
  // a text index instead because that collection keeps growing.
  const pattern = search ? new RegExp(escapeRegex(search), "i") : null;
  const filter = pattern
    ? { $or: [{ name: pattern }, { description: pattern }, { topics: pattern }] }
    : {};

  const [docs, total] = await Promise.all([
    Community.find(filter)
      .sort({ memberCount: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<LeanCommunity[]>(),
    Community.countDocuments(filter),
  ]);

  return {
    items: docs.map(toCommunityCard),
    page,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getFeaturedCommunities(limit: number) {
  await connectDB();
  const docs = await Community.find()
    .sort({ memberCount: -1, name: 1 })
    .limit(limit)
    .lean<LeanCommunity[]>();
  return docs.map(toCommunityCard);
}

// cache() dedupes the call between generateMetadata and the page itself
// within a single render.
export const getCommunityBySlug = cache(async (slug: string) => {
  await connectDB();
  const doc = await Community.findOne({ slug }).lean<LeanCommunity>();
  return doc ? toCommunityCard(doc) : null;
});

export async function getCommunitySlugs() {
  await connectDB();
  const docs = await Community.find().select("slug").lean<{ slug: string }[]>();
  return docs.map((doc) => doc.slug);
}

export async function getCommunityOptions(): Promise<CommunityOption[]> {
  await connectDB();
  const docs = await Community.find()
    .sort({ name: 1 })
    .select("name slug topics")
    .lean<LeanCommunity[]>();
  return docs.map(({ _id, slug, name, topics }) => ({
    id: _id.toString(),
    slug,
    name,
    topics,
  }));
}

export async function getRecentMembers(communityId: string, limit: number) {
  await connectDB();
  const docs = await Membership.find({ community: communityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", AUTHOR_FIELDS)
    .lean<{ user: LeanAuthor | null }[]>();
  return docs.flatMap((doc): Author[] => (doc.user ? [toAuthor(doc.user)] : []));
}

export async function getUserCommunities(userId: string) {
  await connectDB();
  const docs = await Membership.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("community")
    .lean<{ community: LeanCommunity | null }[]>();
  return docs.flatMap((doc): CommunityCard[] =>
    doc.community ? [toCommunityCard(doc.community)] : [],
  );
}

async function findCommunityId(slug: string) {
  const community = await Community.findOne({ slug })
    .select("_id")
    .lean<{ _id: Types.ObjectId }>();
  if (!community) throw new HttpError(404, "Community not found");
  return community._id;
}

export async function isMember(userId: string, slug: string) {
  await connectDB();
  const communityId = await findCommunityId(slug);
  return Boolean(await Membership.exists({ user: userId, community: communityId }));
}

export async function joinCommunity(userId: string, slug: string) {
  await connectDB();
  const communityId = await findCommunityId(slug);

  try {
    await Membership.create({ user: userId, community: communityId });
  } catch (error) {
    // The unique index says we're already a member. Joining twice is fine,
    // it just must not bump the counter again.
    if (isDuplicateKeyError(error)) return { created: false };
    throw error;
  }

  await Community.updateOne({ _id: communityId }, { $inc: { memberCount: 1 } });
  return { created: true };
}

export async function leaveCommunity(userId: string, slug: string) {
  await connectDB();
  const communityId = await findCommunityId(slug);

  const { deletedCount } = await Membership.deleteOne({
    user: userId,
    community: communityId,
  });
  if (deletedCount > 0) {
    await Community.updateOne(
      { _id: communityId, memberCount: { $gt: 0 } },
      { $inc: { memberCount: -1 } },
    );
  }
}

export async function getAllTopics() {
  await connectDB();
  const topics: string[] = await Community.distinct("topics");
  return topics.sort();
}
