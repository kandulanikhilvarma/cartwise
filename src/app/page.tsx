const highlights = [
  {
    title: 'Receipt in, nutrition out',
    text: 'Turn a grocery receipt into a structured nutrition summary without manual logging.',
  },
  {
    title: 'Barcode fallback',
    text: 'Add one product at a time when a receipt misses an item or a package needs a direct lookup.',
  },
  {
    title: 'Google sign-in only when it matters',
    text: 'See the product first. Sign in when you want to save and revisit results.',
  },
]

const steps = ['Capture a receipt', 'Match items automatically', 'See a simple nutrition summary']

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Zero-friction grocery nutrition</p>
          <h1>Show the value first. Ask for effort later.</h1>
          <p className="lede">
            NutriLens turns a grocery receipt into a useful nutrition view without asking you to
            fill out forms, enter meals, or build a diary from scratch.
          </p>
          <div className="cta-row">
            <a className="button button-primary" href="#how-it-works">
              See how it works
            </a>
            <a className="button button-secondary" href="#features">
              Explore features
            </a>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Product summary">
          <div className="panel-badge">First value in one flow</div>
          <div className="panel-title">Fast enough to replace manual logging</div>
          <div className="panel-metric">
            <span>4</span>
            <small>MVP features</small>
          </div>
          <div className="panel-metric">
            <span>0</span>
            <small>onboarding forms</small>
          </div>
          <div className="panel-metric">
            <span>1</span>
            <small>clear next step</small>
          </div>
        </aside>
      </section>

      <section className="feature-strip" id="features">
        {highlights.map((item) => (
          <article className="feature-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="process" id="how-it-works">
        <div className="section-header">
          <p className="eyebrow">How it works</p>
          <h2>Explain the flow before any capture or login step.</h2>
        </div>
        <div className="step-list">
          {steps.map((step, index) => (
            <div className="step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
