import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Award, Zap, Star, TrendingUp } from "lucide-react";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

const RankingDisplay = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time listener for teams with debugging
  useEffect(() => {
    console.log("🔵 Setting up teams listener...");
    const unsubscribe = onSnapshot(
      collection(db, "teams"),
      (snapshot) => {
        console.log("✅ Teams updated! Count:", snapshot.docs.length);
        const teamsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamsData);
        setLastUpdate(new Date());
      },
      (error) => {
        console.error("❌ Teams listener error:", error);
      }
    );

    return () => {
      console.log("🔴 Cleaning up teams listener");
      unsubscribe();
    };
  }, []);

  // Real-time listener for scores with debugging
  useEffect(() => {
    console.log("🔵 Setting up scores listener...");
    const unsubscribe = onSnapshot(
      collection(db, "scores"),
      (snapshot) => {
        console.log("✅ Scores updated! Count:", snapshot.docs.length);
        const scoresData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(
          "📊 Latest score added:",
          scoresData[scoresData.length - 1]
        );
        setScores(scoresData);
        setLastUpdate(new Date());
        console.log("⏰ Last update:", new Date().toLocaleTimeString());
      },
      (error) => {
        console.error("❌ Scores listener error:", error);
      }
    );

    return () => {
      console.log("🔴 Cleaning up scores listener");
      unsubscribe();
    };
  }, []);

  // Calculate rankings with debugging
  const calculateRanking = () => {
    const ranking = teams
      .map((team) => {
        const teamScores = scores.filter((s) => s.teamId === team.id);
        const phase2Total = teamScores.reduce(
          (sum, s) => sum + (s.total || 0),
          0
        );
        const grandTotal = (team.phase1Score || 0) + phase2Total;

        return {
          ...team,
          phase2Score: phase2Total,
          totalScore: grandTotal,
          judgeCount: teamScores.length,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    console.log(
      "📈 Ranking recalculated. Top 3:",
      ranking.slice(0, 3).map((t) => ({ name: t.name, score: t.totalScore }))
    );
    return ranking;
  };

  const ranking = calculateRanking();
  const podiumTeams = ranking.slice(0, 3);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#02182b] via-[#021d35] to-[#02182b] p-4 flex flex-col">
      <div className="max-w-[1800px] mx-auto w-full h-full flex flex-col">
        {/* Live Status - Top LEFT for better visibility */}
        <div className="absolute top-4 left-4 z-50">
          <div className="bg-iotrix-darker/90 backdrop-blur-lg border-2 border-green-500 rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-bold animate-pulse text-md">
                LIVE
              </span>
              <span className="text-gray-400 text-xs">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Header */}
        <div className="text-center mb-3 relative flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-64 h-64 bg-iotrix-red rounded-full blur-3xl animate-pulse"></div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-1 relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-iotrix-red via-red-400 to-iotrix-red animate-gradient">
              IOTrix 2025
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-iotrix-red animate-pulse" />
            <h2 className="text-xl md:text-2xl text-white font-bold">
              LIVE LEADERBOARD
            </h2>
            <Zap className="w-4 h-4 text-iotrix-red animate-pulse" />
          </div>
          <p className="text-white text-xs mt-1">Final Round - Phase 2</p>
        </div>

        {/* Compact Podium */}
        {podiumTeams.length >= 3 && (
          <div className="mb-3 flex-shrink-0">
            <div className="flex justify-center items-end gap-2 max-w-3xl mx-auto">
              {/* 2nd Place - LEFT */}
              <motion.div
                layout
                key={podiumTeams[1]?.id}
                className="flex-1 max-w-[200px] transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-t-3xl pt-1 pb-3 border-2 border-gray-300 shadow-xl relative overflow-hidden h-28">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>

                  <div className="flex justify-center">
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xs font-bold text-white truncate">
                      {podiumTeams[1].name}
                    </h3>
                    <p className="text-white/80 text-[10px] font-semibold truncate">
                      {podiumTeams[1].university}
                    </p>
                    <div className="mt-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 inline-block">
                      <p className="text-base font-black text-white">
                        {podiumTeams[1].totalScore.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-500 via-gray-300 to-gray-500"></div>
                </div>
              </motion.div>

              {/* 1st Place - CENTER */}
              <motion.div
                layout
                key={podiumTeams[0]?.id}
                className="flex-1 max-w-[200px] transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-t-3xl p-3 pb-4 border-2 border-yellow-300 shadow-xl relative overflow-hidden h-36">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>

                  <div className="absolute top-2 left-2 animate-pulse">
                    <Star className="w-3 h-3 text-white" fill="white" />
                  </div>
                  <div className="absolute top-4 right-4 animate-pulse delay-75">
                    <Star className="w-2 h-2 text-white" fill="white" />
                  </div>

                  <div className="flex justify-center mb-2 ">
                    <div className="bg-white/30 p-2 rounded-full">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-sm font-bold text-white truncate">
                      {podiumTeams[0].name}
                    </h3>
                    <p className="text-white/90 text-[10px] font-semibold truncate">
                      {podiumTeams[0].university}
                    </p>
                    <div className="mt-1 bg-white/30 backdrop-blur-sm rounded-full px-3 py-0.5 inline-block">
                      <p className="text-lg font-black text-white">
                        {podiumTeams[0].totalScore.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500"></div>
                </div>
              </motion.div>

              {/* 3rd Place - RIGHT */}
              <motion.div
                layout
                key={podiumTeams[2]?.id}
                className="flex-1 max-w-[200px] transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-3xl pt-1 pb-3 border-2 border-orange-300 shadow-xl relative overflow-hidden h-28">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>

                  <div className="flex justify-center">
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xs font-bold text-white truncate">
                      {podiumTeams[2].name}
                    </h3>
                    <p className="text-white/80 text-[10px] font-semibold truncate">
                      {podiumTeams[2].university}
                    </p>
                    <div className="mt-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 inline-block">
                      <p className="text-base font-black text-white">
                        {podiumTeams[2].totalScore.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-300 to-orange-500"></div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Modern Rankings Table */}
        <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-1">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-iotrix-red via-red-600 to-iotrix-red flex-shrink-0">
            <div className="grid grid-cols-12 gap-2 px-3 py-1.5 font-bold text-white text-[10px]">
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Team Name</div>
              <div className="col-span-2">University</div>
              <div className="col-span-3">Project Title</div>
              <div className="col-span-1 text-right">Phase 1</div>
              <div className="col-span-1 text-right">Phase 2</div>
              <div className="col-span-1 text-right">Total</div>
            </div>
          </div>

          {/* Table Body - Auto-fit ALL teams without scrolling */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 divide-y divide-iotrix-red/30">
              {ranking.map((team, index) => {
                const isTop3 = index < 3;
                const rankIcons = [
                  <Trophy
                    className="inline w-3 h-3 ml-0.5 text-yellow-400"
                    key="1"
                  />,
                  <Medal
                    className="inline w-3 h-3 ml-0.5 text-gray-400"
                    key="2"
                  />,
                  <Award
                    className="inline w-3 h-3 ml-0.5 text-orange-400"
                    key="3"
                  />,
                ];

                return (
                  <motion.div
                    layout
                    key={team.id}
                    className={`grid grid-cols-12 gap-2 px-3 py-1 transition-all duration-300 hover:bg-iotrix-red/10 ${
                      isTop3 ? "bg-iotrix-dark/50" : "bg-transparent"
                    }`}
                    style={{
                      flex: `1 1 ${100 / ranking.length}%`,
                      minHeight: 0,
                    }}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center">
                      <span
                        className={`text-sm font-bold ${
                          isTop3 ? "text-iotrix-red" : "text-white"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {isTop3 && rankIcons[index]}
                    </div>

                    {/* Team Name */}
                    <div className="col-span-3 flex items-center">
                      <div className="w-full">
                        <p className="text-white font-bold text-xs truncate">
                          {team.name}
                        </p>
                        {isTop3 && (
                          <div className="flex gap-0.5 mt-0.5">
                            <TrendingUp className="w-2 h-2 text-green-400" />
                            <span className="text-[8px] text-green-400 font-semibold">
                              Top Performer
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* University */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-white font-semibold text-[10px] truncate">
                        {team.university}
                      </span>
                    </div>

                    {/* Project */}
                    <div className="col-span-3 flex items-center">
                      <span className="text-gray-300 text-[10px] truncate">
                        {team.projectTitle}
                      </span>
                    </div>

                    {/* Phase 1 */}
                    <div className="col-span-1 flex items-center justify-end">
                      <div className="bg-blue-500/20 border border-blue-500/50 rounded px-1.5 py-0.5">
                        <span className="text-blue-300 font-bold text-[10px]">
                          {(team.phase1Score || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Phase 2 */}
                    <div className="col-span-1 flex items-center justify-end">
                      <div className="bg-purple-500/20 border border-purple-500/50 rounded px-1.5 py-0.5">
                        <span className="text-purple-300 font-bold text-[10px]">
                          {team.phase2Score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-1 flex items-center justify-end">
                      <div
                        className={`${
                          isTop3
                            ? "bg-iotrix-red text-white"
                            : "bg-iotrix-red/20 text-iotrix-red"
                        } border-2 border-iotrix-red rounded px-1.5 py-0.5 font-black text-xs`}
                      >
                        {team.totalScore.toFixed(1)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="mt-2 text-center flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-iotrix-red to-red-600 text-white px-4 py-1.5 rounded-lg hover:from-red-600 hover:to-iotrix-red transition-all duration-300 font-bold text-xs shadow-lg hover:shadow-iotrix-red/50 transform hover:scale-105"
          >
            Back to Login
          </button>

          <p className="text-gray-500 text-[10px] mt-1">
            Department of ETE, CUET | Decode the Matrix, Recode the World
          </p>
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default RankingDisplay;
