import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, WMSTileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Filter, Calendar, MapPin, AlertCircle, RefreshCw, Database, Activity, Map as MapIcon, Train, Milestone, CloudRain, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

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
  const [activeTab, setActiveTab] = useState<"filters" | "gis">("filters");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintMarker[]>([]);
  const [loading, setLoading] = useState(false);

  // Advanced GIS states
  const [baseMap, setBaseMap] = useState<"osm" | "bhuvan_sat" | "bhuvan_lulc">("osm");
  const [censusView, setCensusView] = useState<"none" | "wards" | "india">("none");
  const [censusColoring, setCensusColoring] = useState<"population" | "literacy" | "none">("none");
  const [gatiShaktiRail, setGatiShaktiRail] = useState(false);
  const [gatiShaktiRoad, setGatiShaktiRoad] = useState(false);
  const [gatiShaktiPipe, setGatiShaktiPipe] = useState(false);
  const [osmPois, setOsmPois] = useState(false);
  const [imdWeather, setImdWeather] = useState(false);

  const [censusWardsGeoJSON, setCensusWardsGeoJSON] = useState<any>(null);
  const [censusIndiaGeoJSON, setCensusIndiaGeoJSON] = useState<any>(null);
  const [gatiShaktiGeoJSON, setGatiShaktiGeoJSON] = useState<any>(null);
  const [imdForecastData, setImdForecastData] = useState<any>(null);
  const [osmPoiMarkers, setOsmPoiMarkers] = useState<any[]>([]);

  const [mapCenter, setMapCenter] = useState<[number, number]>([20.2961, 85.8245]);
  const [mapZoom, setMapZoom] = useState<number>(13);

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
        
        // Merge with local storage
        const localGrievances = JSON.parse(localStorage.getItem("local_grievances") || "[]");
        const combined = [...formatted];
        localGrievances.forEach((lg: any) => {
          if (!combined.some(c => c.id === lg.grievance_token)) {
            combined.push({
              id: lg.grievance_token,
              title: lg.title,
              latitude: lg.latitude || 20.2961,
              longitude: lg.longitude || 85.8245,
              department: lg.department,
              priority: lg.priority,
              status: lg.status
            });
          }
        });
        setComplaints(combined);
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
    
    // Merge with local storage
    const localGrievances = JSON.parse(localStorage.getItem("local_grievances") || "[]");
    const combined = [...localGrievances.map((lg: any) => ({
      id: lg.grievance_token,
      title: lg.title,
      latitude: lg.latitude || 20.2961,
      longitude: lg.longitude || 85.8245,
      department: lg.department,
      priority: lg.priority,
      status: lg.status
    }))];
    
    mock.forEach((md) => {
      if (!combined.some(c => c.id === md.id)) {
        combined.push(md);
      }
    });
    setComplaints(combined);
  };

  useEffect(() => {
    fetchMapData();
  }, [i18n.language]); // Refetch on language change to update mock data titles

  // Load Census Wards GeoJSON
  useEffect(() => {
    const loadWards = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/gis/census`);
        if (response.ok) {
          const data = await response.json();
          setCensusWardsGeoJSON(data);
        }
      } catch (err) {
        console.error("Failed to load Census wards data", err);
      }
    };
    loadWards();
  }, []);

  // Load Census India GeoJSON
  useEffect(() => {
    if (censusView === "india" && !censusIndiaGeoJSON) {
      const loadIndia = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/gis/census-india`);
          if (response.ok) {
            const data = await response.json();
            setCensusIndiaGeoJSON(data);
          }
        } catch (err) {
          console.error("Failed to load Census India data", err);
        }
      };
      loadIndia();
    }
  }, [censusView, censusIndiaGeoJSON]);

  // Load GatiShakti layers
  useEffect(() => {
    if ((gatiShaktiRail || gatiShaktiRoad || gatiShaktiPipe) && !gatiShaktiGeoJSON) {
      const loadGatiShakti = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/gis/gatishakti`);
          if (response.ok) {
            const data = await response.json();
            setGatiShaktiGeoJSON(data);
          }
        } catch (err) {
          console.error("Failed to load GatiShakti data", err);
        }
      };
      loadGatiShakti();
    }
  }, [gatiShaktiRail, gatiShaktiRoad, gatiShaktiPipe, gatiShaktiGeoJSON]);

  // Load IMD alert and forecast data
  useEffect(() => {
    if (imdWeather && !imdForecastData) {
      const loadIMD = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/gis/imd-forecast`);
          if (response.ok) {
            const data = await response.json();
            setImdForecastData(data);
          }
        } catch (err) {
          console.error("Failed to load IMD data", err);
        }
      };
      loadIMD();
    }
  }, [imdWeather, imdForecastData]);

  // Load OSM POIs when checked
  useEffect(() => {
    if (osmPois && osmPoiMarkers.length === 0) {
      const fetchOSMPois = async () => {
        try {
          const response = await fetch("https://overpass-api.de/api/interpreter?data=[out:json];node[\"amenity\"~\"hospital|school|police\"](20.25,85.75,20.35,85.88);out%2050;");
          if (response.ok) {
            const data = await response.json();
            const markers = data.elements.map((el: any) => ({
              id: el.id,
              name: el.tags.name || el.tags.amenity,
              type: el.tags.amenity,
              lat: el.lat,
              lon: el.lon
            }));
            setOsmPoiMarkers(markers);
          } else {
            setFallbackPois();
          }
        } catch (err) {
          setFallbackPois();
        }
      };
      fetchOSMPois();
    }
  }, [osmPois]);

  const setFallbackPois = () => {
    setOsmPoiMarkers([
      { id: 1, name: i18n.language === "hi" ? "कैपिटल अस्पताल" : "Capital Hospital", type: "hospital", lat: 20.2910, lon: 85.8200 },
      { id: 2, name: i18n.language === "hi" ? "डीएवी पब्लिक स्कूल" : "DAV Public School", type: "school", lat: 20.3080, lon: 85.8270 },
      { id: 3, name: i18n.language === "hi" ? "नयापल्ली पुलिस स्टेशन" : "Nayapalli Police Station", type: "police", lat: 20.2990, lon: 85.8080 },
      { id: 4, name: i18n.language === "hi" ? "जयदेव विहार प्राथमिक स्वास्थ्य केंद्र" : "Jaydev Vihar Primary Health Center", type: "hospital", lat: 20.3015, lon: 85.8310 },
      { id: 5, name: i18n.language === "hi" ? "केआईआईआईटी कैंपस" : "KIIT University Campus", type: "school", lat: 20.3520, lon: 85.8190 }
    ]);
  };

  useEffect(() => {
    if (censusView === "india") {
      setMapCenter([22.0, 78.0]);
      setMapZoom(4);
    } else {
      setMapCenter([20.2961, 85.8245]);
      setMapZoom(13);
    }
  }, [censusView]);

  const getWardStyle = (feature: any) => {
    const props = feature.properties;
    let color = "#3b82f6";
    let fillOpacity = 0.4;
    
    if (censusColoring === "population") {
      const pop = props.population || 0;
      color = pop > 40000 ? "#800026" :
              pop > 30000 ? "#BD0026" :
              pop > 25000 ? "#E31A1C" :
              pop > 20000 ? "#FC4E2A" :
              pop > 15000 ? "#FD8D3C" :
                            "#FEB24C";
      fillOpacity = 0.6;
    } else if (censusColoring === "literacy") {
      const lit = props.literacy_rate || 0;
      color = lit > 92 ? "#005824" :
              lit > 88 ? "#238b45" :
              lit > 84 ? "#41ab5d" :
              lit > 80 ? "#74c476" :
              lit > 75 ? "#a1d99b" :
                         "#c7e9c0";
      fillOpacity = 0.6;
    }
    
    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: "#ffffff",
      dashArray: "3",
      fillOpacity: fillOpacity
    };
  };

  const getStateStyle = (feature: any) => {
    const props = feature.properties;
    let color = "#6366f1";
    let fillOpacity = 0.4;
    
    if (censusColoring === "population") {
      const pop = props.population || 0;
      color = pop > 100000000 ? "#800026" :
              pop > 70000000  ? "#BD0026" :
              pop > 50000000  ? "#E31A1C" :
              pop > 25000000  ? "#FC4E2A" :
              pop > 10000000  ? "#FD8D3C" :
              pop > 1000000   ? "#FEB24C" :
                                "#FED976";
      fillOpacity = 0.65;
    } else if (censusColoring === "literacy") {
      const lit = props.literacy_rate || 0;
      color = lit > 90 ? "#005824" :
              lit > 85 ? "#238b45" :
              lit > 80 ? "#41ab5d" :
              lit > 75 ? "#74c476" :
              lit > 70 ? "#a1d99b" :
              lit > 65 ? "#c7e9c0" :
                         "#e5f5e0";
      fillOpacity = 0.65;
    }
    
    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: "#ffffff",
      dashArray: "3",
      fillOpacity: fillOpacity
    };
  };

  const onEachWardFeature = (feature: any, layer: any) => {
    const props = feature.properties;
    const popupContent = `
      <div style="font-family: sans-serif; padding: 5px; min-width: 180px;">
        <h4 style="margin: 0 0 6px 0; color: #004080; border-bottom: 2px solid #004080; padding-bottom: 4px;">
          ${i18n.language === "hi" ? props.ward_name_hi : props.ward_name} (${props.ward_number})
        </h4>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Population (2011):</td>
            <td style="text-align: right; font-weight: bold;">${props.population.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Literacy Rate:</td>
            <td style="text-align: right; font-weight: bold; color: #16a34a;">${props.literacy_rate}%</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Households:</td>
            <td style="text-align: right;">${props.households.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Water Connectivity:</td>
            <td style="text-align: right; color: #0284c7; font-weight: bold;">${props.water_connectivity}%</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Area:</td>
            <td style="text-align: right;">${props.area_sq_km} sq km</td>
          </tr>
        </table>
      </div>
    `;
    layer.bindPopup(popupContent);
    
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#475569",
          dashArray: "",
          fillOpacity: 0.8
        });
      },
      mouseout: (e: any) => {
        layer.setStyle(getWardStyle(feature));
      }
    });
  };

  const onEachStateFeature = (feature: any, layer: any) => {
    const props = feature.properties;
    const popVal = props.population ? props.population.toLocaleString() : "N/A";
    const litVal = props.literacy_rate ? props.literacy_rate + "%" : "N/A";
    const hhVal = props.households ? props.households.toLocaleString() : "N/A";
    const densityVal = props.population_density ? props.population_density + " / sq km" : "N/A";

    const popupContent = `
      <div style="font-family: sans-serif; padding: 5px; min-width: 180px;">
        <h4 style="margin: 0 0 6px 0; color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 4px;">
          ${props.state_name_official || props.name}
        </h4>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Population (2011):</td>
            <td style="text-align: right; font-weight: bold;">${popVal}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Literacy Rate:</td>
            <td style="text-align: right; font-weight: bold; color: #16a34a;">${litVal}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Households:</td>
            <td style="text-align: right;">${hhVal}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Density:</td>
            <td style="text-align: right; color: #4338ca; font-weight: bold;">${densityVal}</td>
          </tr>
        </table>
      </div>
    `;
    layer.bindPopup(popupContent);
    
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#312e81",
          dashArray: "",
          fillOpacity: 0.8
        });
      },
      mouseout: (e: any) => {
        layer.setStyle(getStateStyle(feature));
      }
    });
  };

  const getGatiShaktiStyle = (feature: any) => {
    const type = feature.properties.type;
    if (type === "railway") {
      return {
        color: "#1e293b",
        weight: 4,
        dashArray: "10, 8",
        opacity: 0.85
      };
    } else if (type === "highway") {
      return {
        color: "#ea580c",
        weight: 5,
        opacity: 0.9
      };
    } else if (type === "pipeline") {
      return {
        color: "#0891b2",
        weight: 3,
        dashArray: "6, 6",
        opacity: 0.8
      };
    }
    return { color: "#64748b" };
  };

  const onEachGatiShaktiFeature = (feature: any, layer: any) => {
    const props = feature.properties;
    const popupContent = `
      <div style="font-family: sans-serif; padding: 4px;">
        <h5 style="margin: 0 0 4px 0; color: #ea580c;">PM GatiShakti Infrastructure</h5>
        <div style="font-size: 13px; font-weight: bold; color: #1e293b;">${props.name}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Operator: ${props.operator} | Status: ${props.status}
        </div>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  const getIMDFloodStyle = (feature: any) => {
    const level = feature.properties.risk_level;
    return {
      fillColor: level === "high" ? "#dc2626" : "#f97316",
      weight: 2,
      opacity: 0.8,
      color: level === "high" ? "#991b1b" : "#c2410c",
      fillOpacity: 0.45,
      dashArray: "4, 4"
    };
  };

  const onEachIMDFeature = (feature: any, layer: any) => {
    const props = feature.properties;
    const popupContent = `
      <div style="font-family: sans-serif; padding: 4px;">
        <h5 style="margin: 0 0 4px 0; color: #dc2626; display: flex; align-items: center; gap: 4px;">
          ⚠️ IMD Flood Advisory
        </h5>
        <div style="font-size: 13px; font-weight: bold; color: #1e293b;">${props.risk_name}</div>
        <div style="font-size: 11px; color: #dc2626; font-weight: bold; margin-top: 4px;">
          Risk Level: ${props.risk_level.toUpperCase()}
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 4px;">
          Action: ${props.action_required}
        </div>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  const getPoiColor = (type: string) => {
    if (type === "hospital") return "#e11d48";
    if (type === "school") return "#2563eb";
    if (type === "police") return "#1e1b4b";
    return "#059669";
  };

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
        {/* Tab Selection */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "15px" }}>
          <button 
            type="button"
            onClick={() => setActiveTab("filters")}
            style={{ 
              flex: 1, 
              padding: "12px 6px", 
              fontSize: "12px", 
              fontWeight: "bold", 
              border: "none", 
              background: activeTab === "filters" ? "#f1f5f9" : "none", 
              borderBottom: activeTab === "filters" ? "2px solid #004080" : "none", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "6px",
              color: activeTab === "filters" ? "#004080" : "#64748b"
            }}
          >
            <Filter className="w-4 h-4" />
            {t("map_filters")}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("gis")}
            style={{ 
              flex: 1, 
              padding: "12px 6px", 
              fontSize: "12px", 
              fontWeight: "bold", 
              border: "none", 
              background: activeTab === "gis" ? "#f1f5f9" : "none", 
              borderBottom: activeTab === "gis" ? "2px solid #004080" : "none", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "6px",
              color: activeTab === "gis" ? "#004080" : "#64748b"
            }}
          >
            <Database className="w-4 h-4" />
            Layers (GIS)
          </button>
        </div>

        {/* Tab 1: Grievance Filters */}
        {activeTab === "filters" && (
          <>
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
          </>
        )}

        {/* Tab 2: Advanced GIS Layers */}
        {activeTab === "gis" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="sidebar-header">
              <Database className="w-5 h-5 text-indigo-700" />
              <h5>{t("gis_advanced_panel")}</h5>
            </div>

            {/* Base Map Selection */}
            <div className="filter-group">
              <label className="font-bold text-gray-700 block mb-1 text-sm">{t("gis_base_maps")}</label>
              <select 
                value={baseMap} 
                onChange={(e) => setBaseMap(e.target.value as any)}
                style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
              >
                <option value="osm">{t("gis_osm_standard")}</option>
                <option value="bhuvan_sat">{t("gis_bhuvan_sat")}</option>
                <option value="bhuvan_lulc">{t("gis_bhuvan_lulc")}</option>
              </select>
            </div>

            {/* Census 2011 Data Layers */}
            <div className="filter-group">
              <label className="font-bold text-gray-700 block mb-1 text-sm">{t("gis_census_layers")}</label>
              <select 
                value={censusView} 
                onChange={(e) => setCensusView(e.target.value as any)}
                style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", marginBottom: "8px" }}
              >
                <option value="none">{t("gis_choropleth_none")}</option>
                <option value="wards">{t("gis_census_wards")}</option>
                <option value="india">{t("gis_census_india")}</option>
              </select>

              {censusView !== "none" && (
                <select 
                  value={censusColoring} 
                  onChange={(e) => setCensusColoring(e.target.value as any)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                >
                  <option value="none">{t("gis_choropleth_none")}</option>
                  <option value="population">{t("gis_choropleth_pop")}</option>
                  <option value="literacy">{t("gis_choropleth_lit")}</option>
                </select>
              )}
            </div>

            {/* PM GatiShakti Infrastructure Layers */}
            <div className="filter-group">
              <label className="font-bold text-gray-700 block mb-2 text-sm">{t("gis_gatishakti_layers")}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={gatiShaktiRail} onChange={(e) => setGatiShaktiRail(e.target.checked)} />
                  <Train className="w-4 h-4 text-slate-700" />
                  {t("gis_gatishakti_rail")}
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={gatiShaktiRoad} onChange={(e) => setGatiShaktiRoad(e.target.checked)} />
                  <Milestone className="w-4 h-4 text-orange-600" />
                  {t("gis_gatishakti_road")}
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={gatiShaktiPipe} onChange={(e) => setGatiShaktiPipe(e.target.checked)} />
                  <Activity className="w-4 h-4 text-cyan-600" />
                  {t("gis_gatishakti_pipe")}
                </label>
              </div>
            </div>

            {/* OpenStreetMap POI Toggle */}
            <div className="filter-group">
              <label className="font-bold text-gray-700 block mb-1 text-sm">OpenStreetMap Services</label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                <input type="checkbox" checked={osmPois} onChange={(e) => setOsmPois(e.target.checked)} />
                <MapIcon className="w-4 h-4 text-emerald-600" />
                {t("gis_osm_pois")}
              </label>
            </div>

            {/* IMD Weather Forecast */}
            <div className="filter-group">
              <label className="font-bold text-gray-700 block mb-1 text-sm">{t("gis_imd_weather")}</label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                <input type="checkbox" checked={imdWeather} onChange={(e) => setImdWeather(e.target.checked)} />
                <CloudRain className="w-4 h-4 text-blue-500" />
                {t("gis_imd_alert_title")}
              </label>
            </div>

            {/* IMD Weather Alert Widget */}
            {imdWeather && imdForecastData && (
              <div style={{ padding: "12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#dc2626", fontWeight: "bold", fontSize: "13px" }}>
                  <ShieldAlert className="w-4 h-4" />
                  {t("gis_imd_alert_title")}
                </div>
                <div style={{ fontSize: "11px", color: "#7f1d1d", marginTop: "6px", lineHeight: "1.4" }}>
                  {imdForecastData.alert_message}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#374151", marginTop: "8px", borderTop: "1px dashed #fca5a5", paddingTop: "6px" }}>
                  <span>Forecast Rain:</span>
                  <span style={{ color: "#2563eb" }}>{imdForecastData.forecast_rainfall_mm} mm</span>
                </div>
              </div>
            )}

            {/* Demographics Legend */}
            {censusView !== "none" && censusColoring !== "none" && (
              <div style={{ padding: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "8px", color: "#334155" }}>
                  {t("gis_legend")}
                </div>
                {censusColoring === "population" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#800026", display: "inline-block" }}></span> 100M+ (Wards: 40k+)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#BD0026", display: "inline-block" }}></span> 70M - 100M (Wards: 30k)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#E31A1C", display: "inline-block" }}></span> 50M - 70M (Wards: 25k)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#FC4E2A", display: "inline-block" }}></span> 25M - 50M (Wards: 20k)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#FD8D3C", display: "inline-block" }}></span> 10M - 25M (Wards: 15k)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#FED976", display: "inline-block" }}></span> Under 10M (Wards: Under 15k)</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#005824", display: "inline-block" }}></span> Over 90% (Wards: Over 92%)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#238b45", display: "inline-block" }}></span> 85% - 90% (Wards: 88%)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#41ab5d", display: "inline-block" }}></span> 80% - 85% (Wards: 84%)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#74c476", display: "inline-block" }}></span> 75% - 80% (Wards: 80%)</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", background: "#a1d99b", display: "inline-block" }}></span> Under 75% (Wards: Under 80%)</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Leaflet Map view */}
      <div className="map-view-area">
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
          <ChangeMapView center={mapCenter} zoom={mapZoom} />
          
          {/* Base Layer */}
          {baseMap === "osm" && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          )}
          {baseMap === "bhuvan_sat" && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="© Esri, ISRO Bhuvan Satellite (WMS Fallback)"
            />
          )}
          {baseMap === "bhuvan_lulc" && (
            <WMSTileLayer
              url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms"
              layers="lulc:LULC50_1112"
              format="image/png"
              transparent={true}
              version="1.1.1"
              attribution="© ISRO Bhuvan"
            />
          )}

          {/* Census 2011 Ward Choropleth */}
          {censusView === "wards" && censusWardsGeoJSON && (
            <GeoJSON 
              key={`wards-${censusColoring}`}
              data={censusWardsGeoJSON} 
              style={getWardStyle} 
              onEachFeature={onEachWardFeature} 
            />
          )}

          {/* Census India States Choropleth */}
          {censusView === "india" && censusIndiaGeoJSON && (
            <GeoJSON 
              key={`india-${censusColoring}`}
              data={censusIndiaGeoJSON} 
              style={getStateStyle} 
              onEachFeature={onEachStateFeature} 
            />
          )}

          {/* PM GatiShakti Infrastructure lines */}
          {gatiShaktiGeoJSON && (
            <GeoJSON 
              key={`gatishakti-${gatiShaktiRail}-${gatiShaktiRoad}-${gatiShaktiPipe}`}
              data={{
                ...gatiShaktiGeoJSON,
                features: gatiShaktiGeoJSON.features.filter((f: any) => {
                  if (f.properties.type === "railway" && !gatiShaktiRail) return false;
                  if (f.properties.type === "highway" && !gatiShaktiRoad) return false;
                  if (f.properties.type === "pipeline" && !gatiShaktiPipe) return false;
                  return true;
                })
              }}
              style={getGatiShaktiStyle}
              onEachFeature={onEachGatiShaktiFeature}
            />
          )}

          {/* IMD Weather Alert & Flood Zones */}
          {imdWeather && imdForecastData && imdForecastData.flood_risk_zones && (
            <GeoJSON 
              key="imd-flood"
              data={imdForecastData.flood_risk_zones} 
              style={getIMDFloodStyle} 
              onEachFeature={onEachIMDFeature} 
            />
          )}
          {imdWeather && imdForecastData && imdForecastData.stations && imdForecastData.stations.map((st: any) => (
            <CircleMarker
              key={st.name}
              center={[st.latitude, st.longitude]}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#60a5fa",
                fillOpacity: 0.9,
                weight: 2
              }}
              radius={10}
            >
              <Popup>
                <div style={{ fontFamily: "sans-serif", padding: "2px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: "#2563eb", textTransform: "uppercase" }}>
                    IMD Weather Station
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b", marginTop: "2px" }}>
                    {st.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                    Temp: {st.temperature_c}°C | 24h Rain: {st.current_rain_mm_24h}mm
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* OSM Points of Interest (POIs) */}
          {osmPois && osmPoiMarkers.map((poi) => (
            <CircleMarker
              key={`${poi.id}-${poi.type}`}
              center={[poi.lat, poi.lon]}
              pathOptions={{
                color: getPoiColor(poi.type),
                fillColor: getPoiColor(poi.type),
                fillOpacity: 0.85,
                weight: 1.5
              }}
              radius={8}
            >
              <Popup>
                <div style={{ fontFamily: "sans-serif", padding: "2px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>
                    OSM POI - {poi.type}
                  </span>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b", marginTop: "2px" }}>
                    {poi.name}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Grievance markers (hidden at broad India zooms to avoid clutter) */}
          {mapZoom > 6 && filteredComplaints.map((c) => (
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
