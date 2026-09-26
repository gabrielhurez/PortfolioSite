import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorBar from "@/components/EditorBar";
import KeystaticApp from "./keystatic";

// Keep the editor out of search results
export const metadata: Metadata = {
  title: "Edit site",
  robots: { index: false, follow: false },
};

// The editor UI at /keystatic. Localhost only: the live site has no editor at all
export default function Layout() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <>
      <KeystaticApp />
      <EditorBar />
    </>
  );
}
