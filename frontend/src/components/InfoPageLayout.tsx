import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InfoPageLayoutProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function InfoPageLayout({ title, icon, children }: InfoPageLayoutProps) {
  const { t, i18n } = useTranslation();
  
  const getLocalizedTitle = (tStr: string) => {
    if (tStr.includes(" | ")) {
      const parts = tStr.split(" | ");
      return i18n.language === "hi" ? parts[1] : parts[0];
    }
    return tStr;
  };

  return (
    <div className="gov-info-page-container bg-gray-50 min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-bold mb-6">
          <ArrowLeft className="w-4 h-4" /> {i18n.language === "hi" ? "मुख्य पृष्ठ पर लौटें" : "Back to Home"}
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
          
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
            {icon}
            <h1 className="text-2xl font-black text-gray-800">{getLocalizedTitle(title)}</h1>
          </div>

          <div className="info-page-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
