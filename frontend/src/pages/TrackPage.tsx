import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, MapPin, Calendar, Clock, AlertTriangle, ShieldCheck, UserCheck, Star, ThumbsUp, MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";

type TimelineEvent = {
  id: number;
  old_status: string | null;
  new_status: string;
  action_type: string;
  notes: string;
  changed_at: string;
};

type GrievanceDetail = {
  grievance_token: string;
  department: string;
  sub_category: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  is_emergency: boolean;
  district_code: string;
  ward_number: string;
  created_at: string;
  image_url?: string;
  citizen_feedback_rating?: number;
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  no_water_supply: "No Water Supply | पानी न आना",
  low_water_pressure: "Low Water Pressure | कम दबाव",
  dirty_drinking_water: "Dirty Drinking Water | गंदा पानी",
  water_leakage: "Water Leakage | पानी का रिसाव",
  pipeline_burst: "Pipeline Burst | पाइप लाइन फटना",
  overflowing_water_tank: "Overflowing Water Tank | उफनती पानी टंकी",
  illegal_water_connection: "Illegal Water Connection | अवैध कनेक्शन",
  power_outage: "Power Outage | बिजली कटौती",
  transformer_damaged: "Transformer Damaged | खराब ट्रांसफार्मर",
  electric_pole_damaged: "Electric Pole Damaged | क्षतिग्रस्त खंभा",
  hanging_live_wire: "Hanging Live Wire | लटकते बिजली के तार",
  street_light_not_working: "Street Light Not Working | स्ट्रीट लाइट बंद",
  meter_issue: "Meter Issue | मीटर की समस्या",
  voltage_fluctuation: "Voltage Fluctuation | कम-ज्यादा वोल्टेज",
  potholes: "Potholes | सड़क के गड्ढे",
  road_collapse: "Road Collapse | सड़क धसना",
  broken_divider: "Broken Divider | टूटा डिवाइडर",
  road_blockage: "Road Blockage | रास्ता बंद",
  construction_debris: "Construction Debris | मलबे का ढेर",
  dangerous_intersection: "Dangerous Intersection | खतरनाक चौराहा",
  drain_overflow: "Drain Overflow | नाला उफन रहा है",
  sewer_blockage: "Sewer Blockage | सीवर चोक",
  waterlogging: "Waterlogging | जलजмав",
  open_manhole: "Open Manhole | खुला मैनहोल",
  drain_damage: "Drain Damage | क्षतिग्रस्त नाली",
  garbage_not_collected: "Garbage Not Collected | कचरा न उठना",
  overflowing_dustbin: "Overflowing Dustbin | उफनता डस्टबिन",
  dead_animal: "Dead Animal | मृत जानवर",
  public_toilet_issue: "Public Toilet Issue | शौचालय गंदगी",
  waste_burning: "Waste Burning | कचरा जलाना",
  fallen_tree: "Fallen Tree | गिरा हुआ पेड़",
  illegal_tree_cutting: "Illegal Tree Cutting | अवैध पेड़ कटाई",
  air_pollution: "Air Pollution | वायु प्रदूषण",
  noise_pollution: "Noise Pollution | ध्वनि प्रदूषण",
  broken_traffic_signal: "Broken Traffic Signal | |  ट्रैफिक लाइट बंद",
  missing_road_sign: "Missing Road Sign | सड़क चिन्ह गायब",
  illegal_encroachment: "Illegal Encroachment | अवैध कब्जा",
  unsafe_building: "Unsafe Building | जर्जर भवन",
  delay_in_certificate: "Delay in Certificate | प्रमाण पत्र में देरी",
  pension_issue: "Pension Issue | पेंशन समस्या",
  ration_issue: "Ration Issue | राशन न मिलना",
  aadhaar_issue: "Aadhaar Issue | आधार समस्या",
  municipal_tax_issue: "Municipal Tax Issue | नगर निगम टैक्स",
  flood: "Flood | बाढ़ की स्थिति",
  fire: "Fire Incident | आग लगना",
  landslide: "Landslide | भूस्खलन",
  cyclone: "Cyclone | तूफान",
  building_collapse: "Building Collapse | भवन ढहना",
  hospital_sanitation: "Hospital Sanitation | अस्पताल गंदगी",
  medicine_unavailable: "Medicine Unavailable | दवाई न मिलना",
  ambulance_delay: "Ambulance Delay | एंबुलेंस देरी",
  phc_closed: "PHC Closed | स्वास्थ्य केंद्र बंद",
  school_infrastructure: "School Infrastructure | स्कूल भवन समस्या",
  mid_day_meal: "Mid-day Meal Issue | मिड-डे मील समस्या",
  teacher_absent: "Teacher Absenteeism | शिक्षक अनुपस्थिति",
  bus_stop_damage: "Bus Stop Damage | बस स्टॉप क्षति",
  public_transport_complaint: "Public Transport Complaint | परिवहन शिकायत",
  parking_issue: "Parking Issue | पार्किंग समस्या",
  other: "Other | अन्य समस्या"
};

