export type GuideBlockKind = "paragraph" | "list" | "steps" | "code" | "callout";

export interface GuideBlock {
  kind: GuideBlockKind;
  text?: string;
  items?: string[];
  code?: string;
  title?: string;
}

export interface GuideSection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  keywords: string[];
  sections: GuideSection[];
  relatedGuideSlugs: string[];
  relatedLessonIds: string[];
  howTo?: boolean;
}
