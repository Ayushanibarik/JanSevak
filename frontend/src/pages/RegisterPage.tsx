import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwords_dont_match"));
      return;
    }

    // Success Simulation
    setSuccess(true);
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="gov-login-container">
      <div className="login-card registration-card">
        <div className="login-flag-bar"></div>

        <div className="login-header">
          <Link to="/login" className="back-link">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("back_to_login")}
          </Link>
          <User className="w-10 h-10 text-[#004080] mb-2 mt-4" />
          <h3>{t("citizen_registration_title")}</h3>
          <p>{t("citizen_registration_subtitle")}</p>
        </div>

        {error && <div className="login-error-msg">{error}</div>}
        {success && (
          <div className="login-success-msg">
            {t("registration_success")}
          </div>
        )}

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label>{t("fullname_label")}</label>
            <div className="input-with-icon">
              <User className="w-5 h-5 text-gray-400 icon" />
              <input
                type="text"
                placeholder={t("placeholder_fullname")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t("mobile_for_otp")}</label>
            <div className="input-with-icon">
              <Phone className="w-5 h-5 text-gray-400 icon" />
              <input
                type="tel"
                placeholder={t("placeholder_mobile")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t("email_optional")}</label>
            <div className="input-with-icon">
              <Mail className="w-5 h-5 text-gray-400 icon" />
              <input
                type="email"
                placeholder={t("placeholder_email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t("password_label")}</label>
            <div className="input-with-icon">
              <Lock className="w-5 h-5 text-gray-400 icon" />
              <input
                type="password"
                placeholder={t("password_hint")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t("confirm_password_label")}</label>
            <div className="input-with-icon">
              <Lock className="w-5 h-5 text-gray-400 icon" />
              <input
                type="password"
                placeholder={t("placeholder_confirm_password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="terms-checkbox">
            <input type="checkbox" id="agree-terms" required />
            <label htmlFor="agree-terms">
              {t("declare_truthful")}
            </label>
          </div>

          <button type="submit" className="login-submit-btn">
            {t("btn_create_account")}
          </button>
        </form>

        <div className="security-notice mt-6">
          <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
          <span>{t("personal_data_secure")}</span>
        </div>
      </div>
    </div>
  );
}
