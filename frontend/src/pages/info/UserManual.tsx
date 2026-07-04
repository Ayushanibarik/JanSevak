import { FileText } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function UserManual() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="User Manual | उपयोगकर्ता नियमावली" 
      icon={<FileText className="w-8 h-8 text-blue-600" />}
    >
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          {isHi 
            ? "राष्ट्रीय नागरिक शिकायत पोर्टल को संचालित करने के निर्देशों को देखें या डाउनलोड करें:" 
            : "Download or view instructions to operate the National Civic Grievance Portal:"}
        </p>
        {isHi ? (
          <ol className="list-decimal pl-5 space-y-3">
            <li><strong>नागरिक पंजीकरण:</strong> अपने ईमेल पते, फोन नंबर और नाम का उपयोग करके पंजीकरण करें।</li>
            <li><strong>शिकायत दर्ज करना:</strong> एक प्राथमिक विभाग चुनें। एक मिलान उपश्रेणी चुनें। सटीक स्थान को पिन करने के लिए मानचित्र पर क्लिक करें। शीर्षक/विवरण भरें और सबमिट करें।</li>
            <li><strong>समय-सीमा लॉग की जाँच करना:</strong> ऑडिट ट्रेल देखें। यदि इसे एस्केलेट किया जाता है, तो आप देख सकते हैं कि यह वर्तमान में किस AE, EE या आयुक्त को प्रेषित है।</li>
            <li><strong>शिकायत बंद करना:</strong> शिकायत हल हो जाने पर समाधान की गुणवत्ता पर प्रतिक्रिया (Feedback) दर्ज करें।</li>
          </ol>
        ) : (
          <ol className="list-decimal pl-5 space-y-3">
            <li><strong>Citizen Registration:</strong> Register using your email address, phone number, and name.</li>
            <li><strong>Filing a Grievance:</strong> Select a primary department. Choose a matching subcategory. Click on the map to pin the exact coordinate. Fill in title/description and submit.</li>
            <li><strong>Checking Timeline Logs:</strong> Watch the audit trail. If it gets escalated, you will see exactly which AE, EE, or Commissioner it is currently routed to.</li>
            <li><strong>Closing:</strong> Leave feedback on the resolution quality once solved.</li>
          </ol>
        )}
      </div>
    </InfoPageLayout>
  );
}
