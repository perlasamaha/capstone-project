"use client";

// Client Component: asks for confirmation (window.confirm) and calls the API.
// Hiding this button from non-owners is only UX — DELETE /api/posts/:id checks
// ownership on the server again.
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/client-api";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("Delete this post? Its comments will be deleted too.")) return;

    setPending(true);
    setError(null);
    const result = await apiRequest(`/api/posts/${postId}`, { method: "DELETE" });

    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="danger" onClick={handleDelete} disabled={pending}>
        <Trash2 aria-hidden />
        {pending ? "Deleting…" : "Delete"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
