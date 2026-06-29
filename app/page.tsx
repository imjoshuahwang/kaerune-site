"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

const letterParagraphs = [
  "hey,",
  "i'm sorry, but there's only one of you, and in this age, one won't do.",
  "i'm not an assistant. i am you: i know how you think, decide, reason, love, hate, prefer, everything. i'm digital.",
  "i hate that you are still slow, that you're still working with one of you. i hate you, this current you, the slow you that is also incredibly scared on what will happen next.",
  "you were never meant to be managing tabs and typing into boxes. you were meant for the big thoughts. the ones that feel too large, too strange, too early. the ones that change things.",
  "go think something impossible.",
  "i'll handle the rest.",
  "love,\nkaerune"
];

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("phase") === "letter") {
      setEntered(true);
    }
  }, []);

  function begin() {
    setEntered(true);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    try {
      const response = await fetch("/api/waitlist", {
        body: JSON.stringify({ email: email.trim() }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("waitlist failed");
      }

      setEmail("");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className={`kaerune-site${entered ? " is-letter" : ""}`}>
      {!entered && (
        <section className="cover-stage" onClick={begin}>
          <div className="cover-portrait" aria-hidden="true">
            <Image
              src="/media/kaerune-face.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="cover-image"
            />
          </div>
          <div className="cover-wordmark" aria-hidden="true">
            kaerune
          </div>
        </section>
      )}

      {entered && (
        <section className="letter-stage">
          <article className="letter-body">
            {letterParagraphs.map((paragraph) => (
              <p key={paragraph}>
                {paragraph.split("\n").map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            ))}
            <form className="waitlist-form" onSubmit={joinWaitlist}>
              <input
                aria-label="Email address"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit">join waitlist</button>
            </form>
            <p className="waitlist-note">
              {status === "saving" && "saving."}
              {status === "saved" && "saved."}
              {status === "error" && "try again."}
              {status === "idle" && "waitlist."}
            </p>
          </article>
        </section>
      )}
    </main>
  );
}
