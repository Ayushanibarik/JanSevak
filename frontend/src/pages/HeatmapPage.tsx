import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Filter, Calendar, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

type ComplaintMarker = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  department: string;
  priority: string;
  status: string;
};

const DEPARTMENTS = [
  { id: "all", label: "All Departments | सभी विभाग" },
  { id: "water_supply", label: "Water Supply | जल आपूर्ति" },
  { id: "electricity", label: "Electricity | बिजली" },
  { id: "roads", label: "Roads | सड़कें" },
  { id: "drainage", label: "Drainage & Sewer | निकासी" },
  { id: "sanitation", label: "Sanitation & Waste | स्वच्छता" }
];

export default function HeatmapPage() {
  const { t, i18n } = useTranslation();
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintMarker[]>([]);
  const [loading, setLoading] = useState(false);

  const getDeptLabel = (label: string) => {
    if (label.includes(" | ")) {
      const parts = label.split(" | ");
      return i18n.language === "hi" ? parts[1] : parts[0];
    }
    return label;
  };

  // Fetch coordinates for mapping
  const fetchMapData = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/gis/heatmap`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Format to map structure from GeoJSON FeatureCollection
        const formatted = data.features.map((feature: any) => ({
          id: feature.properties.id,
          title: feature.properties.title,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          department: feature.properties.department.toLowerCase(),
          priority: feature.properties.priority.toLowerCase(),
          status: feature.properties.status.toLowerCase()
        }));
        setComplaints(formatted);
      } else {
        setMockMapData();
      }
    } catch (err) {
      setMockMapData();
    } finally {
      setLoading(false);
    }
  };

  const setMockMapData = () => {
    // Generate realistic coordinates around Bhubaneswar center (20.2961, 85.8245)
    const mock = [
      { id: "GR-2026-BBSR-WS-000001", title: i18n.language === "hi" ? "जल आपूर्ति बाधित - शिव कॉलोनी" : "Water supply interrupted - Shiv Colony", latitude: 20.2910, longitude: 85.8210, department: "water_supply", priority: "high", status: "in_progress" },
      { id: "GR-2026-BBSR-EL-000002", title: i18n.language === "hi" ? "बिजली का तार लटका हुआ" : "Hanging live electric wire", latitude: 20.2990, longitude: 85.8300, department: "electricity", priority: "critical", status: "assigned" },
      { id: "GR-2026-BBSR-RD-000003", title: i18n.language === "hi" ? "मुख्य मार्ग पर गड्ढे" : "Road Potholes", latitude: 20.2850, longitude: 85.8150, department: "roads", priority: "medium", status: "submitted" },
      { id: "GR-2026-BBSR-DR-000004", title: i18n.language === "hi" ? "सड़क पर नाली का गंदा पानी बह रहा है" : "Drain water overflowing on road", latitude: 20.3080, longitude: 85.8420, department: "drainage", priority: "high", status: "accepted" },
      { id: "GR-2026-BBSR-SN-000005", title: i18n.language === "hi" ? "कचरे का ढेर" : "Garbage pile", latitude: 20.2950, longitude: 85.8260, department: "sanitation", priority: "low", status: "in_progress" },
      { id: "GR-2026-BBSR-WS-000006", title: i18n.language === "hi" ? "पाइप फटने से जल व्यर्थ बहना" : "Water pipeline burst", latitude: 20.3120, longitude: 85.8190, department: "water_supply", priority: "critical", status: "in_progress" },
    ];
    setComplaints(mock);
  };

  useEffect(() => {
    fetchMapData();
  }, [i18n.language]); // Refetch on language change to update mock data titles

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "#f43f5e"; // Rose
      case "high": return "#f97316";     // Orange
      case "medium": return "#eab308";   // Yellow
      default: return "#10b981";         // Green
    }
  };

  // Filter complaints locally for robust UI reactivity
  const filteredComplaints = complaints.filter((c) => {
    if (selectedDept !== "all" && c.department !== selectedDept) return false;
    if (selectedPriority !== "all" && c.priority !== selectedPriority) return false;
    if (emergencyOnly && c.priority !== "critical") return false;
    return true;
  });

  return (
    <div className="heatmap-page-container">
      {/* Map Filter sidebar */}
      <div className="map-sidebar">
        <div className="sidebar-header">
          <Filter className="w-5 h-5 text-blue-800" />
          <h5>{t("map_filters")}</h5>
        </div>

        <div className="filter-group">
          <label>{t("select_dept")}</label>
          <select 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{getDeptLabel(d.label)}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{t("priority_filter_label")}</label>
          <select 
            value={selectedPriority} 
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">{t("all_priorities")}</option>
            <option value="critical">{t("critical_priority")}</option>
            <option value="high">{t("high_priority")}</option>
            <option value="medium">{t("medium_priority")}</option>
            <option value="low">{t("low_priority")}</option>
          </select>
        </div>

        <div className="filter-checkbox-item">
          <input
            type="checkbox"
            id="emergencyMap"
            checked={emergencyOnly}
            onChange={(e) => setEmergencyOnly(e.target.checked)}
          />
          <label htmlFor="emergencyMap">
            <AlertCircle className="w-4 h-4 text-rose-600 inline mr-1" />
            {t("emergency_only")}
          </label>
        </div>

        <button 
          onClick={fetchMapData} 
          className="map-refresh-btn"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("btn_refresh_data")}
        </button>

        {/* Legend */}
        <div className="map-legend">
          <h6>{t("legend_title")}</h6>
          <div className="legend-item">
            <span className="legend-dot bg-rose-500"></span>
            <span>{t("legend_critical")}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bg-orange-500"></span>
            <span>{t("legend_high")}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bg-yellow-500"></span>
            <span>{t("legend_medium")}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bg-emerald-500"></span>
            <span>{t("legend_low")}</span>
          </div>
        </div>
      </div>

      {/* Main Leaflet Map view */}
      <div className="map-view-area">
        <MapContainer center={[20.2961, 85.8245]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {filteredComplaints.map((c) => (
            <CircleMarker
              key={c.id}
              center={[c.latitude, c.longitude]}
              pathOptions={{
                color: getPriorityColor(c.priority),
                fillColor: getPriorityColor(c.priority),
                fillOpacity: 0.6,
                weight: 2
              }}
              radius={c.priority === "critical" ? 18 : 12}
            >
              <Popup>
                <div className="map-popup-card">
                  <h6>{t("popup_token")}: {c.id}</h6>
                  <h5>{c.title}</h5>
                  <div className="popup-tags">
                    <span className="capitalize">{t(`dept_${c.department}`)}</span>
                    <span className={`status-tag status-${c.status}`}>{t(`status_${c.status}`)}</span>
                  </div>
                  <a href={`/grievance/track?token=${c.id}`} className="popup-link">
                    {t("view_details_link")} &rarr;
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
