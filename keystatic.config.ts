import { config, fields, singleton } from "@keystatic/core";

// The site's editor, at /keystatic. It only runs on localhost (npm run dev) and edits the files in
// content/ directly; on the live site it doesn't exist. Commit and push to publish changes.
export default config({
  storage: { kind: "local" },

  ui: {
    brand: { name: "Gabriel's site" },
    navigation: ["profile", "projects", "experience", "skills"],
  },

  singletons: {
    profile: singleton({
      label: "Profile & About",
      path: "content/profile",
      format: { data: "json" },
      schema: {
        firstName: fields.text({ label: "First name" }),
        lastName: fields.text({ label: "Last name" }),
        role: fields.text({ label: "Role", description: "The big line in the hero, e.g. Software Engineer" }),
        heroLine: fields.text({
          label: "Hero sentence",
          description: "One sentence under your role at the top of the page",
          multiline: true,
        }),
        facts: fields.array(fields.text({ label: "Fact" }), {
          label: "Quick facts",
          description: "Short facts like school and location",
          itemLabel: props => props.value || "New fact",
        }),
        email: fields.text({ label: "Email" }),
        github: fields.url({ label: "GitHub URL" }),
        linkedin: fields.url({ label: "LinkedIn URL" }),
        resume: fields.file({
          label: "Resume (PDF)",
          description: "Upload your resume; the Resume buttons link to it",
          directory: "public/files",
          publicPath: "/files/",
        }),
        about: fields.text({
          label: "About",
          description: "Your bio. Leave a blank line between paragraphs.",
          multiline: true,
        }),
      },
    }),

    projects: singleton({
      label: "Projects",
      path: "content/projects",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: "Title", validation: { isRequired: true } }),
            featured: fields.checkbox({
              label: "Featured",
              description: "On: a big section with a screenshot. Off: a row in the “More projects” list.",
              defaultValue: true,
            }),
            category: fields.text({ label: "Category", description: "e.g. AI tooling, Internship, Infrastructure" }),
            year: fields.text({ label: "Year", description: "e.g. 2026, or 2025– for ongoing" }),
            blurb: fields.text({ label: "One-line description", multiline: true }),
            summary: fields.text({ label: "Longer description (optional)", multiline: true }),
            tags: fields.array(fields.text({ label: "Tag" }), {
              label: "Stack tags",
              description: "Shown on the project, e.g. Python, React",
              itemLabel: props => props.value || "New tag",
            }),
            uses: fields.array(fields.text({ label: "Skill" }), {
              label: "Skills used",
              description: "Must match names in Skills exactly; powers the light-up effect in the Skills section",
              itemLabel: props => props.value || "New skill",
            }),
            links: fields.array(
              fields.object({
                label: fields.text({ label: "Label", description: "e.g. GitHub, Live site" }),
                href: fields.url({ label: "URL" }),
              }),
              { label: "Links", itemLabel: props => props.fields.label.value || "New link" }
            ),
            image: fields.image({
              label: "Screenshot",
              directory: "public/images/projects",
              publicPath: "/images/projects/",
            }),
            imageAlt: fields.text({ label: "Screenshot description", description: "What the screenshot shows, for screen readers" }),
            imageLabel: fields.text({ label: "Placeholder text", description: "Shown until you add a screenshot" }),
          }),
          {
            label: "Projects",
            description: "Drag to reorder. The first featured project appears first on the page.",
            itemLabel: props =>
              `${props.fields.title.value || "New project"}${props.fields.featured.value ? "" : " (more projects list)"}`,
          }
        ),
      },
    }),

    experience: singleton({
      label: "Experience",
      path: "content/experience",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: "Role title" }),
            org: fields.text({ label: "Organization" }),
            place: fields.text({ label: "Location" }),
            dates: fields.text({ label: "Dates", description: "e.g. Jul – Aug 2026" }),
            points: fields.array(fields.text({ label: "Point", multiline: true }), {
              label: "What you did",
              itemLabel: props => props.value?.slice(0, 60) || "New point",
            }),
          }),
          { label: "Roles", description: "Most recent first", itemLabel: props => props.fields.title.value || "New role" }
        ),
      },
    }),

    skills: singleton({
      label: "Skills",
      path: "content/skills",
      format: { data: "json" },
      schema: {
        groups: fields.array(
          fields.object({
            group: fields.text({ label: "Group name", description: "e.g. Languages" }),
            items: fields.array(fields.text({ label: "Skill" }), {
              label: "Skills",
              itemLabel: props => props.value || "New skill",
            }),
          }),
          { label: "Skill groups", itemLabel: props => props.fields.group.value || "New group" }
        ),
      },
    }),
  },
});
