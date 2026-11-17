export function PortfolioType() {
  return (
    <div className="portfolio-type">
      <h1>Hey, I’m Cyril.</h1>
      <p>Product designer.</p>
      <p>Open to work.</p>
    </div>
  )
}

export function PortfolioOutro() {
  return (
    <main className="page portfolio-reveal is-revealed portfolio-preview">
      <PortfolioType />
    </main>
  )
}
