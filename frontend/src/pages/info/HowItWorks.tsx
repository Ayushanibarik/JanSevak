import { BookOpen } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function HowItWorks() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="How it Works | यह कैसे काम करता है" 
      icon={<BookOpen className="w-8 h-8 text-teal-600" />}
    >
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <div className="relative border-l-2 border-blue-500 pl-6 space-y-8">
          <div className="relative">
            <div className="absolute -left-9 top-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">1</div>
            <h6 className="font-bold text-gray-800">
              {isHi ? "शिकायत पंजीकरण" : "Submit Grievance"}
            </h6>
            <p className="text-sm mt-1 text-gray-600">
              {isHi 
                ? "अपनी शिकायत दर्ज करें। विभाग, श्रेणियाँ चुनें, मानचित्र पर सटीक स्थान चिह्नित करें, विवरण और आवश्यक फ़ाइल अपलोड करें, और अपनी विशिष्ट टोकन आईडी प्राप्त करें।"
                : "Submit your civic complaint. Select department, categories, mark the exact location on the map, upload details, and receive your unique Token ID."}
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-9 top-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">2</div>
            <h6 className="font-bold text-gray-800">
              {isHi ? "स्वचालित अधिकारी आवंटन" : "Automatic Routing"}
            </h6>
            <p className="text-sm mt-1 text-gray-600">
              {isHi
                ? "हमारा पोर्टल शिकायत की श्रेणी और स्थान की पहचान करता है और शिकायत को सीधे संबंधित वार्ड के कनिष्ठ अभियंता (JE) को प्रेषित करता है।"
                : "Our portal identifies the department and routes the complaint directly to the Junior Engineer (JE) of the concerned ward."}
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-9 top-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">3</div>
            <h6 className="font-bold text-gray-800">
              {isHi ? "ट्रैकिंग और एस्केलेशन" : "SLA Tracking & Escalation"}
            </h6>
            <p className="text-sm mt-1 text-gray-600">
              {isHi
                ? "निवारण समय सीमा की ट्रैकिंग शुरू हो जाती है। समय सीमा बीत जाने पर शिकायतें स्वचालित रूप से हर घंटे उच्च अधिकारियों (AE, EE, आयुक्त) को प्रेषित (escalate) हो जाती हैं।"
                : "Resolution time starts ticking. Overdue complaints escalate automatically hourly to higher authorities (AE, EE, Commissioner)."}
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-9 top-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">4</div>
            <h6 className="font-bold text-gray-800">
              {isHi ? "शिकायत का निवारण" : "Resolution"}
            </h6>
            <p className="text-sm mt-1 text-gray-600">
              {isHi
                ? "एक बार जब अधिकारी समस्या का समाधान कर लेता है, तो वे निवारण का प्रमाण प्रस्तुत करते हैं। नागरिक को फ़ाइल की समीक्षा करने और उसे बंद करने के लिए एक एसएमएस/अधिसूचना प्राप्त होती है।"
                : "Once the officer resolves the issue, they submit proof of resolution. The citizen receives an SMS/Notification to review and close the file."}
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}
