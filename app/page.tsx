"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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
      <div className="sheet">
        <svg
          className="logo"
          viewBox="0 0 64 64"
          role="img"
          aria-label="Kaerune logo"
        >
          <g fill="none" stroke="currentColor" strokeWidth="9">
            <path d="M21 -6V27" />
            <path d="M30 37V70" />
            <path d="M70 -6 42 22" />
            <path d="M42 42 70 70" />
          </g>
        </svg>

        <h1>kaerune</h1>
        <p className="tagline">unbecome one</p>

        <p className="about">
          Kaerune is a copy of yourself that learns how you think and act. It watches the
          shape of your judgment — what you weigh, what you ignore, how you decide when no
          one is asking — and carries it forward on your behalf. The more it sees, the
          closer it gets, until the work only you could do no longer has to wait for you.
        </p>

        <form className="waitlist" onSubmit={joinWaitlist}>
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
        </form>
      </div>
    </main>
  );
}
