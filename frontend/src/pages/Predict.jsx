import React from "react";
import PredictionForm from "../components/PredictionForm";
import { HiOutlineSparkles } from "react-icons/hi2";

export default function Predict() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4">
            <HiOutlineSparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">AI Risk Assessment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Predict Readmission Risk
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Enter patient hospital data below. The ML model will analyze the information and 
            classify the readmission risk level.
          </p>
        </div>

        {/* Form */}
        <PredictionForm />
      </div>
    </div>
  );
}