const STEP_HIERARCHY = [
  "submitted",
  "assigned",
  "accepted",
  "in_progress",
  "completed",
  "closed"
];

const generateMockRouting = (dept: string, ward: string, dist: string) => {
  return [
    { id: 101, full_name: `Binod Sahu (Ward Officer - ${ward || '12'})`, role: "ward_officer", hierarchy_level: 1, department: dept, district_code: dist },
    { id: 102, full_name: `Rajesh Patra (JE - ${dept.replace('_', ' ').toUpperCase()})`, role: "junior_engineer", hierarchy_level: 2, department: dept, district_code: dist },
    { id: 103, full_name: `Suresh Mohanty (AE - ${dept.replace('_', ' ').toUpperCase()})`, role: "assistant_engineer", hierarchy_level: 3, department: dept, district_code: dist },
    { id: 104, full_name: `Amit Verma (EE - ${dept.replace('_', ' ').toUpperCase()})`, role: "executive_engineer", hierarchy_level: 4, department: dept, district_code: dist },
    { id: 105, full_name: `Dr. Arindam Das (Municipal Commissioner)`, role: "municipal_commissioner", hierarchy_level: 5, department: "all", district_code: dist },
    { id: 106, full_name: `Sanjay Singh, IAS (District Collector)`, role: "district_collector", hierarchy_level: 6, department: "all", district_code: dist },
    { id: 107, full_name: `Priyanka Sen, IAS (State Secretary)`, role: "state_secretary", hierarchy_level: 7, department: "all", district_code: dist },
    { id: 108, full_name: `Shri Pratap Jena (Urban Development Minister)`, role: "minister", hierarchy_level: 8, department: "all", district_code: dist }
  ];
};

