import { useState } from "react";
import "./App.css";

// ── Replace this with your real API Gateway URL ──────────────────────────────
const API_URL =
  "https://lcqw9z3woe.execute-api.ap-south-1.amazonaws.com/prod/analyze";
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setError(null);
    setResult(null);
  }

  return (
    <div className="app">
      {/* ── Hero / Input ─────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-inner">
          <div className="logo-row">
            <span className="logo-icon">☁</span>
            <span className="logo-text">AWS</span>
          </div>
          <h1 className="hero-title">AWS Idea Analyzer</h1>
          <p className="hero-sub">
            Turn your idea into an AWS architecture plan + cost estimate
            instantly
          </p>

          <div className="input-card">
            <textarea
              className="idea-input"
              rows={5}
              placeholder="Describe your website idea… e.g. A food delivery app for college students"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={loading || !idea.trim()}
            >
              {loading ? "Analyzing…" : "Analyze My Idea"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <section className="loading-section">
          <div className="spinner" aria-label="Loading" />
          <p className="loading-text">Analyzing your idea with AI…</p>
        </section>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <section className="error-banner" role="alert">
          <span className="error-icon">⚠</span>
          <span className="error-msg">{error}</span>
          <button className="btn-retry" onClick={handleReset}>
            Try Again
          </button>
        </section>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {result && (
        <main className="results">
          {/* Project Card */}
          <section className="project-card">
            <h2 className="project-name">{result.projectName}</h2>
            <p className="project-summary">{result.summary}</p>
          </section>

          {/* Phase Timeline */}
          <section className="section">
            <h3 className="section-title">Implementation Phases</h3>
            <div className="phases-grid">
              {result.phases.map((p) => (
                <div className="phase-card" key={p.phase}>
                  <div className="phase-number">{p.phase}</div>
                  <div className="phase-body">
                    <h4 className="phase-title">{p.title}</h4>
                    <p className="phase-desc">{p.description}</p>
                    <span className="phase-duration">{p.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cost Breakdown */}
          <section className="section">
            <h3 className="section-title">Cost Breakdown</h3>
            <div className="table-wrap">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Free Tier</th>
                    <th>Monthly Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {result.services.map((svc, i) => (
                    <tr key={i}>
                      <td>{svc.name}</td>
                      <td>
                        {svc.freeTier ? (
                          <span className="badge-free">FREE</span>
                        ) : (
                          <span className="badge-paid">No</span>
                        )}
                      </td>
                      <td className={svc.freeTier ? "cost-free" : "cost-paid"}>
                        {svc.freeTier ? "$0.00" : `$${svc.monthlyCost.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan={2}>Total Monthly Cost</td>
                    <td className="total-cost">
                      ${result.totalMonthlyCost.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Download PDF */}
          <section className="section pdf-section">
            <a
              href={result.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-pdf"
            >
              ⬇ Download Cost Report PDF
            </a>
            <p className="savings-text">
              Free Tier Savings: ~${result.freeTierSavings.toFixed(2)}/mo
            </p>
          </section>
        </main>
      )}

      <footer className="footer">
        <p>Powered by AWS &amp; AI · Built with React</p>
      </footer>
    </div>
  );
}
