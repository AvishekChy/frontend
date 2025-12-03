// // Updated JudgePanel.jsx
// import React, { useState, useEffect } from "react";
// import { LogOut, Send, AlertCircle } from "lucide-react";
// import { db } from "../firebase/config";
// import {
//   collection,
//   addDoc,
//   onSnapshot,
//   serverTimestamp,
//   doc,
//   updateDoc,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";

// const JudgePanel = ({ user, onLogout }) => {
//   const [teams, setTeams] = useState([]);
//   const [selectedTeam, setSelectedTeam] = useState("");
//   const [scores, setScores] = useState([]);
//   const [judgeScores, setJudgeScores] = useState({
//     hardwareUserSide: "",
//     hardwareRickshawSide: "",
//     softwareBackend: "",
//     softwareAdmin: "",
//     integration: "",
//     documentation: "",
//     bigIdea: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   const rubrics = [
//     { id: "hardwareUserSide", label: "Hardware - User Side", max: 20 },
//     { id: "hardwareRickshawSide", label: "Hardware - Rickshaw Side", max: 20 },
//     { id: "softwareBackend", label: "Software & Backend", max: 25 },
//     { id: "softwareAdmin", label: "Admin Dashboard & Database", max: 15 },
//     { id: "integration", label: "Integration & Testing", max: 15 },
//     { id: "documentation", label: "Documentation", max: 10 },
//     { id: "bigIdea", label: "Big Idea Evaluation (Bonus)", max: 10 },
//   ];

//   // Extract judge name from email
//   const extractJudgeName = (email) => {
//     const username = email.split("@")[0];
//     return username.charAt(0).toUpperCase() + username.slice(1);
//   };

//   const judgeName = extractJudgeName(user.email);

