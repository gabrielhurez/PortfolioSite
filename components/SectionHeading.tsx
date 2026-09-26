import styles from "./SectionHeading.module.css";

// Section title followed by a rule that runs to the edge of the container
export default function SectionHeading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <div className={styles.head} data-reveal>
      <h2 id={id} className={`display ${styles.title}`}>
        {children}
      </h2>
      <span className={styles.rule} aria-hidden="true" />
    </div>
  );
}
