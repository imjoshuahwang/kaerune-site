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

        <p className="about">
          <span>unbecome the one who has to be in the room.</span>
          <span>unbecome the hours only you can spend.</span>
          <span>unbecome the work that waits for you.</span>
          <span>unbecome the single self.</span>
          <span className="last">unbecome one.</span>
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
