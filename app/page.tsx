"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const explanation =
  "kaerune is a digital version of a person, built from their decisions, preferences, reasoning, and the records they leave behind. it lets one judgment run in more than one place at the same time, without becoming a generic assistant.";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

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
    <main className="kaerune-site">
      <section className="cover-stage" aria-label="kaerune">
        <Image
          src="/media/kaerune-cover.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="cover-image"
        />
        <div className="cover-vignette" aria-hidden="true" />
        <div className="cover-grain" aria-hidden="true" />
        <p className="cover-mark">kaerune</p>
        <p className="cover-line">unbecome one.</p>
      </section>

      <section className="signal-stage" aria-labelledby="signal-title">
        <div className="signal-shell">
          <p className="signal-index">001</p>
          <h1 id="signal-title">kaerune</h1>
          <p className="signal-copy">{explanation}</p>
          <form className="waitlist-form" onSubmit={joinWaitlist}>
            <input
              aria-label="email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "saving" : "request entry"}
            </button>
          </form>
          <p className="waitlist-note" role="status" aria-live="polite">
            {status === "saved" && "saved."}
            {status === "error" && "try again."}
            {status === "idle" && "waitlist."}
          </p>
        </div>
      </section>
    </main>
  );
}