//   // Listen to teams
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "teams"), (snapshot) => {
//       const teamsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setTeams(teamsData.sort((a, b) => a.name.localeCompare(b.name)));
//     });

//     return () => unsubscribe();
//   }, []);

//   // Listen to scores
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "scores"), (snapshot) => {
//       const scoresData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setScores(scoresData);
//     });

//     return () => unsubscribe();
//   }, []);

//   const currentTotal = Object.values(judgeScores).reduce(
//     (sum, val) => sum + (parseFloat(val) || 0),
//     0
//   );

//   const handleSubmitScore = async () => {
//     if (!selectedTeam) {
//       alert("Please select a team!");
//       return;
//     }

//     if (currentTotal > 155) {
//       alert("Total score cannot exceed 155 marks!");
//       return;
//     }

//     // Check if all fields are filled
//     const hasEmptyFields = Object.values(judgeScores).some((val) => val === "");
//     if (hasEmptyFields) {
//       if (!window.confirm("Some fields are empty. Continue anyway?")) {
//         return;
//       }
//     }

//     // Check if this judge already scored this team
//     const alreadyScored = scores.find(
//       (s) => s.teamId === selectedTeam && s.judgeEmail === user.email
//     );

//     if (alreadyScored) {
//       const confirmOverwrite = window.confirm(
//         `You've already scored this team with ${alreadyScored.total.toFixed(
//           1
//         )} points.\n\nDo you want to UPDATE your previous score?`
//       );

//       if (confirmOverwrite) {
//         // Update existing score
//         try {
//           const scoreRef = doc(db, "scores", alreadyScored.id);
//           await updateDoc(scoreRef, {
//             hardwareUserSide: parseFloat(judgeScores.hardwareUserSide) || 0,
//             hardwareRickshawSide:
//               parseFloat(judgeScores.hardwareRickshawSide) || 0,
//             softwareBackend: parseFloat(judgeScores.softwareBackend) || 0,
//             softwareAdmin: parseFloat(judgeScores.softwareAdmin) || 0,
//             integration: parseFloat(judgeScores.integration) || 0,
//             documentation: parseFloat(judgeScores.documentation) || 0,
//             bigIdea: parseFloat(judgeScores.bigIdea) || 0,
//             total: currentTotal,
//             updatedAt: serverTimestamp(),
//           });

//           // Reset form
//           setSelectedTeam("");
//           setJudgeScores({
//             hardwareUserSide: "",
//             hardwareRickshawSide: "",
//             softwareBackend: "",
//             softwareAdmin: "",
//             integration: "",
//             documentation: "",
//             bigIdea: "",
//           });

//           alert("Score updated successfully!");
//           return;
//         } catch (error) {
//           console.error("Error updating score:", error);
//           alert("Failed to update score. Please try again.");
//           return;
//         }
//       } else {
//         return; // Don't submit if user cancelled
//       }
//     }

//     setSubmitting(true);

//     try {
//       await addDoc(collection(db, "scores"), {
//         teamId: selectedTeam,
//         judgeName,
//         judgeEmail: user.email,
//         hardwareUserSide: parseFloat(judgeScores.hardwareUserSide) || 0,
//         hardwareRickshawSide: parseFloat(judgeScores.hardwareRickshawSide) || 0,
//         softwareBackend: parseFloat(judgeScores.softwareBackend) || 0,
//         softwareAdmin: parseFloat(judgeScores.softwareAdmin) || 0,
//         integration: parseFloat(judgeScores.integration) || 0,
//         documentation: parseFloat(judgeScores.documentation) || 0,
//         bigIdea: parseFloat(judgeScores.bigIdea) || 0,
//         total: currentTotal,
//         timestamp: serverTimestamp(),
//       });

//       // Reset form
//       setSelectedTeam("");
//       setJudgeScores({
//         hardwareUserSide: "",
//         hardwareRickshawSide: "",
//         softwareBackend: "",
//         softwareAdmin: "",
//         integration: "",
//         documentation: "",
//         bigIdea: "",
//       });

//       alert("Score submitted successfully!");
//     } catch (error) {
//       console.error("Error submitting score:", error);
//       alert("Failed to submit score. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Get unique teams scored by this judge
//   const uniqueTeamsScored = new Set(
//     scores.filter((s) => s.judgeEmail === user.email).map((s) => s.teamId)
//   ).size;

//   // Get this judge's submissions
//   const mySubmissions = scores.filter((s) => s.judgeEmail === user.email);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#02182b] via-[#021d35] to-[#02182b] p-4 md:p-8 flex flex-col">
//       <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-4xl font-bold text-white">Judge Panel</h1>
//             <p className="text-gray-300">Welcome, {judgeName}</p>
//           </div>
//           <button
//             onClick={onLogout}
//             className="flex items-center gap-2 bg-iotrix-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
//           >
//             <LogOut size={20} />
//             Logout
//           </button>
//         </div>

//         {/* Scoring Form */}
//         <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl p-6 mb-6 flex-1">
//           {/* Team Selection */}
//           <div className="mb-6">
//             <label className="block text-white font-bold mb-2">
//               Select Team *
//             </label>
//             <select
//               value={selectedTeam}
//               onChange={(e) => setSelectedTeam(e.target.value)}
//               className="w-full bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-3"
//             >
//               <option value="">-- Choose a team --</option>
//               {teams.map((team) => (
//                 <option key={team.id} value={team.id}>
//                   {team.name} - {team.university} ({team.projectTitle})
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Rubric Scoring */}
//           <div className="space-y-4 mb-6 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
//             <h3 className="text-white font-bold text-lg mb-3 col-span-2">
//               Score by Rubrics
//             </h3>
//             {rubrics.map((rubric) => (
//               <div
//                 key={rubric.id}
//                 className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4"
//               >
//                 <label className="text-white flex-1">
//                   {rubric.label}
//                   <span className="text-iotrix-red ml-2 font-bold">
//                     / {rubric.max}
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   max={rubric.max}
//                   step="0.5"
//                   value={judgeScores[rubric.id]}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     if (
//                       value === "" ||
//                       (parseFloat(value) >= 0 &&
//                         parseFloat(value) <= rubric.max)
//                     ) {
//                       setJudgeScores({ ...judgeScores, [rubric.id]: value });
//                     }
//                   }}
//                   className="bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-2 w-full md:w-24 text-center font-bold"
//                   placeholder="0"
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Total Display */}
//           <div className="bg-iotrix-dark border-2 border-iotrix-red rounded-lg p-4 mb-6">
//             <div className="flex justify-between items-center">
//               <span className="text-white font-bold text-xl">Total Score:</span>
//               <span
//                 className={`font-bold text-2xl ${
//                   currentTotal > 155 ? "text-red-500" : "text-iotrix-red"
//                 }`}
//               >
//                 {currentTotal.toFixed(1)} / 155
//               </span>
//             </div>
//             {currentTotal > 155 && (
//               <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
//                 <AlertCircle size={16} />
//                 <p>Total exceeds maximum allowed (155 marks)</p>
//               </div>
//             )}
//           </div>

//           {/* Submit Button */}
//           <button
//             onClick={handleSubmitScore}
//             disabled={!selectedTeam || currentTotal > 155 || submitting}
//             className="w-full bg-iotrix-red text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2"
//           >
//             {submitting ? (
//               "Submitting..."
//             ) : (
//               <>
//                 <Send size={20} />
//                 Submit Score
//               </>
//             )}
//           </button>
//         </div>

