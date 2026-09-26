"use client";

import Link from "next/link";
import styles from "./EditorBar.module.css";

// Floating button over the editor to get back to the site
export default function EditorBar() {
  return (
    <div className={styles.bar}>
      <Link href="/" className={styles.button}>
        <span aria-hidden="true">←</span> Back to site
      </Link>
    </div>
  );
}
