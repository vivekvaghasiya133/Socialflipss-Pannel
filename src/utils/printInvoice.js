export function printInvoice(inv) {
  if (!inv) return;
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups to print invoices.");
    return;
  }

  const logoUrl = window.location.origin + "/logo.jpg";
  const rows = (inv.items || []).map((i) => `
    <tr>
      <td class="item-desc">${i.description || 'Reel / Production Service'}</td>
      <td style="text-align:center">${i.quantity || 1}</td>
      <td style="text-align:right">₹${Number(i.rate || 0).toLocaleString("en-IN")}</td>
      <td style="text-align:right;font-weight:600">₹${Number(i.amount || 0).toLocaleString("en-IN")}</td>
    </tr>`).join("");

  const issueDateStr = inv.issueDate
    ? new Date(inv.issueDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });

  const dueDateStr = inv.dueDate
    ? new Date(inv.dueDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
    : "";

  const clientBiz = inv.clientId?.businessName || inv.clientBusiness || inv.agencyId?.businessName || "Client / Agency";
  const clientOwner = inv.clientId?.ownerName || inv.clientName || inv.agencyId?.ownerName || "";
  const clientPhone = inv.clientId?.mobile || inv.clientMobile || inv.agencyId?.mobile || "";
  const clientMail = inv.clientId?.email || inv.clientEmail || inv.agencyId?.email || "";
  const clientCity = inv.clientId?.city || inv.clientCity || inv.agencyId?.city || "Surat";

  const subtotal = Number(inv.subtotal || 0);
  const discount = Number(inv.discount || 0);
  const gstAmount = Number(inv.gstAmount || 0);
  const gstPercent = Number(inv.gstPercent || 0);
  const totalAmount = Number(inv.totalAmount || 0);
  const paidAmount = Number(inv.paidAmount || 0);
  const pendingAmount = Number(inv.pendingAmount !== undefined ? inv.pendingAmount : Math.max(0, totalAmount - paidAmount));

  win.document.write(`<!DOCTYPE html><html><head>
    <title>Invoice - ${inv.invoiceNumber}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
      body { padding: 40px; color: #1f2937; background: #fff; line-height: 1.5; font-size: 13px; }
      
      .top-bar { height: 6px; background: linear-gradient(90deg, #7c3aed, #5b21b6); margin: -40px -40px 30px -40px; }
      
      .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; margin-bottom: 30px; }
      .logo-container img { height: 65px; object-fit: contain; }
      
      .invoice-meta { text-align: right; }
      .invoice-title { font-size: 26px; font-weight: 800; color: #5b21b6; letter-spacing: -0.02em; margin-bottom: 5px; }
      .invoice-number { font-family: monospace; font-size: 15px; font-weight: 700; color: #4b5563; }
      
      .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 35px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 20px 0; }
      .details-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 8px; font-weight: 700; }
      .company-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
      .client-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
      .info-text { color: #4b5563; margin-bottom: 2px; }
      
      .dates-box { display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; }
      .date-row { display: flex; justify-content: space-between; width: 220px; margin-bottom: 6px; }
      .date-label { color: #6b7280; font-weight: 500; }
      .date-value { font-weight: 600; color: #1f2937; }

      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #e5e7eb; }
      th:last-child, th:nth-child(3), th:nth-child(2) { text-align: right; }
      td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 13px; }
      td:last-child, td:nth-child(3), td:nth-child(2) { text-align: right; }
      .item-desc { font-weight: 500; color: #111827; }
      
      .summary-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; margin-bottom: 40px; align-items: start; }
      
      .payment-instructions { background: #f9fafb; border-radius: 8px; padding: 16px; border: 1px dashed #d1d5db; }
      .payment-instructions h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #374151; margin-bottom: 8px; letter-spacing: 0.02em; }
      .payment-row { display: flex; margin-bottom: 4px; font-size: 12px; }
      .payment-label { color: #6b7280; width: 100px; font-weight: 500; }
      .payment-value { color: #1f2937; font-weight: 600; }

      .totals-box { margin-left: auto; width: 100%; }
      .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4b5563; }
      .total-row.final { border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: 800; color: #5b21b6; }
      .total-row.paid { color: #0e9f6e; font-weight: 600; }
      .total-row.balance { background: #fee2e2; border-radius: 6px; padding: 8px 12px; margin-top: 6px; font-weight: 700; color: #b91c1c; }

      .footer-section { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 25px; }
      .terms-box h4 { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 6px; }
      .terms-text { color: #6b7280; font-size: 11px; line-height: 1.6; }
      
      .signature-box { text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; }
      .signature-line { width: 180px; border-bottom: 1px solid #9ca3af; margin-bottom: 8px; margin-top: 60px; }
      .signature-title { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

      @media print {
        body { padding: 20px 0; }
        .top-bar { margin: -20px 0 20px 0; }
        .payment-instructions { background: none; border: 1px solid #e5e7eb; page-break-inside: avoid; }
        .footer-section { page-break-inside: avoid; }
      }
    </style></head><body>
    <div class="top-bar"></div>
    
    <div class="header-grid">
      <div class="logo-container">
        <img src="${logoUrl}" alt="SocialFlipss Logo" />
        <div style="font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Flip The Game</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-number">NO: ${inv.invoiceNumber}</div>
      </div>
    </div>

    <div class="details-grid">
      <div class="details-box">
        <h3>Billed To</h3>
        <div class="client-name">${clientBiz}</div>
        ${clientOwner ? `<div class="info-text">Attn: ${clientOwner}</div>` : ""}
        ${clientPhone ? `<div class="info-text">Phone: +91 ${clientPhone}</div>` : ""}
        ${clientMail ? `<div class="info-text">Email: ${clientMail}</div>` : ""}
        ${clientCity ? `<div class="info-text">City: ${clientCity}</div>` : ""}
      </div>
      
      <div class="details-box" style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
        <h3>Billed From</h3>
        <div class="company-name">SocialFlipss</div>
        <div class="info-text">Digital Marketing Agency</div>
        <div class="info-text">Surat, Gujarat, India</div>
        <div class="info-text">Email: socialflipsswork@gmail.com</div>
        <div class="info-text">Phone: +91 76006 00816</div>
        <div class="info-text">Contact: +91 80001 33106</div>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: -20px; margin-bottom: 25px;">
      <div class="dates-box">
        <div class="date-row">
          <span class="date-label">Invoice Date:</span>
          <span class="date-value">${issueDateStr}</span>
        </div>
        ${dueDateStr ? `
        <div class="date-row">
          <span class="date-label">Due Date:</span>
          <span class="date-value">${dueDateStr}</span>
        </div>` : ""}
        ${inv.month ? `
        <div class="date-row">
          <span class="date-label">Billing Period:</span>
          <span class="date-value">${inv.month}</span>
        </div>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Description</th>
          <th style="text-align: center; width: 15%;">Quantity</th>
          <th style="text-align: right; width: 15%;">Rate</th>
          <th style="text-align: right; width: 20%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="summary-grid">
      <div class="payment-instructions">
        <h4>Payment Information</h4>
        <div class="payment-row">
          <span class="payment-label">UPI ID:</span>
          <span class="payment-value">vivekvaghasiya133-1@oksbi</span>
        </div>
        <div class="payment-row" style="margin-top: 8px;">
          <span class="payment-label">Bank Name:</span>
          <span class="payment-value">SBI Bank</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">Account No:</span>
          <span class="payment-value">43591183670</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">IFSC Code:</span>
          <span class="payment-value">SBIN0064547</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">Contact:</span>
          <span class="payment-value">8000133106</span>
        </div>
      </div>
      
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span>₹${subtotal.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>
        ${discount > 0 ? `
        <div class="total-row">
          <span>Discount</span>
          <span>−₹${discount.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>` : ""}
        ${gstAmount > 0 ? `
        <div class="total-row">
          <span>GST (${gstPercent}%)</span>
          <span>₹${gstAmount.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>` : ""}
        <div class="total-row final">
          <span>Total</span>
          <span>₹${totalAmount.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>
        <div class="total-row paid">
          <span>Amount Paid</span>
          <span>₹${paidAmount.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>
        ${pendingAmount > 0 ? `
        <div class="total-row balance">
          <span>Balance Due</span>
          <span>₹${pendingAmount.toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>` : ""}
      </div>
    </div>

    <div class="footer-section">
      <div class="terms-box">
        <h4>Terms & Conditions</h4>
        <p class="terms-text">1. 50% advance payment required before work.</p>
        <p class="terms-text">2. Remaining 50% to be paid on final delivery.</p>
        <p class="terms-text">3. Cancellation 48 hrs before — full refund.</p>
        <p class="terms-text">4. Content rights belong to Social Flipss until full payment.</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-title">Authorized Signatory</div>
        <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">SocialFlipss Digital Marketing</div>
      </div>
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(() => {
    try { win.print(); } catch (e) {}
  }, 500);
}

export default printInvoice;
