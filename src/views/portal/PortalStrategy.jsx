import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, Grid, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Snackbar, CircularProgress,
  Divider, Paper, Collapse
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getPortalStrategy, reviewPortalStrategyTopic } from "../../api/portalApi";

const STATUS_CHIPS = {
  Draft:             { label: "Draft", color: "default" },
  Review:            { label: "Awaiting Review", color: "info" },
  Approved:          { label: "Approved ✓", color: "success" },
  "Changes Requested": { label: "Revision Requested", color: "warning" }
};

export default function PortalStrategy() {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState("");
  
  // Expand states for each topic (by index)
  const [expandedTopics, setExpandedTopics] = useState({});

  // Review Dialog State
  const [reviewTopic, setReviewTopic]       = useState(null);
  const [reviewStatus, setReviewStatus]     = useState(""); // "Approved" | "Changes Requested"
  const [feedback, setFeedback]             = useState("");
  const [submitting, setSubmitting]         = useState(false);

  const loadStrategy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPortalStrategy();
      setStrategy(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setStrategy(null);
      } else {
        setError("Failed to load strategy details. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategy();
  }, []);

  const toggleExpand = (idx) => {
    setExpandedTopics(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const openReviewDialog = (topic, status) => {
    setReviewTopic(topic);
    setReviewStatus(status);
    setFeedback("");
  };

  const handleReviewSubmit = async () => {
    if (reviewStatus === "Changes Requested" && !feedback.trim()) {
      setError("Please specify what changes you would like us to make.");
      return;
    }
    
    setSubmitting(true);
    setError("");
    try {
      await reviewPortalStrategyTopic(strategy._id, reviewTopic._id, {
        status: reviewStatus,
        feedback: reviewStatus === "Approved" ? "" : feedback
      });
      setToast(reviewStatus === "Approved" ? "Topic Approved! Script will be prepared shortly. ✅" : "Changes requested.");
      setReviewTopic(null);
      loadStrategy();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update review status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!strategy) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>🎯 Monthly Strategy</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>Review goals, pillars, and reels outlines</Typography>
        <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>No Monthly Strategy Found</Typography>
            <Typography variant="body2" color="text.secondary">
              Our strategy team is currently working on your onboarding strategy or upcoming monthly cycle. Once it is ready for your review, it will appear here. Please check back soon!
            </Typography>
          </Box>
        </Card>
      </Box>
    );
  }

  const approvedCount = (strategy.reelTopics || []).filter(t => t.status === "Approved").length;
  const totalCount = (strategy.reelTopics || []).length;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🎯 Monthly Strategy — {strategy.month}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Strategist: <strong>{strategy.strategist?.name || "Assigning..."}</strong>
          </Typography>
        </Box>
        {totalCount > 0 && (
          <Chip
            label={`Progress: ${approvedCount}/${totalCount} Approved`}
            color={approvedCount === totalCount ? "success" : "info"}
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Core Parameters Overview */}
        <Grid item xs={12}>
          <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3, background: "linear-gradient(135deg, #18181b, #27272a)", color: "#fff" }}>
              <Typography variant="h6" fontWeight={700}>Strategic Overview</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Core objectives and branding parameters for this monthly cycle
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>Business Goal</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {strategy.businessGoal || "No specific business goal set."}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>Target Audience</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {strategy.targetAudience || "No specific target audience defined."}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>Content Pillars</Typography>
                  <Box sx={{ whiteSpace: "pre-line", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {strategy.contentPillars || "No pillars configured."}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>Execution Notes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {strategy.monthlyPlan || "No monthly execution summary available."}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Reel Topics Grid */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LightbulbIcon color="primary" /> Reel Concept Review ({totalCount} slots)
          </Typography>
          <Grid container spacing={2}>
            {(strategy.reelTopics || []).map((topic, idx) => {
              const chip = STATUS_CHIPS[topic.status] || STATUS_CHIPS.Draft;
              const isExpanded = expandedTopics[idx];
              const awaitingReview = topic.status !== "Approved";

              return (
                <Grid item xs={12} key={topic._id || idx}>
                  <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 2.5, transition: "box-shadow 0.2s", "&:hover": { boxShadow: 2 } }}>
                    <Box 
                      sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, cursor: "pointer" }}
                      onClick={() => toggleExpand(idx)}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ minWidth: 28, height: 28, borderRadius: "50%", bgcolor: "primary.light", color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                          {idx + 1}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {topic.title || "Concept Under Development"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Chip label={chip.label} color={chip.color} size="small" sx={{ fontWeight: 700, fontSize: 10 }} />
                        {isExpanded ? <ExpandLessIcon color="action" /> : <ExpandMoreIcon color="action" />}
                      </Box>
                    </Box>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Divider />
                      <Box sx={{ p: 2.5, bgcolor: "#fcfdff" }}>
                        <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>Concept Brief / Angle:</Typography>
                        <Typography variant="body2" color="text.secondary" mb={3} sx={{ whiteSpace: "pre-line" }}>
                          {topic.brief || "No brief outline provided yet."}
                        </Typography>

                        {/* Client Actions */}
                        {awaitingReview && (
                          <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => openReviewDialog(topic, "Approved")}
                            >
                              Approve Concept
                            </Button>
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => openReviewDialog(topic, "Changes Requested")}
                            >
                              Request Changes
                            </Button>
                          </Box>
                        )}

                        {topic.status === "Approved" && (
                          <Alert severity="success" icon={<CheckIcon fontSize="inherit" />} sx={{ mt: 1 }}>
                            <strong>Approved!</strong> Scriptwriting is in progress for this concept.
                          </Alert>
                        )}

                        {topic.status === "Changes Requested" && (
                          <Box sx={{ mt: 1.5, p: 2, bgcolor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="warning.dark" fontWeight={700} mb={0.5}>
                              💬 Your Feedback submitted:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {topic.feedback}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog open={Boolean(reviewTopic)} onClose={() => setReviewTopic(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {reviewStatus === "Approved" ? "✅ Approve Concept" : "🔄 Request Changes"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>Topic: {reviewTopic?.title}</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {reviewStatus === "Approved" 
              ? "By approving, the concept will move to the scripting phase. The scripting team will draft the full script outline."
              : "Let the creative team know what changes, hooks, or topics you want to adjust in this brief."}
          </Typography>

          {reviewStatus === "Changes Requested" && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Revisions Requested"
              placeholder="e.g. Include our new product hook, change the topic angle to..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReviewTopic(null)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            color={reviewStatus === "Approved" ? "success" : "warning"}
            onClick={handleReviewSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : reviewStatus === "Approved" ? "Confirm Approve" : "Request Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
