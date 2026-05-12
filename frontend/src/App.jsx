import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import About from "./pages/About";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col" style={{ background: '#0B0B0B', color: '#F5E6D3' }}>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/predict"   element={<Predict />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/about"     element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>

      {/* Premium Toast System */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            color: '#F5E6D3',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            borderRadius: '12px',
          },
        }}
        richColors
        closeButton
      />
    </BrowserRouter>
  );
}
