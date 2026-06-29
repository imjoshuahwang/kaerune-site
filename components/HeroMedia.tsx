export function HeroMedia() {
  return (
    <section className="hero" aria-label="Kaerune campaign film">
      <video
        className="hero-media"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/hero-poster.png"
      >
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