//         {/* Quick Stats */}
//         <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl p-6">
//           <h3 className="text-xl font-bold text-white mb-4">
//             Your Submissions
//           </h3>
//           <div className="text-white space-y-2">
//             <p>
//               Total teams scored:{" "}
//               <span className="text-iotrix-red font-bold">
//                 {uniqueTeamsScored} / {teams.length}
//               </span>
//             </p>
//             <p>
//               Total submissions:{" "}
//               <span className="text-iotrix-red font-bold">
//                 {mySubmissions.length}
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JudgePanel;

// Grok JudgePanel.jsx Revised to reflect new rubric and scoring criteria
// import React, { useState, useEffect } from "react";
// import { LogOut, Send, AlertCircle } from "lucide-react";
// import { db } from "../firebase/config";
// import {
//   collection,
//   addDoc,
//   onSnapshot,
//   serverTimestamp,
//   doc,
//   updateDoc,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";

// const JudgePanel = ({ user, onLogout }) => {
//   const [teams, setTeams] = useState([]);
//   const [selectedTeam, setSelectedTeam] = useState("");
//   const [scores, setScores] = useState([]);
//   const [judgeScores, setJudgeScores] = useState({
//     faceRecognition: "",
//     idCardDetection: "",
//     idPinEntry: "",
//     personStandDetection: "",
//     backendWebApp: "",
//     frontendUiUx: "",
//     managerConfirmation: "",
//     newMemberEnrollment: "",
//     hardwareSoftwareFlow: "",
//     errorHandlingOffline: "",
//     securityFeatures: "",
//     codeCommentsReadme: "",
//     systemDiagrams: "",
//     deploymentGuide: "",
//     bigIdea: "",
//     comments: "",
//   });
//   const [submitting, setSubmitting] = useState(false);

//   const rubrics = [
//     {
//       id: "faceRecognition",
//       label:
//         "Face Recognition System (Multi-person detection [2-3] simultaneous, real-world lighting adaptation)",
//       max: 20,
//     },
//     { id: "idCardDetection", label: "ID Card Detection & Reading", max: 10 },
//     { id: "idPinEntry", label: "ID/PIN Entry System", max: 10 },
//     {
//       id: "personStandDetection",
//       label: "Person Stand Detection (power saving)",
//       max: 10,
//     },
//     {
//       id: "backendWebApp",
//       label:
//         "Backend Web App (token management, enrollment, admin/manager/student panels)",
//       max: 15,
//     },
//     {
//       id: "frontendUiUx",
//       label: "Frontend UI/UX (responsive, intuitive)",
//       max: 10,
//     },
//     {
//       id: "managerConfirmation",
//       label: "Manager Confirmation System (clear approval/denial indicator)",
//       max: 10,
//     },
//     {
//       id: "newMemberEnrollment",
//       label: "New Member Enrollment System",
//       max: 15,
//     },
//     {
//       id: "hardwareSoftwareFlow",
//       label: "Complete Hardware-Software Flow",
//       max: 20,
//     },
//     {
//       id: "errorHandlingOffline",
//       label: "Error Handling & Offline Mode",
//       max: 10,
//     },
//     { id: "securityFeatures", label: "Security Features", max: 10 },
//     { id: "codeCommentsReadme", label: "Code Comments & README", max: 5 },
//     { id: "systemDiagrams", label: "System Diagrams", max: 5 },
//     { id: "deploymentGuide", label: "Deployment Guide", max: 5 },
//     { id: "bigIdea", label: "Innovation & Scalability (Bonus)", max: 10 },
//   ];

//   // Extract judge name from email
//   const extractJudgeName = (email) => {
//     const username = email.split("@")[0];
//     return username.charAt(0).toUpperCase() + username.slice(1);
//   };

//   const judgeName = extractJudgeName(user.email);

