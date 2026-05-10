import React from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineBeaker,
  HiOutlineCpuChip,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineServerStack,
  HiOutlineUserGroup,
} from "react-icons/hi2";

const features = [
  {
    icon: HiOutlineCpuChip,
    title: "Ensemble ML Models",
    desc: "Combines Random Forest, Gradient Boosting, and AdaBoost via Voting Classifier for robust predictions.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: HiOutlineChartBar,
    title: "130+ US Hospitals",
    desc: "Trained on 100,000+ real diabetic patient records from 130 US hospitals (Strack et al. dataset).",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: HiOutlineServerStack,
    title: "Real-Time API",
    desc: "FastAPI backend with live inference — predictions served in milliseconds via REST endpoints.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "3-Level Risk Classification",
    desc: "Classifies patients into Low, Medium, and High readmission risk with actionable recommendations.",
    color: "from-amber-500 to-orange-600",
  },
];

const stats = [
  { value: "100K+", label: "Patient Records" },
  { value: "103", label: "Engineered Features" },
  { value: "4", label: "Ensemble Models" },
  { value: "58.7%", label: "Best Accuracy" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
            <HiOutlineBeaker className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">ML-Powered Healthcare System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Diabetes Hospital
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Readmission Predictor
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed mb-10">
            An AI-powered risk prediction system that analyzes patient hospital records 
            to classify diabetes readmission risk using ensemble machine learning models.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/predict"
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
            >
              Start Prediction
              <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium py-3.5 px-8 rounded-xl border border-white/10 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">System Architecture</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              End-to-end machine learning pipeline — from raw hospital data to real-time risk prediction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card p-6 hover:bg-white/[0.08] transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer */}
      <section className="bg-slate-900/50 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <HiOutlineUserGroup className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Developer</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Muhammad Hammad</h3>
          <p className="text-slate-400 text-sm">Fa-2023/BSCS/514 — CCP Project</p>
        </div>
      </section>
    </div>
  );
}
