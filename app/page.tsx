export default function Home() {
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
        <p className="eyebrow">Kaerune</p>
        <h1>no dead web.</h1>
      </div>
    </main>
  );
}
