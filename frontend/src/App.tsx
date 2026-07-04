import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GrievanceFormPage from "./pages/GrievanceFormPage";
import TrackPage from "./pages/TrackPage";
import HeatmapPage from "./pages/HeatmapPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import CommissionerDashboard from "./pages/CommissionerDashboard";
import MinisterDashboard from "./pages/MinisterDashboard";
import PublicDashboard from "./pages/PublicDashboard";

// Import separate policy and information pages
import PortalOverview from "./pages/info/PortalOverview";
import SlaGuidelines from "./pages/info/SlaGuidelines";
import DepartmentDirectory from "./pages/info/DepartmentDirectory";
import HowItWorks from "./pages/info/HowItWorks";
import FAQ from "./pages/info/FAQ";
import UserManual from "./pages/info/UserManual";
import FeedbackPage from "./pages/info/FeedbackPage";
import ContactPage from "./pages/info/ContactPage";
import WebsitePolicies from "./pages/info/WebsitePolicies";
import PrivacyPolicy from "./pages/info/PrivacyPolicy";
import TermsPage from "./pages/info/TermsPage";
import HyperlinkingPolicy from "./pages/info/HyperlinkingPolicy";
import SitemapPage from "./pages/info/SitemapPage";
import AccessibilityStatement from "./pages/info/AccessibilityStatement";
import DisclaimerPage from "./pages/info/DisclaimerPage";
import HelpPage from "./pages/info/HelpPage";

import "./styles.css";

// Protection component for Officer dashboards
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const role = localStorage.getItem("userRole") || "citizen";
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <div className="gov-app-wrapper">
        <Header />
        
        {/* Main Content Area */}
        <main className="gov-main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/grievance/new" element={<GrievanceFormPage />} />
            <Route path="/grievance/track" element={<TrackPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/dashboard/public" element={<PublicDashboard />} />

            {/* Separate policy and information routes */}
            <Route path="/portal-overview" element={<PortalOverview />} />
            <Route path="/sla-guidelines" element={<SlaGuidelines />} />
            <Route path="/department-directory" element={<DepartmentDirectory />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/user-manual" element={<UserManual />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/website-policies" element={<WebsitePolicies />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/hyperlinking" element={<HyperlinkingPolicy />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/accessibility" element={<AccessibilityStatement />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* Citizen Dashboard Route */}
            <Route 
              path="/dashboard/citizen" 
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Field Officer / Junior Engineer Dashboard */}
            <Route 
              path="/dashboard/officer" 
              element={
                <ProtectedRoute allowedRoles={["ward_officer", "junior_engineer"]}>
                  <OfficerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin / Municipal Commissioner Dashboard */}
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute allowedRoles={["municipal_commissioner", "district_collector"]}>
                  <CommissionerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Minister Dashboard */}
            <Route 
              path="/dashboard/minister" 
              element={
                <ProtectedRoute allowedRoles={["minister"]}>
                  <MinisterDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
