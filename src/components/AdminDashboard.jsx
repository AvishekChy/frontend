import React, { useState, useEffect } from "react";
import {
  LogOut,
  Upload,
  Download,
  Users,
  BarChart3,
  Trophy,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import Papa from "papaparse";

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);

  // Admin management states
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");

  // Judge management states
  const [newJudgeName, setNewJudgeName] = useState("");
  const [newJudgeEmail, setNewJudgeEmail] = useState("");
  const [newJudgePassword, setNewJudgePassword] = useState("");

  // Score editing
  const [editingScore, setEditingScore] = useState(null);

  // CSV upload
  const [uploading, setUploading] = useState(false);

  // Listen to teams
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

  // Calculate rankings
  const calculateRanking = () => {
    return teams
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
  };

  // CSV Upload Handler
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("📁 File selected:", file.name);
    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: async (results) => {
        console.log("✅ CSV Parsed:", results.data);

        try {
          const teamsCollection = collection(db, "teams");
          let successCount = 0;

          for (const row of results.data) {
            console.log("Processing row:", row);

            const teamName = row["Team Name"] || row.TeamName || row.name || "";
            const university = row["University"] || row.university || "";
            const projectTitle =
              row["Project Title"] ||
              row.ProjectTitle ||
              row.projectTitle ||
              "";
            const phase1Score = parseFloat(
              row["Phase 1 Score"] || row.Phase1Score || row.phase1Score || 0
            );

            if (!teamName) {
              console.warn("⚠️ Skipping row with no team name:", row);
              continue;
            }

            await addDoc(teamsCollection, {
              name: teamName.trim(),
              university: university.trim(),
              projectTitle: projectTitle.trim(),
              phase1Score: phase1Score,
              createdAt: serverTimestamp(),
            });

            successCount++;
            console.log(`✅ Added team ${successCount}: ${teamName}`);
          }

          alert(`Successfully imported ${successCount} teams!`);
          console.log("🎉 Import complete!");
        } catch (error) {
          console.error("❌ Error uploading teams:", error);
          console.error("Error details:", error.message);
          alert(`Failed to upload teams: ${error.message}`);
        } finally {
          setUploading(false);
          e.target.value = "";
        }
      },
      error: (error) => {
        console.error("❌ CSV parsing error:", error);
        alert(`Failed to parse CSV file: ${error.message}`);
        setUploading(false);
        e.target.value = "";
      },
    });
  };

  // Add new judge
  const handleAddJudge = async () => {
    if (!newJudgeEmail || !newJudgePassword || !newJudgeName) {
      alert("Please fill all fields!");
      return;
    }

    if (!newJudgeEmail.includes("@")) {
      alert("Please enter a valid email!");
      return;
    }

    if (newJudgePassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${auth.app.options.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newJudgeEmail,
            password: newJudgePassword,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      await addDoc(collection(db, "judges"), {
        name: newJudgeName,
        email: newJudgeEmail,
        createdAt: serverTimestamp(),
      });

      const credentials = `Judge "${newJudgeName}" added successfully!\n\nCredentials:\nEmail: ${newJudgeEmail}\nPassword: ${newJudgePassword}\n\n⚠️ Save these credentials - you won't see the password again!`;

      alert(credentials);
      console.log(credentials);

      setNewJudgeName("");
      setNewJudgeEmail("");
      setNewJudgePassword("");
    } catch (error) {
      console.error("Error adding judge:", error);

      if (error.message.includes("EMAIL_EXISTS")) {
        alert("This email is already registered!");
      } else if (error.message.includes("WEAK_PASSWORD")) {
        alert("Password should be at least 6 characters!");
      } else {
        alert("Failed to add judge: " + error.message);
      }
    }
  };

  // Quick add 4 judges
  const handleQuickAddJudges = async () => {
    const judgeNames = ["Jawwad", "Junayed", "Ridwan", "Yusuf"];
    const password = "judge2025";

    if (
      !window.confirm(
        `Create 4 judge accounts:\n${judgeNames.join(
          ", "
        )}\n\nPassword for all: ${password}`
      )
    )
      return;

    setUploading(true);
    let successCount = 0;
    let credentials = "✅ Judges Created:\n\n";

    try {
      for (const name of judgeNames) {
        const email = `${name.toLowerCase()}@iotrix-judge.com`;

        try {
          const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${auth.app.options.apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true,
              }),
            }
          );

          if (response.ok) {
            await addDoc(collection(db, "judges"), {
              name: name,
              email: email,
              createdAt: serverTimestamp(),
            });

            credentials += `${name}: ${email} / ${password}\n`;
            successCount++;
          }
        } catch (err) {
          console.error(`Failed to add ${name}:`, err);
        }
      }

      alert(`${credentials}\n⚠️ Save these credentials!`);
      console.log(credentials);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete score
  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm("Are you sure you want to delete this score?")) return;

    try {
      await deleteDoc(doc(db, "scores", scoreId));
      alert("Score deleted successfully!");
    } catch (error) {
      console.error("Error deleting score:", error);
      alert("Failed to delete score.");
    }
  };

  // Save edited score
  const handleSaveEdit = async () => {
    if (!editingScore) return;

    try {
      const scoreRef = doc(db, "scores", editingScore.id);

      const total =
        (parseFloat(editingScore.faceRecognition) || 0) +
        (parseFloat(editingScore.idCardDetection) || 0) +
        (parseFloat(editingScore.idPinEntry) || 0) +
        (parseFloat(editingScore.personStandDetection) || 0) +
        (parseFloat(editingScore.backendWebApp) || 0) +
        (parseFloat(editingScore.frontendUI) || 0) +
        (parseFloat(editingScore.managerConfirmation) || 0) +
        (parseFloat(editingScore.memberEnrollment) || 0) +
        (parseFloat(editingScore.systemIntegration) || 0) +
        (parseFloat(editingScore.documentation) || 0) +
        (parseFloat(editingScore.businessViability) || 0) +
        (parseFloat(editingScore.securityInnovation) || 0);

      await updateDoc(scoreRef, {
        faceRecognition: parseFloat(editingScore.faceRecognition) || 0,
        idCardDetection: parseFloat(editingScore.idCardDetection) || 0,
        idPinEntry: parseFloat(editingScore.idPinEntry) || 0,
        personStandDetection:
          parseFloat(editingScore.personStandDetection) || 0,
        backendWebApp: parseFloat(editingScore.backendWebApp) || 0,
        frontendUI: parseFloat(editingScore.frontendUI) || 0,
        managerConfirmation: parseFloat(editingScore.managerConfirmation) || 0,
        memberEnrollment: parseFloat(editingScore.memberEnrollment) || 0,
        systemIntegration: parseFloat(editingScore.systemIntegration) || 0,
        documentation: parseFloat(editingScore.documentation) || 0,
        businessViability: parseFloat(editingScore.businessViability) || 0,
        securityInnovation: parseFloat(editingScore.securityInnovation) || 0,
        evaluatorComments: editingScore.evaluatorComments || "",
        total: total,
      });

      setEditingScore(null);
      alert("Score updated successfully!");
    } catch (error) {
      console.error("Error updating score:", error);
      alert("Failed to update score.");
    }
  };

  // Export results
  const handleExport = () => {
    const ranking = calculateRanking();
    const csv = Papa.unparse({
      fields: [
        "Rank",
        "Team Name",
        "University",
        "Project",
        "Phase 1",
        "Phase 2",
        "Total Score",
      ],
      data: ranking.map((team, index) => [
        index + 1,
        team.name,
        team.university,
        team.projectTitle,
        team.phase1Score?.toFixed(1) || "0.0",
        team.phase2Score.toFixed(1),
        team.totalScore.toFixed(1),
      ]),
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iotrix_results_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const ranking = calculateRanking();
  const totalSubmissions = scores.length;
  const teamsScored = new Set(scores.map((s) => s.teamId)).size;

  return (
    <div className="min-h-screen bg-iotrix-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-iotrix-red">
              Admin Dashboard
            </h1>
            <p className="text-white mt-1">Welcome, {user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-iotrix-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["overview", "teams", "scores", "judges", "judge-analytics"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-bold transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-iotrix-red text-white"
                    : "bg-iotrix-darker text-white border-2 border-iotrix-red hover:bg-iotrix-red"
                }`}
              >
                {tab
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            )
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-4">
                <Users className="w-8 h-8 text-iotrix-red mb-2" />
                <div className="text-2xl font-bold text-white">
                  {teams.length}
                </div>
                <div className="text-white text-sm">Total Teams</div>
              </div>
              <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-4">
                <BarChart3 className="w-8 h-8 text-iotrix-red mb-2" />
                <div className="text-2xl font-bold text-white">
                  {totalSubmissions}
                </div>
                <div className="text-white text-sm">Total Submissions</div>
              </div>
              <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-4">
                <Trophy className="w-8 h-8 text-iotrix-red mb-2" />
                <div className="text-2xl font-bold text-white">
                  {teamsScored}
                </div>
                <div className="text-white text-sm">Teams Scored</div>
              </div>
              <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-4">
                <Users className="w-8 h-8 text-iotrix-red mb-2" />
                <div className="text-2xl font-bold text-white">
                  {new Set(scores.map((s) => s.judgeEmail)).size}
                </div>
                <div className="text-white text-sm">Active Judges</div>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-iotrix-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              <Download size={20} />
              Export Results (CSV)
            </button>

            {/* Top 10 Preview */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Top 10 Teams
              </h3>
              <div className="space-y-2">
                {ranking.slice(0, 10).map((team, index) => (
                  <div
                    key={team.id}
                    className="flex justify-between items-center bg-iotrix-dark p-3 rounded"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-iotrix-red font-bold text-lg">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="text-white font-semibold">
                          {team.name}
                        </div>
                        <div className="text-white text-sm">
                          {team.university}
                        </div>
                      </div>
                    </div>
                    <div className="text-iotrix-red font-bold text-lg">
                      {team.totalScore.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            {/* CSV Upload */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Import Teams from CSV
              </h3>
              <p className="text-white text-sm mb-4">
                CSV Format:{" "}
                <code className="bg-iotrix-dark px-2 py-1 rounded">
                  Team Name, University, Project Title, Phase 1 Score
                </code>
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  disabled={uploading}
                  className="flex-1 bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-2"
                />
                {uploading && <span className="text-white">Uploading...</span>}
              </div>
            </div>

            {/* Teams List */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                All Teams ({teams.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-iotrix-red">
                    <tr>
                      <th className="px-4 py-2 text-left text-white">#</th>
                      <th className="px-4 py-2 text-left text-white">
                        Team Name
                      </th>
                      <th className="px-4 py-2 text-left text-white">
                        University
                      </th>
                      <th className="px-4 py-2 text-left text-white">
                        Project
                      </th>
                      <th className="px-4 py-2 text-right text-white">
                        Phase 1
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr key={team.id} className="border-t border-iotrix-red">
                        <td className="px-4 py-2 text-white">{index + 1}</td>
                        <td className="px-4 py-2 text-white">{team.name}</td>
                        <td className="px-4 py-2 text-white">
                          {team.university}
                        </td>
                        <td className="px-4 py-2 text-white">
                          {team.projectTitle}
                        </td>
                        <td className="px-4 py-2 text-white text-right">
                          {team.phase1Score?.toFixed(1) || "0.0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Scores Tab */}
        {activeTab === "scores" && (
          <div className="space-y-6">
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                All Score Submissions ({scores.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-iotrix-red">
                    <tr>
                      <th className="px-2 py-2 text-left text-white">Team</th>
                      <th className="px-2 py-2 text-left text-white">Judge</th>
                      <th className="px-2 py-2 text-right text-white">Face</th>
                      <th className="px-2 py-2 text-right text-white">ID</th>
                      <th className="px-2 py-2 text-right text-white">PIN</th>
                      <th className="px-2 py-2 text-right text-white">Stand</th>
                      <th className="px-2 py-2 text-right text-white">Back</th>
                      <th className="px-2 py-2 text-right text-white">Front</th>
                      <th className="px-2 py-2 text-right text-white">Mgr</th>
                      <th className="px-2 py-2 text-right text-white">Enrl</th>
                      <th className="px-2 py-2 text-right text-white">Intg</th>
                      <th className="px-2 py-2 text-right text-white">Doc</th>
                      <th className="px-2 py-2 text-right text-white">Biz</th>
                      <th className="px-2 py-2 text-right text-white">Sec</th>
                      <th className="px-2 py-2 text-right text-white">Total</th>
                      <th className="px-2 py-2 text-left text-white">
                        Comments
                      </th>
                      <th className="px-2 py-2 text-center text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score) => {
                      const team = teams.find((t) => t.id === score.teamId);
                      const isEditing = editingScore?.id === score.id;

                      return (
                        <tr
                          key={score.id}
                          className="border-t border-iotrix-red hover:bg-iotrix-dark/30"
                        >
                          <td className="px-2 py-2 text-white">
                            {team?.name || "Unknown"}
                          </td>
                          <td className="px-2 py-2 text-white">
                            {score.judgeName}
                          </td>
                          {isEditing ? (
                            <>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.faceRecognition}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      faceRecognition: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.idCardDetection}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      idCardDetection: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.idPinEntry}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      idPinEntry: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.personStandDetection}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      personStandDetection: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.backendWebApp}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      backendWebApp: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.frontendUI}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      frontendUI: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.managerConfirmation}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      managerConfirmation: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.memberEnrollment}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      memberEnrollment: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.systemIntegration}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      systemIntegration: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.documentation}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      documentation: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.businessViability}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      businessViability: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-1 py-2">
                                <input
                                  type="number"
                                  value={editingScore.securityInnovation}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      securityInnovation: e.target.value,
                                    })
                                  }
                                  className="w-12 bg-iotrix-dark text-white border border-iotrix-red rounded px-1 text-right"
                                />
                              </td>
                              <td className="px-2 py-2 text-white text-right font-bold">
                                {(
                                  (parseFloat(editingScore.faceRecognition) ||
                                    0) +
                                  (parseFloat(editingScore.idCardDetection) ||
                                    0) +
                                  (parseFloat(editingScore.idPinEntry) || 0) +
                                  (parseFloat(
                                    editingScore.personStandDetection
                                  ) || 0) +
                                  (parseFloat(editingScore.backendWebApp) ||
                                    0) +
                                  (parseFloat(editingScore.frontendUI) || 0) +
                                  (parseFloat(
                                    editingScore.managerConfirmation
                                  ) || 0) +
                                  (parseFloat(editingScore.memberEnrollment) ||
                                    0) +
                                  (parseFloat(editingScore.systemIntegration) ||
                                    0) +
                                  (parseFloat(editingScore.documentation) ||
                                    0) +
                                  (parseFloat(editingScore.businessViability) ||
                                    0) +
                                  (parseFloat(
                                    editingScore.securityInnovation
                                  ) || 0)
                                ).toFixed(1)}
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={editingScore.evaluatorComments || ""}
                                  onChange={(e) =>
                                    setEditingScore({
                                      ...editingScore,
                                      evaluatorComments: e.target.value,
                                    })
                                  }
                                  className="w-32 bg-iotrix-dark text-white border border-iotrix-red rounded px-2"
                                  placeholder="Comments..."
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-2 py-2 text-white text-right">
                                {score.faceRecognition?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.idCardDetection?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.idPinEntry?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.personStandDetection?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.backendWebApp?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.frontendUI?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.managerConfirmation?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.memberEnrollment?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.systemIntegration?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.documentation?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.businessViability?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-white text-right">
                                {score.securityInnovation?.toFixed(1) || "0"}
                              </td>
                              <td className="px-2 py-2 text-iotrix-red text-right font-bold">
                                {score.total?.toFixed(1)}
                              </td>
                              <td
                                className="px-2 py-2 text-white text-sm truncate max-w-[150px]"
                                title={score.evaluatorComments}
                              >
                                {score.evaluatorComments || "—"}
                              </td>
                            </>
                          )}
                          <td className="px-2 py-2">
                            <div className="flex gap-2 justify-center">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="text-green-400 hover:text-green-300"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={() => setEditingScore(null)}
                                    className="text-gray-400 hover:text-gray-300"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingScore(score)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteScore(score.id)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Judges Tab */}
        {activeTab === "judges" && (
          <div className="space-y-6">
            {/* Add New Judge */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus size={24} />
                Add New Judge
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Judge Name (e.g., Jawwad)"
                  value={newJudgeName}
                  onChange={(e) => setNewJudgeName(e.target.value)}
                  className="bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-2"
                />
                <input
                  type="email"
                  placeholder="Email (e.g., jawwad@iotrix-judge.com)"
                  value={newJudgeEmail}
                  onChange={(e) => setNewJudgeEmail(e.target.value)}
                  className="bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-2"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={newJudgePassword}
                  onChange={(e) => setNewJudgePassword(e.target.value)}
                  className="bg-iotrix-dark text-white border border-iotrix-red rounded-lg px-4 py-2"
                />
              </div>
              <button
                onClick={handleAddJudge}
                className="bg-iotrix-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Add Judge
              </button>
              <p className="text-gray-400 text-sm mt-3">
                💡 Tip: Use email format like "name@iotrix-judge.com" for easy
                management
              </p>
            </div>

            {/* Current Judges List */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Active Judges
              </h3>

              {(() => {
                const judgeEmails = [
                  ...new Set(scores.map((s) => s.judgeEmail)),
                ];

                return judgeEmails.length === 0 ? (
                  <p className="text-white text-center py-8">
                    No judges have scored yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {judgeEmails.map((email) => {
                      const judgeName =
                        email.split("@")[0].charAt(0).toUpperCase() +
                        email.split("@")[0].slice(1);
                      const judgeScores = scores.filter(
                        (s) => s.judgeEmail === email
                      );
                      const teamsScored = new Set(
                        judgeScores.map((s) => s.teamId)
                      ).size;

                      return (
                        <div
                          key={email}
                          className="bg-iotrix-dark p-4 rounded flex justify-between items-center"
                        >
                          <div>
                            <div className="text-white font-semibold text-lg">
                              {judgeName}
                            </div>
                            <div className="text-gray-400 text-sm">{email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-iotrix-red font-bold text-xl">
                              {teamsScored} / {teams.length}
                            </div>
                            <div className="text-gray-400 text-sm">
                              teams scored
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Judge Credentials */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📋 Judge Login Instructions
              </h3>
              <div className="bg-iotrix-dark p-4 rounded space-y-3">
                <div className="text-white font-mono text-sm space-y-2">
                  <p>
                    <strong>Competition Website:</strong>
                  </p>
                  <p className="text-iotrix-red font-bold text-lg">
                    {window.location.origin}
                  </p>
                  <p className="mt-4">
                    <strong>Login Steps:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open the website above</li>
                    <li>Click "Judge Login"</li>
                    <li>Enter your email and password</li>
                    <li>Start scoring teams!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Judge Analytics Tab */}
        {activeTab === "judge-analytics" && (
          <div className="space-y-6">
            {/* Judge Performance Overview */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Judge Performance Overview
              </h3>

              {(() => {
                const judgeEmails = [
                  ...new Set(scores.map((s) => s.judgeEmail)),
                ];
                const judgeStats = {};

                judgeEmails.forEach((email) => {
                  const judgeName =
                    email.split("@")[0].charAt(0).toUpperCase() +
                    email.split("@")[0].slice(1);
                  const judgeScores = scores.filter(
                    (s) => s.judgeEmail === email
                  );

                  judgeStats[judgeName] = {
                    email,
                    totalScored: new Set(judgeScores.map((s) => s.teamId)).size,
                    submissions: judgeScores.length,
                    avgScore:
                      judgeScores.length > 0
                        ? (
                            judgeScores.reduce((sum, s) => sum + s.total, 0) /
                            judgeScores.length
                          ).toFixed(1)
                        : 0,
                  };
                });

                return Object.keys(judgeStats).length === 0 ? (
                  <p className="text-white text-center py-8">
                    No judge data available yet
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(judgeStats).map(([name, stats]) => (
                      <div
                        key={name}
                        className="bg-iotrix-dark p-4 rounded-lg border border-iotrix-red"
                      >
                        <h4 className="text-iotrix-red font-bold text-lg mb-2">
                          {name}
                        </h4>
                        <div className="space-y-1 text-white text-sm">
                          <p>
                            Teams Scored:{" "}
                            <span className="font-bold">
                              {stats.totalScored} / {teams.length}
                            </span>
                          </p>
                          <p>
                            Total Submissions:{" "}
                            <span className="font-bold">
                              {stats.submissions}
                            </span>
                          </p>
                          <p>
                            Avg Score Given:{" "}
                            <span className="font-bold">{stats.avgScore}</span>
                          </p>
                          <div className="mt-2">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-iotrix-red h-2 rounded-full transition-all"
                                style={{
                                  width: `${
                                    (stats.totalScored / teams.length) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Judge-Team Matrix */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Judge-Team Scoring Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-iotrix-red">
                    <tr>
                      <th className="px-3 py-2 text-left text-white sticky left-0 bg-iotrix-red z-10">
                        Team
                      </th>
                      {(() => {
                        const judgeEmails = [
                          ...new Set(scores.map((s) => s.judgeEmail)),
                        ];
                        return judgeEmails.map((email) => {
                          const name =
                            email.split("@")[0].charAt(0).toUpperCase() +
                            email.split("@")[0].slice(1);
                          return (
                            <th
                              key={email}
                              className="px-3 py-2 text-center text-white"
                            >
                              {name}
                            </th>
                          );
                        });
                      })()}
                      <th className="px-3 py-2 text-center text-white">
                        Total
                      </th>
                      <th className="px-3 py-2 text-center text-white">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => {
                      const teamScores = scores.filter(
                        (s) => s.teamId === team.id
                      );
                      const judgeEmails = [
                        ...new Set(scores.map((s) => s.judgeEmail)),
                      ];

                      const judgeScoresMap = {};
                      judgeEmails.forEach((email) => {
                        const score = teamScores.find(
                          (s) => s.judgeEmail === email
                        );
                        judgeScoresMap[email] = score ? score.total : null;
                      });

                      const totalScore = Object.values(judgeScoresMap).reduce(
                        (sum, s) => sum + (s || 0),
                        0
                      );
                      const scoredCount = Object.values(judgeScoresMap).filter(
                        (s) => s !== null
                      ).length;
                      const avgScore =
                        scoredCount > 0 ? totalScore / scoredCount : 0;

                      return (
                        <tr
                          key={team.id}
                          className="border-t border-iotrix-red hover:bg-iotrix-dark"
                        >
                          <td className="px-3 py-2 text-white font-semibold sticky left-0 bg-iotrix-darker z-10">
                            {team.name}
                          </td>
                          {judgeEmails.map((email) => (
                            <td key={email} className="px-3 py-2 text-center">
                              {judgeScoresMap[email] !== null ? (
                                <span className="text-white font-bold">
                                  {judgeScoresMap[email].toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center text-iotrix-red font-bold">
                            {totalScore.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-center text-white font-bold">
                            {avgScore.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Missing Scores Alert */}
            <div className="bg-iotrix-darker border-2 border-iotrix-red rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                ⚠️ Missing Scores
              </h3>
              {(() => {
                const judgeEmails = [
                  ...new Set(scores.map((s) => s.judgeEmail)),
                ];
                const missingScores = [];

                teams.forEach((team) => {
                  judgeEmails.forEach((email) => {
                    const hasScored = scores.some(
                      (s) => s.teamId === team.id && s.judgeEmail === email
                    );

                    if (!hasScored) {
                      const judgeName =
                        email.split("@")[0].charAt(0).toUpperCase() +
                        email.split("@")[0].slice(1);
                      missingScores.push({ team: team.name, judge: judgeName });
                    }
                  });
                });

                return missingScores.length === 0 ? (
                  <p className="text-green-400 text-center py-4">
                    ✅ All judges have scored all teams!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {missingScores.slice(0, 50).map((item, idx) => (
                      <div
                        key={idx}
                        className="text-white text-sm bg-iotrix-dark p-2 rounded"
                      >
                        <span className="text-iotrix-red font-bold">
                          {item.judge}
                        </span>{" "}
                        hasn't scored{" "}
                        <span className="text-white font-bold">
                          {item.team}
                        </span>
                      </div>
                    ))}
                    {missingScores.length > 50 && (
                      <p className="text-gray-400 text-sm mt-2 text-center">
                        ... and {missingScores.length - 50} more missing scores
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
