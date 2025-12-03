import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "./firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";

import Login from "./components/Login";
import RankingDisplay from "./components/RankingDisplay";
import JudgePanel from "./components/JudgePanel";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔐 Auth state changed:", user?.email || "No user");
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Helper function to check if user is admin
  const isAdmin = (email) => {
    if (!email) return false;

    // List of admin emails (add more as needed)
    const adminEmails = [
      "avishek@iotrix.com",
      "admin@iotrix.com",
      "admin1@iotrix.com",
    ];

    // Check if email is in admin list OR contains 'admin'
    return (
      adminEmails.includes(email.toLowerCase()) ||
      email.toLowerCase().includes("admin")
    );
  };

  // Helper function to check if user is judge
  const isJudge = (email) => {
    if (!email) return false;
    return email.includes("judge") || email.includes("@iotrix-judge.com");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-iotrix-dark flex items-center justify-center">
        <div className="text-iotrix-red text-2xl font-bold">
          Loading IOTrix...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/ranking" element={<RankingDisplay />} />

        {/* Protected Judge Route */}
        <Route
          path="/judge"
          element={
            currentUser && isJudge(currentUser.email) ? (
              <JudgePanel user={currentUser} onLogout={handleLogout} />
            ) : (
              <>
                {console.log("❌ Not authorized as judge")}
                <Navigate to="/" replace />
              </>
            )
          }
        />

        {/* Protected Admin Route */}
        <Route
          path="/admin"
          element={
            currentUser && isAdmin(currentUser.email) ? (
              <>
                {console.log("✅ Admin access granted for:", currentUser.email)}
                <AdminDashboard user={currentUser} onLogout={handleLogout} />
              </>
            ) : currentUser ? (
              <>
                {console.log(
                  "❌ User logged in but not admin:",
                  currentUser.email
                )}
                <Navigate to="/" replace />
              </>
            ) : (
              <>
                {console.log("❌ No user logged in, redirecting to /")}
                <Navigate to="/" replace />
              </>
            )
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
