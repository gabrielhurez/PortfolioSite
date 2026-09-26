import { ArrowUpRight } from "lucide-react";
import { archive } from "@/data/site";
import styles from "./MoreProjects.module.css";

// Compact list of smaller projects under the featured ones; add entries in data/site.ts
export default function MoreProjects() {
  if (!archive.length) return null;

  return (
    <section className={`container ${styles.more}`} aria-labelledby="more-projects-title">
      <h2 id="more-projects-title" className={`display ${styles.title}`} data-reveal>
        More projects
      </h2>
      <ul className={styles.list}>
        {archive.map((project, index) => {
          const content = (
            <>
              <span className={styles.year}>{project.year}</span>
              <span className={`display ${styles.name}`}>{project.title}</span>
              {/* Kept even when empty, so the tags and arrow stay in their grid columns */}
              <span className={styles.summary}>{project.summary}</span>
              <span className={styles.tags}>{project.tags.join(" · ")}</span>
              <span className={styles.arrow} aria-hidden="true">
                {project.link && <ArrowUpRight size={22} strokeWidth={2.25} />}
              </span>
            </>
          );
          return (
            <li key={project.title} data-reveal style={{ "--delay": `${index * 0.05}s` } as React.CSSProperties}>
              {project.link ? (
                <a className={styles.row} href={project.link.href} target="_blank" rel="noopener noreferrer">
                  {content}
                  <span className="sr-only"> (opens {project.link.label})</span>
                </a>
              ) : (
                <div className={styles.row}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
