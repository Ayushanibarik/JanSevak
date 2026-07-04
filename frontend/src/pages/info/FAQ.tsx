import { HelpCircle } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="Frequently Asked Questions | सामान्य प्रश्न" 
      icon={<HelpCircle className="w-8 h-8 text-amber-500" />}
    >
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h6 className="font-bold text-gray-800">
            {isHi ? "प्र. 1. मैं अपनी शिकायत को कैसे ट्रैक करूँ?" : "Q1. How do I track my grievance?"}
          </h6>
          <p className="text-sm text-gray-600 mt-2">
            {isHi 
              ? 'नेविगेशन बार में "शिकायत की स्थिति" (Track Grievance) पेज पर जाएं, अपनी विशिष्ट टोकन आईडी दर्ज करें और वास्तविक समय की स्थिति और प्रगति विवरण देखने के लिए खोज पर क्लिक करें।' 
              : 'Go to the "Track Grievance" page in the navigation bar, input your unique Token ID, and click search to view the real-time status and timeline log.'}
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h6 className="font-bold text-gray-800">
            {isHi ? "प्र. 2. आपातकालीन शिकायत क्या होती है?" : "Q2. What is an emergency grievance?"}
          </h6>
          <p className="text-sm text-gray-600 mt-2">
            {isHi 
              ? "कोई भी समस्या जिससे तत्काल शारीरिक खतरा हो सकता है (जैसे बिजली के लटकते तार, मुख्य सड़क अवरुद्ध होना, बाढ़ आदि) उसकी समाधान समय सीमा सख्त 4 घंटे (SLA) होती है।" 
              : "Any issue posing immediate physical danger (electricity hanging wires, main road blockage, sewage floods) has a strict 4-hour resolution SLA."}
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h6 className="font-bold text-gray-800">
            {isHi ? "प्र. 3. क्या मैं गुमनाम रूप से शिकायत दर्ज कर सकता हूँ?" : "Q3. Can I file a grievance anonymously?"}
          </h6>
          <p className="text-sm text-gray-600 mt-2">
            {isHi 
              ? 'हाँ। शिकायत दर्ज करने की प्रक्रिया के चरण 4 के दौरान, "गुमनाम" (Anonymous) चेकबॉक्स को टिक करने से आपका नाम और फोन नंबर सार्वजनिक सूचियों और संबंधित अधिकारियों से छिप जाता है।' 
              : 'Yes. During Step 4 of the filing process, checking the "Anonymous" box hides your name and phone number from public lists and assigning officers.'}
          </p>
        </div>
      </div>
    </InfoPageLayout>
  );
}
