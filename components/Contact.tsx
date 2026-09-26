import { profile } from "@/data/site";
import SectionHeading from "./SectionHeading";
import SocialLinks from "./SocialLinks";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <>
      <section className="section" id="contact" aria-labelledby="contact-title">
        <div className="container">
          <SectionHeading id="contact-title">Contact</SectionHeading>

          <a href={`mailto:${profile.email}`} className={`display ${styles.email}`} data-reveal>
            {profile.email}
          </a>

          <div data-reveal style={{ "--delay": "0.1s" } as React.CSSProperties}>
            <SocialLinks className={styles.links} />
          </div>
        </div>
      </section>

      <footer className={`container ${styles.footer}`}>
        <span>© {new Date().getFullYear()} {profile.firstName} {profile.lastName}</span>
        <a href="#top">Back to top</a>
      </footer>
    </>
  );
}
