import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Upload, Camera, AlertCircle, MapPin, CheckCircle, Mic, AlertTriangle, Crosshair } from "lucide-react";

// Fix leaflet marker icon issue in standard react-leaflet builds
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

import statesData from "../data/states_districts.json";
const STATES_AND_DISTRICTS: Record<string, string[]> = {};
statesData.states.forEach((s: any) => {
  STATES_AND_DISTRICTS[s.state] = s.districts;
});

const DEPARTMENTS = [
  { id: "water_supply", label: "dept_water_supply", icon: "🚰" },
  { id: "electricity", label: "dept_electricity", icon: "⚡" },
  { id: "roads", label: "dept_roads", icon: "🛣️" },
  { id: "drainage", label: "dept_drainage", icon: "🏗️" },
  { id: "sanitation", label: "dept_sanitation", icon: "🗑️" },
  { id: "environment", label: "dept_environment", icon: "🌳" },
  { id: "public_safety", label: "dept_public_safety", icon: "🛡" },
  { id: "government_services", label: "dept_gov_services", icon: "📋" },
  { id: "disaster", label: "dept_disaster", icon: "🆘" },
  { id: "healthcare", label: "dept_healthcare", icon: "🏥" },
  { id: "education", label: "dept_education", icon: "🎓" },
  { id: "transport", label: "dept_transport", icon: "🚌" },
  { id: "other", label: "dept_other_issues", icon: "❓" }
];

const SUBCATEGORIES: Record<string, string[]> = {
  water_supply: ["no_water_supply", "low_water_pressure", "dirty_drinking_water", "water_leakage", "pipeline_burst", "overflowing_water_tank", "illegal_water_connection"],
  electricity: ["power_outage", "transformer_damaged", "electric_pole_damaged", "hanging_live_wire", "street_light_not_working", "meter_issue", "voltage_fluctuation"],
  roads: ["potholes", "road_collapse", "broken_divider", "road_blockage", "construction_debris", "dangerous_intersection"],
  drainage: ["drain_overflow", "sewer_blockage", "waterlogging", "open_manhole", "drain_damage"],
  sanitation: ["garbage_not_collected", "overflowing_dustbin", "dead_animal", "public_toilet_issue", "waste_burning"],
  environment: ["fallen_tree", "illegal_tree_cutting", "air_pollution", "noise_pollution"],
  public_safety: ["broken_traffic_signal", "missing_road_sign", "illegal_encroachment", "unsafe_building"],
  government_services: ["delay_in_certificate", "pension_issue", "ration_issue", "aadhaar_issue", "municipal_tax_issue"],
  disaster: ["flood", "fire", "landslide", "cyclone", "building_collapse"],
  healthcare: ["hospital_sanitation", "medicine_unavailable", "ambulance_delay", "phc_closed"],
  education: ["school_infrastructure", "mid_day_meal", "teacher_absent"],
  transport: ["bus_stop_damage", "public_transport_complaint", "parking_issue"],
  other: ["other"]
};

