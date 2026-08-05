import Image from 'next/image'
import { MarketingFooter } from '@/shared/components/MarketingFooter'
import { MarketingNav } from '@/shared/components/MarketingNav'

const steps = [
  {
    title: 'Photograph your receipt',
    text: 'Open Cartwise after a shop and snap the receipt, or upload a photo. The camera opens straight away.',
  },
  {
    title: 'Text is read on your device',
    text: 'Your phone reads the receipt itself. Only the extracted text is sent on — the image never leaves your device.',
  },
  {
    title: 'Items matched to real nutrition',
    text: 'Each line is matched against USDA and Open Food Facts data. Anything we can’t match is shown honestly, never guessed.',
  },
]

const trustNotes = [
  'The receipt photo stays on your device. We only receive the text it contains.',
  'Nutrition comes from USDA FoodData Central and Open Food Facts — real figures, not estimates we invented.',
  'Unmatched items are labelled as unmatched. Cartwise never fills in numbers to look complete.',
  'Sign in with Google. No password to set, no onboarding form before you see value.',
]

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="home">
        <MarketingNav />
      </div>

      <main id="main">
        <div className="home">
          <section className="home-hero">
            <div>
              <h1>
                Snap your receipt.
                <br />
                Know <span className="home-hero-accent">what you bought</span>.
              </h1>
              <p className="home-hero-lede">
                Cartwise turns one grocery receipt into a nutrition read of your whole shop — no daily food
                diary, no logging every meal.
              </p>
              <div className="cta-row">
                <a className="button button-primary" href="/scan">
                  Scan a receipt
                </a>
                <a className="button button-secondary" href="/how-it-works">
                  See how it works
                </a>
              </div>
              <p className="home-hero-note">One receipt in. Real nutrition out.</p>
            </div>

            <figure className="home-figure home-hero-figure">
              <Image
                src="/images/hero-produce.jpg"
                alt="A supermarket produce wall stocked with greens, peppers, squash and root vegetables."
                fill
                sizes="(max-width: 900px) 100vw, 45vw"
                priority
              />
              <figcaption className="home-hero-tag">
                <strong>Receipt</strong>
                <span>→</span>
                <strong>matched items</strong>
                <span>→</span>
                <strong>nutrition read</strong>
              </figcaption>
            </figure>
          </section>
        </div>

        <div className="home">
          <section className="home-band" id="how-it-works">
            <div className="home-band-head">
              <h2>From a crumpled receipt to a clear read.</h2>
              <p>Three steps, most of it automatic. You only step in when a match looks wrong.</p>
            </div>
            <div className="step-flow">
              <div className="step-flow-list">
                {steps.map((step, index) => (
                  <div className="step-row" key={step.title}>
                    <span className="step-index">{index + 1}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <figure className="home-figure step-figure">
                <Image
                  src="/images/receipt.jpg"
                  alt="Close-up of a printed grocery receipt showing itemised text."
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                />
              </figure>
            </div>
          </section>
        </div>

        <div className="home">
          <section className="signal-band">
            <div className="signal-grid">
              <div className="home-band-head" style={{ marginBottom: 0 }}>
                <h2>Three signals, not a spreadsheet.</h2>
                <p>
                  Every batch opens with a short, plain read of your shop — one thing to watch, one gap, one
                  win. Tap through for the full breakdown when you want it.
                </p>
              </div>

              <div className="signal-demo" aria-label="Example nutrition read">
                <div className="signal-demo-head">
                  <h3>This week’s shop</h3>
                  <span>Example read</span>
                </div>
                <div className="signal-line">
                  <div>
                    <span className="signal-line-label">Sodium</span>
                    <span className="signal-line-note">Running high across packaged items</span>
                  </div>
                  <span className="signal-tag is-warn">Watch</span>
                </div>
                <div className="signal-line">
                  <div>
                    <span className="signal-line-label">Vitamin D sources</span>
                    <span className="signal-line-note">No sources in this batch</span>
                  </div>
                  <span className="signal-tag is-warn">Gap</span>
                </div>
                <div className="signal-line">
                  <div>
                    <span className="signal-line-label">Fresh produce</span>
                    <span className="signal-line-note">Six matched fruit and veg items</span>
                  </div>
                  <span className="signal-tag is-good">Win</span>
                </div>
                <p className="signal-demo-foot">Illustrative figures. Your read is built from your own receipt.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="home">
          <section className="trust-band" aria-label="How Cartwise handles your data">
            <div className="trust-band-copy">
              <h2>Honest by default.</h2>
              <div className="trust-list">
                {trustNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
            <div className="trust-band-media">
              <Image
                src="/images/shopper.jpg"
                alt="A shopper carrying a wire basket of groceries beside a produce aisle."
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
              />
            </div>
          </section>
        </div>

        <div className="home">
          <section className="home-close">
            <h2>Your next shop can tell you something.</h2>
            <p>Scan one receipt and see what a week of groceries adds up to.</p>
            <div className="cta-row">
              <a className="button button-primary" href="/scan">
                Scan your first receipt
              </a>
              <a className="button button-secondary" href="/barcode">
                Try a barcode instead
              </a>
            </div>
          </section>
        </div>
      </main>

      <div className="home">
        <MarketingFooter />
      </div>
    </>
  )
}
