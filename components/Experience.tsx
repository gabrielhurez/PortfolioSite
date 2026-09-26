import { experience } from "@/data/site";
import SectionHeading from "./SectionHeading";
import styles from "./Experience.module.css";

export default function Experience() {
  return (
    <section className="section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeading id="experience-title">Experience</SectionHeading>

        <ol className={styles.list}>
          {experience.map((role, index) => (
            <li
              key={`${role.org}-${role.dates}`}
              className={styles.role}
              data-reveal
              style={{ "--delay": `${index * 0.08}s` } as React.CSSProperties}
            >
              <div className={styles.when}>
                <span>{role.dates}</span>
                <span>{role.place}</span>
              </div>
              <div>
                <h3 className={`display ${styles.title}`}>{role.title}</h3>
                <p className={styles.org}>{role.org}</p>
              </div>
              <ul className={styles.points}>
                {role.points.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
