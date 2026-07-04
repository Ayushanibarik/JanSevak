import { Search, ShieldAlert, Award, FileText, CheckCircle, Clock, PhoneCall, ArrowRight, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const [trackToken, setTrackToken] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackToken.trim()) {
      navigate(`/grievance/track?token=${encodeURIComponent(trackToken.trim())}`);
    }
  };

  return (
    <div className="gov-landing-container">
      {/* Alert / Notice Bar */}
      <div className="gov-alert-banner">
        <span className="alert-tag">{i18n.language === "hi" ? "महत्वपूर्ण सूचना:" : "NOTICE:"}</span>
        <marquee className="alert-marquee" behavior="scroll" direction="left">
          {t("notice_marquee_text")}
        </marquee>
      </div>

      {/* Hero Section */}
      <section className="gov-hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text-container">
            <h2>{t("hero_title")}</h2>
            <h3>{t("tagline")}</h3>
            <p>
              {t("hero_desc")}
            </p>
            <div className="hero-ctas">
              <Link to="/grievance/new" className="cta-btn primary-cta">
                {t("file_now")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a href="#departments" className="cta-btn secondary-cta">
                {t("view_departments")}
              </a>
            </div>
          </div>

          {/* Quick Tracking Panel */}
          <div className="hero-tracking-card">
            <h4>{t("track_status")}</h4>
            <p>{t("input_token_hint")}</p>
            <form onSubmit={handleTrackSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder={t("placeholder_token")}
                  value={trackToken}
                  onChange={(e) => setTrackToken(e.target.value)}
                  className="tracking-input"
                  required
                />
                <button type="submit" className="tracking-search-btn">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
            <div className="tracking-hint">
              {t("token_hint")}
            </div>
          </div>
        </div>
      </section>

      {/* Real-time State Stats Counter Banner */}
      <section className="gov-stats-banner">
        <div className="stat-item">
          <FileText className="stat-icon text-blue-600" />
          <div className="stat-details">
            <span className="stat-num">48,912</span>
            <span className="stat-label">{t("total_received")}</span>
          </div>
        </div>
        <div className="stat-item">
          <Clock className="stat-icon text-amber-500" />
          <div className="stat-details">
            <span className="stat-num">1,248</span>
            <span className="stat-label">{t("in_progress_label")}</span>
          </div>
        </div>
        <div className="stat-item">
          <CheckCircle className="stat-icon text-emerald-500" />
          <div className="stat-details">
            <span className="stat-num">47,664</span>
            <span className="stat-label">{t("resolved_cases")}</span>
          </div>
        </div>
        <div className="stat-item">
          <Award className="stat-icon text-indigo-500" />
          <div className="stat-details">
            <span className="stat-num">97.4%</span>
            <span className="stat-label">{t("resolution_rate")}</span>
          </div>
        </div>
      </section>

      {/* Main Departments Grid */}
      <section id="departments" className="gov-section departments-section">
        <div className="section-header">
          <h2>{t("departments_categories_title")}</h2>
          <p>{t("departments_categories_subtitle")}</p>
        </div>

        <div className="dept-grid">
          <div className="dept-card">
            <div className="dept-card-icon water-icon">🚰</div>
            <h5>{i18n.language === "hi" ? "जल आपूर्ति" : "Water Supply"}</h5>
            <ul>
              <li>{i18n.language === "hi" ? "पानी न आना" : "No Water"}</li>
              <li>{i18n.language === "hi" ? "पाइप लाइन लीक" : "Pipeline Leakage"}</li>
              <li>{i18n.language === "hi" ? "गंदा पानी" : "Dirty Water"}</li>
            </ul>
          </div>
          <div className="dept-card">
            <div className="dept-card-icon electricity-icon">⚡</div>
            <h5>{i18n.language === "hi" ? "बिजली" : "Electricity"}</h5>
            <ul>
              <li>{i18n.language === "hi" ? "बिजली गुल" : "Power Outage"}</li>
              <li>{i18n.language === "hi" ? "टूटा ट्रांसफार्मर" : "Damaged Transformer"}</li>
              <li>{i18n.language === "hi" ? "बिजली के लटकते तार" : "Hanging Wire"}</li>
            </ul>
          </div>
          <div className="dept-card">
            <div className="dept-card-icon road-icon">🛣️</div>
            <h5>{i18n.language === "hi" ? "सड़कें और बुनियादी ढांचा" : "Roads & Infrastructure"}</h5>
            <ul>
              <li>{i18n.language === "hi" ? "सड़क के गड्ढे" : "Potholes"}</li>
              <li>{i18n.language === "hi" ? "टूटा डिवाइडर" : "Broken Divider"}</li>
              <li>{i18n.language === "hi" ? "अतिक्रमण" : "Road Blockage"}</li>
            </ul>
          </div>
          <div className="dept-card">
            <div className="dept-card-icon drainage-icon">🏗️</div>
            <h5>{i18n.language === "hi" ? "निकासी और सीवरेज" : "Drainage & Sewerage"}</h5>
            <ul>
              <li>{i18n.language === "hi" ? "उफनता नाला" : "Drain Overflow"}</li>
              <li>{i18n.language === "hi" ? "सीवर ब्लॉक" : "Sewer Block"}</li>
              <li>{i18n.language === "hi" ? "खुला मैनहोल" : "Open Manhole"}</li>
            </ul>
          </div>
          <div className="dept-card">
            <div className="dept-card-icon sanitation-icon">🗑️</div>
            <h5>{i18n.language === "hi" ? "स्वच्छता और कचरा" : "Sanitation & Waste"}</h5>
            <ul>
              <li>{i18n.language === "hi" ? "कचरा संग्रह न होना" : "Uncollected Waste"}</li>
              <li>{i18n.language === "hi" ? "सड़ता कूड़ा" : "Overflowing Bin"}</li>
              <li>{i18n.language === "hi" ? "मृत जानवर" : "Dead Animal"}</li>
            </ul>
          </div>
          <div className="dept-card">
            <div className="dept-card-icon environment-icon">🌳</div>
            <h5>{i18n.language === "hi" ? "पर्यावरण और वन" : "Environment & Forest"}</h5>
            <ul>
              <li>{i18n.language === "hi" ? "पेड़ का गिरना" : "Fallen Tree"}</li>
              <li>{i18n.language === "hi" ? "अवैध कटान" : "Illegal Tree Cutting"}</li>
              <li>{i18n.language === "hi" ? "वायु/ध्वनि प्रदूषण" : "Air/Noise Pollution"}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Info Sections: How it works & Emergency */}
      <section className="gov-section-alt how-it-works">
        <div className="info-grid-container">
          {/* Workflow */}
          <div className="workflow-container">
            <h3>{t("redressal_process_title")}</h3>
            <div className="workflow-steps">
              <div className="step-block">
                <span className="step-number">1</span>
                <div>
                  <h6>{t("step_registration_title")}</h6>
                  <p>{t("step_registration_desc")}</p>
                </div>
              </div>
              <div className="step-block">
                <span className="step-number">2</span>
                <div>
                  <h6>{t("step_routing_title")}</h6>
                  <p>{t("step_routing_desc")}</p>
                </div>
              </div>
              <div className="step-block">
                <span className="step-number">3</span>
                <div>
                  <h6>{t("step_sla_title")}</h6>
                  <p>{t("step_sla_desc")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Panel */}
          <div className="emergency-panel">
            <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
            <h3>{t("emergency_panel_title")}</h3>
            <p>{t("emergency_panel_desc")}</p>
            <div className="emergency-time">
              <span>{t("emergency_sla_val")}</span>
            </div>
            <div className="helpline-contact">
              <PhoneCall className="w-6 h-6 text-rose-200" />
              <span>{t("emergency_helpline_val")}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
