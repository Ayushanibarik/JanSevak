import { Info } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function PortalOverview() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="Portal Overview | पोर्टल अवलोकन" 
      icon={<Info className="w-8 h-8 text-blue-600" />}
    >
      <div className="space-y-6 text-gray-700 leading-relaxed">
        {isHi ? (
          <p>
            <strong>जनसेवक</strong> एक राष्ट्रीय एकीकृत जन शिकायत निवारण पोर्टल है जो नागरिकों और नगर निगम प्राधिकरणों के बीच की दूरी को कम करने के लिए डिज़ाइन किया गया है। यह मंच नागरिकों को स्थानीय बुनियादी ढांचे, बिजली, पानी, स्वच्छता और सुरक्षा से संबंधित शिकायतों को दर्ज करने का एक आसान माध्यम प्रदान करता है।
          </p>
        ) : (
          <p>
            <strong>JanSevak</strong> is the National Unified Civic Grievance Management System designed to bridge the gap between citizens and municipal authorities. 
            Our platform provides a seamless pathway for citizens to register grievances relating to local infrastructure, utility breakdowns, sanitation, and safety.
          </p>
        )}

        <h5 className="font-bold text-gray-800 text-lg border-b pb-2 mt-6">
          {isHi ? "मुख्य उद्देश्य" : "Key Objectives"}
        </h5>
        
        {isHi ? (
          <ul className="list-disc pl-5 space-y-3 mt-2">
            <li><strong>पारदर्शिता (Transparency):</strong> विस्तृत ऑडिट लॉग के साथ शिकायतों की वास्तविक समय में ट्रैकिंग।</li>
            <li><strong>जवाबदेही (Accountability):</strong> स्वचालित रूटिंग और उच्च अधिकारियों को समय-सीमा आधारित स्वचालित एस्केलेशन।</li>
            <li><strong>सुगम्यता (Accessibility):</strong> सभी नागरिकों के लिए अंग्रेजी, हिंदी और सभी क्षेत्रीय भाषाओं में उपलब्ध।</li>
          </ul>
        ) : (
          <ul className="list-disc pl-5 space-y-3 mt-2">
            <li><strong>Transparency:</strong> Real-time tracking of grievances with detailed audit logs.</li>
            <li><strong>Accountability:</strong> Automatic routing and SLA-based automatic escalation to higher officers.</li>
            <li><strong>Accessibility:</strong> Available in English, Hindi, and all regional languages for all citizens.</li>
          </ul>
        )}
      </div>
    </InfoPageLayout>
  );
}
