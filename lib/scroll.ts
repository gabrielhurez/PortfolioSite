import type Lenis from "lenis";

// The page's smooth scroller, set by SmoothScroll, so other components can pause it (e.g. while a menu is open)
export const scroller: { lenis: Lenis | null } = { lenis: null };
