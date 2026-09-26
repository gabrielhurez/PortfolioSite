import { profile } from "@/data/site";
import HeroGradient from "./HeroGradient";
import SocialLinks from "./SocialLinks";
import styles from "./Hero.module.css";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function Hero() {
  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <header className={styles.hero} id="top">
      <HeroGradient />

      <div className={`container ${styles.body}`}>
        <div className={styles.text}>
          <p className={`${styles.intro} ${styles.fade}`} style={delay(100)}>
            <strong>{fullName}</strong>
          </p>
          {/* The role rises into view from behind its own edge */}
          <h1 className={`display ${styles.title}`}>
            <span className="sr-only">{fullName}, </span>
            <span className={styles.line}>
              <span className={styles.rise} style={delay(200)}>
                {profile.role}
              </span>
            </span>
          </h1>
          <p className={`${styles.sub} ${styles.fade}`} style={delay(550)}>
            {profile.heroLine}
          </p>
          <SocialLinks className={`${styles.links} ${styles.fade}`} style={delay(750)} />
        </div>
      </div>
    </header>
  );
}
