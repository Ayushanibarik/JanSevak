import { Shield } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { i18n } = useTranslation();
  return (
    <InfoPageLayout 
      title="Privacy Policy | गोपनीयता नीति" 
      icon={<Shield className="w-8 h-8 text-emerald-600" />}
    >
      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        {i18n.language === "hi" ? (
          <>
            <p>
              हम आपकी गोपनीयता का सम्मान करते हैं। फोन नंबर, निर्देशांक और ईमेल जैसे व्यक्तिगत क्रेडेंशियल केवल शिकायतों को प्रेषित करने और उनकी स्थिति में बदलावों की सूचना देने के लिए एकत्र किए जाते हैं।
            </p>
            <p>
              जनसेवक नागरिकों के डेटा को किसी तीसरे पक्ष को बेचता, किराए पर या पट्टे पर नहीं देता है। यदि किसी शिकायत को गुमनाम चिह्नित किया जाता है, तो पहचान विवरण समाधान करने वाले विभागों से छिपा दिए जाते हैं।
            </p>
          </>
        ) : (
          <>
            <p>
              We value your privacy. Personal credentials such as phone numbers, coordinates, and emails are collected solely to route grievances and communicate status changes.
            </p>
            <p>
              JanSevak does not sell, rent, or lease citizen data to third parties. If a complaint is marked as anonymous, identification details are hidden from resolving departments.
            </p>
          </>
        )}
      </div>
    </InfoPageLayout>
  );
}
