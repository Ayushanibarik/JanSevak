import { useState, useEffect } from "react";
import { Languages, ShieldCheck, Eye, Cpu, Bell, User, Clock, MessageCircle, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadLanguageBundle } from "../i18n";

export default function Header() {
  const { t, i18n } = useTranslation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Accessibility state initialization and handlers
  useEffect(() => {
    const storedFont = localStorage.getItem("accessibility-font") || "normal";
    applyFontSize(storedFont);

    const storedContrast = localStorage.getItem("accessibility-contrast") === "true";
    if (storedContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    const storedDark = localStorage.getItem("accessibility-dark") === "true";
    if (storedDark) {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }

    const storedColorblind = localStorage.getItem("accessibility-colorblind") === "true";
    if (storedColorblind) {
      document.documentElement.classList.add("colorblind-mode");
    } else {
      document.documentElement.classList.remove("colorblind-mode");
    }
  }, []);

  const applyFontSize = (size: string) => {
    document.documentElement.classList.remove("font-sm", "font-lg");
    if (size === "sm") document.documentElement.classList.add("font-sm");
    if (size === "lg") document.documentElement.classList.add("font-lg");
  };

  const changeFontSize = (size: string) => {
    localStorage.setItem("accessibility-font", size);
    applyFontSize(size);
  };

  const toggleHighContrast = () => {
    const active = document.documentElement.classList.toggle("high-contrast");
    localStorage.setItem("accessibility-contrast", active ? "true" : "false");
  };

  const toggleDarkMode = () => {
    const active = document.documentElement.classList.toggle("dark-theme");
    localStorage.setItem("accessibility-dark", active ? "true" : "false");
  };

  const toggleColorblindMode = () => {
    const active = document.documentElement.classList.toggle("colorblind-mode");
    localStorage.setItem("accessibility-colorblind", active ? "true" : "false");
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    localStorage.setItem("lang", lang);
    await loadLanguageBundle(lang);
    i18n.changeLanguage(lang);
  };

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString(`${i18n.language}-IN`, options);
  };

  return (
    <header className="gov-header-container">
      {/* Top Banner (Indian Flag Colors Strip & Top Bar) */}
      <div className="gov-top-bar">
        <div className="flag-strip">
          <div className="saffron"></div>
          <div className="white"></div>
          <div className="green"></div>
        </div>
        <div className="gov-top-bar-content flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 20px' }}>
          
          {/* Integrated Real Communication Links */}
          <div className="helpline-top-bar flex items-center text-xs font-bold text-white gap-3" style={{ color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="text-[#FF9933]">HELPLINE / सहायता:</span>
            <a href="https://wa.me/917894281460?text=Hello%20JanSevak,%20I%20want%20to%20file%20a%20grievance" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-400 text-white" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp
            </a>
            <a href="tel:+917894281460" className="flex items-center gap-1 hover:text-blue-300 text-white" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone className="w-3.5 h-3.5 text-blue-300" />
              Call
            </a>
            <a href="sms:+917894281460?body=JANSEVAK%20GRIEVANCE" className="flex items-center gap-1 hover:text-orange-400 text-white" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Send className="w-3.5 h-3.5 text-orange-400" />
              SMS
            </a>
            <span className="text-gray-500">|</span>
            <span className="text-white">+91 78942 81460</span>
          </div>

          {/* Accessibility & Language Container */}
          <div className="accessibility-and-lang flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Font Sizing Controls */}
            <div className="gov-accessibility-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button onClick={() => changeFontSize("sm")} className="accessibility-btn" title="Decrease Text Size">A-</button>
              <button onClick={() => changeFontSize("normal")} className="accessibility-btn" title="Reset Text Size">A</button>
              <button onClick={() => changeFontSize("lg")} className="accessibility-btn" title="Increase Text Size">A+</button>
            </div>

            {/* Contrast & Theme Controls */}
            <div className="gov-accessibility-controls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button onClick={toggleHighContrast} className="accessibility-btn" title="Toggle High Contrast">Contrast</button>
              <button onClick={toggleDarkMode} className="accessibility-btn" title="Toggle Dark Theme">Dark Mode</button>
              <button onClick={toggleColorblindMode} className="accessibility-btn" title="Toggle Colorblind Mode">Colorblind</button>
            </div>

            {/* Language Selector */}
            <div className="lang-toggle-container flex items-center">
              <Languages className="w-4 h-4 text-blue-300 mr-1" />
              <select 
                className="lang-select" 
                value={i18n.language} 
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="or">ଓଡ଼ିଆ (Odia)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="as">অসমীया (Assamese)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand Header */}
      <div className="gov-brand-header">
        <Link to="/" className="gov-brand-left" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand-text">
            <h1 className="main-title">{t("portal_title")}</h1>
            <p className="sub-title">{t("portal_subtitle")}</p>
          </div>
        </Link>
      </div>

      {/* Nav Bar */}
      <div className="gov-nav-bar">
        <div className="nav-links">
          <Link to="/" className="nav-link-item">{t("home")}</Link>
          <Link to="/grievance/new" className="nav-link-item">{t("file_grievance")}</Link>
          <Link to="/grievance/track" className="nav-link-item">{t("track_grievance")}</Link>
          <Link to="/heatmap" className="nav-link-item">{t("interactive_map")}</Link>
          <Link to="/dashboard/public" className="nav-link-item">{t("public_stats")}</Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" className="login-btn-nav">
            <User className="w-4 h-4 mr-1.5" />
            {t("officer_login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
