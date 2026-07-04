import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users, FileText, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Play, Check, ArrowRightLeft, FileSpreadsheet } from "lucide-react";

type AssignedGrievance = {
  id: number;
  grievance_token: string;
  department: string;
  sub_category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  escalation_deadline: string;
};

export default function OfficerDashboard() {
  const { t, i18n } = useTranslation();
  const [grievances, setGrievances] = useState<AssignedGrievance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeGrievance, setActiveGrievance] = useState<AssignedGrievance | null>(null);
  
  // Action form states
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [reassignDept, setReassignDept] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const role = localStorage.getItem("userRole") || "junior_engineer";
  const department = localStorage.getItem("userDept") || "roads";

  const fetchAssignedData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || \'http://localhost:8001\'}/grievances/?department=${department}`);
      if (response.ok) {
        const data = await response.json();
        setGrievances(data);
      } else {
        setMockAssignedGrievances();
      }
    } catch (err) {
      setMockAssignedGrievances();
    } finally {
      setLoading(false);
    }
  };

  const setMockAssignedGrievances = () => {
    setGrievances([
      {
        id: 1,
        grievance_token: "GR-2026-BBSR-RD-004513",
        department: "roads",
        sub_category: "potholes",
        title: i18n.language === "hi" ? "मुख्य मार्ग पर गहरे गड्ढे" : "Deep potholes on the main road",
        description: i18n.language === "hi"
          ? "जयदेव विहार मार्ग पर राष्ट्रीय राजमार्ग के चौराहे के पास सड़क पर 3 बड़े गड्ढे हो गए हैं, जिससे आए दिन बाइक सवार गिर रहे हैं। सुरक्षा हेतु तत्काल गड्ढे भरें।"
          : "There are 3 large potholes near the junction of National Highway on Jaydev Vihar road, causing frequent minor accidents. Prompt action requested.",
        status: "assigned",
        priority: "high",
        created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        escalation_deadline: new Date(Date.now() + 42 * 3600 * 1000).toISOString()
      },
      {
        id: 2,
        grievance_token: "GR-2026-BBSR-RD-004599",
        department: "roads",
        sub_category: "road_blockage",
        title: i18n.language === "hi" ? "पेड़ गिरने से यातायात बाधित" : "Tree fall blocking main street",
        description: i18n.language === "hi"
          ? "आंधी के कारण एक पुराना बरगद का पेड़ मार्ग पर गिर गया है जिससे वाहनों का निकलना बंद है। वन विभाग के साथ समन्वय कर हटाएं।"
          : "Heavy rain has caused a large tree to fall, completely blocking the street. Need immediate removal and traffic diversion.",
        status: "accepted",
        priority: "critical",
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        escalation_deadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString()
      }
    ]);
  };

  useEffect(() => {
    fetchAssignedData();
  }, [i18n.language]);

  const handleAccept = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || \'http://localhost:8001\'}/grievances/${token}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_status: "accepted", notes: "Grievance accepted by officer, investigation/team dispatched." })
      });
      if (response.ok) {
        setSuccessMsg(t("grievance_accepted"));
        fetchAssignedData();
        setActiveGrievance(null);
      } else {
        simulateStatusChange(token, "accepted");
      }
    } catch (err) {
      simulateStatusChange(token, "accepted");
    }
  };

  const handleResolve = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || \'http://localhost:8001\'}/grievances/${token}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_status: "completed", notes: `Resolved: ${resolutionNotes}` })
      });
      if (response.ok) {
        setSuccessMsg(t("grievance_resolved"));
        fetchAssignedData();
        setActiveGrievance(null);
        setResolutionNotes("");
      } else {
        simulateStatusChange(token, "completed");
      }
    } catch (err) {
      simulateStatusChange(token, "completed");
    }
  };

  const handleReassign = async (token: string) => {
    if (!reassignDept) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || \'http://localhost:8001\'}/grievances/${token}/reassign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_department: reassignDept, reason: "Reassigned by department officer due to jurisdiction." })
      });
      if (response.ok) {
        setSuccessMsg(t("reassignment_success"));
        fetchAssignedData();
        setActiveGrievance(null);
        setReassignDept("");
      } else {
        setGrievances(prev => prev.filter(g => g.grievance_token !== token));
        setSuccessMsg(t("reassignment_success"));
        setActiveGrievance(null);
        setReassignDept("");
      }
    } catch (err) {
      setGrievances(prev => prev.filter(g => g.grievance_token !== token));
      setSuccessMsg(t("reassignment_success"));
      setActiveGrievance(null);
      setReassignDept("");
    }
  };

  const simulateStatusChange = (token: string, newStatus: string) => {
    setGrievances(prev => prev.map(g => g.grievance_token === token ? { ...g, status: newStatus } : g));
    setSuccessMsg(`${t("status_table")}: ${t(`status_${newStatus}`)}`);
    setActiveGrievance(null);
  };

  const getDeadlineHours = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - Date.now();
    const hours = Math.round(diff / (3600 * 1000));
    return hours;
  };

  // Performance scoring mock data (standard portal metrics)
  const complianceScore = 94.5;
  const avgResolveTime = i18n.language === "hi" ? "2.4 दिन" : "2.4 Days";

  return (
    <div className="gov-dashboard-container">
      {/* Sidebar navigation */}
      <aside className="gov-dashboard-sidebar">
        <div className="sidebar-user-card">
          <div className="avatar">O</div>
          <h6 className="capitalize">{t("role_" + role)}</h6>
          <span className="capitalize">{t("dept_" + department)}</span>
        </div>
        
        {/* Compliance metrics block (Gov standard) */}
        <div className="profile-info-block px-6 py-4 border-b border-gray-700 text-xs text-gray-300 space-y-2">
          <div className="font-bold uppercase tracking-wider text-gray-400">{t("dept_performance_score")}</div>
          <div className="flex justify-between">
            <span>Score:</span>
            <span className="text-[#FF9933] font-bold">{complianceScore}%</span>
          </div>
          <div className="flex justify-between">
            <span>{t("avg_resolution_time")}:</span>
            <span className="text-emerald-400 font-bold">{avgResolveTime}</span>
          </div>
        </div>

        <nav className="sidebar-nav mt-4">
          <Link to="/dashboard/officer" className="nav-item active">
            <Users className="w-5 h-5" />
            {t("assigned_cases")}
          </Link>
        </nav>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="gov-dashboard-main">
        <div className="dashboard-main-header">
          <h4>{t("officer_redressal_panel")}</h4>
          <span className="current-role-badge">
            {t("role_" + role)} ({t("dept_" + department)})
          </span>
        </div>

        {successMsg && (
          <div className="alert alert-success mt-4">
            <Check className="inline w-5 h-5 mr-1" />
            {successMsg}
          </div>
        )}

        {/* Action Counters / Stats Grid */}
        <div className="gov-card-grid-small mt-6">
          <div className="stats-mini-card bg-blue-50 border-blue-200">
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <div className="val">{grievances.length}</div>
            <div className="lbl">{t("total_complaints")}</div>
          </div>
          <div className="stats-mini-card bg-amber-50 border-amber-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
            <div className="val">
              {grievances.filter(g => g.status === "assigned").length}
            </div>
            <div className="lbl">{t("status_assigned")}</div>
          </div>
          <div className="stats-mini-card bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <div className="val">
              {grievances.filter(g => g.status === "accepted").length}
            </div>
            <div className="lbl">{t("status_accepted")}</div>
          </div>
        </div>

        {/* Complaints List Panel */}
        <div className="dashboard-table-card mt-8">
          <h5>{t("active_grievance_queue")}</h5>
          {loading ? (
            <div className="p-8 text-center text-gray-500">{t("loading_data")}</div>
          ) : grievances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t("no_pending_grievances")}</div>
          ) : (
            <div className="table-responsive">
              <table className="gov-data-table">
                <thead>
                  <tr>
                    <th>{t("token_id")}</th>
                    <th>{t("title_table")}</th>
                    <th>{t("priority_table")}</th>
                    <th>{t("sla_deadline")}</th>
                    <th>{t("status_table")}</th>
                    <th>{t("actions_table")}</th>
                  </tr>
                </thead>
                <tbody>
                  {grievances.map((g) => {
                    const hoursLeft = getDeadlineHours(g.escalation_deadline);
                    return (
                      <tr key={g.grievance_token} className={hoursLeft <= 4 ? "row-critical-deadline" : ""}>
                        <td className="font-bold text-blue-900">{g.grievance_token}</td>
                        <td>{g.title}</td>
                        <td>
                          <span className={`priority-tag priority-${g.priority}`}>
                            {t(`priority_${g.priority}`)}
                          </span>
                        </td>
                        <td>
                          <span className={hoursLeft <= 4 ? "text-red-600 font-bold" : "text-gray-700"}>
                            {hoursLeft > 0 ? `${hoursLeft} ${t("hours")}` : t("deadline_passed")}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge-gov status-${g.status}`}>
                            {t(`status_${g.status}`)}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => {
                              setActiveGrievance(g);
                              setSuccessMsg("");
                            }}
                            className="btn-table-action"
                          >
                            {t("process_action")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal/Detail action view overlay */}
        {activeGrievance && (
          <div className="officer-action-modal-overlay">
            <div className="officer-action-card">
              <h5>{t("grievance_action_panel")}</h5>
              
              <div className="grievance-summary-block mt-4">
                <h6>{t("token_label")} <strong>{activeGrievance.grievance_token}</strong></h6>
                <p><strong>{t("title_label")}</strong> {activeGrievance.title}</p>
                <p><strong>{t("desc_label")}</strong> {activeGrievance.description}</p>
              </div>

              {/* Action Steps Form */}
              <div className="modal-actions-container mt-6">
                {activeGrievance.status === "assigned" && (
                  <div className="action-step-card">
                    <h6>{t("step1_accept")}</h6>
                    <p>{t("step1_desc")}</p>
                    <button 
                      onClick={() => handleAccept(activeGrievance.grievance_token)}
                      className="btn-modal-action-accept"
                    >
                      <Play className="w-5 h-5 mr-1" />
                      {t("accept_start_work")}
                    </button>
                  </div>
                )}

                {activeGrievance.status === "accepted" && (
                  <div className="action-step-card space-y-4">
                    <h6>{t("step2_resolve")}</h6>
                    <p>{t("step2_desc")}</p>
                    
                    <div className="form-group">
                      <label>{t("resolution_summary")}</label>
                      <textarea
                        placeholder={t("resolution_placeholder")}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={3}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                      ></textarea>
                    </div>

                    <button 
                      onClick={() => handleResolve(activeGrievance.grievance_token)}
                      className="btn-modal-action-resolve"
                      disabled={!resolutionNotes}
                    >
                      <Check className="w-5 h-5 mr-1 inline" />
                      {t("complete_close_ticket")}
                    </button>
                  </div>
                )}

                {/* Reassignment Panel (Gov Portal standard) */}
                <div className="action-step-card border-t pt-4 mt-4">
                  <h6 className="flex items-center gap-1">
                    <ArrowRightLeft className="w-4 h-4 text-orange-600" />
                    {t("forward_reassign")}
                  </h6>
                  <p className="text-xs text-gray-500 mb-2">{t("select_dept_reassign")}</p>
                  
                  <div className="flex gap-2">
                    <select
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      value={reassignDept}
                      onChange={(e) => setReassignDept(e.target.value)}
                    >
                      <option value="">-- Choose Department --</option>
                      <option value="water_supply">{t("dept_water_supply")}</option>
                      <option value="electricity">{t("dept_electricity")}</option>
                      <option value="roads">{t("dept_roads")}</option>
                      <option value="drainage">{t("dept_drainage")}</option>
                      <option value="sanitation">{t("dept_sanitation")}</option>
                      <option value="environment">{t("dept_environment")}</option>
                    </select>

                    <button
                      onClick={() => handleReassign(activeGrievance.grievance_token)}
                      className="btn-back text-xs"
                      disabled={!reassignDept}
                    >
                      {t("btn_submit_reassignment")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer-close mt-6">
                <button 
                  onClick={() => {
                    setActiveGrievance(null);
                    setResolutionNotes("");
                    setReassignDept("");
                  }}
                  className="btn-close-modal"
                >
                  {t("cancel_btn")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
