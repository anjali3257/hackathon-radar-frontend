function LandingPage({ onGetStarted }) {
  const platforms = ["Unstop", "Devfolio", "Devpost", "MLH"];

  return (
    <div className="landing-bw">
      <nav className="bw-nav">
        <button className="bw-back">←</button>
        <div className="bw-nav-links">
          <span>Browse</span>
          <span>Reason</span>
          <span>Act</span>
        </div>
                <div className="bw-wordmark-small">HACKATHON RADAR</div>
        <div className="bw-nav-icons">
          <span>Search</span>
          <span>About</span>
        </div>
      </nav>

      <section className="bw-hero">
        <div className="bw-hero-top">
          <p className="bw-tagline">AGENTS THAT<br />READ, REASON<br />AND ACT.</p>
          <div className="bw-hero-graphic">
            <svg viewBox="0 0 300 300">
              <circle cx="150" cy="150" r="120" fill="none" stroke="#000" strokeWidth="1" />
              <circle cx="150" cy="150" r="80" fill="none" stroke="#000" strokeWidth="1" />
              <circle cx="150" cy="150" r="40" fill="none" stroke="#000" strokeWidth="1" />
              <line x1="150" y1="30" x2="150" y2="270" stroke="#000" strokeWidth="0.5" />
              <line x1="30" y1="150" x2="270" y2="150" stroke="#000" strokeWidth="0.5" />
              <circle cx="150" cy="150" r="5" fill="#000" />
            </svg>
          </div>
        </div>

                <h1 className="bw-wordmark">HACKATHON RADAR</h1>

        <div className="bw-hero-bottom">
          <div className="bw-hero-actions">
            <button className="bw-btn-fill" onClick={onGetStarted}>Get Started</button>
            <button className="bw-btn-outline" onClick={onGetStarted}>See How It Works</button>
          </div>
          <div className="bw-hero-meta">
            <p className="bw-meta-label">Anakin Forge<br />Hackathon 2026</p>
          </div>
        </div>
      </section>

      <section className="bw-three-col">
        <div className="bw-col">
          <span className="bw-col-num">01</span>
          <h3>Browse</h3>
          <p>Reads live hackathon listings across the web in real time.</p>
          <span className="bw-col-link">Learn more →</span>
        </div>
        <div className="bw-col">
          <span className="bw-col-num">02</span>
          <h3>Reason</h3>
          <p>Scores every listing against your profile and explains why.</p>
          <span className="bw-col-link">Learn more →</span>
        </div>
        <div className="bw-col">
          <span className="bw-col-num">03</span>
          <h3>Act</h3>
          <p>Fills forms, shows a preview, submits only when you confirm.</p>
          <span className="bw-col-link">Learn more →</span>
        </div>
      </section>

            <section className="bw-banner">
        <p className="bw-banner-label">LIVE NOW</p>
        <h2 className="bw-banner-title">Never Miss<br />A Deadline.</h2>
        <p className="bw-banner-sub">While you sleep, it's scanning Unstop, Devfolio, Devpost and MLH — so the next great hackathon finds you first.</p>
             <button className="bw-btn-fill" onClick={onGetStarted}>Try the Agent</button>
      </section>

      <section className="bw-features">
        <div className="bw-feature">
          <div className="bw-feature-icon">⚡</div>
          <p className="bw-feature-title">Live Data</p>
          <p className="bw-feature-sub">Fresh listings, every scan</p>
        </div>
        <div className="bw-feature">
          <div className="bw-feature-icon">◎</div>
          <p className="bw-feature-title">AI Reasoning</p>
          <p className="bw-feature-sub">Scored to your profile</p>
        </div>
        <div className="bw-feature">
          <div className="bw-feature-icon">✓</div>
          <p className="bw-feature-title">Human Confirmed</p>
          <p className="bw-feature-sub">You approve every action</p>
        </div>
        <div className="bw-feature">
          <div className="bw-feature-icon">○</div>
          <p className="bw-feature-title">Open Source</p>
          <p className="bw-feature-sub">Built in the open</p>
        </div>
      </section>

      <section className="bw-platforms">
        <div className="bw-platforms-header">
          <h2>Sources We Read</h2>
          <span className="bw-view-all">View all →</span>
        </div>
        <div className="bw-platform-grid">
          {platforms.map((p) => (
            <div key={p} className="bw-platform-card">
              <div className="bw-platform-mark">{p.charAt(0)}</div>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bw-about">
        <h2>About This Project</h2>
        <p>
          Built for the Anakin Forge Hackathon — a challenge to build AI agents that go
          beyond chatbots. Hackathon Radar combines live web reading, multi-step reasoning,
          and real browser automation into one end-to-end agent, with a human-in-the-loop
          safety step before anything is ever submitted.
        </p>
        <p className="bw-stack">React · Node.js · MongoDB · Anakin API · Gemini · Playwright</p>
      </section>

      <footer className="bw-footer">
        <button className="bw-btn-fill" onClick={onGetStarted}>Get Started →</button>
      </footer>
    </div>
  );
}

export default LandingPage;