"use client";

// Client Component: controlled inputs, topic chips that change with the
// selected community, and validation feedback before anything is sent.
// The same Zod schema runs again in the Route Handler — this copy is for UX.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form";
import { apiRequest } from "@/lib/client-api";
import type { FieldErrors } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { postInputSchema } from "@/schemas/post";
import type { CommunityOption, PostDetail, PostStatus } from "@/types";

const MAX_TOPICS = 5;

type SaveResponse = { post: { id: string; slug: string; status: PostStatus } };

export function PostForm({
  communities,
  post,
}: {
  communities: CommunityOption[];
  /** Pass a post to edit it, leave empty to create a new one. */
  post?: PostDetail;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [communityId, setCommunityId] = useState(post?.community.id ?? "");
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [content, setContent] = useState(post?.content ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<PostStatus | null>(null);

  const topics = communities.find((c) => c.id === communityId)?.topics ?? [];
  const isPublished = post?.status === "published";

  function changeCommunity(id: string) {
    setCommunityId(id);
    // Topics belong to a community, so drop the ones the new one doesn't have.
    const available = communities.find((c) => c.id === id)?.topics ?? [];
    setTags((current) => current.filter((tag) => available.includes(tag)));
  }

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  }

  async function save(status: PostStatus) {
    setFormError(null);

    const parsed = postInputSchema.safeParse({ title, content, communityId, tags, status });
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }

    setErrors({});
    setSaving(status);

    const result = post
      ? await apiRequest<SaveResponse>(`/api/posts/${post.id}`, {
          method: "PATCH",
          body: parsed.data,
        })
      : await apiRequest<SaveResponse>("/api/posts", { method: "POST", body: parsed.data });

    if (!result.ok) {
      setSaving(null);
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
      return;
    }

    const saved = result.data.post;
    router.push(saved.status === "published" ? `/blogs/${saved.slug}` : "/dashboard");
    router.refresh();
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // Pressing Enter in the title saves without changing the status, so
        // a draft is never published by accident. Publishing is always an
        // explicit click on the button below.
        event.preventDefault();
        save(post?.status ?? "draft");
      }}
      className="space-y-6"
    >
      {formError && <FormAlert>{formError}</FormAlert>}

      <Field label="Title" htmlFor="title" error={errors.title?.[0]}>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What did you learn?"
          maxLength={120}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
      </Field>

      <Field
        label="Community"
        htmlFor="communityId"
        error={errors.communityId?.[0]}
        hint="Your post will be published in this community."
      >
        <Select
          id="communityId"
          value={communityId}
          onChange={(event) => changeCommunity(event.target.value)}
          aria-invalid={Boolean(errors.communityId)}
          aria-describedby={errors.communityId ? "communityId-error" : undefined}
        >
          <option value="">Choose a community</option>
          {communities.map((community) => (
            <option key={community.id} value={community.id}>
              {community.name}
            </option>
          ))}
        </Select>
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Topics</legend>
        {topics.length === 0 ? (
          <p className="text-xs text-muted">Choose a community to see its topics.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => {
              const selected = tags.includes(topic);
              const disabled = !selected && tags.length >= MAX_TOPICS;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTag(topic)}
                  disabled={disabled}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs transition-colors disabled:opacity-40",
                    selected
                      ? "border-accent/50 bg-accent/15 text-link"
                      : "border-line bg-surface-2 text-muted hover:text-fg",
                  )}
                >
                  #{topic}
                </button>
              );
            })}
          </div>
        )}
        {errors.tags ? (
          <p className="text-xs text-danger">{errors.tags[0]}</p>
        ) : (
          topics.length > 0 && (
            <p className="text-xs text-muted">Optional, up to {MAX_TOPICS}.</p>
          )
        )}
      </fieldset>

      <Field
        label="Content"
        htmlFor="content"
        error={errors.content?.[0]}
        hint="Markdown works: ## headings, **bold**, lists, links, `inline code` and ``` code blocks."
      >
        <Textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={18}
          className="font-mono text-[13px]"
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? "content-error" : undefined}
        />
      </Field>

      <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-6">
        <Button variant="secondary" onClick={() => save("draft")} disabled={saving !== null}>
          {saving === "draft" ? "Saving…" : isPublished ? "Move to drafts" : "Save draft"}
        </Button>
        <Button onClick={() => save("published")} disabled={saving !== null}>
          {saving === "published" ? "Publishing…" : isPublished ? "Update post" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
