"use client";

import { FormEvent, useState } from "react";

const explanation =
  "kaerune is a digital version of a person, built from their decisions, preferences, reasoning, and the records they leave behind. it lets one judgment run in more than one place at the same time, without becoming a generic assistant.";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showInfo, setShowInfo] = useState(false);

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
      <button
        className="about-button"
        type="button"
        aria-expanded={showInfo}
        onClick={() => setShowInfo((value) => !value)}
      >
        About
      </button>

      <section className="hero" aria-label="kaerune waitlist">
        <h1>kaerune</h1>
        {showInfo && <p className="about-copy">{explanation}</p>}
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
            {status === "saving" ? "saving" : "join waitlist"} <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="waitlist-note" role="status" aria-live="polite">
          {status === "saved" && "saved."}
          {status === "error" && "try again."}
          {status === "idle" && "waitlist."}
        </p>
      </section>
    </main>
  );
}
