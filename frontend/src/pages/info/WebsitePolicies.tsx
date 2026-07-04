import { Shield } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function WebsitePolicies() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="Website Policies | वेबसाइट नीतियां" 
      icon={<Shield className="w-8 h-8 text-blue-600" />}
    >
      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <h6 className="font-bold text-gray-800 text-base">
          {isHi ? "कॉपीराइट नीति" : "Copyright Policy"}
        </h6>
        <p>
          {isHi 
            ? "इस पोर्टल पर दी गई सामग्री को बिना किसी विशिष्ट अनुमति के किसी भी प्रारूप या मीडिया में निःशुल्क पुनरुत्पादित किया जा सकता है, बशर्ते कि सामग्री को सटीक रूप से पुनरुत्पादित किया जाए और इसका उपयोग किसी भी आपत्तिजनक या अपमानजनक तरीके से न किया जाए।" 
            : "Material featured on this portal may be reproduced free of charge in any format or media without requiring specific permission, subject to the material being reproduced accurately and not being used in a derogatory manner."}
        </p>
        <h6 className="font-bold text-gray-800 mt-4 text-base">
          {isHi ? "सामग्री योगदान एवं मॉडरेशन नीति" : "Content Contribution & Moderation Policy"}
        </h6>
        <p>
          {isHi 
            ? "होस्ट की गई सामग्री का स्वामित्व और संपादन राज्य के नगर निगम विभागों के पास है। सभी नागरिक टिप्पणियाँ साइबर कानूनों के तहत सख्त निगरानी के अधीन हैं।" 
            : "Content hosted is owned and curated by the state municipal departments. All citizen comments are subject to strict monitoring under cyber laws."}
        </p>
      </div>
    </InfoPageLayout>
  );
}
