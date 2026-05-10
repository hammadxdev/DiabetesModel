import React from "react";
import {
  HiOutlineCpuChip,
  HiOutlineCircleStack,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineChartBar,
  HiOutlineServerStack,
  HiOutlineComputerDesktop,
  HiOutlineAcademicCap,
  HiOutlineUserCircle,
} from "react-icons/hi2";

const pipeline = [
  {
    icon: HiOutlineCircleStack,
    title: "1. Dataset",
    desc: "UCI Diabetes 130-US Hospitals dataset — 100K+ patient records with 50+ clinical features.",
  },
  {
    icon: HiOutlineAdjustmentsHorizontal,
    title: "2. Preprocessing",
    desc: "ICD-9 diagnosis mapping to 20 disease categories, missing value imputation, one-hot encoding, StandardScaler.",
  },
  {
    icon: HiOutlineCpuChip,
    title: "3. SMOTE Balancing",
    desc: "Synthetic Minority Oversampling to balance 3 risk classes — 131K balanced training samples.",
  },
  {
    icon: HiOutlineChartBar,
    title: "4. Model Training",
    desc: "Random Forest, Gradient Boosting, AdaBoost trained independently, combined via Voting Classifier.",
  },
  {
    icon: HiOutlineServerStack,
    title: "5. FastAPI Backend",
    desc: "RESTful prediction API with Swagger documentation — accepts patient data, returns risk level.",
  },
  {
    icon: HiOutlineComputerDesktop,
    title: "6. React Frontend",
    desc: "Modern healthcare dashboard built with React + Tailwind CSS for intuitive patient risk assessment.",
  },
];

const models = [
  { name: "Gradient Boosting", accuracy: "58.73%", type: "Boosting" },
  { name: "Voting Classifier", accuracy: "57.75%", type: "Meta-Ensemble" },
  { name: "Random Forest", accuracy: "57.56%", type: "Bagging" },
  { name: "AdaBoost", accuracy: "52.55%", type: "Boosting" },
];

const techStack = [
  "Python 3.13", "scikit-learn", "pandas", "NumPy",
  "imbalanced-learn (SMOTE)", "FastAPI", "Uvicorn",
  "React 19", "Tailwind CSS 3", "Axios", "Vite",
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4">
            <HiOutlineAcademicCap className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Project Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">About the Model</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Complete technical overview of the Diabetes Hospital Readmission Risk Prediction System.
          </p>
        </div>

        {/* ML Pipeline */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6">ML Pipeline</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pipeline.map((step) => (
              <div key={step.title} className="glass-card p-5 hover:bg-white/[0.08] transition-all group">
                <step.icon className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold text-sm mb-1.5">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Model Comparison */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6">Model Performance</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Model</th>
                  <th className="text-left text-slate-400 font-medium px-6 py-4">Type</th>
                  <th className="text-right text-slate-400 font-medium px-6 py-4">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <tr key={m.name} className={`border-b border-white/5 ${i === 0 ? "bg-cyan-500/5" : ""}`}>
                    <td className="px-6 py-4 text-white font-medium">
                      {i === 0 && <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full mr-2">Best</span>}
                      {m.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{m.type}</td>
                    <td className="px-6 py-4 text-right text-white font-semibold">{m.accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-xs mt-3">
            * The Voting Classifier (meta-ensemble of all 3 models) is used as the production model for higher reliability.
          </p>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6">Technology Stack</h2>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="bg-white/5 border border-white/10 text-slate-300 text-sm px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Developer */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Developer</h2>
          <div className="glass-card p-6 sm:p-8 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
              <HiOutlineUserCircle className="w-9 h-9 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Muhammad Hammad</h3>
              <p className="text-cyan-400 text-sm font-medium">Fa-2023/BSCS/514</p>
              <p className="text-slate-400 text-sm mt-1">
                CCP Project — Diabetes Hospital Risk Prediction System
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