//   // Listen to teams
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "teams"), (snapshot) => {
//       const teamsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setTeams(teamsData.sort((a, b) => a.name.localeCompare(b.name)));
//     });

//     return () => unsubscribe();
//   }, []);

//   // Listen to scores
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "scores"), (snapshot) => {
//       const scoresData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setScores(scoresData);
//     });

//     return () => unsubscribe();
//   }, []);

//   const currentTotal =
//     Object.values(judgeScores).reduce(
//       (sum, val) => sum + (parseFloat(val) || 0),
//       0
//     ) - (parseFloat(judgeScores.comments) || 0); // Exclude comments from total

//   const handleSubmitScore = async () => {
//     if (!selectedTeam) {
//       alert("Please select a team!");
//       return;
//     }

//     const mandatoryTotal =
//       currentTotal - (parseFloat(judgeScores.bigIdea) || 0);

//     if (mandatoryTotal > 155) {
//       alert("Mandatory score cannot exceed 155 marks!");
//       return;
//     }

//     // Check if all fields are filled
//     const hasEmptyFields = Object.values(judgeScores).some(
//       (val) =>
//         val === "" &&
//         val !== judgeScores.comments &&
//         val !== judgeScores.bigIdea
//     );
//     if (hasEmptyFields) {
//       if (!window.confirm("Some fields are empty. Continue anyway?")) {
//         return;
//       }
//     }

//     // Check if this judge already scored this team
//     const alreadyScored = scores.find(
//       (s) => s.teamId === selectedTeam && s.judgeEmail === user.email
//     );

//     if (alreadyScored) {
//       const confirmOverwrite = window.confirm(
//         `You've already scored this team with ${alreadyScored.total.toFixed(
//           1
//         )} points.\n\nDo you want to UPDATE your previous score?`
//       );

//       if (confirmOverwrite) {
//         // Update existing score
//         try {
//           const scoreRef = doc(db, "scores", alreadyScored.id);
//           await updateDoc(scoreRef, {
//             faceRecognition: parseFloat(judgeScores.faceRecognition) || 0,
//             idCardDetection: parseFloat(judgeScores.idCardDetection) || 0,
//             idPinEntry: parseFloat(judgeScores.idPinEntry) || 0,
//             personStandDetection:
//               parseFloat(judgeScores.personStandDetection) || 0,
//             backendWebApp: parseFloat(judgeScores.backendWebApp) || 0,
//             frontendUiUx: parseFloat(judgeScores.frontendUiUx) || 0,
//             managerConfirmation:
//               parseFloat(judgeScores.managerConfirmation) || 0,
//             newMemberEnrollment:
//               parseFloat(judgeScores.newMemberEnrollment) || 0,
//             hardwareSoftwareFlow:
//               parseFloat(judgeScores.hardwareSoftwareFlow) || 0,
//             errorHandlingOffline:
//               parseFloat(judgeScores.errorHandlingOffline) || 0,
//             securityFeatures: parseFloat(judgeScores.securityFeatures) || 0,
//             codeCommentsReadme: parseFloat(judgeScores.codeCommentsReadme) || 0,
//             systemDiagrams: parseFloat(judgeScores.systemDiagrams) || 0,
//             deploymentGuide: parseFloat(judgeScores.deploymentGuide) || 0,
//             bigIdea: parseFloat(judgeScores.bigIdea) || 0,
//             comments: judgeScores.comments,
//             total: currentTotal,
//             updatedAt: serverTimestamp(),
//           });

//           // Reset form
//           setSelectedTeam("");
//           setJudgeScores({
//             faceRecognition: "",
//             idCardDetection: "",
//             idPinEntry: "",
//             personStandDetection: "",
//             backendWebApp: "",
//             frontendUiUx: "",
//             managerConfirmation: "",
//             newMemberEnrollment: "",
//             hardwareSoftwareFlow: "",
//             errorHandlingOffline: "",
//             securityFeatures: "",
//             codeCommentsReadme: "",
//             systemDiagrams: "",
//             deploymentGuide: "",
//             bigIdea: "",
//             comments: "",
//           });

//           alert("Score updated successfully!");
//           return;
//         } catch (error) {
//           console.error("Error updating score:", error);
//           alert("Failed to update score. Please try again.");
//           return;
//         }
//       } else {
//         return; // Don't submit if user cancelled
//       }
//     }

//     setSubmitting(true);

//     try {
//       await addDoc(collection(db, "scores"), {
//         teamId: selectedTeam,
//         judgeName,
//         judgeEmail: user.email,
//         faceRecognition: parseFloat(judgeScores.faceRecognition) || 0,
//         idCardDetection: parseFloat(judgeScores.idCardDetection) || 0,
//         idPinEntry: parseFloat(judgeScores.idPinEntry) || 0,
//         personStandDetection: parseFloat(judgeScores.personStandDetection) || 0,
//         backendWebApp: parseFloat(judgeScores.backendWebApp) || 0,
//         frontendUiUx: parseFloat(judgeScores.frontendUiUx) || 0,
//         managerConfirmation: parseFloat(judgeScores.managerConfirmation) || 0,
//         newMemberEnrollment: parseFloat(judgeScores.newMemberEnrollment) || 0,
//         hardwareSoftwareFlow: parseFloat(judgeScores.hardwareSoftwareFlow) || 0,
//         errorHandlingOffline: parseFloat(judgeScores.errorHandlingOffline) || 0,
//         securityFeatures: parseFloat(judgeScores.securityFeatures) || 0,
//         codeCommentsReadme: parseFloat(judgeScores.codeCommentsReadme) || 0,
//         systemDiagrams: parseFloat(judgeScores.systemDiagrams) || 0,
//         deploymentGuide: parseFloat(judgeScores.deploymentGuide) || 0,
//         bigIdea: parseFloat(judgeScores.bigIdea) || 0,
//         comments: judgeScores.comments,
//         total: currentTotal,
//         timestamp: serverTimestamp(),
//       });

//       // Reset form
//       setSelectedTeam("");
//       setJudgeScores({
//         faceRecognition: "",
//         idCardDetection: "",
//         idPinEntry: "",
//         personStandDetection: "",
//         backendWebApp: "",
//         frontendUiUx: "",
//         managerConfirmation: "",
//         newMemberEnrollment: "",
//         hardwareSoftwareFlow: "",
//         errorHandlingOffline: "",
//         securityFeatures: "",
//         codeCommentsReadme: "",
//         systemDiagrams: "",
//         deploymentGuide: "",
//         bigIdea: "",
//         comments: "",
//       });

//       alert("Score submitted successfully!");
//     } catch (error) {
//       console.error("Error submitting score:", error);
//       alert("Failed to submit score. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Get unique teams scored by this judge
//   const uniqueTeamsScored = new Set(
//     scores.filter((s) => s.judgeEmail === user.email).map((s) => s.teamId)
//   ).size;

//   // Get this judge's submissions
//   const mySubmissions = scores.filter((s) => s.judgeEmail === user.email);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#02182b] via-[#021d35] to-[#02182b] p-4 md:p-8 flex flex-col">
//       <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-4xl font-bold text-white">Judge Panel</h1>
//             <p className="text-gray-300">Welcome, {judgeName}</p>
//           </div>
//           <button
//             onClick={onLogout}
//             className="flex items-center gap-2 bg-iotrix-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
//           >
//             <LogOut size={20} />
//             Logout
//           </button>
//         </div>

//         {/* Scoring Form */}
//         <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl p-6 mb-6 flex-1">
//           {/* Team Selection */}
//           <div className="mb-6">
//             <label className="block text-white font-bold mb-2">
//               Select Team *
//             </label>
//             <select
//               value={selectedTeam}
//               onChange={(e) => setSelectedTeam(e.target.value)}
//               className="w-full bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-3"
//             >
//               <option value="">-- Choose a team --</option>
//               {teams.map((team) => (
//                 <option key={team.id} value={team.id}>
//                   {team.name} - {team.university} ({team.projectTitle})
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Rubric Scoring */}
//           <div className="space-y-4 mb-6 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
//             <h3 className="text-white font-bold text-lg mb-3 col-span-2">
//               Score by Rubrics
//             </h3>
//             {rubrics.map((rubric) => (
//               <div
//                 key={rubric.id}
//                 className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4"
//               >
//                 <label className="text-white flex-1">
//                   {rubric.label}
//                   <span className="text-iotrix-red ml-2 font-bold">
//                     / {rubric.max}
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   max={rubric.max}
//                   step="0.5"
//                   value={judgeScores[rubric.id]}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     if (
//                       value === "" ||
//                       (parseFloat(value) >= 0 &&
//                         parseFloat(value) <= rubric.max)
//                     ) {
//                       setJudgeScores({ ...judgeScores, [rubric.id]: value });
//                     }
//                   }}
//                   className="bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-2 w-full md:w-24 text-center font-bold"
//                   placeholder="0"
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Evaluator Comments */}
//           <div className="mb-4">
//             <label className="block text-white font-bold mb-2">
//               Evaluator Comments (optional)
//             </label>
//             <textarea
//               value={judgeScores.comments}
//               onChange={(e) =>
//                 setJudgeScores({ ...judgeScores, comments: e.target.value })
//               }
//               className="w-full bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-2"
//               rows="4"
//               placeholder="Any additional comments or observations..."
//             />
//           </div>

