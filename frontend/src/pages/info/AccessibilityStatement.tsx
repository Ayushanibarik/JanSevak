import { Info } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function AccessibilityStatement() {
  const { i18n } = useTranslation();
  return (
    <InfoPageLayout 
      title="Accessibility Statement | सुगम्यता वक्तव्य" 
      icon={<Info className="w-8 h-8 text-blue-600" />}
    >
      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        {i18n.language === "hi" ? (
          <p>
            यह वेबसाइट सभी उपयोगकर्ताओं के लिए सुलभ होने के लिए डिज़ाइन की गई है, जिसमें दृश्य, श्रवण, संज्ञानात्मक या शारीरिक अक्षमता वाले लोग शामिल हैं। यह W3C वेब सामग्री सुगम्यता दिशानिर्देशों (WCAG) 2.1 स्तर AA और GIGW 3.0 दिशानिर्देशों के अनुपालन में बनाई गई है।
          </p>
        ) : (
          <p>
            This website is designed to be accessible to all users, including those with visual, hearing, cognitive, or physical impairments. It is built in compliance with W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and GIGW 3.0 guidelines.
          </p>
        )}
      </div>
    </InfoPageLayout>
  );
}
