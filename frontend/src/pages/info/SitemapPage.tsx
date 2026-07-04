import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function SitemapPage() {
  const { t, i18n } = useTranslation();
  return (
    <InfoPageLayout 
      title="Sitemap | साइटमैप" 
      icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
    >
      <div className="space-y-4 text-sm font-semibold text-blue-600">
        <ul className="space-y-3">
          <li className="flex items-center gap-1.5 hover:underline">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link to="/">{i18n.language === "hi" ? "मुख्य पृष्ठ" : "Home"}</Link>
          </li>
          <li className="flex items-center gap-1.5 hover:underline">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link to="/grievance/new">{t("file_grievance")}</Link>
          </li>
          <li className="flex items-center gap-1.5 hover:underline">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link to="/grievance/track">{t("track_grievance")}</Link>
          </li>
          <li className="flex items-center gap-1.5 hover:underline">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link to="/heatmap">{t("interactive_map")}</Link>
          </li>
          <li className="flex items-center gap-1.5 hover:underline">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link to="/dashboard/public">{t("public_stats")}</Link>
          </li>
          <li className="flex items-center gap-1.5 hover:underline">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Link to="/login">{t("officer_login")}</Link>
          </li>
        </ul>
      </div>
    </InfoPageLayout>
  );
}
