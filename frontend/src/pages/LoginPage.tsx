import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Phone, Mail, ShieldAlert, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"citizen" | "officer">("citizen");
  const [identifier, setIdentifier] = useState(""); // Email or phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: identifier.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Login failed" }));
        setError(errorData.detail || "Incorrect username/password. Please try again.");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);

      // Fetch user profile using /auth/me
      const meResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${data.access_token}`,
        },
      });

      if (meResponse.ok) {
        const meData = await meResponse.json();
        localStorage.setItem("userRole", meData.role);
        localStorage.setItem("userDept", meData.department || "all");
        localStorage.setItem("userDistrict", meData.district_code || "BBSR");
        localStorage.setItem("userState", meData.state || "Odisha");
        localStorage.setItem("userWard", meData.ward_number || "");
        localStorage.setItem("userName", meData.full_name);

        // Redirect depending on role
        if (meData.role === "ward_officer" || meData.role === "junior_engineer" || meData.role === "assistant_engineer" || meData.role === "executive_engineer") {
          navigate("/dashboard/officer");
        } else if (meData.role === "minister") {
          navigate("/dashboard/minister");
        } else if (meData.role === "citizen") {
          navigate("/dashboard/citizen");
        } else {
          navigate("/dashboard/admin");
        }
      } else {
        setError("Failed to fetch user profile details.");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("Server connection failed. Please ensure the backend is running.");
    }
  };

  return (
    <div className="gov-login-container">
      <div className="login-card">
        {/* Flag Bar */}
        <div className="login-flag-bar"></div>

        <div className="login-header">
          <KeyRound className="w-10 h-10 text-[#004080] mb-2" />
          <h3>{t("login_portal_title")}</h3>
          <p>{t("login_portal_subtitle")}</p>
        </div>

        {/* Tab Toggle */}
        <div className="login-tabs">
          <button
            className={`login-tab-btn ${activeTab === "citizen" ? "active" : ""}`}
            onClick={() => setActiveTab("citizen")}
          >
            {t("citizen_tab")}
          </button>
          <button
            className={`login-tab-btn ${activeTab === "officer" ? "active" : ""}`}
            onClick={() => setActiveTab("officer")}
          >
            {t("officer_tab")}
          </button>
        </div>

        {error && <div className="login-error-msg">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          {activeTab === "citizen" ? (
            <div className="form-group">
              <label>{t("mobile_number_label")}</label>
              <div className="input-with-icon">
                <Phone className="w-5 h-5 text-gray-400 icon" />
                <input
                  type="tel"
                  placeholder={t("placeholder_mobile")}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label>{t("officer_email_label")}</label>
              <div className="input-with-icon">
                <Mail className="w-5 h-5 text-gray-400 icon" />
                <input
                  type="text"
                  placeholder={t("placeholder_officer_email")}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>{t("password_label")}</label>
            <div className="input-with-icon">
              <Lock className="w-5 h-5 text-gray-400 icon" />
              <input
                type="password"
                placeholder={t("placeholder_password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>



          <button type="submit" className="login-submit-btn">
            {t("btn_signin")}
          </button>
        </form>

        <div className="login-footer-links">
          {activeTab === "citizen" ? (
            <>
              <Link to="/register">{t("register_new_citizen")}</Link>
              <span className="bullet">•</span>
            </>
          ) : null}
          <a href="#">{t("forgot_password")}</a>
        </div>

        <div className="security-notice">
          <ShieldAlert className="w-4 h-4 mr-1 text-amber-600" />
          <span>{t("login_security_notice")}</span>
        </div>
      </div>
    </div>
  );
}
