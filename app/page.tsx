"use client";

import Image from "next/image";
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
      <section className="cover-stage" aria-label="kaerune">
        <Image
          src="/media/kaerune-alone.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="cover-image"
        />
        <div className="cover-fade" aria-hidden="true" />
        <div className="cover-noise" aria-hidden="true" />

        <p className="site-mark">kaerune</p>

        <div className="corner-actions">
          <button
            className="plain-button"
            type="button"
            aria-expanded={showInfo}
            onClick={() => setShowInfo((value) => !value)}
          >
            what is this
          </button>

          {showInfo && <p className="info-copy">{explanation}</p>}

          <form className="waitlist-panel" onSubmit={joinWaitlist}>
            <label className="waitlist-title" htmlFor="waitlist-email">
              unbecome one.
            </label>
            <div className="waitlist-row">
              <input
                id="waitlist-email"
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
            </div>
            <p className="waitlist-note" role="status" aria-live="polite">
              {status === "saved" && "saved."}
              {status === "error" && "try again."}
              {status === "idle" && "waitlist."}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
