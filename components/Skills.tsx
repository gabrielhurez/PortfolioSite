"use client";

import { useState } from "react";
import { projects, skills } from "@/data/site";
import SectionHeading from "./SectionHeading";
import styles from "./Skills.module.css";

// Hover (or tap) a skill and the projects that used it light up; the rest fade back
export default function Skills() {
  const [active, setActive] = useState<string | null>(null);
  const using = active ? new Set(projects.filter(p => p.uses.includes(active)).map(p => p.ref)) : null;

  return (
    <section className="section" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading id="skills-title">Skills</SectionHeading>

        <div className={styles.layout} data-filtering={!!active} onMouseLeave={() => setActive(null)}>
          <div className={styles.groups} data-reveal>
            {skills.map(({ group, items }) => (
              <div key={group}>
                <h3 className={styles.group}>{group}</h3>
                <ul className={styles.chips}>
                  {items.map(skill => (
                    <li key={skill}>
                      <button
                        type="button"
                        className={styles.chip}
                        aria-pressed={active === skill}
                        onMouseEnter={() => setActive(skill)}
                        onFocus={() => setActive(skill)}
                        onClick={() => setActive(active === skill ? null : skill)}
                      >
                        {skill}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <ol className={styles.work} data-reveal style={{ "--delay": "0.1s" } as React.CSSProperties}>
            {projects.map(project => (
              <li key={project.ref} data-on={using?.has(project.ref) ?? false}>
                <a href={`#work-${project.ref}`}>
                  <span className="display">{project.title}</span>
                  <span className={styles.kind}>{project.category}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <p className="sr-only" aria-live="polite">
          {active
            ? using?.size
              ? `${active}: used in ${projects.filter(p => using.has(p.ref)).map(p => p.title).join(", ")}`
              : `${active}: not in a project on this site yet`
            : ""}
        </p>
      </div>
    </section>
  );
}
