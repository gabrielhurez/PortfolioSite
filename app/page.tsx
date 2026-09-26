import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import RevealOnScroll from "@/components/RevealOnScroll";
import SiteNav from "@/components/SiteNav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <Hero />
      <main>
        <Projects />
        <Experience />
        <Skills />
        <About />
        <Contact />
      </main>
      <RevealOnScroll />
    </>
  );
}