//           {/* Total Display */}
//           <div className="bg-iotrix-dark border-2 border-iotrix-red rounded-lg p-4 mb-6">
//             <div className="flex justify-between items-center">
//               <span className="text-white font-bold text-xl">Total Score:</span>
//               <span
//                 className={`font-bold text-2xl ${
//                   currentTotal > 165 ? "text-red-500" : "text-iotrix-red"
//                 }`}
//               >
//                 {currentTotal.toFixed(1)} / 165
//               </span>
//             </div>
//             {currentTotal > 165 && (
//               <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
//                 <AlertCircle size={16} />
//                 <p>Total exceeds maximum allowed (165 marks)</p>
//               </div>
//             )}
//           </div>

//           {/* Submit Button */}
//           <button
//             onClick={handleSubmitScore}
//             disabled={!selectedTeam || currentTotal > 165 || submitting}
//             className="w-full bg-iotrix-red text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2"
//           >
//             {submitting ? (
//               "Submitting..."
//             ) : (
//               <>
//                 <Send size={20} />
//                 Submit Score
//               </>
//             )}
//           </button>
//         </div>

//         {/* Quick Stats */}
//         <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl p-6">
//           <h3 className="text-xl font-bold text-white mb-4">
//             Your Submissions
//           </h3>
//           <div className="text-white space-y-2">
//             <p>
//               Total teams scored:{" "}
//               <span className="text-iotrix-red font-bold">
//                 {uniqueTeamsScored} / {teams.length}
//               </span>
//             </p>
//             <p>
//               Total submissions:{" "}
//               <span className="text-iotrix-red font-bold">
//                 {mySubmissions.length}
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JudgePanel;

