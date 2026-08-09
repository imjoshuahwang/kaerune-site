"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AsciiField } from "../components/AsciiField";
import { DotWordmark } from "../components/DotWordmark";
import { PixelField } from "../components/PixelField";

const poem = ["many minds at work", "agents carry our thinking", "one judgment, echoed"];

const PALE = "#d4d4d4";
const INK = "#050505";

export default function Home() {
  const storyRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  /* Drive everything off raw page scroll against the section's measured pixel
     range. Deriving progress from a target rect misreads while the section's
     child is stuck, which sent the form back to invisible at the very bottom. */
  const { scrollY } = useScroll();
  const [span, setSpan] = useState({ start: 0, end: 1 });

  useEffect(() => {
    function measure() {
      const el = storyRef.current;
      if (!el) return;
      const start = el.offsetTop;
      const end = start + el.offsetHeight - window.innerHeight;
      setSpan({ start, end: Math.max(end, start + 1) });
    }

    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (storyRef.current) observer.observe(storyRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  function at(from: number, to: number) {
    const length = span.end - span.start;
    return [span.start + length * from, span.start + length * to];
  }

  // The lines darken one after another; the paper itself never changes.
  const firstLine = useTransform(scrollY, at(0.02, 0.22), [PALE, INK]);
  const secondLine = useTransform(scrollY, at(0.2, 0.4), [PALE, INK]);
  const thirdLine = useTransform(scrollY, at(0.38, 0.58), [PALE, INK]);
  const formOpacity = useTransform(scrollY, at(0.6, 0.82), [0, 1]);
  const formY = useTransform(scrollY, at(0.6, 0.82), [20, 0]);

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Waitlist request failed");
      }

      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main>
      <AsciiField />
      <PixelField />

      <section className="landing" aria-labelledby="site-title">
        <div className="halftone">
          <img
            src="/media/kaerune-halftone.jpg"
            alt="Halftone portrait grid of a single figure repeated across six frames."
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div className="mark">
          <h1 id="site-title">
            <span className="sr-only">kaerune</span>
            <DotWordmark className="dot-wordmark" text="kaerune" />
          </h1>
          <p>unbecome one</p>
        </div>
      </section>

      <section className="story" id="many" ref={storyRef} aria-labelledby="poem-title">
        <div className="story-sticky">
          <div className="poem-wrap">
            <h2 id="poem-title" className="poem" aria-label={poem.join(". ")}>
              <motion.span style={{ color: firstLine }}>{poem[0]}</motion.span>
              <motion.span style={{ color: secondLine }}>{poem[1]}</motion.span>
              <motion.span style={{ color: thirdLine }}>{poem[2]}</motion.span>
            </h2>

            <motion.form
              className="waitlist"
              onSubmit={joinWaitlist}
              style={{ opacity: formOpacity, y: formY }}
            >
              <label htmlFor="email">join the waitlist</label>
              <div className="waitlist-row">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={status === "loading" || status === "success"}
                />
                <button type="submit" disabled={status === "loading" || status === "success"}>
                  {status === "loading" ? "joining" : status === "success" ? "you're in" : "join"}
                </button>
              </div>
              <p className="form-status" aria-live="polite">
                {status === "success" && "you're on the list. we'll be in touch."}
                {status === "error" && "something went wrong. please try again."}
              </p>
            </motion.form>
          </div>
        </div>
      </section>
    </main>
  );
}
