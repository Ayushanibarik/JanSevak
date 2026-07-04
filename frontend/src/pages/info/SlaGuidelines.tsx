import { ShieldAlert } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function SlaGuidelines() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="SLA Guidelines | समय सीमा दिशानिर्देश" 
      icon={<ShieldAlert className="w-8 h-8 text-amber-500" />}
    >
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          {isHi 
            ? "समय पर निवारण की गारंटी देने के लिए पोर्टल सख्त सेवा स्तर समझौते (SLA) की समय सीमा के तहत काम करता है। शिकायतों को दो प्राथमिकता वर्गों में विभाजित किया गया है:" 
            : "The portal operates under strict Service Level Agreement (SLA) timelines to guarantee timely resolutions. Grievances are divided into two priority classes:"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h6 className="font-bold text-red-800">
              {isHi ? "आपातकालीन शिकायतें" : "Emergency Grievances"}
            </h6>
            {isHi ? (
              <p className="text-sm text-red-700 mt-2">
                <strong>समाधान का लक्ष्य: 4 घंटे</strong>
                <br />
                इसमें लटके बिजली के नंगे तार, स्थानीय बाढ़ का कारण बनने वाले उफनते नाले, खतरनाक खुले मैनहोल और आग की घटनाएं शामिल हैं।
              </p>
            ) : (
              <p className="text-sm text-red-700 mt-2">
                <strong>Resolution Target: 4 Hours</strong>
                <br />
                Includes dangling live wires, overflowing drains causing local floods, hazardous open manholes, and fires.
              </p>
            )}
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h6 className="font-bold text-blue-800">
              {isHi ? "सामान्य शिकायतें" : "Standard Grievances"}
            </h6>
            {isHi ? (
              <p className="text-sm text-blue-700 mt-2">
                <strong>समाधान का लक्ष्य: 48 घंटे</strong>
                <br />
                इसमें सड़क के गड्ढे, पीने के पानी की पाइपलाइनों का रिसाव, स्वच्छता/कचरा बैकलॉग और स्ट्रीट लाइट की खराबी शामिल हैं।
              </p>
            ) : (
              <p className="text-sm text-blue-700 mt-2">
                <strong>Resolution Target: 48 Hours</strong>
                <br />
                Includes road potholes, leaking drinking water pipelines, sanitation garbage backlog, and street light breakdowns.
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 italic">
          {isHi 
            ? "* नोट: यदि शिकायतों का समाधान नहीं किया जाता है, तो लंबित मामलों को स्वचालित रूप से स्तर 1 (कनिष्ठ अभियंता) से लेकर 9 स्तरों (नगर आयुक्त तक) के माध्यम से हर घंटे एस्केलेट किया जाता है।" 
            : "* Note: Overdue cases are automatically escalated hourly to Level 1 (Junior Engineer) and upwards through 9 levels (up to Municipal Commissioner) if left unresolved."}
        </p>
      </div>
    </InfoPageLayout>
  );
}
