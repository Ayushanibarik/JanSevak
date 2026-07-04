import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart3, AlertCircle, CheckCircle, Clock, ShieldCheck, Mail, Map, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

type DeptStat = {
  name: string;
  total: number;
  resolved: number;
  pending: number;
};

export default function CommissionerDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8001/dashboard/public");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setMockStats();
      }
    } catch (err) {
      setMockStats();
    } finally {
      setLoading(false);
    }
  };

  const setMockStats = () => {
    setStats({
      total_grievances: 489,
      resolved: 420,
      resolution_rate: 85.8
    });
    setDeptStats([
      { name: "water_supply", total: 145, resolved: 120, pending: 25 },
      { name: "electricity", total: 98, resolved: 88, pending: 10 },
      { name: "roads", total: 110, resolved: 90, pending: 20 },
      { name: "drainage", total: 72, resolved: 60, pending: 12 },
      { name: "sanitation", total: 64, resolved: 62, pending: 2 }
    ]);
  };

  useEffect(() => {
    fetchStats();
  }, [i18n.language]);

  return (
    <div className="gov-dashboard-container">
      {/* Sidebar navigation */}
      <aside className="gov-dashboard-sidebar">
        <div className="sidebar-user-card">
          <div className="avatar">A</div>
          <h6>{i18n.language === "hi" ? "भुवनेश्वर नगर आयुक्त" : "Bhubaneswar Municipal Commissioner"}</h6>
          <span>{t("commissioner_title")}</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard/admin" className="nav-item active">
            <Activity className="w-5 h-5" />
            {t("dashboard_overview")}
          </Link>
          <Link to="/heatmap" className="nav-item">
            <Map className="w-5 h-5" />
            {t("gis_map_view")}
          </Link>
        </nav>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="gov-dashboard-main">
        <div className="dashboard-main-header">
          <h4>{t("commissioner_command_center")}</h4>
          <button onClick={fetchStats} className="btn-refresh-stats">
            <RefreshCw className="w-4 h-4 mr-1" />
            {t("btn_refresh")}
          </button>
        </div>

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="gov-card-grid-small mt-6">
              <div className="stats-mini-card bg-blue-50 border-blue-200">
                <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                <div className="val">{stats.total_grievances}</div>
                <div className="lbl">{t("total_complaints")}</div>
              </div>
              <div className="stats-mini-card bg-emerald-50 border-emerald-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                <div className="val">{stats.resolved}</div>
                <div className="lbl">{t("resolved_complaints_label")}</div>
              </div>
              <div className="stats-mini-card bg-rose-50 border-rose-200">
                <Clock className="w-8 h-8 text-rose-500 mb-2" />
                <div className="val">{stats.total_grievances - stats.resolved}</div>
                <div className="lbl">{t("pending_complaints")}</div>
              </div>
              <div className="stats-mini-card bg-indigo-50 border-indigo-200">
                <ShieldCheck className="w-8 h-8 text-indigo-500 mb-2" />
                <div className="val">{stats.resolution_rate}%</div>
                <div className="lbl">{t("resolution_rate")}</div>
              </div>
            </div>

            {/* Department Wise Summary Chart */}
            <div className="dashboard-table-card mt-8">
              <h5>{t("dept_performance_tracker")}</h5>
              <div className="dept-summary-chart-box mt-4">
                <table className="gov-data-table">
                  <thead>
                    <tr>
                      <th>{t("table_dept_name")}</th>
                      <th>{t("table_total")}</th>
                      <th>{t("table_resolved")}</th>
                      <th>{t("table_pending")}</th>
                      <th>{t("table_progress")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptStats.map((d) => {
                      const rate = ((d.resolved / d.total) * 100).toFixed(1);
                      return (
                        <tr key={d.name}>
                          <td className="font-bold capitalize">{t(`dept_${d.name}`)}</td>
                          <td>{d.total}</td>
                          <td className="text-emerald-700 font-bold">{d.resolved}</td>
                          <td className="text-rose-700 font-bold">{d.pending}</td>
                          <td>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${rate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
