import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EducationModules from "./pages/EducationModules";
import VirtualDrills from "./pages/VirtualDrills";
import DisasterAlerts from "./pages/DisasterAlerts";
import EmergencyContacts from "./pages/EmergencyContacts";
import AdminDashboard from "./pages/AdminDashboard";
import ProblemImpact from "./pages/ProblemImpact";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/" element={user ? <Layout user={user} setUser={setUser} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="education" element={<EducationModules />} />
          <Route path="drills" element={<VirtualDrills />} />
          <Route path="alerts" element={<DisasterAlerts />} />
          <Route path="emergency" element={<EmergencyContacts />} />
          <Route path="problem" element={<ProblemImpact />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
