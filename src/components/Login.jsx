// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, User, Lock, Eye, EyeOff } from "lucide-react";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const [judgeEmail, setJudgeEmail] = useState("");
  const [judgePassword, setJudgePassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJudgeLogin = async () => {
    if (!judgeEmail || !judgePassword) {
      alert("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, judgeEmail, judgePassword);
      navigate("/judge");
    } catch (error) {
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) {
      alert("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      navigate("/admin");
    } catch (error) {
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02182b] via-[#021d35] to-[#02182b] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-iotrix-red dark:text-red-400 mb-2">
            IOTrix
          </h1>
          <p className="text-white dark:text-gray-200 text-lg">
            Real-time Judging System
          </p>
          <p className="text-white dark:text-gray-200 text-sm mt-1">
            Phase 2 - Final Round | November 21, 2025
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Public Ranking */}
          <div className="bg-iotrix-darker/80 dark:bg-gray-800/80 backdrop-blur-lg border-2 border-iotrix-red dark:border-red-500 rounded-2xl p-6">
            <Trophy className="w-12 h-12 text-iotrix-red dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white dark:text-gray-200 text-center mb-4">
              Live Ranking
            </h2>
            <button
              onClick={() => navigate("/ranking")}
              className="w-full bg-iotrix-red dark:bg-red-600 text-white dark:text-gray-100 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition"
            >
              View Leaderboard
            </button>
          </div>

          {/* Judge Login */}
          <div className="bg-iotrix-darker/80 dark:bg-gray-800/80 backdrop-blur-lg border-2 border-iotrix-red dark:border-red-500 rounded-2xl p-6">
            <User className="w-12 h-12 text-iotrix-red dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white dark:text-gray-200 text-center mb-4">
              Judge Login
            </h2>

            <input
              type="email"
              placeholder="Judge email"
              value={judgeEmail}
              onChange={(e) => setJudgeEmail(e.target.value)}
              className="w-full bg-iotrix-dark dark:bg-gray-700 text-white dark:text-gray-200 border border-iotrix-red dark:border-red-500 rounded-lg px-4 py-2 mb-3"
            />

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={judgePassword}
                onChange={(e) => setJudgePassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJudgeLogin()}
                className="w-full bg-iotrix-dark dark:bg-gray-700 text-white dark:text-gray-200 border border-iotrix-red dark:border-red-500 rounded-lg px-4 py-2 pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-white dark:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              onClick={handleJudgeLogin}
              disabled={loading}
              className="w-full bg-iotrix-red dark:bg-red-600 text-white dark:text-gray-100 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login as Judge"}
            </button>
          </div>

          {/* Admin Login */}
          <div className="bg-iotrix-darker/80 dark:bg-gray-800/80 backdrop-blur-lg border-2 border-iotrix-red dark:border-red-500 rounded-2xl p-6">
            <Lock className="w-12 h-12 text-iotrix-red dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white dark:text-gray-200 text-center mb-4">
              Admin Login
            </h2>
            <input
              type="email"
              placeholder="Admin email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full bg-iotrix-dark dark:bg-gray-700 text-white dark:text-gray-200 border border-iotrix-red dark:border-red-500 rounded-lg px-4 py-2 mb-3"
            />
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                className="w-full bg-iotrix-dark dark:bg-gray-700 text-white dark:text-gray-200 border border-iotrix-red dark:border-red-500 rounded-lg px-4 py-2 pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-white dark:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full bg-iotrix-red dark:bg-red-600 text-white dark:text-gray-100 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-white dark:text-gray-200 text-sm">
          <p>Organized by Department of ETE, CUET</p>
          <p className="mt-1">Decode the Matrix, Recode the World</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
