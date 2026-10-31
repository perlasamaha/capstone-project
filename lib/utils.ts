export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(value: string | Date) {
  return dateFormatter.format(new Date(value));
}

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});

export function formatMonth(value: string | Date) {
  return monthFormatter.format(new Date(value));
}

export function pluralize(count: number, word: string, plural = `${word}s`) {
  return `${count.toLocaleString("en")} ${count === 1 ? word : plural}`;
}

/** Builds a URL that keeps the current filters and overrides a few of them. */
export function withParams(
  pathname: string,
  current: Record<string, string | number | undefined>,
  changes: Record<string, string | number | undefined> = {},
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...changes })) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
