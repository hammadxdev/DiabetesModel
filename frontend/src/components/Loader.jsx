import React from "react";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      {/* Animated pulse rings */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-4 border-cyan-400/40 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 animate-pulse" />
      </div>
      <p className="text-cyan-300 text-sm font-medium animate-pulse tracking-wide">
        Analyzing patient risk...
      </p>
    </div>
  );
}
