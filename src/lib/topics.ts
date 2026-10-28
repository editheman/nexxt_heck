import { TOPICS, type TopicId } from "@/content/topics";

/** Module slugs for the chosen interests, in the user's order, without duplicates. */
export function recommendedModules(interests: readonly string[]): string[] {
  const out: string[] = [];
  for (const id of interests) {
    const slug = TOPICS.find((t) => t.id === (id as TopicId))?.moduleSlug;
    if (slug && !out.includes(slug)) out.push(slug);
  }
  return out;
}
