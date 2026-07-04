import { Link } from "react-router-dom";
import { Shield, BookOpen, HeartHandshake, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gov-footer">
      <div className="gov-footer-main">
        <div className="gov-footer-grid">
          {/* Col 1: About */}
          <div className="footer-col">
            <h6 className="footer-title flex items-center gap-2">
              <Info className="w-5 h-5 text-[#FF9933]" />
              {t("about_portal")}
            </h6>
            <ul className="footer-links-list">
              <li><Link to="/portal-overview">{t("portal_overview")}</Link></li>
              <li><Link to="/sla-guidelines">{t("sla_guidelines")}</Link></li>
              <li><Link to="/department-directory">{t("dept_directory")}</Link></li>
              <li><Link to="/how-it-works">{t("how_it_works")}</Link></li>
            </ul>
          </div>

          {/* Col 2: Help */}
          <div className="footer-col">
            <h6 className="footer-title flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-blue-400" />
              {t("help_support")}
            </h6>
            <ul className="footer-links-list">
              <li><Link to="/faq">{t("faq")}</Link></li>
              <li><Link to="/user-manual">{t("user_manual")}</Link></li>
              <li><Link to="/feedback">{t("submit_feedback")}</Link></li>
              <li><Link to="/contact">{t("contact_us")}</Link></li>
            </ul>
          </div>

          {/* Col 3: Policies */}
          <div className="footer-col">
            <h6 className="footer-title flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              {t("policies")}
            </h6>
            <ul className="footer-links-list">
              <li><Link to="/website-policies">{t("website_policies")}</Link></li>
              <li><Link to="/privacy-policy">{t("privacy_policy")}</Link></li>
              <li><Link to="/terms">{t("terms_conditions")}</Link></li>
              <li><Link to="/hyperlinking">{t("hyperlinking_policy")}</Link></li>
            </ul>
          </div>

          {/* Col 4: Sitemap */}
          <div className="footer-col">
            <h6 className="footer-title flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              {t("sitemap_access")}
            </h6>
            <ul className="footer-links-list">
              <li><Link to="/sitemap">{t("sitemap")}</Link></li>
              <li><Link to="/accessibility">{t("accessibility_statement")}</Link></li>
              <li><Link to="/disclaimer">{t("disclaimer")}</Link></li>
              <li><Link to="/help">{t("help")}</Link></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom-bar">
          <p className="gov-footer-text">
            {t("footer_content_owner")}
          </p>
          <p className="gov-footer-copyright">
            {t("footer_copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
