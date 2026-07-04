import { useState } from "react";
import { HeartHandshake, CheckCircle, Send } from "lucide-react";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useTranslation } from "react-i18next";

export default function FeedbackPage() {
  const { i18n } = useTranslation();
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackMsg("");
    }, 5000);
  };

  const isHi = i18n.language === "hi";

  return (
    <InfoPageLayout 
      title="Submit Feedback | प्रतिपुष्टि भेजें" 
      icon={<HeartHandshake className="w-8 h-8 text-emerald-500" />}
    >
      <div className="space-y-6">
        {feedbackSent ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h6 className="font-bold text-lg">
              {isHi ? "आपकी प्रतिक्रिया के लिए धन्यवाद!" : "Thank You for Your Feedback!"}
            </h6>
            <p className="text-sm mt-1">
              {isHi 
                ? "हम सार्वजनिक सेवा वितरण में निरंतर सुधार के लिए आपके इनपुट को महत्व देते हैं।" 
                : "We value your input to continuously improve public service delivery."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {isHi ? "प्रतिक्रिया प्रकार" : "Feedback Type"}
              </label>
              <select 
                value={feedbackType} 
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full p-2.5 border rounded-lg"
              >
                <option value="suggestion">{isHi ? "सुझाव" : "Suggestion"}</option>
                <option value="complaint">{isHi ? "पोर्टल प्रदर्शन शिकायत" : "Portal Performance Complaint"}</option>
                <option value="appreciation">{isHi ? "सराहना" : "Appreciation"}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {isHi ? "आपकी प्रतिपुष्टि / टिप्पणियाँ" : "Your Comments"}
              </label>
              <textarea 
                rows={4} 
                required
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder={isHi ? "पोर्टल का उपयोग करने के अपने अनुभव को साझा करें..." : "Share your experience using the portal..."}
                className="w-full p-2.5 border rounded-lg text-sm"
              />
            </div>
            <button type="submit" className="cta-btn primary-cta bg-[#004080] hover:bg-[#002b54] text-white flex items-center justify-center gap-2 w-full py-3">
              {isHi ? "प्रतिक्रिया सबमिट करें" : "Submit Feedback"} <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </InfoPageLayout>
  );
}
