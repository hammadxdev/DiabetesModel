import React from "react";
import { HiOutlineBeaker, HiOutlineHeart } from "react-icons/hi2";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <HiOutlineBeaker className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">
              Diabetes<span className="text-cyan-400">Guard</span> AI
            </span>
          </div>

          {/* Credits */}
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Developed with <HiOutlineHeart className="inline w-4 h-4 text-red-400 mx-0.5" /> by{" "}
              <span className="text-white font-semibold">Muhammad Hammad</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">Fa-2023/BSCS/514</p>
          </div>

          {/* Year */}
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} CCP Project
          </p>
        </div>
      </div>
    </footer>
  );
}
