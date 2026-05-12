import React, { useState } from "react";
import { HiOutlineMagnifyingGlass, HiOutlineArrowPath } from "react-icons/hi2";
import API from "../services/api";
import Loader from "./Loader";
import ResultCard from "./ResultCard";

const ageOptions = [
  "[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)",
  "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)",
];

const diag1CategoryOptions = [
  "Circulatory", "Respiratory", "Digestive", "Diabetes", "Injury", 
  "Musculoskeletal", "Genitourinary", "Neoplasms", "Endocrine", 
  "Skin", "Mental", "Infectious", "Blood", "Nervous", "Pregnancy", 
  "Congenital", "Perinatal", "Symptoms", "Other", 
  "Circulatory_Hypertension", "Circulatory_HeartDisease", 
  "Diabetes_Type2", "Respiratory_COPD"
];

const insulinOptions = ["No", "Up", "Down", "Steady"];
const yesNoOptions = ["Yes", "No"];

const defaultForm = {
  age: "[50-60)",
  time_in_hospital: 4,
  num_medications: 12,
  number_diagnoses: 5,
  number_inpatient: 0,
  number_outpatient: 0,
  number_emergency: 0,
  admission_type_id: 1,
  discharge_disposition_id: 1,
  diag_1_cat: "Circulatory",
  insulin: "No",
  diabetesMed: "Yes",
};

export default function PredictionForm() {
  const [form, setForm] = useState({ ...defaultForm });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      "time_in_hospital", "num_medications", "number_diagnoses",
      "number_inpatient", "number_outpatient", "number_emergency",
      "admission_type_id", "discharge_disposition_id"
    ];
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    // Build full payload with sensible defaults for hidden fields
    const payload = {
      ...form,
      admission_source_id: 7,
      num_lab_procedures: 40,
      num_procedures: 1,
    };

    try {
      const response = await API.post("/predict", payload);
      setResult(response.data.prediction);
    } catch (err) {
      setError("Unable to generate prediction. Please ensure the backend server is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ ...defaultForm });
    setResult(null);
    setError(null);
  };

  const selectClass =
    "w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all appearance-none cursor-pointer";
  const inputClass =
    "w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">Patient Information</h3>
          <p className="text-slate-400 text-sm">Enter patient details for risk assessment</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Age */}
          <div>
            <label className={labelClass}>Age Group</label>
            <select name="age" value={form.age} onChange={handleChange} className={selectClass}>
              {ageOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Primary Diagnosis */}
          <div>
            <label className={labelClass}>Primary Diagnosis</label>
            <select name="diag_1_cat" value={form.diag_1_cat} onChange={handleChange} className={selectClass}>
              {diag1CategoryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Time in hospital */}
          <div>
            <label className={labelClass}>Time in Hospital (days)</label>
            <input
              type="number"
              name="time_in_hospital"
              value={form.time_in_hospital}
              onChange={handleChange}
              min={1}
              max={14}
              className={inputClass}
            />
          </div>

          {/* Num medications */}
          <div>
            <label className={labelClass}>Number of Medications</label>
            <input
              type="number"
              name="num_medications"
              value={form.num_medications}
              onChange={handleChange}
              min={0}
              max={81}
              className={inputClass}
            />
          </div>

          {/* Number of diagnoses */}
          <div>
            <label className={labelClass}>Number of Diagnoses</label>
            <input
              type="number"
              name="number_diagnoses"
              value={form.number_diagnoses}
              onChange={handleChange}
              min={1}
              max={16}
              className={inputClass}
            />
          </div>

          {/* Number Inpatient */}
          <div>
            <label className={labelClass}>Inpatient Visits (prior year)</label>
            <input
              type="number"
              name="number_inpatient"
              value={form.number_inpatient}
              onChange={handleChange}
              min={0}
              className={inputClass}
            />
          </div>

          {/* Number Outpatient */}
          <div>
            <label className={labelClass}>Outpatient Visits (prior year)</label>
            <input
              type="number"
              name="number_outpatient"
              value={form.number_outpatient}
              onChange={handleChange}
              min={0}
              className={inputClass}
            />
          </div>

          {/* Number Emergency */}
          <div>
            <label className={labelClass}>Emergency Visits (prior year)</label>
            <input
              type="number"
              name="number_emergency"
              value={form.number_emergency}
              onChange={handleChange}
              min={0}
              className={inputClass}
            />
          </div>
          
          {/* Admission Type */}
          <div>
            <label className={labelClass}>Admission Type ID</label>
            <input
              type="number"
              name="admission_type_id"
              value={form.admission_type_id}
              onChange={handleChange}
              min={1}
              className={inputClass}
            />
          </div>

          {/* Discharge Disposition */}
          <div>
            <label className={labelClass}>Discharge Disposition ID</label>
            <input
              type="number"
              name="discharge_disposition_id"
              value={form.discharge_disposition_id}
              onChange={handleChange}
              min={1}
              className={inputClass}
            />
          </div>

          {/* Insulin */}
          <div>
            <label className={labelClass}>Insulin Status</label>
            <select name="insulin" value={form.insulin} onChange={handleChange} className={selectClass}>
              {insulinOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Diabetes Med */}
          <div>
            <label className={labelClass}>Diabetes Medication</label>
            <select name="diabetesMed" value={form.diabetesMed} onChange={handleChange} className={selectClass}>
              {yesNoOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineMagnifyingGlass className="w-5 h-5" />
            {loading ? "Analyzing..." : "Predict Risk"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium py-3 px-6 rounded-xl border border-white/10 transition-all duration-200"
          >
            <HiOutlineArrowPath className="w-5 h-5" />
            Reset
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && <Loader />}

      {/* Error */}
      {error && (
        <div className="glass-card p-6 border-red-500/30 border">
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && <ResultCard prediction={result} />}
    </div>
  );
}
