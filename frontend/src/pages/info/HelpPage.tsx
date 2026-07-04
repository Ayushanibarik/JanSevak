import { HelpCircle } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function HelpPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="Help | सहायता" 
      icon={<HelpCircle className="w-8 h-8 text-blue-600" />}
    >
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          {isHi ? "क्या आपको सहायता की आवश्यकता है? इन त्वरित निर्देशों का पालन करें:" : "Need assistance? Follow these quick instructions:"}
        </p>
        {isHi ? (
          <ul className="list-disc pl-5 space-y-3 text-sm mt-2">
            <li>शिकायत दर्ज करने के लिए: "शिकायत दर्ज करें" पर क्लिक करें और 5-चरणीय फ़ॉर्म को पूरा करें।</li>
            <li>भाषा बदलने के लिए: हेडर बार में भाषा ड्रॉपडाउन का उपयोग करें।</li>
            <li>विशिष्ट स्थानीयकृत शिकायतें देखने के लिए: "शिकायत मानचित्र" खोलें और विभाग द्वारा फ़िल्टर करें।</li>
          </ul>
        ) : (
          <ul className="list-disc pl-5 space-y-3 text-sm mt-2">
            <li>To file a complaint: Click "File Grievance" and complete the 5-step form.</li>
            <li>To change language: Use the language dropdown in the header bar.</li>
            <li>To view localized complaints: Open the "Interactive Map" and filter by department.</li>
          </ul>
        )}
      </div>
    </InfoPageLayout>
  );
}
