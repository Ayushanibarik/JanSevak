import { Landmark } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function DepartmentDirectory() {
  const { t, i18n } = useTranslation();
  
  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="Department Directory | विभागीय निर्देशिका" 
      icon={<Landmark className="w-8 h-8 text-indigo-600" />}
    >
      <div className="space-y-6">
        <p className="text-gray-700">
          {isHi 
            ? "नगर निगम विभागों के लिए संपर्क जानकारी और शिकायत रूटिंग मानचित्र:" 
            : "Contact information and grievance routing map for Municipal Departments:"}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-200 rounded-lg text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-bold text-gray-600">
                  {isHi ? "विभाग" : "Department"}
                </th>
                <th className="p-3 font-bold text-gray-600">
                  {isHi ? "संभाले जाने वाली श्रेणियाँ" : "Categories Handled"}
                </th>
                <th className="p-3 font-bold text-gray-600">
                  {isHi ? "हेल्पलाइन" : "Helpline"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-semibold">{t("dept_water_supply")}</td>
                <td className="p-3 text-gray-600">
                  {isHi ? "पानी न आना, पाइपलाइन लीक, दूषित पेयजल आपूर्ति" : "No water, pipeline leakage, contaminated supply"}
                </td>
                <td className="p-3 text-blue-600 font-bold">1800-345-0001</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-semibold">{t("dept_electricity")}</td>
                <td className="p-3 text-gray-600">
                  {isHi ? "ट्रांसफार्मर क्षति, बिजली कटौती, लटकते तार" : "Transformer damage, power outage, hanging wires"}
                </td>
                <td className="p-3 text-blue-600 font-bold">1800-345-0002</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-semibold">{t("dept_roads")}</td>
                <td className="p-3 text-gray-600">
                  {isHi ? "सड़क के गड्ढे, टूटा डिवाइडर, सड़क अवरोध" : "Potholes, broken divider, road blockage"}
                </td>
                <td className="p-3 text-blue-600 font-bold">1800-345-0003</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-semibold">{t("dept_drainage")}</td>
                <td className="p-3 text-gray-600">
                  {isHi ? "उफनती नाली, सीवर ब्लॉक, खुला मैनहोल" : "Overflowing drain, sewer blockage, open manhole"}
                </td>
                <td className="p-3 text-blue-600 font-bold">1800-345-0004</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-semibold">{t("dept_sanitation")}</td>
                <td className="p-3 text-gray-600">
                  {isHi ? "कचरा न उठना, कचरे का डिब्बा उफनना, मृत जानवर निपटान" : "Uncollected waste, overflowing bin, dead animal disposal"}
                </td>
                <td className="p-3 text-blue-600 font-bold">1800-345-0005</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </InfoPageLayout>
  );
}
