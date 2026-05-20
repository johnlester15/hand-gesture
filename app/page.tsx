import { ArrowRight, Box, Camera, Code2, Hand, Smartphone } from "lucide-react";
import HandExperience from "./components/HandExperience";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-bg" />
        <nav className="nav">
          <div className="brand"><span><Hand size={22} /></span> AR Hand 3D</div>
          <a href="#demo" className="nav-link">Try Demo</a>
        </nav>

        <div className="hero-content">
          <div className="hero-copy">
           
            <h1>Procedural 3D hand gesture app made with Next.js.</h1>
            <p>
              Detect hand signs from the camera and display a realistic coded 3D hand with clear meaning. No downloaded 3D hand model needed.
            </p>
            <div className="hero-actions">
              <a href="#demo" className="btn primary big">Open Demo <ArrowRight size={18} /></a>
              <a href="#features" className="btn ghost big">View Features</a>
            </div>
          </div>

          <div className="hero-card">
            <div className="mini-window">
              <div className="window-dots"><i /><i /><i /></div>
              <div className="hand-preview">
                <Hand size={90} strokeWidth={1.3} />
                <span className="ring one" />
                <span className="ring two" />
              </div>
              <div className="preview-row"><span>Gesture</span><strong>Peace Sign</strong></div>
              <div className="preview-row"><span>Meaning</span><strong>Peace / Calm</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="feature-card"><Box /><h3>Procedural 3D</h3><p>The hand is created using code shapes, rounded palm, capsule fingers, nails, and knuckles.</p></div>
        <div className="feature-card"><Camera /><h3>Camera Detection</h3><p>MediaPipe detects real hand landmarks from the browser camera.</p></div>
        <div className="feature-card"><Smartphone /><h3>Mobile Responsive</h3><p>The interface adapts cleanly for desktop, tablet, and mobile screens.</p></div>
        <div className="feature-card"><Code2 /><h3>No 3D Download</h3><p>No external 3D hand file. The model is fully coded inside React Three Fiber.</p></div>
      </section>

      <HandExperience />
    </main>
  );
}
