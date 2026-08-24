import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, IconButton, Button,
  TextField, CircularProgress, Alert, Tooltip, Chip, Paper,
  LinearProgress, Snackbar, Select, MenuItem, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, InputLabel
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SaveIcon from "@mui/icons-material/Save";
import { getReelsDelivery, createClient } from "../api/clientsApi";
import { createContent, updateContent } from "../api/projectsApi";
import api from "../api";

export default function ReelsDeliveryPage() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  
  const [selectedClientId, setSelectedClientId] = useState(null);
  const selectedClient = data.find(c => c._id === selectedClientId);

  const [inputState, setInputState] = useState({});

  // Quick Add Client Dialog State
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickForm, setQuickForm] = useState({
    businessName: "",
    ownerName: "",
    mobile: "",
    targetReels: 15,
    quickServiceType: "Only Editing"
  });
  const [quickAddError, setQuickAddError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Update input state by finding the latest reel matching "Reel #i" prefix
  useEffect(() => {
    if (selectedClient) {
      const state = {};
      const target = selectedClient.currentCycle?.totalTarget || selectedClient.monthlyTarget || 30;
      const reels = selectedClient.currentCycle?.reels || [];

      for (let i = 1; i <= target; i++) {
        const reel = reels.filter(r => 
          r.title && r.title.toLowerCase().replace(/\s/g, '').startsWith(`reel#${i}`)
        );
        reel.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const activeReel = reel[0] || null;

        state[i] = {
          title: activeReel ? (activeReel.title.toLowerCase().startsWith(`reel #${i}:`) ? activeReel.title.split(":").slice(1).join(":").trim() : activeReel.title) : "",
          driveLink: activeReel ? activeReel.driveLink || "" : "",
          instagramLink: activeReel ? activeReel.instagramLink || "" : "",
          scriptText: activeReel ? activeReel.scriptText || "" : "",
          serviceType: activeReel ? activeReel.serviceType || "" : "",
          shootDataLink: activeReel ? activeReel.shootDataLink || "" : ""
        };
      }
      setInputState(state);
    } else {
      setInputState({});
    }
  }, [selectedClientId, selectedClient?.currentCycle?.reels]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [reelsRes, usersRes] = await Promise.all([
        getReelsDelivery(),
        api.get("/auth/users").catch(() => ({ data: [] }))
      ]);
      setData(reelsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reels delivery data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTracker = (client) => {
    setSelectedClientId(client._id);
  };

  const handleBack = () => {
    setSelectedClientId(null);
    fetchData();
  };

  // Helper to check stage hierarchy
  const getStageStatus = (reel, stageToCheck) => {
    if (!reel) return false;
    if (stageToCheck === "script") {
      return ["script", "shoot", "edit", "qc", "client_approval", "posted", "approved"].includes(reel.stage);
    }
    if (stageToCheck === "shoot") {
      return ["shoot", "edit", "qc", "client_approval", "posted", "approved"].includes(reel.stage);
    }
    if (stageToCheck === "edit") {
      return ["edit", "qc", "client_approval", "posted", "approved"].includes(reel.stage) || !!reel.driveLink;
    }
    if (stageToCheck === "posted") {
      return ["posted", "approved"].includes(reel.stage) || !!reel.instagramLink;
    }
    return false;
  };

  // Handle stage change/toggle
  const handleToggleStage = async (reelNum, stageToCheck) => {
    setError("");
    if (!selectedClient) return;

    const reels = selectedClient.currentCycle?.reels || [];
    const matchingReels = reels.filter(r => 
      r.title && r.title.toLowerCase().replace(/\s/g, '').startsWith(`reel#${reelNum}`)
    );
    matchingReels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const reel = matchingReels[0] || null;

    const isCurrentlyDone = getStageStatus(reel, stageToCheck);

    let nextStage = "idea";
    if (stageToCheck === "script") {
      nextStage = isCurrentlyDone ? "idea" : "script";
    } else if (stageToCheck === "shoot") {
      nextStage = isCurrentlyDone ? "script" : "shoot";
    } else if (stageToCheck === "edit") {
      nextStage = isCurrentlyDone ? "shoot" : "edit";
    } else if (stageToCheck === "posted") {
      nextStage = isCurrentlyDone ? "edit" : "posted";
    }

    try {
      if (reel) {
        await updateContent(reel._id, { stage: nextStage });
      } else {
        const currentInputs = inputState[reelNum] || {};
        const titleText = currentInputs.title ? `Reel #${reelNum}: ${currentInputs.title}` : `Reel #${reelNum}`;
        await createContent({
          clientId: selectedClient._id,
          title: titleText,
          type: "reel",
          stage: nextStage,
          description: currentInputs.title || "",
          scriptText: currentInputs.scriptText || "",
          serviceType: currentInputs.serviceType || "",
          shootDataLink: currentInputs.shootDataLink || ""
        });
      }
      setToast(`Reel #${reelNum} status updated successfully!`);
      await fetchData();
    } catch (err) {
      setError("Failed to update status. Please try again.");
    }
  };

  // Assign Editor directly from checklist
  const handleAssignEditor = async (reelNum, editorId) => {
    setError("");
    if (!selectedClient) return;

    const reels = selectedClient.currentCycle?.reels || [];
    const matchingReels = reels.filter(r => 
      r.title && r.title.toLowerCase().replace(/\s/g, '').startsWith(`reel#${reelNum}`)
    );
    matchingReels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const reel = matchingReels[0] || null;

    try {
      if (reel) {
        await updateContent(reel._id, { editorId: editorId || null });
      } else {
        const currentInputs = inputState[reelNum] || {};
        const titleText = currentInputs.title ? `Reel #${reelNum}: ${currentInputs.title}` : `Reel #${reelNum}`;
        await createContent({
          clientId: selectedClient._id,
          title: titleText,
          type: "reel",
          stage: "idea",
          editorId: editorId || null,
          description: currentInputs.title || "",
          scriptText: currentInputs.scriptText || "",
          serviceType: currentInputs.serviceType || "",
          shootDataLink: currentInputs.shootDataLink || ""
        });
      }
      setToast(`Editor assigned to Reel #${reelNum}!`);
      await fetchData();
    } catch (err) {
      setError("Failed to assign editor.");
    }
  };

  // Update specific reel's serviceType
  const handleSaveReelServiceType = async (reelNum, serviceType) => {
    setError("");
    if (!selectedClient) return;

    const reels = selectedClient.currentCycle?.reels || [];
    const matchingReels = reels.filter(r => 
      r.title && r.title.toLowerCase().replace(/\s/g, '').startsWith(`reel#${reelNum}`)
    );
    matchingReels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const reel = matchingReels[0] || null;

    try {
      if (reel) {
        await updateContent(reel._id, { serviceType: serviceType || "" });
      } else {
        const currentInputs = inputState[reelNum] || {};
        const titleText = currentInputs.title ? `Reel #${reelNum}: ${currentInputs.title}` : `Reel #${reelNum}`;
        await createContent({
          clientId: selectedClient._id,
          title: titleText,
          type: "reel",
          stage: "idea",
          serviceType: serviceType || "",
          description: currentInputs.title || "",
          scriptText: currentInputs.scriptText || "",
          shootDataLink: currentInputs.shootDataLink || ""
        });
      }
      setToast(`Reel #${reelNum} service type updated!`);
      await fetchData();
    } catch (err) {
      setError("Failed to update reel service type.");
    }
  };

  // Save textual inputs (Concept Title, Links, Script)
  const handleSaveTextInputs = async (reelNum) => {
    setError("");
    if (!selectedClient) return;

    const reels = selectedClient.currentCycle?.reels || [];
    const matchingReels = reels.filter(r => 
      r.title && r.title.toLowerCase().replace(/\s/g, '').startsWith(`reel#${reelNum}`)
    );
    matchingReels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const reel = matchingReels[0] || null;

    const currentInputs = inputState[reelNum] || { title: "", driveLink: "", instagramLink: "", scriptText: "", serviceType: "", shootDataLink: "" };
    const formattedTitle = currentInputs.title ? `Reel #${reelNum}: ${currentInputs.title}` : `Reel #${reelNum}`;

    try {
      if (reel) {
        await updateContent(reel._id, {
          title: formattedTitle,
          description: currentInputs.title,
          driveLink: currentInputs.driveLink,
          instagramLink: currentInputs.instagramLink,
          scriptText: currentInputs.scriptText,
          shootDataLink: currentInputs.shootDataLink
        });
      } else {
        await createContent({
          clientId: selectedClient._id,
          title: formattedTitle,
          type: "reel",
          stage: "idea",
          description: currentInputs.title,
          driveLink: currentInputs.driveLink,
          instagramLink: currentInputs.instagramLink,
          scriptText: currentInputs.scriptText,
          shootDataLink: currentInputs.shootDataLink,
          serviceType: currentInputs.serviceType || ""
        });
      }
      setToast(`Reel #${reelNum} data saved successfully!`);
      await fetchData();
    } catch (err) {
      setError("Failed to save inputs. Please try again.");
    }
  };

  const handleInputChange = (reelNum, field, value) => {
    setInputState(prev => ({
      ...prev,
      [reelNum]: {
        ...prev[reelNum],
        [field]: value
      }
    }));
  };

  // Export beautiful PDF of all scripts
  const handleExportPDF = () => {
    if (!selectedClient) return;
    
    const target = selectedClient.currentCycle?.totalTarget || selectedClient.monthlyTarget || 30;
    const reels = selectedClient.currentCycle?.reels || [];
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export PDF.");
      return;
    }
    
    let scriptsHtml = "";
    for (let i = 1; i <= target; i++) {
      const matchingReels = reels.filter(r => 
        r.title && r.title.toLowerCase().replace(/\s/g, '').startsWith(`reel#${i}`)
      );
      matchingReels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const reel = matchingReels[0] || null;
      
      const concept = reel ? (reel.title.toLowerCase().startsWith(`reel #${i}:`) ? reel.title.split(":").slice(1).join(":").trim() : reel.title) : "No Concept";
      const scriptText = reel ? reel.scriptText || "No script written yet." : "No script written yet.";
      
      scriptsHtml += `
        <div class="reel-section">
          <h2>Reel #${i}: ${concept}</h2>
          <div class="script-body">
            <strong>Script Draft:</strong>
            <p style="white-space: pre-wrap; font-size: 14px;">${scriptText}</p>
          </div>
          ${reel && reel.driveLink ? `<p style="font-size: 12px; margin: 5px 0;"><strong>Drive Link:</strong> <a href="${reel.driveLink}" target="_blank">${reel.driveLink}</a></p>` : ""}
          ${reel && reel.instagramLink ? `<p style="font-size: 12px; margin: 5px 0;"><strong>Insta Link:</strong> <a href="${reel.instagramLink}" target="_blank">${reel.instagramLink}</a></p>` : ""}
          <hr/>
        </div>
      `;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedClient.businessName} - Reels Scripts</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; padding: 40px; line-height: 1.6; }
            h1 { color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 30px; }
            .meta { margin-bottom: 40px; color: #4b5563; font-size: 14px; }
            .reel-section { margin-bottom: 30px; page-break-inside: avoid; }
            h2 { color: #2563eb; font-size: 18px; margin-bottom: 10px; }
            .script-body { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 10px 0; }
            hr { border: 0; border-top: 1px solid #e5e7eb; margin-top: 30px; }
          </style>
        </head>
        <body>
          <h1>🎬 ${selectedClient.businessName} - Reels Scripts</h1>
          <div class="meta">
            <strong>Owner:</strong> ${selectedClient.ownerName} <br/>
            <strong>Cycle:</strong> ${selectedClient.currentCycle?.label || "Current Month"} <br/>
            <strong>Generated Date:</strong> ${new Date().toLocaleDateString("en-IN")}
          </div>
          ${scriptsHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Quick add service-only client
  const handleQuickAddClient = async () => {
    setQuickAddError("");
    if (!quickForm.businessName || !quickForm.ownerName || !quickForm.mobile) {
      setQuickAddError("Business Name, Owner Name, and Mobile are required.");
      return;
    }
    try {
      await createClient({
        businessName: quickForm.businessName,
        ownerName: quickForm.ownerName,
        mobile: quickForm.mobile,
        status: "active",
        isQuickClient: true,
        quickServiceType: quickForm.quickServiceType,
        package: {
          name: quickForm.quickServiceType,
          amount: 0,
          deliverables: [
            { type: "Reels", quantity: Number(quickForm.targetReels) }
          ]
        }
      });
      setQuickAddOpen(false);
      setQuickForm({ businessName: "", ownerName: "", mobile: "", targetReels: 15, quickServiceType: "Only Editing" });
      setToast("Quick client added successfully!");
      fetchData();
    } catch (err) {
      setQuickAddError(err.response?.data?.message || "Failed to add quick client.");
    }
  };

  const filteredClients = data.filter(client => {
    return (
      client.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      client.ownerName?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading && data.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // --- View 2: Client Detail Checklist ---
  if (selectedClient) {
    const target = selectedClient.currentCycle?.totalTarget || selectedClient.monthlyTarget || 30;
    const reels = selectedClient.currentCycle?.reels || [];
    
    return (
      <Box sx={{ pb: 6 }}>
        {/* Detail Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={handleBack} color="primary" sx={{ border: "1px solid #e5e7eb" }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                🏢 {selectedClient.businessName} {selectedClient.isQuickClient && <Chip label="Quick Client" color="secondary" size="small" />}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Owner: {selectedClient.ownerName} | Target: {target} Reels {selectedClient.currentCycle?.carryOver > 0 ? `(Includes ${selectedClient.currentCycle.carryOver} Carry-over)` : ""} | Cycle: {selectedClient.currentCycle?.label || "Current Month"}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportPDF}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3, py: 1 }}
          >
            📄 Export Scripts PDF
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper sx={{ border: "1px solid #e5e7eb", borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell width="80px" sx={{ fontWeight: 700 }}>No.</TableCell>
                  <TableCell minWidth="220px" sx={{ fontWeight: 700 }}>Concept & Service</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>1. Scripting</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>2. Shooting</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>3. Editing</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>4. Posting</TableCell>
                  <TableCell minWidth="280px" sx={{ fontWeight: 700 }}>Script & Links</TableCell>
                  <TableCell width="80px" align="center" sx={{ fontWeight: 700 }}>Save</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: target }).map((_, index) => {
                  const reelNum = index + 1;
                  
                  const matchingReels = reels.filter(r => 
                    r.title && r.title.toLowerCase().replace(/\s/g, '').startsWith(`reel#${reelNum}`)
                  );
                  matchingReels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                  const reel = matchingReels[0] || null;
                  
                  const isScriptDone = getStageStatus(reel, "script");
                  const isShootDone = getStageStatus(reel, "shoot");
                  const isEditDone = getStageStatus(reel, "edit");
                  const isPostDone = getStageStatus(reel, "posted");

                  const currentInputs = inputState[reelNum] || { title: "", driveLink: "", instagramLink: "", scriptText: "", serviceType: "", shootDataLink: "" };
                  const reelServiceType = currentInputs.serviceType || selectedClient.quickServiceType || "Full Management";
                  const isOnlyEditing = reelServiceType === "Only Editing";

                  return (
                    <TableRow key={reelNum} hover sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                      <TableCell sx={{ fontWeight: 600 }}>Reel #{reelNum}</TableCell>
                      
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter hook or topic..."
                          value={currentInputs.title || ""}
                          onChange={(e) => handleInputChange(reelNum, "title", e.target.value)}
                          onBlur={() => handleSaveTextInputs(reelNum)}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                            mb: 1
                          }}
                        />
                        <FormControl size="small" fullWidth>
                          <Select
                            value={currentInputs.serviceType || ""}
                            onChange={(e) => handleSaveReelServiceType(reelNum, e.target.value)}
                            displayEmpty
                            sx={{ height: 26, fontSize: 11, borderRadius: 1.5 }}
                          >
                            <MenuItem value="" sx={{ fontSize: 11 }}>
                              <em>Default: {selectedClient.quickServiceType || "Full"}</em>
                            </MenuItem>
                            <MenuItem value="Only Editing" sx={{ fontSize: 11 }}>Only Editing</MenuItem>
                            <MenuItem value="Shooting + Editing" sx={{ fontSize: 11 }}>Shooting + Editing</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          variant={isScriptDone ? "contained" : "outlined"}
                          color={isScriptDone ? "success" : "inherit"}
                          size="small"
                          onClick={() => handleToggleStage(reelNum, "script")}
                          startIcon={isScriptDone ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                          sx={{ borderRadius: 4, minWidth: 100, textTransform: "none" }}
                        >
                          {isScriptDone ? "Done" : "Pending"}
                        </Button>
                      </TableCell>

                      <TableCell align="center">
                        {isOnlyEditing ? (
                          <Chip 
                            label="N/A (Editing Only)" 
                            size="small" 
                            variant="outlined" 
                            sx={{ borderRadius: 1.5, fontSize: 9.5, fontWeight: 700, bgcolor: "#f3f4f6", color: "text.secondary" }} 
                          />
                        ) : (
                          <Button
                            variant={isShootDone ? "contained" : "outlined"}
                            color={isShootDone ? "secondary" : "inherit"}
                            size="small"
                            onClick={() => handleToggleStage(reelNum, "shoot")}
                            startIcon={isShootDone ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                            sx={{ borderRadius: 4, minWidth: 100, textTransform: "none" }}
                          >
                            {isShootDone ? "Done" : "Pending"}
                          </Button>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
                          <Button
                            variant={isEditDone ? "contained" : "outlined"}
                            color={isEditDone ? "warning" : "inherit"}
                            size="small"
                            onClick={() => handleToggleStage(reelNum, "edit")}
                            startIcon={isEditDone ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                            sx={{ borderRadius: 4, minWidth: 100, textTransform: "none" }}
                          >
                            {isEditDone ? "Done" : "Pending"}
                          </Button>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={reel?.editorId?._id || reel?.editorId || ""}
                              onChange={(e) => handleAssignEditor(reelNum, e.target.value)}
                              displayEmpty
                              sx={{ 
                                height: 26, 
                                fontSize: 11, 
                                borderRadius: 1.5,
                                "& .MuiSelect-select": { py: 0.5 }
                              }}
                            >
                              <MenuItem value="" sx={{ fontSize: 11 }}>
                                <em>Select Editor</em>
                              </MenuItem>
                              {users.map(u => (
                                <MenuItem key={u._id} value={u._id} sx={{ fontSize: 11 }}>
                                  {u.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          variant={isPostDone ? "contained" : "outlined"}
                          color={isPostDone ? "info" : "inherit"}
                          size="small"
                          onClick={() => handleToggleStage(reelNum, "posted")}
                          startIcon={isPostDone ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                          sx={{ borderRadius: 4, minWidth: 100, textTransform: "none" }}
                        >
                          {isPostDone ? "Posted" : "Pending"}
                        </Button>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <TextField
                            size="small"
                            multiline
                            maxRows={3}
                            placeholder="Script Text / Draft"
                            value={currentInputs.scriptText || ""}
                            onChange={(e) => handleInputChange(reelNum, "scriptText", e.target.value)}
                            onBlur={() => handleSaveTextInputs(reelNum)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                          />
                          <TextField
                            size="small"
                            placeholder="Raw Footage Link (Google Drive)"
                            value={currentInputs.shootDataLink || ""}
                            onChange={(e) => handleInputChange(reelNum, "shootDataLink", e.target.value)}
                            onBlur={() => handleSaveTextInputs(reelNum)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                          />
                          <TextField
                            size="small"
                            placeholder="Edited Video Link (Drive)"
                            value={currentInputs.driveLink || ""}
                            onChange={(e) => handleInputChange(reelNum, "driveLink", e.target.value)}
                            onBlur={() => handleSaveTextInputs(reelNum)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                          />
                          <TextField
                            size="small"
                            placeholder="Instagram Link"
                            value={currentInputs.instagramLink || ""}
                            onChange={(e) => handleInputChange(reelNum, "instagramLink", e.target.value)}
                            onBlur={() => handleSaveTextInputs(reelNum)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="Save text/links">
                          <IconButton color="primary" onClick={() => handleSaveTextInputs(reelNum)}>
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {/* Success Popup */}
        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={2000}
          onClose={() => setToast("")}
          message={toast}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        />
      </Box>
    );
  }

  // --- View 1: Client Overview List ---
  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            🎬 Clients Reels Tracker Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            તમારા ક્લાયન્ટ્સના રીલ્સનું લાઈવ સ્ટેટસ અને પ્રોગ્રેસ અહિયાથી મેનેજ કરો.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => setQuickAddOpen(true)} 
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            ⚡ Quick Add Client (Editing/Shooting Only)
          </Button>
          <Button variant="contained" size="medium" onClick={fetchData} sx={{ borderRadius: 2 }}>
            Refresh Dashboard
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 2, mb: 4, borderRadius: 3, border: "1px solid #e5e7eb" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="ક્લાયન્ટ અથવા બિઝનેસનું નામ શોધો..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
            }
          }}
        />
      </Card>

      <Grid container spacing={3}>
        {filteredClients.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary", borderRadius: 3 }}>
              No clients found.
            </Paper>
          </Grid>
        ) : (
          filteredClients.map((client) => {
            const current = client.currentCycle;
            const target = current ? current.totalTarget : (client.monthlyTarget || 30);

            const scriptCount = current ? current.script || 0 : 0;
            const shootCount = current ? current.shoot || 0 : 0;
            const editCount = current ? current.edited || 0 : 0;
            const deliveredCount = current ? current.delivered || 0 : 0;

            return (
              <Grid item xs={12} md={6} lg={4} key={client._id}>
                <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 4, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={700} noWrap>
                          {client.businessName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Owner: {client.ownerName}
                        </Typography>
                        {client.isQuickClient && (
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                            <Chip 
                              label="Service Only" 
                              color="secondary" 
                              size="small" 
                              sx={{ height: 16, fontSize: 9.5, fontWeight: 700 }} 
                            />
                            <Chip 
                              label={client.quickServiceType || "Only Editing"} 
                              color={client.quickServiceType === "Only Editing" ? "warning" : "primary"}
                              variant="outlined"
                              size="small" 
                              sx={{ height: 16, fontSize: 9.5, fontWeight: 700 }} 
                            />
                          </Box>
                        )}
                        {current && current.carryOver > 0 && (
                          <Chip 
                            label={`Carry-over: +${current.carryOver}`} 
                            color="warning" 
                            size="small" 
                            sx={{ mt: 0.5, ml: client.isQuickClient ? 1 : 0, height: 16, fontSize: 9.5, fontWeight: 700 }} 
                          />
                        )}
                      </Box>
                      <Chip
                        label={client.status}
                        color={client.status === "active" ? "success" : "warning"}
                        size="small"
                        sx={{ fontWeight: 600, textTransform: "capitalize", borderRadius: 1.5 }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 3 }}>
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">Scripting</Typography>
                          <Typography variant="caption" fontWeight={700}>{scriptCount} / {target}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={(scriptCount / target) * 100} color="success" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>

                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">Shooting</Typography>
                          <Typography variant="caption" fontWeight={700}>{shootCount} / {target}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={(shootCount / target) * 100} color="secondary" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>

                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">Editing</Typography>
                          <Typography variant="caption" fontWeight={700}>{editCount} / {target}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={(editCount / target) * 100} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>

                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={600} color="text.secondary">Posted</Typography>
                          <Typography variant="caption" fontWeight={700}>{deliveredCount} / {target}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={(deliveredCount / target) * 100} color="info" sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenTracker(client)}
                      sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600, py: 1 }}
                    >
                      Open Reels Checklist
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Quick Add Client Dialog */}
      <Dialog 
        open={quickAddOpen} 
        onClose={() => setQuickAddOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          ⚡ Quick Add Service Client
        </DialogTitle>
        <DialogContent dividers>
          {quickAddError && (
            <Alert severity="error" sx={{ mb: 2 }}>{quickAddError}</Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Business / Client Name *"
              value={quickForm.businessName}
              onChange={(e) => setQuickForm({ ...quickForm, businessName: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Owner Name *"
              value={quickForm.ownerName}
              onChange={(e) => setQuickForm({ ...quickForm, ownerName: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Mobile Number *"
              value={quickForm.mobile}
              onChange={(e) => setQuickForm({ ...quickForm, mobile: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Service Type *</InputLabel>
              <Select
                value={quickForm.quickServiceType}
                label="Service Type *"
                onChange={(e) => setQuickForm({ ...quickForm, quickServiceType: e.target.value })}
              >
                <MenuItem value="Only Editing">Only Editing (ખાલી એડિટિંગ)</MenuItem>
                <MenuItem value="Shooting + Editing">Shooting + Editing (શૂટિંગ + એડિટિંગ)</MenuItem>
                <MenuItem value="Full Management">Full Management (આખું મેનેજમેન્ટ)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Monthly Target Reels *"
              type="number"
              value={quickForm.targetReels}
              onChange={(e) => setQuickForm({ ...quickForm, targetReels: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setQuickAddOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleQuickAddClient}>
            Add Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Popup */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2000}
        onClose={() => setToast("")}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
}
