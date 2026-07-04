import { ShieldAlert } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function DisclaimerPage() {
  const { i18n } = useTranslation();
  return (
    <InfoPageLayout 
      title="Disclaimer | अस्वीकरण" 
      icon={<ShieldAlert className="w-8 h-8 text-rose-500" />}
    >
      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        {i18n.language === "hi" ? (
          <p>
            इस पोर्टल पर प्रदान की गई जानकारी, सेवाएं और आंकड़े सार्वजनिक जागरूकता और प्रशासनिक जवाबदेही के लिए हैं। यद्यपि हम सटीक डेटा बनाए रखने का प्रयास करते हैं, लेकिन जमीनी अपडेट और निवारण के लिए केवल नगर निगम विभाग ही जिम्मेदार हैं।
          </p>
        ) : (
          <p>
            The information, services, and statistics provided on this portal are for public awareness and administrative accountability. While we strive to maintain accurate data, the municipal departments are solely liable for field updates and resolutions.
          </p>
        )}
      </div>
    </InfoPageLayout>
  );
}
