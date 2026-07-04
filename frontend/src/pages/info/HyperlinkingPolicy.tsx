import { BookOpen } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function HyperlinkingPolicy() {
  const { i18n } = useTranslation();
  return (
    <InfoPageLayout 
      title="Hyperlinking Policy | हाइपरलिंकिंग नीति" 
      icon={<BookOpen className="w-8 h-8 text-purple-600" />}
    >
      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        {i18n.language === "hi" ? (
          <p>
            हमें हमारे पोर्टल पर होस्ट की गई जानकारी से सीधे लिंक करने पर कोई आपत्ति नहीं है। हालाँकि, हम अपने पेजों को आपकी साइट के फ़्रेम में लोड करने की अनुमति नहीं देते हैं। इस पोर्टल से संबंधित पेजों को उपयोगकर्ता की नई खुली ब्राउज़र विंडो में लोड किया जाना चाहिए।
          </p>
        ) : (
          <p>
            We do not object to you linking directly to the information hosted on our portal. However, we do not permit our pages to be loaded into frames on your site. The pages belonging to this portal must load into a newly opened browser window of the user.
          </p>
        )}
      </div>
    </InfoPageLayout>
  );
}
