import LandingPage from "./LandingPage";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "https://hackathon-radar-backend.onrender.com/api";

function buildGCalLink(listing) {
  const title = encodeURIComponent(listing.title);
  const details = encodeURIComponent(listing.description || listing.reasoningNotes || "");
  let dateParam = "";

  if (listing.deadline) {
    const d = new Date(listing.deadline);
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    dateParam = `&dates=${dateStr}/${dateStr}`;
  }

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}${dateParam}&details=${details}`;
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    techStack: "",
    interests: "",
    studentOnly: true,
    email: "",
    collegeName: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [traceLog, setTraceLog] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [pendingSession, setPendingSession] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);

  const [platformFilter, setPlatformFilter] = useState("all");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    axios.get(`${API_BASE}/profile`).then((res) => {
      if (res.data) {
        setProfile({
          name: res.data.name || "",
          techStack: (res.data.techStack || []).join(", "),
          interests: (res.data.interests || []).join(", "),
          studentOnly: res.data.studentOnly ?? true,
          email: res.data.email || "",
          collegeName: res.data.collegeName || "",
        });
        setProfileSaved(true);
      }
    }).catch(() => {});
  }, []);

  function addLog(text) {
    setTraceLog((prev) => [...prev, text]);
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/profile`, {
        name: profile.name,
        techStack: profile.techStack.split(",").map((s) => s.trim()).filter(Boolean),
        interests: profile.interests.split(",").map((s) => s.trim()).filter(Boolean),
        studentOnly: profile.studentOnly,
        email: profile.email,
        collegeName: profile.collegeName,
      });
      setProfileSaved(true);
      setShowProfileForm(false);
    } catch (error) {
      alert("Failed to save profile: " + (error.response?.data?.error || error.message));
    }
  }

  async function runFullScan() {
    if (!profileSaved) {
      setShowProfileForm(true);
      return;
    }

    setLoading(true);
    setTraceLog([]);
    setListings([]);
    setScreenshot(null);
    setErrorBanner(null);

    try {
      addLog("Reading Unstop, Devfolio, Devpost, MLH...");
      await axios.post(`${API_BASE}/scan/run`);
      addLog("Scan complete. Raw content collected from 4 sources.");

      addLog("Analyzing listings with Gemini - extracting titles, deadlines, eligibility...");
      const analyzeResponse = await axios.post(`${API_BASE}/analyze/run`);

      if (analyzeResponse.data.warning || analyzeResponse.data.listings.length === 0) {
        addLog("Warning: no listings extracted.");
        setErrorBanner(analyzeResponse.data.message || "No listings extracted. The AI service may be temporarily rate-limited - please wait a minute and try again.");
        setLoading(false);
        return;
      }

      addLog(`Extracted ${analyzeResponse.data.listings.length} hackathon listings.`);

      addLog("Ranking by relevance to your profile...");
      const rankedResponse = await axios.get(`${API_BASE}/analyze/ranked`);
      setListings(rankedResponse.data);
      addLog(`Done. Top match: "${rankedResponse.data[0]?.title}"`);
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      addLog("Error: " + message);
      setErrorBanner(message);
    } finally {
      setLoading(false);
    }
  }

  async function prepareRegistration(hackathonId) {
    setRegistering(hackathonId);
    setScreenshot(null);
    try {
      const response = await axios.post(`${API_BASE}/action/prepare/${hackathonId}`);
      setPendingSession({ hackathonId, sessionId: response.data.sessionId });
      setScreenshot(`https://hackathon-radar-backend.onrender.com${response.data.screenshot}`);
    } catch (error) {
      alert("Failed to prepare form: " + (error.response?.data?.error || error.message));
      setRegistering(null);
    }
  }

  async function confirmRegistration() {
    if (!pendingSession) return;
    try {
      await axios.post(`${API_BASE}/action/confirm/${pendingSession.hackathonId}`, {
        sessionId: pendingSession.sessionId,
      });
      setListings((prev) =>
        prev.map((listing) =>
          listing._id === pendingSession.hackathonId
            ? { ...listing, registrationStatus: "submitted" }
            : listing
        )
      );
      setScreenshot(null);
      setPendingSession(null);
      setRegistering(null);
    } catch (error) {
      alert("Failed to confirm: " + (error.response?.data?.error || error.message));
    }
  }

  function cancelRegistration() {
    setScreenshot(null);
    setPendingSession(null);
    setRegistering(null);
  }

  const platforms = useMemo(() => {
    const set = new Set(listings.map((l) => l.sourcePlatform));
    return ["all", ...set];
  }, [listings]);

  const visibleListings = useMemo(() => {
    let result = listings.filter((l) => l.registrationStatus !== "submitted");

    if (platformFilter !== "all") {
      result = result.filter((l) => l.sourcePlatform === platformFilter);
    }
    if (urgentOnly) {
      result = result.filter((l) => l.urgencyFlag);
    }
    result = result.filter((l) => (l.relevanceScore || 0) >= minScore);

    if (sortBy === "deadline") {
      result = [...result].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    } else {
      result = [...result].sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    return result;
  }, [listings, platformFilter, urgentOnly, minScore, sortBy]);

  const registeredListings = listings.filter((l) => l.registrationStatus === "submitted");
  const urgentCount = listings.filter((l) => l.urgencyFlag).length;
  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }
  return (
    <div className="app">
      <div className="header">
        <div className="badge">⚡ AI-Powered Agent</div>
        <h1>Never Miss a <span className="highlight">Hackathon</span> Again.</h1>
        <p className="subtitle">Reads live hackathon platforms, reasons about fit to your profile, and registers you — automatically.</p>
        <div className="header-actions">
          <button className="profile-btn" onClick={() => setShowProfileForm(!showProfileForm)}>
            {profileSaved ? "Edit Profile" : "Set Up Profile"}
          </button>
        </div>
      </div>

      {showProfileForm && (
        <form className="profile-form fade-in" onSubmit={saveProfile}>
          <h3>Your Profile</h3>
          <label>Name</label>
          <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />

          <label>Email</label>
          <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />

          <label>College Name</label>
          <input type="text" value={profile.collegeName} onChange={(e) => setProfile({ ...profile, collegeName: e.target.value })} />

          <label>Tech Stack (comma separated)</label>
          <input type="text" placeholder="React, Node.js, Claude API" value={profile.techStack} onChange={(e) => setProfile({ ...profile, techStack: e.target.value })} />

          <label>Interests (comma separated)</label>
          <input type="text" placeholder="AI agents, web development" value={profile.interests} onChange={(e) => setProfile({ ...profile, interests: e.target.value })} />

          <label className="checkbox-label">
            <input type="checkbox" checked={profile.studentOnly} onChange={(e) => setProfile({ ...profile, studentOnly: e.target.checked })} />
            Student-only hackathons preferred
          </label>

          <button type="submit" className="save-btn">Save Profile</button>
        </form>
      )}

      <div className="scan-section">
        <button className="scan-btn" onClick={runFullScan} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Scanning...
            </>
          ) : (
            "Run Scan"
          )}
        </button>
      </div>

      {errorBanner && <div className="error-banner fade-in">{errorBanner}</div>}

      {traceLog.length > 0 && (
        <div className="trace-panel fade-in">
          <h3>Agent Reasoning Trace</h3>
          {traceLog.map((line, i) => (
            <div key={i} className="trace-line">→ {line}</div>
          ))}
        </div>
      )}

      {screenshot && (
        <div className="screenshot-modal fade-in">
          <h3>Review before submitting</h3>
          <img src={screenshot} alt="Form preview" />
          <div className="modal-buttons">
            <button onClick={confirmRegistration} className="confirm-btn">Confirm & Submit</button>
            <button onClick={cancelRegistration} className="secondary">Cancel</button>
          </div>
        </div>
      )}

      {listings.length > 0 && (
        <>
          <div className="stats-bar fade-in">
            <div className="stat"><strong>{listings.length}</strong> found</div>
            <div className="stat urgent-stat"><strong>{urgentCount}</strong> urgent</div>
            <div className="stat"><strong>{registeredListings.length}</strong> registered</div>
          </div>

          <div className="filters fade-in">
            <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              {platforms.map((p) => (
                <option key={p} value={p}>{p === "all" ? "All platforms" : p}</option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="relevance">Sort: Relevance</option>
              <option value="deadline">Sort: Deadline</option>
            </select>

            <label className="toggle-label">
              <input type="checkbox" checked={urgentOnly} onChange={(e) => setUrgentOnly(e.target.checked)} />
              Urgent only
            </label>

            <label className="slider-label">
              Min score: {minScore}
              <input type="range" min="0" max="10" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} />
            </label>
          </div>
        </>
      )}

      <div className="listings">
        {visibleListings.map((listing, i) => (
          <div key={listing._id} className="listing-card fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="listing-header">
              <h3>{listing.title}</h3>
              <span className="score">{listing.relevanceScore}/10</span>
            </div>
                      <p className="platform">{listing.sourcePlatform}</p>
            {listing.eligibility && <p className="eligibility">Eligibility: {listing.eligibility}</p>}
            {listing.techFocus && listing.techFocus.length > 0 && (
              <div className="tech-tags">
                {listing.techFocus.map((tag, idx) => (
                  <span key={idx} className="tech-tag">{tag}</span>
                ))}
              </div>
            )}
            {listing.deadline && (
              <p className={listing.urgencyFlag ? "urgent" : ""}>
                Deadline: {new Date(listing.deadline).toLocaleDateString()}
                {listing.urgencyFlag && " · URGENT"}
              </p>
            )}
            {listing.prizePool && <p>Prize: {listing.prizePool}</p>}
            {listing.eventDates && <p>Event dates: {listing.eventDates}</p>}
            {listing.description && <p className="description">{listing.description}</p>}
            <p className="reasoning">{listing.reasoningNotes}</p>

            <div className="card-links">
              {listing.listingUrl && (
                <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                  View on {listing.sourcePlatform} ↗
                </a>
              )}
              {listing.deadline && (
                <a href={buildGCalLink(listing)} target="_blank" rel="noopener noreferrer" className="cal-link">
                  Add to Calendar
                </a>
              )}
            </div>

            <button
              className="register-btn"
              onClick={() => prepareRegistration(listing._id)}
              disabled={registering === listing._id}
            >
              {registering === listing._id ? "Preparing..." : "Register"}
            </button>
          </div>
        ))}
      </div>

      {registeredListings.length > 0 && (
        <div className="registered-section fade-in">
          <h3>Your Registrations</h3>
          {registeredListings.map((listing) => (
            <div key={listing._id} className="registered-item">
              <span>{listing.title}</span>
              <span className="registered-badge">Registered</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;