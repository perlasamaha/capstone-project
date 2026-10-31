"use client";

// Client Component: form state and validation feedback, plus refreshing the
// session afterwards so the header shows the new name/username right away.
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form";
import { apiRequest } from "@/lib/client-api";
import type { FieldErrors } from "@/lib/errors";
import { profileInputSchema } from "@/schemas/profile";
import type { Profile } from "@/types";

function splitSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setFormError(null);

    const parsed = profileInputSchema.safeParse({
      name,
      username,
      bio,
      skills: splitSkills(skills),
    });
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }

    setErrors({});
    setPending(true);
    const result = await apiRequest("/api/me", { method: "PATCH", body: parsed.data });

    if (!result.ok) {
      setPending(false);
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error);
      return;
    }

    // Ask Auth.js to rebuild the session token from the database.
    await update();
    setPending(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <FormAlert>{formError}</FormAlert>}

      <Field label="Name" htmlFor="name" error={errors.name?.[0]}>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
      </Field>

      <Field
        label="Username"
        htmlFor="username"
        error={errors.username?.[0]}
        hint={`Your profile lives at /profile/${username || "your-username"}`}
      >
        <Input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          maxLength={30}
          autoComplete="username"
          aria-invalid={Boolean(errors.username)}
          aria-describedby={errors.username ? "username-error" : undefined}
        />
      </Field>

      <Field
        label="Bio"
        htmlFor="bio"
        error={errors.bio?.[0]}
        hint={`${bio.length}/280 characters`}
      >
        <Textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          maxLength={280}
          placeholder="What do you work on? What are you learning?"
          aria-invalid={Boolean(errors.bio)}
          aria-describedby={errors.bio ? "bio-error" : undefined}
        />
      </Field>

      <Field
        label="Skills"
        htmlFor="skills"
        error={errors.skills?.[0]}
        hint="Separate with commas, e.g. React, TypeScript, MongoDB"
      >
        <Input
          id="skills"
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
          aria-invalid={Boolean(errors.skills)}
          aria-describedby={errors.skills ? "skills-error" : undefined}
        />
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        {saved && (
          <p role="status" className="text-sm text-emerald-300">
            Profile saved
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
