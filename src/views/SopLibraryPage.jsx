import { useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material";
import BookIcon from "@mui/icons-material/MenuBook";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const SOPS = [
  {
    title: "📘 Client Onboarding SOP",
    summary: "Standard procedure to onboard new personal branding and content marketing clients.",
    content: `
### Purpose:
Establish operational clarity, alignment, and set up brand details within 24 hours of contract signature.

### Steps:
1. **Assign Account Manager**: Founder assigns a dedicated Account Manager (AM) to the client.
2. **Send Onboarding Link**: AM copies the unique Onboarding Form link from the client detail page and sends it via WhatsApp.
3. **Internal Setup**: AM creates a personal workspace slot for the client in the dashboard.
4. **Onboarding Form Review**: Review the submitted goal (Authority, Sales, Hybrid), colors, brand colors, competitor profiles, and tone of voice.
5. **Initial Alignment Call**: Schedule a 15-minute call to align on expectations and lock the Content Strategy deadline.
    `
  },
  {
    title: "📘 Strategy SOP",
    summary: "SOP for developing high-impact content strategy and locking down monthly topics.",
    content: `
### Purpose:
"No Strategy = No Content". Define target metrics, client goals, and content pillars for the upcoming cycle.

### Steps:
1. **Research & Analysis**: Strategist analyzes the target audience, competitors, and offer.
2. **Define Pillars**: Lock down 3 core content pillars matching the client's goal (e.g. Sales, Trust, Authority).
3. **Draft 15 Reel Topics**: Write down 15 hook-driven topic concepts matching the client's style.
4. **Strategy Review**: Submit the Strategy to the founder or manager for review.
5. **Client Approval**: Send the approved strategy to the client for final sign-off.
    `
  },
  {
    title: "📘 Content SOP",
    summary: "Writing scripts and outlines for hook-driven short-form reels.",
    content: `
### Purpose:
Create engaging short-form video scripts that optimize for retention, views, and action.

### Rules:
* Every Reel must have only one goal: **Authority**, **Trust**, **Sales**, or **Awareness**.
* Script must have a strong hook (first 3 seconds), body, and a clear call-to-action (CTA).

### Steps:
1. AM moves task from **Idea** to **Script** stage.
2. Writer drafts the script according to the approved strategy topic.
3. Lock script into the content description.
4. Once script is ready, move the task to **Shoot** stage.
    `
  },
  {
    title: "📘 Shoot SOP",
    summary: "Scheduling and executing efficient and high-quality client video shoots.",
    content: `
### Purpose:
"No Approved Script = No Shoot". Ensure high-quality audio and video capture with zero time wasted.

### Steps:
1. **Script Validation**: Ensure all scripts are fully approved before scheduling the shoot slot.
2. **Slot Allocation**: Schedule the client using the Shoot Scheduler.
3. **Shoot Preparation**: AM sends script guides and clothing instructions to the client.
4. **Execution**: Shooters record the video ensuring crisp audio, correct lighting, and clear eye contact.
5. **Upload Raw Footage**: Immediately upload raw files to Google Drive, paste the link in the task's Drive Link property, and move the stage to **Edit**.
    `
  },
  {
    title: "📘 Editing SOP",
    summary: "Video editing guidelines for maximum retention, pacing, and brand styling.",
    content: `
### Purpose:
Edit reels for fast pacing, clear messaging, premium typography, and matching sound design.

### Guidelines:
* Cut out pauses and filler words.
* Add clean, legible captions using brand colors.
* Integrate visual hooks, B-rolls, and zoom-in effects every 2-3 seconds.

### Steps:
1. Editor downloads raw footage from the Drive Link.
2. Drafts the edit and uploads the version to Google Drive.
3. Pastes the edited link as the **Drive Link** in the task card.
4. Moves the task stage from **Edit** to **QC**.
    `
  },
  {
    title: "📘 QC SOP",
    summary: "Quality Control procedures to ensure zero errors in spelling, grammar, and video flow.",
    content: `
### Purpose:
"No QC = No Client Delivery". Guarantee error-free, premium quality content before client review.

### Checklist:
* **Spelling**: Double-check all caption text for grammatical or spelling errors.
* **Audio**: Ensure audio levels are consistent and background music is not overpowering.
* **Branding**: Confirm logo, color palette, and thumbnails match the brand book.

### Steps:
1. QC manager reviews the video from the Drive Link.
2. If errors are found, move back to **Edit** with notes.
3. If approved, move task to **Client Approval** stage.
    `
  },
  {
    title: "📘 Client Communication SOP",
    summary: "Standard communication templates and response procedures for client relationships.",
    content: `
### Purpose:
Establish premium, clear, and proactive communication. Protect client satisfaction and speed up feedback.

### Rules:
* Always communicate professionally and politely.
* Send content approval reminders proactively.
* Notify the team immediately if a client requests changes or rejects content.

### Steps:
1. When content is moved to **Client Approval**, AM sends the approval link to the client via WhatsApp.
2. Proactively follow up if approval is pending for more than 24 hours.
3. Once the client approves, update status to posted when scheduled.
    `
  }
];

export default function SopLibraryPage() {
  const [selectedSop, setSelectedSop] = useState(null);

  const handleOpenSop = (sop) => {
    setSelectedSop(sop);
  };

  const handleCloseSop = () => {
    setSelectedSop(null);
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          📘 Standard Operating Procedures (SOPs)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Zero confusion, fast execution. Standard guidelines for all departments in SocialFlips.
        </Typography>
      </Box>

      {/* Grid of SOPs */}
      <Grid container spacing={3}>
        {SOPS.map((sop, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid #e5e7eb", "&:hover": { boxShadow: 4 } }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <BookIcon sx={{ color: "primary.main" }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    {sop.title.replace("📘 ", "")}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {sop.summary}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleOpenSop(sop)}
                >
                  View SOP Procedure
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SOP Content Dialog */}
      <Dialog 
        open={Boolean(selectedSop)} 
        onClose={handleCloseSop} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {selectedSop?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ whiteSpace: "pre-wrap", typography: "body2", color: "text.primary", "& h3": { fontWeight: 700, color: "primary.main", mt: 2, mb: 1 }, "& ul": { pl: 2, mb: 1 } }}>
            {selectedSop?.content}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSop} variant="contained" size="small">
            Got it, Understood!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
