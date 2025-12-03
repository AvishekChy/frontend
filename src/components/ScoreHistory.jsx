// import React, { useState, useEffect } from "react";
// import { db } from "../firebase/config";
// import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
// import { Clock, User, Award } from "lucide-react";

// const ScoreHistory = ({ teamId }) => {
//   const [scores, setScores] = useState([]);
//   const [teams, setTeams] = useState([]);

//   useEffect(() => {
//     const q = query(collection(db, "scores"), orderBy("timestamp", "desc"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const scoresData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       if (teamId) {
//         setScores(scoresData.filter((s) => s.teamId === teamId));
//       } else {
//         setScores(scoresData);
//       }
//     });

//     return () => unsubscribe();
//   }, [teamId]);

//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "teams"), (snapshot) => {
//       const teamsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setTeams(teamsData);
//     });

//     return () => unsubscribe();
//   }, []);

//   const getTeamName = (teamId) => {
//     const team = teams.find((t) => t.id === teamId);
//     return team ? team.name : "Unknown Team";
//   };

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return "N/A";
//     try {
//       return new Date(timestamp.seconds * 1000).toLocaleString();
//     } catch {
//       return "N/A";
//     }
//   };

//   return (
//     <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
//       <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//         <Clock size={24} />
//         Score History {teamId && `- ${getTeamName(teamId)}`}
//       </h3>

//       <div className="space-y-3">
//         {scores.length === 0 ? (
//           <p className="text-white text-center py-8">No scores yet</p>
//         ) : (
//           scores.map((score) => (
//             <div
//               key={score.id}
//               className="bg-iotrix-dark p-4 rounded-lg border border-iotrix-red"
//             >
//               <div className="flex justify-between items-start mb-2">
//                 <div className="flex items-center gap-2">
//                   <User className="text-iotrix-red" size={18} />
//                   <span className="text-white font-semibold">
//                     {score.judgeName || "Judge"}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Award className="text-iotrix-red" size={18} />
//                   <span className="text-iotrix-red font-bold text-lg">
//                     {score.total?.toFixed(1)}
//                   </span>
//                 </div>
//               </div>

//               {!teamId && (
//                 <div className="text-white mb-2">
//                   Team:{" "}
//                   <span className="text-iotrix-red font-semibold">
//                     {getTeamName(score.teamId)}
//                   </span>
//                 </div>
//               )}

//               <div className="grid grid-cols-4 gap-2 text-sm mb-2">
//                 <div className="text-gray-400">
//                   HW User:{" "}
//                   <span className="text-white">
//                     {score.hardwareUserSide?.toFixed(1)}
//                   </span>
//                 </div>
//                 <div className="text-gray-400">
//                   HW Rick:{" "}
//                   <span className="text-white">
//                     {score.hardwareRickshawSide?.toFixed(1)}
//                   </span>
//                 </div>
//                 <div className="text-gray-400">
//                   SW Back:{" "}
//                   <span className="text-white">
//                     {score.softwareBackend?.toFixed(1)}
//                   </span>
//                 </div>
//                 <div className="text-gray-400">
//                   SW Admin:{" "}
//                   <span className="text-white">
//                     {score.softwareAdmin?.toFixed(1)}
//                   </span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-2 text-sm mb-2">
//                 <div className="text-gray-400">
//                   Integration:{" "}
//                   <span className="text-white">
//                     {score.integration?.toFixed(1)}
//                   </span>
//                 </div>
//                 <div className="text-gray-400">
//                   Docs:{" "}
//                   <span className="text-white">
//                     {score.documentation?.toFixed(1)}
//                   </span>
//                 </div>
//                 <div className="text-gray-400">
//                   Bonus:{" "}
//                   <span className="text-white">
//                     {score.bigIdea?.toFixed(1)}
//                   </span>
//                 </div>
//               </div>

//               <div className="text-gray-400 text-xs">
//                 {formatTimestamp(score.timestamp)}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default ScoreHistory;

// Updated ScoreHistory.jsx (for consistency, if used in other pages)
import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Clock, User, Award } from "lucide-react";

const ScoreHistory = ({ teamId }) => {
  const [scores, setScores] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "scores"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scoresData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (teamId) {
        setScores(scoresData.filter((s) => s.teamId === teamId));
      } else {
        setScores(scoresData);
      }
    });

    return () => unsubscribe();
  }, [teamId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teams"), (snapshot) => {
      const teamsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeams(teamsData);
    });

    return () => unsubscribe();
  }, []);

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Clock size={24} />
        Score History {teamId && `- ${getTeamName(teamId)}`}
      </h3>

      <div className="space-y-3">
        {scores.length === 0 ? (
          <p className="text-white text-center py-8">No scores yet</p>
        ) : (
          scores.map((score) => (
            <div
              key={score.id}
              className="bg-iotrix-dark p-4 rounded-lg border border-iotrix-red"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <User className="text-iotrix-red" size={18} />
                  <span className="text-white font-semibold">
                    {score.judgeName || "Judge"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="text-iotrix-red" size={18} />
                  <span className="text-iotrix-red font-bold text-lg">
                    {score.total?.toFixed(1)}
                  </span>
                </div>
              </div>

              {!teamId && (
                <div className="text-white mb-2">
                  Team:{" "}
                  <span className="text-iotrix-red font-semibold">
                    {getTeamName(score.teamId)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm mb-2">
                <div className="text-gray-400">
                  HW User:{" "}
                  <span className="text-white">
                    {score.hardwareUserSide?.toFixed(1)}
                  </span>
                </div>
                <div className="text-gray-400">
                  HW Rick:{" "}
                  <span className="text-white">
                    {score.hardwareRickshawSide?.toFixed(1)}
                  </span>
                </div>
                <div className="text-gray-400">
                  SW Back:{" "}
                  <span className="text-white">
                    {score.softwareBackend?.toFixed(1)}
                  </span>
                </div>
                <div className="text-gray-400">
                  SW Admin:{" "}
                  <span className="text-white">
                    {score.softwareAdmin?.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-2">
                <div className="text-gray-400">
                  Integration:{" "}
                  <span className="text-white">
                    {score.integration?.toFixed(1)}
                  </span>
                </div>
                <div className="text-gray-400">
                  Docs:{" "}
                  <span className="text-white">
                    {score.documentation?.toFixed(1)}
                  </span>
                </div>
                <div className="text-gray-400">
                  Bonus:{" "}
                  <span className="text-white">
                    {score.bigIdea?.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="text-gray-400 text-xs">
                {formatTimestamp(score.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScoreHistory;
