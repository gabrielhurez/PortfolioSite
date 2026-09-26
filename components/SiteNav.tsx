"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { profile } from "@/data/site";
import { scroller } from "@/lib/scroll";
import Signature from "./Signature";
import ThemeToggle from "./ThemeToggle";
import styles from "./SiteNav.module.css";

const LINKS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

// The main navbar. Always pinned: the signature, then Résumé, the theme switch and a Menu button that
// opens a full-screen list of the sections. Past the hero it gains a background and a gold line along
// its bottom showing how far through the page you are.
export default function SiteNav() {
  const [docked, setDocked] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Put the Close button exactly over the Menu button, and sweep the menu open from it
  const alignToMenuButton = () => {
    const button = menuButtonRef.current?.getBoundingClientRect();
    const menu = menuRef.current;
    if (!button || !menu) return;
    menu.style.setProperty("--close-top", `${button.top}px`);
    menu.style.setProperty("--close-right", `${document.documentElement.clientWidth - button.right}px`);
    menu.style.setProperty("--close-width", `${button.width}px`);
    menu.style.setProperty("--origin-x", `${button.left + button.width / 2}px`);
    menu.style.setProperty("--origin-y", `${button.top + button.height / 2}px`);
  };

  // Cheap enough to run on every scroll event (a handful of rect reads); React skips no-op updates
  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setDocked(y > window.innerHeight * 0.7);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty("transform", `scaleX(${max > 0 ? y / max : 0})`);
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const { id } of LINKS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom the last section wins even if it's too short to reach the line
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = LINKS[LINKS.length - 1].id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const close = (returnFocus = true) => {
    // Resume scrolling right away: a menu link's smooth scroll starts in this same click,
    // and restarting the scroller later (in the effect cleanup) would cancel it
    document.documentElement.style.overflow = "";
    scroller.lenis?.start();
    setOpen(false);
    if (returnFocus) menuButtonRef.current?.focus({ preventScroll: true });
  };

  // While the menu is open: pause page scrolling, close on Escape, and put focus inside it
  useEffect(() => {
    if (!open) return;
    scroller.lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    firstLinkRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", alignToMenuButton);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", alignToMenuButton);
      document.documentElement.style.overflow = "";
      scroller.lenis?.start();
    };
  }, [open]);

  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <>
      <div className={styles.bar} data-docked={docked}>
        <nav className={`container ${styles.inner}`} aria-label="Main">
          <a href="#top" className={styles.mark} aria-label={`${fullName}, home`}>
            <Signature src={profile.signature} delay={400} className={styles.markSignature} replayOnHover />
          </a>
          <div className={styles.actions}>
            <a href={profile.resume} className={styles.resume} target="_blank" rel="noopener noreferrer">
              Résumé
            </a>
            <ThemeToggle className={styles.themeToggle} />
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => {
                alignToMenuButton();
                setOpen(true);
              }}
            >
              <span className={styles.menuIcon} aria-hidden="true" />
              Menu
            </button>
          </div>
        </nav>
        <div ref={progressRef} className={styles.progress} aria-hidden="true" />
      </div>

      <div ref={menuRef} id="site-menu" className={styles.menu} data-open={open} aria-hidden={!open} inert={!open}>
        <div className={`container ${styles.menuInner}`}>
          <nav aria-label="Sections">
            <ol className={styles.menuLinks}>
              {LINKS.map(({ id, label }, i) => (
                <li key={id} style={{ "--i": i } as React.CSSProperties}>
                  <a
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={`#${id}`}
                    aria-current={active === id ? "location" : undefined}
                    onClick={() => close(false)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className={styles.menuFooter}>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={profile.resume} target="_blank" rel="noopener noreferrer">
              Résumé
            </a>
            {/* The editor only exists on localhost */}
            {process.env.NODE_ENV === "development" && (
              <Link href="/keystatic" className={styles.edit}>
                Edit site
              </Link>
            )}
          </div>
        </div>
        <button type="button" className={styles.close} onClick={() => close()}>
          <span className={styles.closeIcon} aria-hidden="true" />
          Close
        </button>
      </div>

    </>
  );
}
