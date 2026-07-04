import { FileText } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { i18n } = useTranslation();
  return (
    <InfoPageLayout 
      title="Terms & Conditions | नियम एवं शर्तें" 
      icon={<FileText className="w-8 h-8 text-blue-600" />}
    >
      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        {i18n.language === "hi" ? (
          <>
            <p>
              इस पोर्टल का उपयोग करके, आप प्रामाणिक शिकायत अनुरोध प्रस्तुत करने के लिए सहमत हैं। धोखाधड़ी या झूठी रिपोर्ट दर्ज करना स्थानीय नागरिक नियमों और साइबर कानून के तहत एक दंडनीय अपराध है।
            </p>
            <p>
              सरकार के पास समान स्थान क्लस्टर से दर्ज की गई समान शिकायतों को एक मूल ट्रैकिंग टोकन में मिलाने का अधिकार सुरक्षित है ताकि फील्ड संचालन को सुव्यवस्थित किया जा सके।
            </p>
          </>
        ) : (
          <>
            <p>
              By using this portal, you agree to submit authentic grievance requests. Filing fraudulent or false reports is a punishable offence under local civic regulations and cyber law.
            </p>
            <p>
              The government reserves the right to merge similar complaints registered from the same coordinate clusters into parent tracking tokens to streamline field operations.
            </p>
          </>
        )}
      </div>
    </InfoPageLayout>
  );
}
