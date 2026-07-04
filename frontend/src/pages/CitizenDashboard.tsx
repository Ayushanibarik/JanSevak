import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, FileText, CheckCircle2, AlertTriangle, Eye, ArrowRight, Activity, Plus, Search, ShieldCheck, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

type CitizenGrievance = {
  grievance_token: string;
  department: string;
  sub_category: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
};

export default function CitizenDashboard() {
  const { t, i18n } = useTranslation();
  const [grievances, setGrievances] = useState<CitizenGrievance[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchCitizenData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8001/grievances/");
      if (response.ok) {
        const data = await response.json();
        setGrievances(data);
      } else {
        setMockCitizenGrievances();
      }
    } catch (err) {
      setMockCitizenGrievances();
    } finally {
      setLoading(false);
    }
  };

  const setMockCitizenGrievances = () => {
    setGrievances([
      {
        grievance_token: "GR-2026-BBSR-WS-004512",
        department: "water_supply",
        sub_category: "no_water_supply",
        title: i18n.language === "hi" ? "शिव कॉलोनी में 3 दिनों से पेयजल आपूर्ति ठप" : "Water supply stopped in Shiv Colony for 3 days",
        status: "in_progress",
        priority: "high",
        created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
      },
      {
        grievance_token: "GR-2026-BBSR-RD-004513",
        department: "roads",
        sub_category: "potholes",
        title: i18n.language === "hi" ? "मुख्य मार्ग पर गहरे गड्ढे" : "Deep potholes on the main road",
        status: "completed",
        priority: "medium",
        created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString()
      }
    ]);
  };

  useEffect(() => {
    fetchCitizenData();
  }, [i18n.language]);

  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      g.grievance_token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || g.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDownloadReceipt = (token: string) => {
    alert(`${t("download_acknowledgement")}: ${token}`);
  };

  const hasResolvedGrievances = grievances.some(g => g.status === "completed" || g.status === "closed");

  return (
    <div className="gov-dashboard-container">
      {/* Sidebar navigation */}
      <aside className="gov-dashboard-sidebar">
        <div className="sidebar-user-card">
          <div className="avatar">C</div>
          <h6>{i18n.language === "hi" ? "रमेश कुमार" : "Ramesh Kumar"}</h6>
          <span>{t("citizen_account")}</span>
        </div>
        
        {/* Profile Info block (Gov standard) */}
        <div className="profile-info-block px-6 py-4 border-b border-gray-700 text-xs text-gray-300 space-y-2">
          <div className="font-bold uppercase tracking-wider text-gray-400">{t("citizen_profile")}</div>
          <div className="flex items-center justify-between">
            <span>{t("aadhaar_status")}:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("aadhaar_verified")}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav mt-4">
          <Link to="/dashboard/citizen" className="nav-item active">
            <Activity className="w-5 h-5" />
            {t("my_dashboard")}
          </Link>
          <Link to="/grievance/new" className="nav-item">
            <Plus className="w-5 h-5" />
            {t("new_grievance_sidebar")}
          </Link>
          <Link to="/grievance/track" className="nav-item">
            <Eye className="w-5 h-5" />
            {t("track_status_sidebar")}
          </Link>
        </nav>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="gov-dashboard-main">
        <div className="dashboard-main-header">
          <h4>{t("citizen_dashboard_title")}</h4>
          <Link to="/grievance/new" className="btn-new-grievance-dash">
            <Plus className="w-4 h-4 mr-1" />
            {t("file_grievance")}
          </Link>
        </div>

        {/* Feedback/Pending ratings notice */}
        {hasResolvedGrievances && (
          <div className="alert alert-info mt-4">
            <AlertTriangle className="inline w-5 h-5 mr-2 text-amber-600" />
            {t("feedback_pending_alert")}
          </div>
        )}

        {/* Status statistics Cards */}
        <div className="gov-card-grid-small mt-6">
          <div className="stats-mini-card bg-blue-50 border-blue-200">
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <div className="val">{grievances.length}</div>
            <div className="lbl">{t("total_complaints")}</div>
          </div>
          <div className="stats-mini-card bg-amber-50 border-amber-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
            <div className="val">
              {grievances.filter(g => g.status !== "completed" && g.status !== "closed").length}
            </div>
            <div className="lbl">{t("active_issues")}</div>
          </div>
          <div className="stats-mini-card bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <div className="val">
              {grievances.filter(g => g.status === "completed" || g.status === "closed").length}
            </div>
            <div className="lbl">{t("resolved_complaints")}</div>
          </div>
        </div>

        {/* Registry Table with interactive filtering */}
        <div className="dashboard-table-card mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h5>{t("my_grievance_registry")}</h5>
            
            {/* Interactive filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("search_token_placeholder")}
                  className="pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="p-1.5 border border-gray-300 rounded text-sm bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("all_statuses")}</option>
                <option value="submitted">{t("status_submitted")}</option>
                <option value="assigned">{t("status_assigned")}</option>
                <option value="accepted">{t("status_accepted")}</option>
                <option value="in_progress">{t("status_in_progress")}</option>
                <option value="completed">{t("status_completed")}</option>
                <option value="closed">{t("status_closed")}</option>
                <option value="rejected">{t("status_rejected")}</option>
              </select>

              <select
                className="p-1.5 border border-gray-300 rounded text-sm bg-white"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">{t("all_priorities")}</option>
                <option value="low">{t("priority_low")}</option>
                <option value="medium">{t("priority_medium")}</option>
                <option value="high">{t("priority_high")}</option>
                <option value="critical">{t("priority_critical")}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">{t("loading_data")}</div>
          ) : filteredGrievances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t("no_grievance_yet")}</div>
          ) : (
            <div className="table-responsive">
              <table className="gov-data-table">
                <thead>
                  <tr>
                    <th>{t("table_token")}</th>
                    <th>{t("table_title")}</th>
                    <th>{t("table_department")}</th>
                    <th>{t("table_date")}</th>
                    <th>{t("table_status")}</th>
                    <th>{t("table_actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrievances.map((g) => (
                    <tr key={g.grievance_token}>
                      <td className="font-bold text-blue-900">{g.grievance_token}</td>
                      <td>{g.title}</td>
                      <td className="capitalize">{t(`dept_${g.department}`)}</td>
                      <td>{new Date(g.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge-gov status-${g.status}`}>
                          {t(`status_${g.status}`)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Link 
                            to={`/grievance/track?token=${g.grievance_token}`} 
                            className="table-action-link"
                          >
                            {t("track_link")}
                            <ArrowRight className="w-4 h-4 ml-1 inline" />
                          </Link>
                          
                          <button
                            onClick={() => handleDownloadReceipt(g.grievance_token)}
                            className="text-gray-600 hover:text-blue-700 flex items-center gap-1 text-xs font-bold"
                            title={t("download_acknowledgement")}
                          >
                            <Download className="w-3.5 h-3.5" />
                            {t("download_acknowledgement")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
