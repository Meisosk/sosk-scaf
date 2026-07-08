type PageViewRow = {
  path: string;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
};

export function groupViewsByDay(views: PageViewRow[]) {
  const counts: Record<string, number> = {};

  for (const view of views) {
    const day = new Date(view.created_at).toISOString().slice(0, 10);
    counts[day] = (counts[day] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
