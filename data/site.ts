// The site's content lives in content/*.json, edited through the editor at /keystatic.
// This file turns those files into the shapes the components use.
import profileData from "@/content/profile.json";
import projectsData from "@/content/projects.json";
import experienceData from "@/content/experience.json";
import skillsData from "@/content/skills.json";

type Link = { label: string; href: string };

type ProjectEntry = {
  title: string;
  featured: boolean;
  category: string;
  year: string;
  blurb: string;
  summary: string;
  tags: string[];
  uses: string[];
  links: Link[];
  image: string | null;
  imageAlt: string;
  imageLabel: string;
};

export type Project = {
  ref: string;
  title: string;
  category: string;
  year: string;
  blurb: string;
  summary: string;
  tags: string[];
  uses: string[];
  links?: Link[];
  image?: { src: string; alt: string };
  imageLabel?: string;
};

export type ArchiveProject = {
  year: string;
  title: string;
  summary: string;
  tags: string[];
  link?: Link;
};

export type Role = {
  title: string;
  org: string;
  place: string;
  dates: string;
  points: string[];
};

// URL-safe id for a project, used for in-page links like #work-skapta
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const profile = {
  firstName: profileData.firstName,
  lastName: profileData.lastName,
  role: profileData.role,
  heroLine: profileData.heroLine,
  facts: profileData.facts,
  email: profileData.email,
  github: profileData.github,
  linkedin: profileData.linkedin,
  // Empty fields are left out of the file by the editor, so the resume may be missing
  resume: (profileData as { resume?: string | null }).resume || "/resume.pdf",
  // The animated signature (see public/signature.svg); not edited through the editor
  signature: "/signature.svg",
};

export const about: string[] = profileData.about
  .split(/\n\s*\n/)
  .map(paragraph => paragraph.trim())
  .filter(Boolean);

const entries = projectsData.items as ProjectEntry[];

export const projects: Project[] = entries
  .filter(entry => entry.featured)
  .map(entry => ({
    ref: slug(entry.title),
    title: entry.title,
    category: entry.category,
    year: entry.year,
    blurb: entry.blurb,
    summary: entry.summary,
    tags: entry.tags,
    uses: entry.uses,
    links: entry.links.length ? entry.links : undefined,
    image: entry.image ? { src: entry.image, alt: entry.imageAlt || `Screenshot of ${entry.title}` } : undefined,
    imageLabel: entry.imageLabel || undefined,
  }));

export const archive: ArchiveProject[] = entries
  .filter(entry => !entry.featured)
  .map(entry => ({
    year: entry.year,
    title: entry.title,
    summary: entry.blurb,
    tags: entry.tags,
    link: entry.links[0],
  }));

export const experience: Role[] = experienceData.items;

export const skills: { group: string; items: string[] }[] = skillsData.groups;