// Final JudgePanel.jsx with revised rubric and scoring criteria
import React, { useState, useEffect } from "react";
import { LogOut, Send, AlertCircle, MessageSquare } from "lucide-react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

const JudgePanel = ({ user, onLogout }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [scores, setScores] = useState([]);
  const [judgeScores, setJudgeScores] = useState({
    faceRecognition: "",
    idCardDetection: "",
    idPinEntry: "",
    personStandDetection: "",
    backendWebApp: "",
    frontendUI: "",
    managerConfirmation: "",
    memberEnrollment: "",
    systemIntegration: "",
    documentation: "",
    businessViability: "",
    securityInnovation: "",
  });
  const [evaluatorComments, setEvaluatorComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rubrics = [
    {
      id: "faceRecognition",
      label: "Face Recognition System (Multi-person, Lighting)",
      max: 20,
      category: "Hardware Implementation",
    },
    {
      id: "idCardDetection",
      label: "ID Card Detection & Reading",
      max: 10,
      category: "Hardware Implementation",
    },
    {
      id: "idPinEntry",
      label: "ID/PIN Entry System",
      max: 10,
      category: "Hardware Implementation",
    },
    {
      id: "personStandDetection",
      label: "Person Stand Detection (Power Saving)",
      max: 10,
      category: "Hardware Implementation",
    },
    {
      id: "backendWebApp",
      label: "Backend Web App (Token Management, Enrollment)",
      max: 15,
      category: "Software Development",
    },
    {
      id: "frontendUI",
      label: "Frontend UI/UX (Responsive, Intuitive)",
      max: 10,
      category: "Software Development",
    },
    {
      id: "managerConfirmation",
      label: "Manager Confirmation System (Approval/Denial)",
      max: 10,
      category: "Software Development",
    },
    {
      id: "memberEnrollment",
      label: "New Member Enrollment System",
      max: 15,
      category: "Software Development",
    },
    {
      id: "systemIntegration",
      label: "Complete Hardware-Software Integration",
      max: 30,
      category: "System Integration",
    },
    {
      id: "documentation",
      label: "GitHub Repository + Presentation Slides",
      max: 10,
      category: "Documentation",
    },
    {
      id: "businessViability",
      label: "Implementation Timeline & Business Cycle",
      max: 5,
      category: "Business Viability",
    },
    {
      id: "securityInnovation",
      label: "Data Security, Privacy & Anti-Fraud Measures",
      max: 10,
      category: "Security & Innovation",
    },
  ];

  // Group rubrics by category for better UI
  const groupedRubrics = rubrics.reduce((acc, rubric) => {
    const category = rubric.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rubric);
    return acc;
  }, {});

  // Extract judge name from email
  const extractJudgeName = (email) => {
    const username = email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const judgeName = extractJudgeName(user.email);

  // Listen to teams
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teams"), (snapshot) => {
      const teamsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeams(teamsData.sort((a, b) => a.name.localeCompare(b.name)));
    });

    return () => unsubscribe();
  }, []);

  // Listen to scores
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "scores"), (snapshot) => {
      const scoresData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScores(scoresData);
    });

    return () => unsubscribe();
  }, []);

  const currentTotal = Object.values(judgeScores).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  const handleSubmitScore = async () => {
    if (!selectedTeam) {
      alert("Please select a team!");
      return;
    }

    if (currentTotal > 155) {
      alert("Total score cannot exceed 155 marks!");
      return;
    }

    // Check if all fields are filled
    const hasEmptyFields = Object.values(judgeScores).some((val) => val === "");
    if (hasEmptyFields) {
      if (!window.confirm("Some fields are empty. Continue anyway?")) {
        return;
      }
    }

    // Check if this judge already scored this team
    const alreadyScored = scores.find(
      (s) => s.teamId === selectedTeam && s.judgeEmail === user.email
    );

    if (alreadyScored) {
      const confirmOverwrite = window.confirm(
        `You've already scored this team with ${alreadyScored.total.toFixed(
          1
        )} points.\n\nDo you want to UPDATE your previous score?`
      );

      if (confirmOverwrite) {
        // Update existing score
        try {
          const scoreRef = doc(db, "scores", alreadyScored.id);
          await updateDoc(scoreRef, {
            faceRecognition: parseFloat(judgeScores.faceRecognition) || 0,
            idCardDetection: parseFloat(judgeScores.idCardDetection) || 0,
            idPinEntry: parseFloat(judgeScores.idPinEntry) || 0,
            personStandDetection:
              parseFloat(judgeScores.personStandDetection) || 0,
            backendWebApp: parseFloat(judgeScores.backendWebApp) || 0,
            frontendUI: parseFloat(judgeScores.frontendUI) || 0,
            managerConfirmation:
              parseFloat(judgeScores.managerConfirmation) || 0,
            memberEnrollment: parseFloat(judgeScores.memberEnrollment) || 0,
            systemIntegration: parseFloat(judgeScores.systemIntegration) || 0,
            documentation: parseFloat(judgeScores.documentation) || 0,
            businessViability: parseFloat(judgeScores.businessViability) || 0,
            securityInnovation: parseFloat(judgeScores.securityInnovation) || 0,
            evaluatorComments: evaluatorComments.trim(),
            total: currentTotal,
            updatedAt: serverTimestamp(),
          });

          // Reset form
          setSelectedTeam("");
          setJudgeScores({
            faceRecognition: "",
            idCardDetection: "",
            idPinEntry: "",
            personStandDetection: "",
            backendWebApp: "",
            frontendUI: "",
            managerConfirmation: "",
            memberEnrollment: "",
            systemIntegration: "",
            documentation: "",
            businessViability: "",
            securityInnovation: "",
          });
          setEvaluatorComments("");

          alert("Score updated successfully!");
          return;
        } catch (error) {
          console.error("Error updating score:", error);
          alert("Failed to update score. Please try again.");
          return;
        }
      } else {
        return; // Don't submit if user cancelled
      }
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "scores"), {
        teamId: selectedTeam,
        judgeName,
        judgeEmail: user.email,
        faceRecognition: parseFloat(judgeScores.faceRecognition) || 0,
        idCardDetection: parseFloat(judgeScores.idCardDetection) || 0,
        idPinEntry: parseFloat(judgeScores.idPinEntry) || 0,
        personStandDetection: parseFloat(judgeScores.personStandDetection) || 0,
        backendWebApp: parseFloat(judgeScores.backendWebApp) || 0,
        frontendUI: parseFloat(judgeScores.frontendUI) || 0,
        managerConfirmation: parseFloat(judgeScores.managerConfirmation) || 0,
        memberEnrollment: parseFloat(judgeScores.memberEnrollment) || 0,
        systemIntegration: parseFloat(judgeScores.systemIntegration) || 0,
        documentation: parseFloat(judgeScores.documentation) || 0,
        businessViability: parseFloat(judgeScores.businessViability) || 0,
        securityInnovation: parseFloat(judgeScores.securityInnovation) || 0,
        evaluatorComments: evaluatorComments.trim(),
        total: currentTotal,
        timestamp: serverTimestamp(),
      });

      // Reset form
      setSelectedTeam("");
      setJudgeScores({
        faceRecognition: "",
        idCardDetection: "",
        idPinEntry: "",
        personStandDetection: "",
        backendWebApp: "",
        frontendUI: "",
        managerConfirmation: "",
        memberEnrollment: "",
        systemIntegration: "",
        documentation: "",
        businessViability: "",
        securityInnovation: "",
      });
      setEvaluatorComments("");

      alert("Score submitted successfully!");
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Failed to submit score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Get unique teams scored by this judge
  const uniqueTeamsScored = new Set(
    scores.filter((s) => s.judgeEmail === user.email).map((s) => s.teamId)
  ).size;

  // Get this judge's submissions
  const mySubmissions = scores.filter((s) => s.judgeEmail === user.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02182b] via-[#021d35] to-[#02182b] p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Judge Panel</h1>
            <p className="text-gray-300 mt-1">Welcome, {judgeName}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-iotrix-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition shadow-lg"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Scoring Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl p-6 shadow-2xl">
              {/* Team Selection */}
              <div className="mb-6">
                <label className="block text-white font-bold mb-2 text-lg">
                  Select Team *
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full bg-iotrix-dark text-white border-2 border-iotrix-red rounded-lg px-4 py-3 font-semibold"
                >
                  <option value="">-- Choose a team --</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.university} ({team.projectTitle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rubric Scoring by Category */}
              <div className="space-y-6 mb-6">
                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <span className="text-iotrix-red">●</span>
                  Evaluation Rubrics
                </h3>

                {Object.entries(groupedRubrics).map(
                  ([category, categoryRubrics]) => {
                    const categoryTotal = categoryRubrics.reduce(
                      (sum, r) => sum + r.max,
                      0
                    );
                    const categoryScore = categoryRubrics.reduce(
                      (sum, r) => sum + (parseFloat(judgeScores[r.id]) || 0),
                      0
                    );

                    return (
                      <div
                        key={category}
                        className="bg-iotrix-dark/50 rounded-xl p-4 border border-iotrix-red/30"
                      >
                        {/* Category Header */}
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-iotrix-red font-bold text-sm uppercase tracking-wide">
                            {category}
                          </h4>
                          <span className="text-white font-bold text-sm">
                            {categoryScore.toFixed(1)} / {categoryTotal}
                          </span>
                        </div>

                        {/* Category Rubrics */}
                        <div className="space-y-3">
                          {categoryRubrics.map((rubric) => (
                            <div
                              key={rubric.id}
                              className="flex items-center gap-3"
                            >
                              <label className="text-white flex-1 text-sm">
                                {rubric.label}
                                <span className="text-iotrix-red ml-2 font-bold">
                                  / {rubric.max}
                                </span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={rubric.max}
                                step="0.5"
                                value={judgeScores[rubric.id]}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (
                                    value === "" ||
                                    (parseFloat(value) >= 0 &&
                                      parseFloat(value) <= rubric.max)
                                  ) {
                                    setJudgeScores({
                                      ...judgeScores,
                                      [rubric.id]: value,
                                    });
                                  }
                                }}
                                className="bg-iotrix-dark text-white border-2 border-iotrix-red rounded-lg px-3 py-2 w-20 text-center font-bold focus:ring-2 focus:ring-iotrix-red"
                                placeholder="0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Evaluator Comments */}
              <div className="mb-6">
                <label className="block text-white font-bold mb-2 text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-iotrix-red" />
                  Evaluator Comments (Optional)
                </label>
                <textarea
                  value={evaluatorComments}
                  onChange={(e) => setEvaluatorComments(e.target.value)}
                  placeholder="Add feedback, observations, or suggestions for the team..."
                  rows="4"
                  maxLength="500"
                  className="w-full bg-iotrix-dark text-white border-2 border-iotrix-red rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-iotrix-red"
                />
                <div className="text-right text-gray-400 text-xs mt-1">
                  {evaluatorComments.length} / 500 characters
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-gradient-to-r from-iotrix-red/20 to-iotrix-red/10 border-2 border-iotrix-red rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-2xl">
                    Total Score:
                  </span>
                  <span
                    className={`font-black text-4xl ${
                      currentTotal > 155 ? "text-red-500" : "text-iotrix-red"
                    }`}
                  >
                    {currentTotal.toFixed(1)} / 155
                  </span>
                </div>
                {currentTotal > 155 && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-3">
                    <AlertCircle size={16} />
                    <p>⚠️ Total exceeds maximum allowed (155 marks)</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitScore}
                disabled={!selectedTeam || currentTotal > 155 || submitting}
                className="w-full bg-gradient-to-r from-iotrix-red to-red-600 text-white py-4 rounded-xl hover:from-red-600 hover:to-iotrix-red transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-iotrix-red/50 transform hover:scale-105"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send size={24} />
                    Submit Score
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-iotrix-red">●</span>
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="bg-iotrix-dark/50 rounded-lg p-4 border border-iotrix-red/30">
                  <p className="text-gray-400 text-sm mb-1">Teams Scored</p>
                  <p className="text-3xl font-black text-iotrix-red">
                    {uniqueTeamsScored}{" "}
                    <span className="text-white text-lg">/ {teams.length}</span>
                  </p>
                </div>
                <div className="bg-iotrix-dark/50 rounded-lg p-4 border border-iotrix-red/30">
                  <p className="text-gray-400 text-sm mb-1">
                    Total Submissions
                  </p>
                  <p className="text-3xl font-black text-iotrix-red">
                    {mySubmissions.length}
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Completion</span>
                    <span>
                      {Math.round((uniqueTeamsScored / teams.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-iotrix-dark rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-iotrix-red to-red-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${(uniqueTeamsScored / teams.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rubric Summary */}
            <div className="bg-iotrix-darker/80 backdrop-blur-lg border-2 border-iotrix-red rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-iotrix-red">●</span>
                Marking Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Hardware Implementation</span>
                  <span className="font-bold text-white">50</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Software Development</span>
                  <span className="font-bold text-white">50</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>System Integration</span>
                  <span className="font-bold text-white">30</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Documentation</span>
                  <span className="font-bold text-white">10</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Business Viability</span>
                  <span className="font-bold text-white">5</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Security & Innovation</span>
                  <span className="font-bold text-white">10</span>
                </div>
                <div className="border-t border-iotrix-red/30 pt-2 mt-2"></div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-iotrix-red">155</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgePanel;
