import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import "./index.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "dashboard">(
    "landing"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === "landing" ? (
        <LandingPage
          onNavigateToDashboard={() => setCurrentPage("dashboard")}
        />
      ) : (
        <Dashboard onNavigateToLanding={() => setCurrentPage("landing")} />
      )}
    </div>
  );
}
