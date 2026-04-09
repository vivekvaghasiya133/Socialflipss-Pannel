import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Grid,
} from "@mui/material";
import DownloadIcon    from "@mui/icons-material/Download";
import VisibilityIcon  from "@mui/icons-material/Visibility";
import { getAttendanceSummary, getSalarySlip } from "../api/hrApi";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function monthOptions() {
  const opts = [];
  const now  = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({
      value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,
      label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    });
  }
  return opts;
}

function SlipRow({ label, value, bold, color }) {
  return (
    <Box sx={{ display:"flex", justifyContent:"space-between", py:0.75, borderBottom:"0.5px solid #f3f4f6" }}>
      <Typography variant="body2" color={color || "text.secondary"}>{label}</Typography>
      <Typography variant="body2" fontWeight={bold ? 700 : 400} color={color || "text.primary"}>{value}</Typography>
    </Box>
  );
}

function printSlip(slip, monthLabel) {
  const win = window.open("", "_blank");
  const deductionColor = slip.deduction > 0 ? "#e02424" : "#6b7280";
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>Salary Slip — ${slip.staff.name}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #111; font-size:14px; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; border-bottom:2px solid #1a56db; padding-bottom:16px; }
      .brand { font-size:22px; font-weight:700; color:#1a56db; }
      .brand-sub { font-size:12px; color:#6b7280; margin-top:2px; }
      h2 { font-size:16px; font-weight:600; margin-bottom:4px; }
      .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; background:#f9fafb; padding:16px; border-radius:8px; }
      .info-item label { font-size:11px; color:#6b7280; display:block; margin-bottom:2px; }
      .info-item span  { font-size:14px; font-weight:500; }
      table { width:100%; border-collapse:collapse; margin-bottom:24px; }
      th { background:#f3f4f6; text-align:left; padding:8px 12px; font-size:12px; color:#6b7280; font-weight:600; }
      td { padding:8px 12px; border-bottom:1px solid #f3f4f6; font-size:13px; }
      .total-row td { font-weight:700; font-size:15px; border-top:2px solid #1a56db; padding-top:12px; }
      .deduct { color:${deductionColor}; }
      .net { color:#0e9f6e; font-size:18px; }
      .footer { text-align:center; color:#9ca3af; font-size:11px; margin-top:32px; border-top:1px solid #e5e7eb; padding-top:16px; }
      @media print { body { padding:20px; } }
    </style></head><body>
    <div class="header">
      <div>
        <div class="brand">SocialFlipss</div>
        <div class="brand-sub">Digital Marketing Agency</div>
      </div>
      <div style="text-align:right">
        <h2>Salary Slip</h2>
        <div style="color:#6b7280;font-size:13px">${monthLabel}</div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-item"><label>Employee Name</label><span>${slip.staff.name}</span></div>
      <div class="info-item"><label>Position</label><span>${slip.staff.position}</span></div>
      <div class="info-item"><label>Joining Date</label><span>${slip.staff.joiningDate ? new Date(slip.staff.joiningDate).toLocaleDateString("en-IN") : "—"}</span></div>
      <div class="info-item"><label>Salary Month</label><span>${monthLabel}</span></div>
    </div>
    <table>
      <tr><th>Attendance Summary</th><th>Days</th></tr>
      <tr><td>Present</td><td>${slip.present}</td></tr>
      <tr><td>Half Day</td><td>${slip.halfDay} (= ${slip.halfDay * 0.5} days)</td></tr>
      <tr><td>Leave (Approved)</td><td>${slip.leave}</td></tr>
      <tr><td>Holiday</td><td>${slip.holiday}</td></tr>
      <tr><td class="deduct">Absent</td><td class="deduct">${slip.absent}</td></tr>
    </table>
    <table>
      <tr><th>Earnings / Deductions</th><th>Amount (₹)</th></tr>
      <tr><td>Gross Monthly Salary</td><td>₹${Number(slip.staff.salary).toLocaleString("en-IN")}</td></tr>
      <tr><td>Per Day Rate (÷26)</td><td>₹${Number(slip.perDay).toFixed(2)}</td></tr>
      <tr><td class="deduct">Deduction (${slip.deductDays} days × ₹${Number(slip.perDay).toFixed(2)})</td><td class="deduct">− ₹${Number(slip.deduction).toLocaleString("en-IN")}</td></tr>
      <tr class="total-row"><td class="net">Net Salary Payable</td><td class="net">₹${Number(slip.netSalary).toLocaleString("en-IN")}</td></tr>
    </table>
    <div class="footer">
      This is a system-generated salary slip. · SocialFlipss · Ahmedabad, Gujarat
    </div>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>
  `);
  win.document.close();
}

export default function SalaryPage() {
  const opts    = monthOptions();
  const [month, setMonth]   = useState(opts[0].value);
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [slipDialog, setSlipDialog] = useState(null); // { slip, monthLabel }
  const [slipLoading, setSlipLoading] = useState(false);

  const load = () => {
    setLoading(true); setError("");
    getAttendanceSummary(month)
      .then((r) => setData(r.data))
      .catch(() => setError("Summary load failed."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [month]);

  const openSlip = async (staffId) => {
    setSlipLoading(true);
    const monthLabel = opts.find((o) => o.value === month)?.label || month;
    try {
      const r = await getSalarySlip(staffId, month);
      setSlipDialog({ slip: r.data, monthLabel });
    } catch {
      setError("Slip load failed.");
    } finally {
      setSlipLoading(false);
    }
  };

  const totalGross  = data.reduce((s, d) => s + d.salary, 0);
  const totalNet    = data.reduce((s, d) => s + d.netSalary, 0);
  const totalDeduct = data.reduce((s, d) => s + d.deduction, 0);

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5">Salary Summary</Typography>
          <Typography variant="body2" color="text.secondary">26 working days base — absent/half day auto deduction</Typography>
        </Box>
        <Box sx={{ display:"flex", gap:1.5, alignItems:"center" }}>
          <select
            value={month} onChange={(e) => setMonth(e.target.value)}
            style={{ padding:"8px 12px", borderRadius:8, border:"1px solid #d1d5db", fontSize:14, fontFamily:"inherit", background:"#fff", cursor:"pointer" }}
          >
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

      {/* Summary totals */}
      <Grid container spacing={2} mb={3}>
        {[
          { label:"Gross Payroll",   value:`₹${totalGross.toLocaleString("en-IN")}`,  color:"#1a56db" },
          { label:"Total Deductions",value:`₹${totalDeduct.toLocaleString("en-IN")}`, color:"#e02424" },
          { label:"Net Payroll",     value:`₹${totalNet.toLocaleString("en-IN")}`,    color:"#0e9f6e" },
        ].map((c) => (
          <Grid item xs={12} sm={4} key={c.label}>
            <Card><Box sx={{ p:2 }}>
              <Typography variant="body2" color="text.secondary">{c.label}</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
            </Box></Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["Name","Position","Gross","Present","Absent","Half Day","Leave","Deduction","Net Salary","Slip"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py:4 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : data.map((row) => (
                <TableRow key={row.staffId} hover>
                  <TableCell sx={{ fontWeight:500 }}>{row.name}</TableCell>
                  <TableCell sx={{ fontSize:12, color:"text.secondary" }}>{row.position}</TableCell>
                  <TableCell>₹{Number(row.salary).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Chip label={row.present}  color="success"   size="small" /></TableCell>
                  <TableCell><Chip label={row.absent}   color={row.absent > 0 ? "error" : "default"}   size="small" /></TableCell>
                  <TableCell><Chip label={row.halfDay}  color={row.halfDay > 0 ? "warning" : "default"} size="small" /></TableCell>
                  <TableCell><Chip label={row.leave}    color="info"      size="small" /></TableCell>
                  <TableCell sx={{ color: row.deduction > 0 ? "#e02424" : "text.secondary", fontWeight:600 }}>
                    {row.deduction > 0 ? `−₹${Number(row.deduction).toLocaleString("en-IN")}` : "—"}
                  </TableCell>
                  <TableCell sx={{ color:"#0e9f6e", fontWeight:700 }}>
                    ₹{Number(row.netSalary).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" startIcon={<VisibilityIcon />}
                      onClick={() => openSlip(row.staffId)} disabled={slipLoading}>
                      Slip
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && data.length === 0 && (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py:4, color:"text.secondary" }}>No data for this month.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Salary Slip Dialog */}
      {slipDialog && (
        <Dialog open maxWidth="sm" fullWidth onClose={() => setSlipDialog(null)}>
          <DialogTitle>
            Salary Slip — {slipDialog.slip.staff.name}
            <Typography variant="caption" display="block" color="text.secondary">{slipDialog.monthLabel}</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ background:"#f9fafb", borderRadius:2, p:2, mb:2 }}>
              <Grid container spacing={1}>
                {[
                  ["Position",     slipDialog.slip.staff.position],
                  ["Gross Salary", `₹${Number(slipDialog.slip.staff.salary).toLocaleString("en-IN")}`],
                  ["Per Day Rate", `₹${Number(slipDialog.slip.perDay).toFixed(2)}`],
                ].map(([l,v]) => (
                  <Grid item xs={6} key={l}>
                    <Typography variant="caption" color="text.secondary">{l}</Typography>
                    <Typography variant="body2" fontWeight={500}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Divider sx={{ mb:1.5 }}><Typography variant="caption" color="text.secondary">Attendance</Typography></Divider>
            <SlipRow label="Present"    value={`${slipDialog.slip.present} days`} />
            <SlipRow label="Half Day"   value={`${slipDialog.slip.halfDay} × 0.5 = ${slipDialog.slip.halfDay * 0.5} days`} />
            <SlipRow label="Leave"      value={`${slipDialog.slip.leave} days`} />
            <SlipRow label="Holiday"    value={`${slipDialog.slip.holiday} days`} />
            <SlipRow label="Absent"     value={`${slipDialog.slip.absent} days`} color="#e02424" />
            <Divider sx={{ my:1.5 }}><Typography variant="caption" color="text.secondary">Calculation</Typography></Divider>
            <SlipRow label="Gross Salary"  value={`₹${Number(slipDialog.slip.staff.salary).toLocaleString("en-IN")}`} />
            <SlipRow label={`Deduction (${slipDialog.slip.deductDays} days)`} value={`−₹${Number(slipDialog.slip.deduction).toLocaleString("en-IN")}`} color="#e02424" />
            <Box sx={{ display:"flex", justifyContent:"space-between", mt:1.5, p:1.5, background:"#dcfce7", borderRadius:2 }}>
              <Typography fontWeight={700} color="#166534">Net Salary Payable</Typography>
              <Typography fontWeight={700} color="#166534" fontSize={18}>₹{Number(slipDialog.slip.netSalary).toLocaleString("en-IN")}</Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2 }}>
            <Button onClick={() => setSlipDialog(null)}>Close</Button>
            <Button variant="contained" startIcon={<DownloadIcon />}
              onClick={() => printSlip(slipDialog.slip, slipDialog.monthLabel)}>
              Print / Download PDF
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
