import { about } from "@/data/site";
import SectionHeading from "./SectionHeading";
import styles from "./About.module.css";

export default function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading id="about-title">About</SectionHeading>

        <div className={styles.bio} data-reveal>
          {about.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
