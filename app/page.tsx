export default function Home() {
  return (
    <main className="page">
      <div className="halftone">
        <img
          src="/media/kaerune-halftone.jpg"
          alt="Halftone portrait grid of a single figure repeated across six frames."
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="mark">
        <h1>kaerune</h1>
        <p>unbecome one</p>
      </div>
    </main>
  );
}
