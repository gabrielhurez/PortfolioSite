import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { projects } from "@/data/site";
import MoreProjects from "./MoreProjects";
import PiClusterModel from "./PiClusterModel";
import styles from "./Projects.module.css";

// One full-height section per project, details and preview alternating sides
export default function Projects() {
  return (
    <div id="work">
      {projects.map((project, index) => {
        const titleId = `project-${project.ref}`;
        const link = project.links?.[0];
        return (
          <section
            key={project.ref}
            id={`work-${project.ref}`}
            className={styles.project}
            data-alternate={index % 2 === 1}
            aria-labelledby={titleId}
          >
            <div className={`container ${styles.inner}`}>
              <div className={styles.details} data-reveal>
                <span className={styles.divider} aria-hidden="true" />
                <h2 id={titleId} className={`display ${styles.title}`}>
                  {project.title}
                </h2>
                <p className={styles.blurb}>{project.blurb}</p>
                <ul className="tags">
                  {project.tags.map(tag => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                {link && (
                  <a className="button" href={link.href} target="_blank" rel="noopener noreferrer">
                    View on {link.label}
                    <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
                  </a>
                )}
              </div>

              <div
                className={styles.preview}
                data-reveal
                style={{ "--delay": "0.15s" } as React.CSSProperties}
              >
                {/* The Pi Cluster gets an interactive model in place of a screenshot */}
                {project.ref === "pi-cluster" ? (
                  <PiClusterModel className={styles.shot} />
                ) : project.image ? (
                  <Image
                    className={styles.shot}
                    src={project.image.src}
                    alt={project.image.alt}
                    width={1600}
                    height={1000}
                    sizes="(max-width: 900px) 100vw, 55vw"
                  />
                ) : (
                  <div className={`${styles.shot} ${styles.placeholder}`}>
                    {project.imageLabel ?? "Screenshot"} goes here
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
      <MoreProjects />
    </div>
  );
}
