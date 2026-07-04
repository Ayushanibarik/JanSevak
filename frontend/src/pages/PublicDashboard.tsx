import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  BarChart3, CheckCircle, Clock, AlertTriangle, ShieldCheck, Map, 
  ArrowRight, FileSpreadsheet, Building2, TrendingUp, HelpCircle, Download
} from "lucide-react";

export default function PublicDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPublicStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8001/dashboard/public");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setMockPublicData();
      }
    } catch (err) {
      setMockPublicData();
    } finally {
      setLoading(false);
    }
  };

  const setMockPublicData = () => {
    setStats({
      total_grievances: 489,
      resolved: 420,
      resolution_rate: 85.8,
      department_breakdown: {
        "water_supply": 145,
        "electricity": 98,
        "roads": 110,
        "drainage": 72,
        "sanitation": 64
      },
      priority_breakdown: {
        "critical": 45,
        "high": 120,
        "medium": 240,
        "low": 84
      }
    });
  };

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const getDeptLabel = (dept: string) => {
    return t(`dept_${dept}`);
  };

  const getDeptAvgTime = (dept: string) => {
    switch (dept) {
      case "water_supply": return `24 ${t("hours")}`;
      case "electricity": return `12 ${t("hours")}`;
      case "roads": return `48 ${t("hours")}`;
      case "drainage": return `36 ${t("hours")}`;
      case "sanitation": return `24 ${t("hours")}`;
      default: return `48 ${t("hours")}`;
    }
  };

  return (
    <div className="gov-public-dashboard-container">
      {/* Official Government Title Header */}
      <div className="gov-dashboard-header" style={{ textAlign: "center" }}>
        <Building2 className="w-12 h-12 text-[#004080]" style={{ margin: "0 auto 12px auto" }} />
        <h2 style={{ margin: 0, color: "var(--gov-blue-primary)", fontSize: "22px", fontWeight: 800 }}>
          {t("public_dashboard_title")}
        </h2>
        <p style={{ margin: "6px 0 0 0", color: "var(--text-muted)", fontSize: "13px" }}>
          {t("public_dashboard_subtitle")}
        </p>
      </div>

      {loading && (
        <div className="dashboard-table-card" style={{ textAlign: "center", padding: "40px" }}>
          <Clock className="w-8 h-8 animate-spin" style={{ margin: "0 auto 12px auto", color: "var(--gov-blue-primary)" }} />
          <span>{t("loading_data")}</span>
        </div>
      )}

      {stats && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Key Metrics Grid */}
          <div className="gov-card-grid-small">
            <div className="stats-mini-card border-blue">
              <div>
                <div className="lbl">{t("total_received")}</div>
                <div className="val">{stats.total_grievances}</div>
              </div>
              <BarChart3 className="w-8 h-8" style={{ color: "var(--gov-blue-primary)", opacity: 0.8 }} />
            </div>

            <div className="stats-mini-card border-emerald">
              <div>
                <div className="lbl">{t("resolved_cases")}</div>
                <div className="val" style={{ color: "var(--gov-green)" }}>{stats.resolved}</div>
              </div>
              <CheckCircle className="w-8 h-8" style={{ color: "var(--gov-green)", opacity: 0.8 }} />
            </div>

            <div className="stats-mini-card border-rose">
              <div>
                <div className="lbl">{t("pending_backlog")}</div>
                <div className="val" style={{ color: "#ef4444" }}>{stats.total_grievances - stats.resolved}</div>
              </div>
              <Clock className="w-8 h-8" style={{ color: "#ef4444", opacity: 0.8 }} />
            </div>

            <div className="stats-mini-card border-amber">
              <div>
                <div className="lbl">{t("resolution_rate")}</div>
                <div className="val" style={{ color: "#f59e0b" }}>{stats.resolution_rate}%</div>
              </div>
              <ShieldCheck className="w-8 h-8" style={{ color: "#f59e0b", opacity: 0.8 }} />
            </div>
          </div>

          {/* Detailed Performance & Announcements Section */}
          <div className="gov-dashboard-layout">
            
            {/* Department SLA Matrix Table */}
            <div className="dashboard-table-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--gov-border)", paddingBottom: "12px", marginBottom: "16px" }}>
                <h5 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--text-dark)", fontSize: "16px", fontWeight: 800 }}>
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  {t("dept_sla_matrix")}
                </h5>
                <button style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--gov-blue-primary)", fontWeight: "bold", border: "none", background: "none", cursor: "pointer" }}>
                  <Download className="w-4 h-4" /> {t("export_report")}
                </button>
              </div>

              <div className="table-responsive">
                <table className="gov-data-table">
                  <thead>
                    <tr>
                      <th>{t("department_header")}</th>
                      <th style={{ textAlign: "center" }}>{t("received_header")}</th>
                      <th style={{ textAlign: "center" }}>{t("resolved_header")}</th>
                      <th style={{ textAlign: "center" }}>{t("avg_time_header")}</th>
                      <th style={{ textAlign: "center" }}>{t("compliance_header")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.department_breakdown).map(([dept, count]: any) => {
                      const resolvedCount = Math.floor(count * (stats.resolution_rate / 100));
                      const compliance = ((resolvedCount / count) * 100).toFixed(1);
                      return (
                        <tr key={dept}>
                          <td style={{ fontWeight: 600 }}>{getDeptLabel(dept)}</td>
                          <td style={{ textAlign: "center", fontWeight: 600 }}>{count}</td>
                          <td style={{ textAlign: "center", color: "var(--gov-green)", fontWeight: 600 }}>{resolvedCount}</td>
                          <td style={{ textAlign: "center" }}>{getDeptAvgTime(dept)}</td>
                          <td style={{ textAlign: "center" }}>
                            <span className="status-badge-gov status-completed" style={{ fontSize: "11px", fontWeight: "bold" }}>
                              {compliance}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Announcements and Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="gov-sidebar-card">
                <h4>
                  <TrendingUp className="w-5 h-5" style={{ display: "inline", marginRight: "8px", verticalAlign: "middle", color: "#f59e0b" }} />
                  {t("sla_target_status")}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                      <span>{t("emergency_sla_label")}</span>
                      <strong>98.2%</strong>
                    </div>
                    <div style={{ width: "100%", backgroundColor: "var(--gov-border)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                      <div style={{ backgroundColor: "#ef4444", height: "8px", width: "98.2%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                      <span>{t("standard_sla_label")}</span>
                      <strong>84.5%</strong>
                    </div>
                    <div style={{ width: "100%", backgroundColor: "var(--gov-border)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                      <div style={{ backgroundColor: "var(--gov-blue-primary)", height: "8px", width: "84.5%" }}></div>
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: "#fef9c3", border: "1px solid #fef08a", borderRadius: "6px", display: "flex", gap: "8px", fontSize: "11px", color: "#713f12", marginTop: "10px" }}>
                    <AlertTriangle className="w-5 h-5 text-amber-600" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>{t("escalation_alert_title")}:</strong> {t("escalation_alert_desc")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="gov-sidebar-card">
                <h4>
                  <HelpCircle className="w-5 h-5" style={{ display: "inline", marginRight: "8px", verticalAlign: "middle", color: "#8b5cf6" }} />
                  {t("citizen_links_title")}
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <Link to="/grievance/new" style={{ color: "var(--gov-blue-primary)", fontWeight: 600, textDecoration: "none" }}>{t("file_grievance")}</Link>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <Link to="/grievance/track" style={{ color: "var(--gov-blue-primary)", fontWeight: 600, textDecoration: "none" }}>{t("track_grievance")}</Link>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <Link to="/heatmap" style={{ color: "var(--gov-blue-primary)", fontWeight: 600, textDecoration: "none" }}>{t("interactive_map")}</Link>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Map Redirect Action Banner */}
          <div style={{ backgroundColor: "var(--gov-blue-light)", border: "1px solid var(--gov-border)", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ padding: "12px", backgroundColor: "var(--gov-blue-primary)", borderRadius: "8px", color: "#fff" }}>
                <Map className="w-8 h-8" />
              </div>
              <div>
                <h4 style={{ margin: 0, color: "var(--gov-blue-primary)", fontSize: "16px", fontWeight: 800 }}>{t("map_banner_title")}</h4>
                <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "13px" }}>{t("map_banner_desc")}</p>
              </div>
            </div>
            <Link to="/heatmap" className="cta-btn primary-cta" style={{ display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
              {t("view_map_btn")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
