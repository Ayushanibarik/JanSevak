import { Phone } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { i18n } = useTranslation();
  return (
    <InfoPageLayout 
      title="Contact Us | हमसे संपर्क करें" 
      icon={<Phone className="w-8 h-8 text-teal-600" />}
    >
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <div className="p-4 bg-gray-50 border rounded-lg space-y-4">
          {i18n.language === "hi" ? (
            <>
              <div>
                <h6 className="font-bold text-gray-800">सहायता डेस्क (Support Desk)</h6>
                <p className="text-sm mt-1">ईमेल: support-jansevak@gov.in</p>
                <p className="text-sm">टोल-फ्री हेल्पलाइन: 1800-345-1950 (सुबह 9:00 बजे से शाम 6:00 बजे तक)</p>
              </div>
              <div>
                <h6 className="font-bold text-gray-800">एनआईसी मुख्यालय (NIC Head Office)</h6>
                <p className="text-sm mt-1">राष्ट्रीय सूचना विज्ञान केंद्र (NIC), इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय,</p>
                <p className="text-sm">ए-ब्लॉक, सीजीओ कॉम्प्लेक्स, लोधी रोड, नई दिल्ली - 110003.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h6 className="font-bold text-gray-800">Support Desk</h6>
                <p className="text-sm mt-1">Email: support-jansevak@gov.in</p>
                <p className="text-sm">Toll-Free Helpline: 1800-345-1950 (9:00 AM to 6:00 PM)</p>
              </div>
              <div>
                <h6 className="font-bold text-gray-800">NIC Head Office</h6>
                <p className="text-sm mt-1">National Informatics Centre (NIC), Ministry of Electronics & IT,</p>
                <p className="text-sm">A-Block, CGO Complex, Lodhi Road, New Delhi - 110003.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </InfoPageLayout>
  );
}