export default function TrackPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [tokenInput, setTokenInput] = useState("");
  const [grievance, setGrievance] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [routingPath, setRoutingPath] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Feedback form states
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const getSubcategoryLabel = (sub: string) => {
    const label = SUBCATEGORY_LABELS[sub] || sub;
    if (label.includes(" | ")) {
      const parts = label.split(" | ");
      return i18n.language === "hi" ? parts[1] : parts[0];
    }
    return label;
  };

  const fetchGrievance = async (token: string) => {
    setLoading(true);
    setError("");
    setGrievance(null);
    setTimeline([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/grievances/${token}`);
      if (response.ok) {
        const data = await response.json();
        setGrievance(data);
        
        // Fetch timeline
        const timeResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/grievances/${token}/timeline`);
        if (timeResponse.ok) {
          const timeData = await timeResponse.json();
          setTimeline(timeData);
        }

        // Fetch routing path
        const routeResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/grievances/${token}/routing`);
        if (routeResponse.ok) {
          const routeData = await routeResponse.json();
          setRoutingPath(routeData);
        } else {
          setRoutingPath(generateMockRouting(data.department, data.ward_number, data.district_code));
        }
      } else {
        // Fallback to local storage or mock
        fetchFromLocalOrMock(token);
      }
    } catch (err) {
      // Fallback to local storage or mock
      fetchFromLocalOrMock(token);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromLocalOrMock = (token: string) => {
    const localGrievances = JSON.parse(localStorage.getItem("local_grievances") || "[]");
    const found = localGrievances.find((g: any) => g.grievance_token === token);
    if (found) {
      setGrievance({
        grievance_token: found.grievance_token,
        department: found.department,
        sub_category: found.sub_category,
        title: found.title,
        description: found.description,
        status: found.status,
        priority: found.priority,
        is_emergency: found.is_emergency,
        district_code: found.district_code || "BBSR",
        ward_number: found.ward_number || "Ward 12",
        created_at: found.created_at,
        citizen_feedback_rating: found.citizen_feedback_rating,
        current_hierarchy_level: found.current_hierarchy_level || 1,
      });

      setRoutingPath(generateMockRouting(found.department, found.ward_number || "12", found.district_code || "BBSR"));

      // Generate realistic timeline events for this local grievance
      const events: TimelineEvent[] = [
        {
          id: 1,
          old_status: null,
          new_status: "submitted",
          action_type: "status_change",
          notes: i18n.language === "hi" ? "शिकायत ऑनलाइन पोर्टल के माध्यम से दर्ज की गई।" : "Grievance registered through online portal.",
          changed_at: found.created_at,
        }
      ];

      if (found.status !== "submitted") {
        let statusNotes = "";
        if (found.status === "assigned") {
          statusNotes = i18n.language === "hi" ? "शिकायत संबंधित अधिकारी को आवंटित कर दी गई है।" : "Grievance assigned to the concern officer.";
        } else if (found.status === "accepted") {
          statusNotes = i18n.language === "hi" ? "अधिकारी द्वारा शिकायत स्वीकार की गई।" : "Grievance accepted by officer.";
        } else if (found.status === "in_progress") {
          statusNotes = i18n.language === "hi" ? "समस्या निवारण कार्य प्रगति पर है।" : "Resolution work in progress.";
        } else if (found.status === "completed") {
          statusNotes = i18n.language === "hi" ? "समस्या का समाधान कर दिया गया है।" : "Issue has been resolved successfully.";
        } else if (found.status === "closed") {
          statusNotes = i18n.language === "hi" ? "शिकायत बंद कर दी गई है।" : "Grievance has been closed.";
        } else {
          statusNotes = `Status updated to ${found.status}`;
        }
        
        events.push({
          id: 2,
          old_status: "submitted",
          new_status: found.status,
          action_type: "status_change",
          notes: statusNotes,
          changed_at: new Date(new Date(found.created_at).getTime() + 10 * 60000).toISOString(),
        });
      }

      setTimeline(events);
    } else {
      setMockData(token);
    }
  };

  const setMockData = (token: string) => {
    if (!token.startsWith("GR-")) {
      setError(t("invalid_token_format"));
      return;
    }

    // Set high quality mock data matching government workflow
    setGrievance({
      grievance_token: token,
      department: "water_supply",
      sub_category: "no_water_supply",
      title: i18n.language === "hi" ? "शिव कॉलोनी में 3 दिनों से पेयजल आपूर्ति ठप" : "Water supply stopped in Shiv Colony for 3 days",
      description: i18n.language === "hi" 
        ? "पानी का मुख्य वाल्व खराब होने के कारण कॉलोनी के 200 से अधिक घरों में पेयजल की गंभीर समस्या उत्पन्न हो गई है। कृपया तत्काल सहायता करें।" 
        : "Due to main water valve damage, serious drinking water issue has occurred in more than 200 houses. Please resolve immediately.",
      status: "in_progress",
      priority: "high",
      is_emergency: false,
      district_code: "BBSR",
      ward_number: "Ward 12",
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      current_hierarchy_level: 2,
    });
    setRoutingPath(generateMockRouting("water_supply", "Ward 12", "BBSR"));

    setTimeline([
      {
        id: 1,
        old_status: null,
        new_status: "submitted",
        action_type: "status_change",
        notes: i18n.language === "hi" ? "शिकायत ऑनलाइन पोर्टल के माध्यम से दर्ज की गई।" : "Grievance registered through online portal.",
        changed_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      },
      {
        id: 2,
        old_status: "submitted",
        new_status: "assigned",
        action_type: "status_change",
        notes: i18n.language === "hi" 
          ? "स्वचालि‍त रूप से कनिष्ठ अभियंता (जल आपूर्ति) भुवनेश्वर को आवंटित की गई।" 
          : "Automatically assigned to Junior Engineer (Water Supply) Bhubaneswar.",
        changed_at: new Date(Date.now() - 35.8 * 3600 * 1000).toISOString(),
      },
      {
        id: 3,
        old_status: "assigned",
        new_status: "accepted",
        action_type: "status_change",
        notes: i18n.language === "hi" 
          ? "अधिकारी द्वारा शिकायत स्वीकार की गई एवं स्थल निरीक्षण का समय तय हुआ।" 
          : "Grievance accepted by officer and site inspection scheduled.",
        changed_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 4,
        old_status: "accepted",
        new_status: "in_progress",
        action_type: "status_change",
        notes: i18n.language === "hi" 
          ? "मरम्मत कार्य हेतु सामग्री खरीदी गई एवं तकनीशियन दल मौके पर मौजूद है।" 
          : "Materials purchased for repair work and technician team is on site.",
        changed_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      }
    ]);
  };

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setTokenInput(token);
      fetchGrievance(token);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      fetchGrievance(tokenInput.trim());
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/grievances/${grievance?.grievance_token}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback_text: feedbackText })
      });

      if (response.ok) {
        setFeedbackSuccess(true);
        // Refresh details
        fetchGrievance(grievance!.grievance_token);
      } else {
        simulateLocalFeedback();
      }
    } catch (err) {
      simulateLocalFeedback();
    }
  };

  const simulateLocalFeedback = () => {
    if (grievance) {
      try {
        const localGrievances = JSON.parse(localStorage.getItem("local_grievances") || "[]");
        const updated = localGrievances.map((lg: any) => {
          if (lg.grievance_token === grievance.grievance_token) {
            return {
              ...lg,
              status: rating <= 2 ? "appealed" : lg.status,
              citizen_feedback_rating: rating,
              citizen_feedback_text: feedbackText
            };
          }
          return lg;
        });
        localStorage.setItem("local_grievances", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
    setFeedbackSuccess(true);
    if (grievance) {
      fetchGrievance(grievance.grievance_token);
    }
  };

  const getStepIndex = (status: string) => {
    if (status === "closed" || status === "citizen_verified") return 5;
    if (status === "completed") return 4;
    if (status === "in_progress" || status === "work_order" || status === "inspection") return 3;
    if (status === "accepted") return 2;
    if (status === "assigned" || status === "ai_verified") return 1;
    return 0; // submitted
  };

  const currentStepIndex = grievance ? getStepIndex(grievance.status) : 0;

  return (
    <div className="gov-track-container">
      {/* Search Bar section */}
      <section className="track-search-section">
        <div className="section-header text-center">
          <h2>{t("track_title")}</h2>
          <p>{t("track_subtitle")}</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="track-search-form">
          <input
            type="text"
            placeholder={t("placeholder_track")}
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            required
          />
          <button type="submit" className="btn-track-search">
            <Search className="w-5 h-5 mr-1" />
            {t("btn_search")}
          </button>
        </form>
      </section>

      {loading && <div className="track-loading-spinner">{t("fetching_info")}</div>}
      {error && <div className="track-error-alert">{error}</div>}

      {/* Grievance Details & Timeline Display */}
      {grievance && (
        <div className="track-results-layout">
          {/* Main Info Columns */}
          <div className="track-detail-col">
            <div className="detail-card">
              <div className="card-header-gov">
                <h5>{t("grievance_details")}</h5>
                <span className={`status-badge-gov status-${grievance.status}`}>
                  {t(`status_${grievance.status}`)}
                </span>
              </div>

              <div className="card-body-gov">
                <table className="gov-detail-table">
                  <tbody>
                    <tr>
                      <td>{t("token_id_label")}:</td>
                      <td className="font-bold text-blue-900">{grievance.grievance_token}</td>
                    </tr>
                    <tr>
                      <td>{t("title_label")}:</td>
                      <td>{grievance.title}</td>
                    </tr>
                    <tr>
                      <td>{t("department_label")}:</td>
                      <td>
                        <span className="capitalize">{t(`dept_${grievance.department}`)}</span> - {getSubcategoryLabel(grievance.sub_category)}
                      </td>
                    </tr>
                    <tr>
                      <td>{t("location_label")}:</td>
                      <td>
                        <MapPin className="inline w-4 h-4 mr-1 text-red-500" />
                        {grievance.ward_number}, {grievance.district_code}
                      </td>
                    </tr>
                    <tr>
                      <td>{t("date_filed_label")}:</td>
                      <td>
                        <Calendar className="inline w-4 h-4 mr-1 text-gray-500" />
                        {new Date(grievance.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td>{t("priority_label")}:</td>
                      <td>
                        <span className={`priority-tag priority-${grievance.priority}`}>
                          {grievance.priority.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="complaint-description-box">
                  <h6>{t("description_label")}:</h6>
                  <p>{grievance.description}</p>
                </div>
              </div>
            </div>

            {/* Officer Resolution Routing Path */}
            {routingPath && routingPath.length > 0 && (
              <div className="detail-card mt-6" style={{ marginTop: "24px" }}>
                <div className="card-header-gov" style={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h5 style={{ margin: 0 }}>{i18n.language === "hi" ? "शिकायत समाधान अधिकारी मार्ग" : "Grievance Resolution Routing Path"}</h5>
                  <span style={{ fontSize: "11px", opacity: 0.9 }}>{grievance.district_code} • {grievance.ward_number}</span>
                </div>
                <div className="card-body-gov" style={{ padding: "20px" }}>
                  <p style={{ fontSize: "13px", color: "#4b5563", marginBottom: "20px" }}>
                    {i18n.language === "hi" 
                      ? "नीचे शिकायत निवारण के लिए जिम्मेदार अधिकारियों का पदानुक्रम मार्ग दिया गया है। वर्तमान में उत्तरदायी अधिकारी को रेखांकित किया गया है।" 
                      : "Below is the hierarchical routing of officers responsible for resolving this grievance. The currently responsible officer is highlighted."}
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", paddingLeft: "24px", borderLeft: "2px solid #e5e7eb" }}>
                    {routingPath.map((officer, index) => {
                      const isPassed = officer.hierarchy_level <= (grievance.current_hierarchy_level || 1);
                      const isActive = officer.hierarchy_level === (grievance.current_hierarchy_level || 1);
                      
                      return (
                        <div 
                          key={officer.id || index} 
                          style={{ 
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: isActive ? "#eff6ff" : "#f9fafb",
                            border: isActive ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                            boxShadow: isActive ? "0 4px 6px -1px rgba(59, 130, 246, 0.1)" : "none",
                            transition: "all 0.2s"
                          }}
                        >
                          {/* Node Dot */}
                          <div 
                            style={{ 
                              position: "absolute",
                              left: "-33px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              border: "3px solid #fff",
                              background: isActive ? "#3b82f6" : isPassed ? "#10b981" : "#d1d5db",
                              boxShadow: "0 0 0 1px " + (isActive ? "#3b82f6" : isPassed ? "#10b981" : "#d1d5db"),
                              zIndex: 2
                            }}
                          />

                          {/* Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: "bold", fontSize: "14px", color: isActive ? "#1e3a8a" : "#374151" }}>
                                {officer.full_name}
                              </span>
                              {isActive && (
                                <span style={{ fontSize: "11px", fontWeight: "bold", background: "#3b82f6", color: "#fff", padding: "2px 8px", borderRadius: "9999px" }}>
                                  {i18n.language === "hi" ? "वर्तमान अधिकारी" : "CURRENT OFFICER"}
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                              <span>Level {officer.hierarchy_level} ({officer.role.replace('_', ' ').toUpperCase()})</span>
                              {officer.department && officer.department !== "all" && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{officer.department.replace('_', ' ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Citizen Feedback Form (Only visible if status is completed) */}
            {grievance.status === "completed" && !grievance.citizen_feedback_rating && !feedbackSuccess && (
              <div className="feedback-card mt-6">
                <h5>{t("citizen_feedback_title")}</h5>
                <p>{t("feedback_satisfaction_question")}</p>
                <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                  <div className="star-rating-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`star-btn ${star <= rating ? "filled" : ""}`}
                      >
                        <Star className="w-8 h-8" />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && rating <= 2 && (
                    <div className="alert alert-warning text-xs mt-2">
                      <AlertTriangle className="inline w-4 h-4 mr-1" />
                      {t("low_rating_alert")}
                    </div>
                  )}
                  <div className="form-group mt-4">
                    <label>{t("additional_comments_label")}</label>
                    <textarea
                      placeholder={t("placeholder_feedback_comments")}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={3}
                    ></textarea>
                  </div>
                  <button type="submit" className="submit-feedback-btn mt-2">
                    {t("btn_submit_feedback")}
                  </button>
                </form>
              </div>
            )}

            {(feedbackSuccess || grievance.citizen_feedback_rating) && (
              <div className="feedback-success-card mt-6">
                <ThumbsUp className="w-12 h-12 text-emerald-600 mb-2" />
                <h5>{t("feedback_submitted_title")}</h5>
                <p>{t("feedback_submitted_desc")}</p>
              </div>
            )}
          </div>

          {/* Vertical Delivery Timeline (Amazon Style) */}
          <div className="track-timeline-col">
            <div className="timeline-card">
              <h5>{t("progress_tracker_title")}</h5>
              
              {/* Visual horizontal step bar */}
              <div className="progress-horizontal-bar">
                {STEP_HIERARCHY.map((stepName, i) => (
                  <div 
                    key={stepName}
                    className={`progress-node ${i <= currentStepIndex ? "completed" : ""} ${i === currentStepIndex ? "active" : ""}`}
                  >
                    <div className="node-circle"></div>
                    <span className="node-text capitalize">{t(`status_${stepName}`)}</span>
                  </div>
                ))}
              </div>

              {/* Vertical Audit Timeline Details */}
              <div className="audit-timeline-vertical">
                {timeline.map((event) => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-time">
                        <Clock className="inline w-3 h-3 mr-1" />
                        {new Date(event.changed_at).toLocaleString()}
                      </div>
                      <h6>{t(`status_${event.new_status}`) || event.new_status}</h6>
                      <p>{event.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
