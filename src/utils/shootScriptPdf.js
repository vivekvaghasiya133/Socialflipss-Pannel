/**
 * SocialFlipss Agency OS - Shoot Script Docket & PDF Generator
 * Clean, dynamic, and free of dummy placeholders.
 * Only renders sections that actually contain user-entered data!
 */

export function generateShootScriptPdf(tasks, customClient = null) {
  if (!tasks || (Array.isArray(tasks) && tasks.length === 0)) {
    alert("No reel scripts available to generate PDF.");
    return;
  }

  const taskList = Array.isArray(tasks) ? tasks : [tasks];
  const primaryTask = taskList[0];
  const client = customClient || primaryTask.client || {};

  const clientName = client.businessName || "Client Shoot";
  const ownerName = client.ownerName || "";
  const mobile = client.mobile || "";
  const shootDate = primaryTask.shootDate || "Scheduled Date";
  const shootTime = primaryTask.shootTime || "Time TBD";
  const location = primaryTask.location || "Client Store";
  const shooterName = primaryTask.shooter?.name || primaryTask.shooterId?.name || (typeof primaryTask.shooter === "string" ? primaryTask.shooter : "Vivek");
  const totalReels = taskList.length;

  const printWin = window.open("", "_blank");
  if (!printWin) {
    alert("Popup blocked! Please allow popups for localhost to print / save as PDF.");
    return;
  }

  const seenNumbers = new Set();
  const reelsHtml = taskList
    .map((task, index) => {
      let reelNumber = task.reelNumber || index + 1;
      if (seenNumbers.has(reelNumber)) {
        reelNumber = index + 1;
      }
      seenNumbers.add(reelNumber);
      let cleanTitle = (task.title || `Reel #${reelNumber}`).trim();
      cleanTitle = cleanTitle.replace(/^Reel\s*#?\d+\s*:\s*/i, "");
      const title = cleanTitle || `Reel #${reelNumber}`;
      const goal = task.goal || "Authority";
      const writerName = task.writer?.name || "Content Team";

      const hookText = task.hook ? task.hook.trim() : "";
      const conceptText = task.concept ? task.concept.trim() : "";
      const bodyText = task.bodyText ? task.bodyText.trim() : "";
      const ctaText = task.cta ? task.cta.trim() : "";
      const notesText = task.shootNote ? task.shootNote.trim() : "";

      const hasHook = Boolean(hookText);
      const hasConcept = Boolean(conceptText);
      const hasBody = Boolean(bodyText);
      const hasCta = Boolean(ctaText);
      const hasNotes = Boolean(notesText);

      // Section HTML builder: Only show sections that have actual content!
      let contentHtml = "";

      if (!hasBody && hasHook && !hasConcept) {
        // Simple / Quick workflow: User entered script/hook in one place
        contentHtml += `
          <div class="section-box script-box">
            <div class="section-label">
              <span>📜 SCRIPT / HOOK & CONCEPT</span>
            </div>
            <div class="script-body">
              ${hookText.replace(/\n/g, "<br/>")}
            </div>
          </div>
        `;
      } else {
        // Detailed workflow: Separate hook, concept, body, etc.
        if (hasHook) {
          contentHtml += `
            <div class="section-box hook-box">
              <div class="section-label">
                <span>🪝 OPENING HOOK (FIRST 3 SECONDS)</span>
              </div>
              <p class="hook-text">"${hookText}"</p>
            </div>
          `;
        }

        if (hasConcept) {
          contentHtml += `
            <div class="section-box concept-box">
              <div class="section-label">
                <span>🎬 VISUAL CONCEPT & DIRECTION</span>
              </div>
              <p class="concept-text">${conceptText}</p>
            </div>
          `;
        }

        if (hasBody) {
          contentHtml += `
            <div class="section-box script-box">
              <div class="section-label">
                <span>📜 SPOKEN DIALOGUE / SCRIPT BODY</span>
              </div>
              <div class="script-body">
                ${bodyText.replace(/\n/g, "<br/>")}
              </div>
            </div>
          `;
        }
      }

      if (hasCta) {
        contentHtml += `
          <div class="section-box cta-box">
            <div class="section-label">
              <span>🎯 CALL TO ACTION (CTA)</span>
            </div>
            <p class="cta-text">"${ctaText}"</p>
          </div>
        `;
      }

      if (hasNotes) {
        contentHtml += `
          <div class="section-box notes-box">
            <div class="section-label">
              <span>📝 SHOOT NOTES / PROPS</span>
            </div>
            <p class="notes-text">${notesText}</p>
          </div>
        `;
      }

      // If absolutely nothing was provided
      if (!contentHtml) {
        contentHtml = `
          <div class="section-box script-box empty">
            <p class="empty-note" style="color:#94a3b8;font-size:12px;font-style:italic;">No script text or hook provided yet.</p>
          </div>
        `;
      }

      return `
        <div class="reel-card">
          <div class="reel-header">
            <div class="reel-title-box">
              <span class="reel-badge">REEL #${reelNumber}</span>
              <h2 class="reel-title">${title}</h2>
            </div>
            <div class="reel-meta-badges">
              <span class="meta-tag goal-${goal.toLowerCase()}">${goal} Goal</span>
              <span class="meta-tag writer-tag">✍️ ${writerName}</span>
            </div>
          </div>

          <!-- Dynamic Sections (No empty placeholders!) -->
          ${contentHtml}

          <!-- On-set Shooter Checklist -->
          <div class="on-set-checklist">
            <div class="checklist-title">SHOOTER VERIFICATION:</div>
            <div class="checklist-items">
              <label><span class="checkbox"></span> Mic/Audio</label>
              <label><span class="checkbox"></span> Lighting/4K</label>
              <label><span class="checkbox"></span> A-Roll Done</label>
              <label><span class="checkbox"></span> B-Roll Done</label>
              <div class="takes-input">Takes: _________</div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${clientName} — Shoot Script Docket (${totalReels} Reels)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 24px;
      line-height: 1.5;
    }

    .docket-container {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 32px 36px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
    }

    /* Print Header Bar */
    .brand-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #FF5200;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
    }

    .brand-subtitle {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #FF5200;
    }

    .doc-badge {
      background: #fff7ed;
      border: 1px solid #ffedd5;
      color: #c2410c;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Client & Shoot Metadata Grid */
    .shoot-overview-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 28px;
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 16px;
    }

    .meta-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }

    .meta-val {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }

    .meta-val.highlight {
      color: #FF5200;
      font-size: 14px;
    }

    .meta-val.accent {
      color: #059669;
    }

    /* Reel Card */
    .reel-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }

    .reel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 12px;
    }

    .reel-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .reel-badge {
      background: #FF5200;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }

    .reel-title {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.3px;
    }

    .reel-meta-badges {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .meta-tag {
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      border: 1px solid transparent;
    }

    .goal-authority { background: #f5f3ff; color: #6d28d9; border-color: #ddd6fe; }
    .goal-sales { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .goal-trust { background: #ecfeff; color: #0e7490; border-color: #cffafe; }
    .goal-viral { background: #fffbeb; color: #b45309; border-color: #fde68a; }
    .writer-tag { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

    /* Section Boxes */
    .section-box {
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 12px;
    }

    .section-label {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Hook */
    .hook-box {
      background: #fef2f2;
      border: 1.5px solid #fee2e2;
    }
    .hook-box .section-label { color: #b91c1c; }
    .hook-text {
      font-size: 14.5px;
      font-weight: 800;
      color: #991b1b;
      font-style: italic;
      line-height: 1.5;
    }

    /* Concept */
    .concept-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .concept-box .section-label { color: #475569; }
    .concept-text {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      line-height: 1.5;
    }

    /* Script */
    .script-box {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
    }
    .script-box .section-label { color: #0f172a; }
    .script-body {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.65;
      white-space: pre-line;
    }

    /* CTA */
    .cta-box {
      background: #f0fdf4;
      border: 1px solid #dcfce7;
    }
    .cta-box .section-label { color: #15803d; }
    .cta-text {
      font-size: 13px;
      font-weight: 700;
      color: #166534;
    }

    /* Notes */
    .notes-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
    }
    .notes-box .section-label { color: #b45309; }
    .notes-text {
      font-size: 12px;
      font-weight: 600;
      color: #92400e;
    }

    /* Checklist */
    .on-set-checklist {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .checklist-title {
      font-size: 10px;
      font-weight: 900;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .checklist-items {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 11px;
      font-weight: 700;
      color: #334155;
    }

    .checklist-items label {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .checkbox {
      width: 14px;
      height: 14px;
      border: 1.5px solid #94a3b8;
      border-radius: 4px;
      display: inline-block;
    }

    .takes-input {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
    }

    /* Footer */
    .docket-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
    }

    /* Print Specific Styling */
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .docket-container {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .reel-card {
        page-break-inside: avoid;
        border-color: #cbd5e1;
      }
      .action-buttons {
        display: none !important;
      }
    }

    /* Screen Action Bar */
    .action-buttons {
      position: sticky;
      top: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 20px;
      z-index: 100;
    }

    .btn {
      padding: 10px 18px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-print {
      background: #FF5200;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(255, 82, 0, 0.3);
    }
    .btn-print:hover {
      background: #e04800;
    }

    .btn-close {
      background: #e2e8f0;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="action-buttons">
    <button class="btn btn-close" onclick="window.close()">✕ Close</button>
    <button class="btn btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="docket-container">
    <!-- Header -->
    <div class="brand-bar">
      <div class="brand-logo-group">
        <div>
          <div class="brand-title">SocialFlipss Agency OS</div>
          <div class="brand-subtitle">Production & Shoot Script Docket</div>
        </div>
      </div>
      <div class="doc-badge">
        🎯 ${totalReels} ${totalReels === 1 ? "Reel" : "Reels"} Scheduled
      </div>
    </div>

    <!-- Shoot Overview -->
    <div class="shoot-overview-card">
      <div class="meta-group">
        <span class="meta-label">Client / Business</span>
        <span class="meta-val highlight">🏢 ${clientName}</span>
        ${ownerName || mobile ? `<span style="font-size:11px;color:#64748b;font-weight:600;">${ownerName} · 📞 ${mobile}</span>` : ""}
      </div>
      <div class="meta-group">
        <span class="meta-label">Shoot Session</span>
        <span class="meta-val">📅 ${shootDate}</span>
        <span style="font-size:11px;color:#64748b;font-weight:600;">⏰ ${shootTime}</span>
      </div>
      <div class="meta-group">
        <span class="meta-label">Assigned Shooter</span>
        <span class="meta-val accent">🎥 ${shooterName}</span>
        <span style="font-size:11px;color:#64748b;font-weight:600;">📍 ${location}</span>
      </div>
    </div>

    <!-- Reels List -->
    <div class="reels-container">
      ${reelsHtml}
    </div>

    <!-- Footer -->
    <div class="docket-footer">
      <span>Generated via SocialFlipss Agency OS · ${new Date().toLocaleString("en-IN")}</span>
      <span>Confidential On-Set Production Document</span>
    </div>
  </div>

  <script>
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {}
    }, 600);
  </script>
</body>
</html>`;

  printWin.document.open();
  printWin.document.write(fullHtml);
  printWin.document.close();
}
