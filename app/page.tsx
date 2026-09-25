export default function Home() {
  return (
    <main>
      <section className="mark-panel" aria-label="Abstract K mark">
        <svg
          className="logo"
          viewBox="0 0 64 64"
          role="img"
          aria-label="Abstract K mark"
        >
          <g fill="none" stroke="currentColor" strokeWidth="9">
            <path d="M21 -6V27" />
            <path d="M30 37V70" />
            <path d="M70 -6 42 22" />
            <path d="M42 42 70 70" />
          </g>
        </svg>
      </section>
      <section className="copy-panel">
        <h1>no dead web.</h1>
      </section>
    </main>
  );
}
