import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart2, ShieldAlert, Award, AlertTriangle, CheckCircle, Clock, Map, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

type DistrictRank = {
  rank: number;
  district: string;
  total: number;
  resolved: number;
  rate: number;
};

export default function MinisterDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [districtRanks, setDistrictRanks] = useState<DistrictRank[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMinisterData = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/dashboard/stats`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const rate = data.total_grievances > 0 
          ? ((data.resolved / data.total_grievances) * 100).toFixed(1) 
          : "0.0";
        setStats({
          total_grievances: data.total_grievances,
          resolved: data.resolved,
          resolution_rate: rate
        });
      } else {
        setMockMinisterData();
      }
    } catch (err) {
      console.error(err);
      setMockMinisterData();
    } finally {
      setLoading(false);
    }
  };

  const setMockMinisterData = () => {
    setStats({
      total_grievances: 4892,
      resolved: 4200,
      resolution_rate: 85.8
    });
    setDistrictRanks([
      { rank: 1, district: i18n.language === "hi" ? "खोर्धा (भुवनेश्वर)" : "Khordha (Bhubaneswar)", total: 1450, resolved: 1380, rate: 95.1 },
      { rank: 2, district: i18n.language === "hi" ? "कटक" : "Cuttack", total: 1100, resolved: 1012, rate: 92.0 },
      { rank: 3, district: i18n.language === "hi" ? "पुरी" : "Puri", total: 850, resolved: 765, rate: 90.0 },
      { rank: 4, district: i18n.language === "hi" ? "गंजम (ब्रह्मपुर)" : "Ganjam (Berhampur)", total: 950, resolved: 820, rate: 86.3 },
      { rank: 5, district: i18n.language === "hi" ? "संबलपुर" : "Sambalpur", total: 542, resolved: 223, rate: 41.1 }
    ]);
  };

  useEffect(() => {
    fetchMinisterData();
  }, [i18n.language]);

  return (
    <div className="gov-dashboard-container">
      {/* Sidebar navigation */}
      <aside className="gov-dashboard-sidebar">
        <div className="sidebar-user-card">
          <div className="avatar">M</div>
          <h6>{i18n.language === "hi" ? "माननीय विभाग मंत्री" : "Hon'ble Department Minister"}</h6>
          <span>{t("minister_title")}</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard/minister" className="nav-item active">
            <Activity className="w-5 h-5" />
            {t("state_view")}
          </Link>
          <Link to="/heatmap" className="nav-item">
            <Map className="w-5 h-5" />
            {t("state_gis_map")}
          </Link>
        </nav>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="gov-dashboard-main">
        <div className="dashboard-main-header">
          <h4>{t("minister_command_center")}</h4>
          <button onClick={fetchMinisterData} className="btn-refresh-stats">
            <RefreshCw className="w-4 h-4 mr-1" />
            {t("btn_sync")}
          </button>
        </div>

        {stats && (
          <>
            {/* KPI Cards */}
            <div className="gov-card-grid-small mt-6">
              <div className="stats-mini-card bg-blue-50 border-blue-200">
                <BarChart2 className="w-8 h-8 text-blue-600 mb-2" />
                <div className="val">{stats.total_grievances}</div>
                <div className="lbl">{t("total_state_grievances")}</div>
              </div>
              <div className="stats-mini-card bg-emerald-50 border-emerald-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                <div className="val">{stats.resolved}</div>
                <div className="lbl">{t("total_resolved")}</div>
              </div>
              <div className="stats-mini-card bg-rose-50 border-rose-200">
                <Clock className="w-8 h-8 text-rose-500 mb-2" />
                <div className="val">{stats.total_grievances - stats.resolved}</div>
                <div className="lbl">{t("active_backlog")}</div>
              </div>
              <div className="stats-mini-card bg-indigo-50 border-indigo-200">
                <Award className="w-8 h-8 text-indigo-500 mb-2" />
                <div className="val">{stats.resolution_rate}%</div>
                <div className="lbl">{t("state_sla_compliance")}</div>
              </div>
            </div>

            {/* District Ranking Panel */}
            <div className="dashboard-table-card mt-8">
              <h5>{t("district_performance_rankings")}</h5>
              <div className="dept-summary-chart-box mt-4">
                <table className="gov-data-table">
                  <thead>
                    <tr>
                      <th>{t("table_rank")}</th>
                      <th>{t("table_district")}</th>
                      <th>{t("table_total")}</th>
                      <th>{t("table_resolved")}</th>
                      <th>{t("table_sla_rate")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districtRanks.map((d) => (
                      <tr key={d.district}>
                        <td className="font-bold">#{d.rank}</td>
                        <td className="font-semibold text-blue-900">{d.district}</td>
                        <td>{d.total}</td>
                        <td className="text-emerald-700 font-bold">{d.resolved}</td>
                        <td>
                          <span className={`badge ${d.rate >= 90 ? "bg-emerald-100 text-emerald-800" : d.rate >= 70 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"} px-2.5 py-1 rounded text-xs font-bold`}>
                            {d.rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
