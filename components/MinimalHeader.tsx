import { Wordmark } from "./Wordmark";

export function MinimalHeader() {
  return (
    <header className="site-header" aria-label="Kaerune">
      <Wordmark />
      <a className="utility-link" href="#collection" aria-label="View Collection 01">
        Collection 01
      </a>
    </header>
  );
}