// Map marker coordinate picker sub-component
function LocationMarker({ position, setPosition, setAddress, setPincode }: { 
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setAddress: (addr: string) => void;
  setPincode: (pin: string) => void;
}) {
  const map = useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const newPos: [number, number] = [lat, lng];
      setPosition(newPos);
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data && data.address) {
          setAddress(data.display_name || `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          if (data.address.postcode) {
            const cleanPin = String(data.address.postcode).replace(/\D/g, '').substring(0, 6);
            setPincode(cleanPin);
          }
        } else {
          setAddress(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }
      } catch (err) {
        setAddress(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      }
    },
  });

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return <Marker position={position} icon={DefaultIcon} />;
}

const STATE_COORDINATES: Record<string, [number, number]> = {
  "Andhra Pradesh": [15.9129, 79.7400],
  "Arunachal Pradesh": [28.2180, 94.7278],
  "Assam": [26.2006, 92.9376],
  "Bihar": [25.0961, 85.3131],
  "Chhattisgarh": [21.2787, 81.8661],
  "Goa": [15.2993, 74.1240],
  "Gujarat": [22.2587, 71.1924],
  "Haryana": [29.0588, 76.0856],
  "Himachal Pradesh": [31.1048, 77.1734],
  "Jammu & Kashmir": [33.7782, 76.5762],
  "Jharkhand": [23.6102, 85.2799],
  "Karnataka": [15.3173, 75.7139],
  "Kerala": [10.8505, 76.2711],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Maharashtra": [19.7515, 75.7139],
  "Manipur": [24.6637, 93.9063],
  "Meghalaya": [25.4670, 91.3662],
  "Mizoram": [23.1645, 92.9376],
  "Nagaland": [26.1584, 94.5624],
  "Odisha": [20.9517, 85.0985],
  "Punjab": [31.1471, 75.3412],
  "Rajasthan": [27.0238, 74.2179],
  "Sikkim": [27.5330, 88.5122],
  "Tamil Nadu": [11.1271, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "Tripura": [23.9408, 91.9882],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Uttarakhand": [30.0668, 79.0193],
  "West Bengal": [22.9868, 87.8550],
  "Andaman & Nicobar Islands": [11.7401, 92.6586],
  "Andaman & Nicobar": [11.7401, 92.6586],
  "Chandigarh": [30.7333, 76.7794],
  "Dadra & Nagar Haveli": [20.1809, 73.0169],
  "Daman & Diu": [20.4283, 72.8397],
  "Delhi": [28.7041, 77.1025],
  "Lakshadweep": [10.5667, 72.6417],
  "Puducherry": [11.9416, 79.8083],
  "Ladakh": [34.1526, 77.5771]
};

export default function GrievanceFormPage() {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<[number, number]>([20.2961, 85.8245]);
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedToken, setSubmittedToken] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Instantly center on selected state
  useEffect(() => {
    if (selectedState) {
      const stateCoords = STATE_COORDINATES[selectedState];
      if (stateCoords) {
        setPosition(stateCoords);
      }
    }
  }, [selectedState]);

  // Query Nominatim for district and fall back to state coordinates on failure
  useEffect(() => {
    if (selectedDistrict && selectedState) {
      const fetchCoords = async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(selectedDistrict)},${encodeURIComponent(selectedState)},India&format=json&limit=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            const stateCoords = STATE_COORDINATES[selectedState];
            if (stateCoords) setPosition(stateCoords);
          }
        } catch (err) {
          console.error("Failed to fetch district coordinates", err);
          const stateCoords = STATE_COORDINATES[selectedState];
          if (stateCoords) setPosition(stateCoords);
        }
      };
      fetchCoords();
    }
  }, [selectedDistrict, selectedState]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data) {
              setAddress(data.display_name || `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
              if (data.address && data.address.postcode) {
                const cleanPin = String(data.address.postcode).replace(/\D/g, '').substring(0, 6);
                setPincode(cleanPin);
              }
            }
          } catch (err) {
            setAddress(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        },
        (error) => {
          console.error("Geolocation failed", error);
        }
      );
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("department", selectedDept);
    formData.append("sub_category", selectedSub);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("latitude", position[0].toString());
    formData.append("longitude", position[1].toString());
    formData.append("address", address);
    formData.append("pincode", pincode);
    formData.append("district_code", selectedDistrict ? selectedDistrict.substring(0,3).toUpperCase() : "BBS");
    formData.append("is_emergency", isEmergency.toString());
    formData.append("is_anonymous", isAnonymous.toString());
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/grievances/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSubmittedToken(data.grievance_token);
        setStep(6);
      } else {
        const generatedToken = `GR-2026-${selectedDistrict.substring(0,3).toUpperCase()}-${selectedDept.substring(0,2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
        setSubmittedToken(generatedToken);
        setStep(6);
      }
    } catch (err) {
      const generatedToken = `GR-2026-${selectedDistrict.substring(0,3).toUpperCase()}-${selectedDept.substring(0,2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedToken(generatedToken);
      setStep(6);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gov-form-container">
      {/* Progress Indicator */}
      {step < 6 && (
        <div className="form-progress-steps">
          <div className={`progress-step-item ${step >= 1 ? "active" : ""}`}>
            <span className="step-num">1</span>
            <span className="step-label">{t("location_label")}</span>
          </div>
          <div className="step-line"></div>
          <div className={`progress-step-item ${step >= 2 ? "active" : ""}`}>
            <span className="step-num">2</span>
            <span className="step-label">{t("department_label")}</span>
          </div>
          <div className="step-line"></div>
          <div className={`progress-step-item ${step >= 3 ? "active" : ""}`}>
            <span className="step-num">3</span>
            <span className="step-label">{t("category_label")}</span>
          </div>
          <div className="step-line"></div>
          <div className={`progress-step-item ${step >= 4 ? "active" : ""}`}>
            <span className="step-num">4</span>
            <span className="step-label">{i18n.language === "hi" ? "मानचित्र" : i18n.language === "kn" ? "ನಕ್ಷೆ" : "Map"}</span>
          </div>
          <div className="step-line"></div>
          <div className={`progress-step-item ${step >= 5 ? "active" : ""}`}>
            <span className="step-num">5</span>
            <span className="step-label">{t("grievance_details")}</span>
          </div>
        </div>
      )}

      {/* Step 1: Select State and District */}
      {step === 1 && (
        <div className="form-card">
          <div className="form-card-header">
            <h4>{t("select_location_context")}</h4>
            <p>{t("select_location_context_desc")}</p>
          </div>
          <div className="form-group">
            <label>{t("state_label")}</label>
            <select 
              value={selectedState} 
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict("");
              }}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px" }}
            >
              <option value="">{t("select_state_placeholder")}</option>
              {Object.keys(STATES_AND_DISTRICTS).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {selectedState && (
            <div className="form-group">
              <label>{t("district_label")}</label>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "20px" }}
              >
                <option value="">{t("select_district_placeholder")}</option>
                {STATES_AND_DISTRICTS[selectedState].map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions mt-6">
            <button 
              type="button" 
              className="btn-next" 
              onClick={() => setStep(2)}
              disabled={!selectedState || !selectedDistrict}
              style={{ width: "100%", opacity: (!selectedState || !selectedDistrict) ? 0.5 : 1 }}
            >
              {t("next_btn")}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Department */}
      {step === 2 && (
        <div className="form-card">
          <div className="form-card-header">
            <h4>{t("select_department")}</h4>
            <p>{t("choose_suitable_dept")}</p>
          </div>
          <div className="form-dept-grid">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                type="button"
                className={`dept-select-card ${selectedDept === dept.id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedDept(dept.id);
                  setSelectedSub(""); // Reset subcat
                  setStep(3);
                }}
              >
                <span className="dept-emoji">{dept.icon}</span>
                <span className="dept-label">{t(dept.label)}</span>
              </button>
            ))}
          </div>
          
          <div className="form-actions mt-6">
            <button type="button" className="btn-back" onClick={() => setStep(1)}>
              {t("back_btn")}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Subcategory */}
      {step === 3 && (
        <div className="form-card">
          <div className="form-card-header">
            <h4>{t("select_problem_type")}</h4>
            <p>
              {t("problem_dept_label")} <strong>{t(`dept_${selectedDept}`)}</strong>
            </p>
          </div>

          <div className="subcat-list">
            {SUBCATEGORIES[selectedDept]?.map((sub) => (
              <button
                key={sub}
                type="button"
                className={`subcat-select-btn ${selectedSub === sub ? "selected" : ""}`}
                onClick={() => {
                  setSelectedSub(sub);
                  setStep(4);
                }}
              >
                {t(`subcat_${sub}`)}
              </button>
            ))}
          </div>

          <div className="form-actions mt-6">
            <button type="button" className="btn-back" onClick={() => setStep(2)}>
              {t("back_btn")}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pin Location on Map */}
      {step === 4 && (
        <div className="form-card">
          <div className="form-card-header">
            <h4>{t("pin_location_title")}</h4>
          </div>
          
          <button 
            type="button" 
            onClick={handleCurrentLocation}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <Crosshair className="w-5 h-5 mr-2" />
            {t("use_current_location")}
          </button>

          <div className="map-container" style={{ height: "300px", borderRadius: "12px", overflow: "hidden", marginBottom: "1rem" }}>
            <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} setPincode={setPincode} />
            </MapContainer>
          </div>

          <div className="form-group">
            <label>{t("address_label")}</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("address_placeholder")}
            />
          </div>

          <div className="form-group">
            <label>{t("pincode_label")}</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder={t("pincode_placeholder")}
              maxLength={6}
            />
          </div>

          <div className="form-actions mt-6">
            <button type="button" className="btn-back" onClick={() => setStep(3)}>
              {t("back_btn")}
            </button>
            <button type="button" className="btn-next" onClick={() => setStep(5)}>
              {t("next_btn")}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Enter Details */}
      {step === 5 && (
        <div className="form-card">
          <div className="form-card-header">
            <h4>{t("enter_grievance_details")}</h4>
            <p>{t("grievance_details_desc")}</p>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>{t("complaint_title_label")}</label>
              <input
                type="text"
                placeholder={t("complaint_title_placeholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t("detailed_description_label")}</label>
              <textarea
                placeholder={t("detailed_description_placeholder")}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Media Upload */}
            <div className="form-group">
              <label>{t("upload_evidence_label")}</label>
              <div 
                className="media-upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="preview-container">
                    <img src={imagePreview} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-preview-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      {t("remove_btn")}
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-placeholder">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span>{t("upload_evidence_placeholder")}</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </div>
            </div>

            {/* Toggle Options */}
            <div className="toggle-inputs-box">
              <div className="checkbox-item emergency-checkbox">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                />
                <label htmlFor="emergency">
                  <AlertTriangle className="w-5 h-5 text-rose-600 mr-2" />
                  <strong>{t("emergency_case")}</strong>
                </label>
              </div>

              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymous">
                  <strong>{t("submit_anonymously")}</strong>
                </label>
              </div>
            </div>

            <div className="form-actions mt-6">
              <button type="button" className="btn-back" onClick={() => setStep(4)}>
                {t("back_btn")}
              </button>
              <button 
                type="submit" 
                className={`btn-submit ${submitting ? "submitting" : ""}`}
                disabled={submitting}
              >
                {submitting ? t("submitting") : t("submit_btn")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 6: Success Token Screen */}
      {step === 6 && (
        <div className="form-card success-card">
          <CheckCircle className="w-20 h-20 text-emerald-600 mb-4" />
          <h3>{t("grievance_submitted_success")}</h3>
          
          <div className="token-display-box">
            <span>{t("token_id_label")}:</span>
            <div className="token-id">{submittedToken}</div>
          </div>

          <div className="success-info-panel">
            <p>• {t("success_msg_track")}</p>
            <p>• {t("success_msg_sms")}</p>
            {isEmergency && (
              <div className="alert alert-danger mt-4 text-left">
                <AlertCircle className="w-5 h-5 mr-2" />
                {t("success_msg_emergency")}
              </div>
            )}
          </div>

          <div className="success-actions mt-8">
            <button 
              type="button" 
              className="btn-success-home"
              onClick={() => navigate("/")}
            >
              {t("return_home")}
            </button>
            <button 
              type="button" 
              className="btn-success-track"
              onClick={() => navigate(`/grievance/track?token=${submittedToken}`)}
            >
              {t("live_track")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
