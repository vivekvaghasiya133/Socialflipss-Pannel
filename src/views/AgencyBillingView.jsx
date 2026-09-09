import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Select, MenuItem, FormControl,
  InputLabel, Alert, Snackbar, Tooltip, Grid, Checkbox, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Divider
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import { getAgencyPartners, getAgencyBillingSummary, generateAgencyInvoice, updateClientAgencyStatus } from '../api/agencyOsApi';
import { getClients } from '../api/clientsApi';

export default function AgencyBillingView() {
  const [agencies, setAgencies] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [statusFilter, setStatusFilter] = useState('all');

  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Invoice Result Modal
  const [generatedInvoiceModal, setGeneratedInvoiceModal] = useState(null);

  // Convert Client to Agency Modal
  const [showAddAgencyModal, setShowAddAgencyModal] = useState(false);
  const [clientToConvert, setClientToConvert] = useState('');

  // Load Agencies & All Clients
  const loadAgencies = useCallback(async () => {
    try {
      const [agRes, cliRes] = await Promise.all([
        getAgencyPartners(),
        getClients({ limit: 200 })
      ]);
      const agList = agRes.data?.agencies || [];
      const cliList = cliRes.data?.clients || [];
      setAgencies(agList);
      setAllClients(cliList);

      if (agList.length > 0 && !selectedAgencyId) {
        setSelectedAgencyId(agList[0]._id);
      } else if (agList.length === 0 && cliList.length > 0 && !selectedAgencyId) {
        setSelectedAgencyId(cliList[0]._id);
      }
    } catch (err) {
      console.error('loadAgencies error:', err);
    }
  }, [selectedAgencyId]);

  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  // Load Agency Summary for chosen Month
  const loadSummary = useCallback(async () => {
    if (!selectedAgencyId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getAgencyBillingSummary(selectedAgencyId, {
        month: selectedMonth,
        statusFilter: statusFilter !== 'all' ? statusFilter : undefined
      });
      setSummaryData(res.data);
      // Auto-select all unbilled tasks
      const unbilled = (res.data?.tasks || []).filter(t => t.billingStatus === 'unbilled').map(t => t._id);
      setSelectedTaskIds(unbilled);
    } catch (err) {
      console.error('loadSummary error:', err);
      setError(err.response?.data?.message || 'Failed to load agency summary');
    } finally {
      setLoading(false);
    }
  }, [selectedAgencyId, selectedMonth, statusFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Handle task selection checkbox
  const toggleTaskSelection = (id) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const tasks = summaryData?.tasks || [];
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(t => t._id));
    }
  };

  // Generate Invoice Action
  const handleGenerateInvoice = async () => {
    if (selectedTaskIds.length === 0) {
      setError('કૃપા કરીને બિલ બનાવવા માટે ઓછામાં ઓછો ૧ વીડિયો પસંદ કરો.');
      return;
    }

    try {
      const monthLabel = new Date(selectedMonth + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      const res = await generateAgencyInvoice({
        agencyId: selectedAgencyId,
        month: monthLabel,
        taskIds: selectedTaskIds
      });

      setGeneratedInvoiceModal(res.data);
      setToast('🎉 Agency Invoice Generated Successfully!');
      loadSummary();
    } catch (err) {
      console.error('generateInvoice error:', err);
      setError(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  // Convert Client to Agency
  const handleConvertClient = async () => {
    if (!clientToConvert) return;
    try {
      await updateClientAgencyStatus(clientToConvert, { clientType: 'agency' });
      setToast('Client marked as Agency Partner! 🤝');
      setShowAddAgencyModal(false);
      loadAgencies();
      setSelectedAgencyId(clientToConvert);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update client');
    }
  };

  // Copy WhatsApp Message
  const handleCopyWhatsApp = () => {
    if (!generatedInvoiceModal?.whatsappMessage) return;
    navigator.clipboard.writeText(generatedInvoiceModal.whatsappMessage);
    setToast('WhatsApp message copied to clipboard! 📋');
  };

  const currentAgency = summaryData?.agency || agencies.find(a => a._id === selectedAgencyId) || {};
  const stats = summaryData?.stats || { totalTasks: 0, totalShootCount: 0, totalEditCount: 0, totalFullCount: 0, totalAmount: 0, unbilledAmount: 0 };
  const tasks = summaryData?.tasks || [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, margin: '0 auto' }}>
      {/* ── HEADER ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            🤝 Agency & B2B Partner Billing
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>
            એજન્સી કામ (Only Shooting, Only Editing, Shoot+Edit) નો વિગતવાર હિસાબ અને ૧-ક્લિક મંથલી ઇન્વોઇસિંગ.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<HandshakeIcon />}
            onClick={() => setShowAddAgencyModal(true)}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, borderColor: '#cbd5e1', color: '#334155' }}
          >
            + Add / Tag Agency
          </Button>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={loadSummary}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, bgcolor: '#FF5200', '&:hover': { bgcolor: '#e04800' } }}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* ── FILTER CONTROLS ── */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Agency Selector */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Agency / B2B Client</InputLabel>
                <Select
                  value={selectedAgencyId}
                  label="Select Agency / B2B Client"
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  sx={{ borderRadius: 2.5, fontWeight: 700 }}
                >
                  {agencies.length === 0 && (
                    <MenuItem value="" disabled>No agency partner tagged yet</MenuItem>
                  )}
                  {agencies.map(ag => (
                    <MenuItem key={ag._id} value={ag._id}>
                      🤝 {ag.businessName} {ag.ownerName ? `(${ag.ownerName})` : ''}
                    </MenuItem>
                  ))}
                  {allClients.filter(c => !agencies.some(a => a._id === c._id)).map(c => (
                    <MenuItem key={c._id} value={c._id}>
                      🏢 {c.businessName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Month Selector */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="month"
                label="Billing Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ borderRadius: 2.5 }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Billing Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Billing Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="all">All Reels / Tasks</MenuItem>
                  <MenuItem value="unbilled">⏳ Unbilled Only</MenuItem>
                  <MenuItem value="billed">✓ Already Billed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Generate Button */}
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ReceiptLongIcon />}
                disabled={selectedTaskIds.length === 0}
                onClick={handleGenerateInvoice}
                sx={{
                  py: 1,
                  borderRadius: 2.5,
                  fontWeight: 900,
                  textTransform: 'none',
                  bgcolor: '#FF5200',
                  '&:hover': { bgcolor: '#e04800' }
                }}
              >
                Generate Bill ({selectedTaskIds.length})
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── SUMMARY KPI STATS ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Tasks */}
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, bgcolor: '#f8fafc' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>TOTAL VIDEOS</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
              {stats.totalTasks}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>For this period</Typography>
          </Card>
        </Grid>

        {/* Only Shooting */}
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #bfdbfe', p: 2, bgcolor: '#eff6ff' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VideoCameraBackIcon fontSize="inherit" /> ONLY SHOOTING
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e40af', mt: 0.5 }}>
              {stats.totalShootCount} <span style={{ fontSize: 13, fontWeight: 700 }}>Reels</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#60a5fa' }}>Shooting only</Typography>
          </Card>
        </Grid>

        {/* Only Editing */}
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e9d5ff', p: 2, bgcolor: '#faf5ff' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#7e22ce', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ContentCutIcon fontSize="inherit" /> ONLY EDITING
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#6b21a8', mt: 0.5 }}>
              {stats.totalEditCount} <span style={{ fontSize: 13, fontWeight: 700 }}>Reels</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#c084fc' }}>Editing only</Typography>
          </Card>
        </Grid>

        {/* Shoot + Edit */}
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #fed7aa', p: 2, bgcolor: '#fff7ed' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MovieFilterIcon fontSize="inherit" /> SHOOT + EDIT
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#9a3412', mt: 0.5 }}>
              {stats.totalFullCount} <span style={{ fontSize: 13, fontWeight: 700 }}>Reels</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#fb923c' }}>Full package</Typography>
          </Card>
        </Grid>

        {/* Total Billable */}
        <Grid item xs={12} sm={12} md={2.4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #bbf7d0', p: 2, bgcolor: '#f0fdf4' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#15803d' }}>UNBILLED PENDING</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#166534', mt: 0.5 }}>
              ₹{stats.unbilledAmount.toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#4ade80' }}>Total: ₹{stats.totalAmount.toLocaleString('en-IN')}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ── TASKS BREAKDOWN TABLE ── */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
              indeterminate={selectedTaskIds.length > 0 && selectedTaskIds.length < tasks.length}
              onChange={handleSelectAll}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Select All Videos ({selectedTaskIds.length}/{tasks.length} selected for bill)
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
            Agency: <b style={{ color: '#0f172a' }}>{currentAgency.businessName || 'Loading...'}</b>
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Reel #</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Title / Concept</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Service Scope</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Stage</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Personnel</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="right">Rate (₹)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="center">Billing Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    આ મહિનામાં આ એજન્સી માટે કોઈ વીડિયો ટાસ્ક મળ્યા નથી.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task._id);
                  const isShoot = task.serviceType === 'only_shooting';
                  const isEdit = task.serviceType === 'only_editing';

                  return (
                    <TableRow
                      key={task._id}
                      hover
                      selected={isSelected}
                      sx={{ '&.Mui-selected': { bgcolor: '#fff7ed' } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleTaskSelection(task._id)}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 900, color: '#0f172a', fontMono: true }}>
                        #{task.reelNumber || 1}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {task.title}
                        {task.goal && (
                          <span style={{ fontSize: 10, color: '#64748b', marginLeft: 6 }}>
                            ({task.goal})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEdit && (
                          <Chip
                            size="small"
                            label="✂️ Only Editing"
                            sx={{ fontSize: 10, fontWeight: 800, bgcolor: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe' }}
                          />
                        )}
                        {isShoot && (
                          <Chip
                            size="small"
                            label="🎥 Only Shooting"
                            sx={{ fontSize: 10, fontWeight: 800, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                          />
                        )}
                        {!isShoot && !isEdit && (
                          <Chip
                            size="small"
                            label="🎬 Shoot + Edit"
                            sx={{ fontSize: 10, fontWeight: 800, bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={task.stage ? task.stage.toUpperCase() : 'COMPLETED'}
                          sx={{ fontSize: 9, fontWeight: 800, bgcolor: '#f1f5f9', color: '#334155' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 11, color: '#475569' }}>
                        {task.shooter && <span>🎥 {task.shooter.name} </span>}
                        {task.editor && <span>🎬 {task.editor.name}</span>}
                        {!task.shooter && !task.editor && <span style={{ color: '#94a3b8' }}>-</span>}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: '#0f172a', fontSize: 13 }}>
                        ₹{(task.videoPrice || 0).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell align="center">
                        {task.billingStatus === 'billed' ? (
                          <Chip
                            size="small"
                            label="✓ Billed"
                            color="success"
                            sx={{ fontSize: 9, fontWeight: 800, height: 20 }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="⏳ Unbilled"
                            color="warning"
                            sx={{ fontSize: 9, fontWeight: 800, height: 20 }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── MODAL: GENERATED INVOICE PREVIEW ── */}
      <Dialog
        open={Boolean(generatedInvoiceModal)}
        onClose={() => setGeneratedInvoiceModal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🧾 Agency Invoice Generated!</span>
          <Chip label={generatedInvoiceModal?.invoice?.invoiceNumber || ''} color="primary" sx={{ fontWeight: 800 }} />
        </DialogTitle>
        <DialogContent dividers>
          {generatedInvoiceModal?.invoice && (
            <Box sx={{ spaceY: 2 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>AGENCY / CLIENT:</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
                    {generatedInvoiceModal.invoice.clientBusiness}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569' }}>
                    Contact: {generatedInvoiceModal.invoice.clientName} ({generatedInvoiceModal.invoice.clientMobile})
                  </Typography>
                </Grid>

                <Grid item xs={6} align="right">
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>BILLING MONTH & DUE DATE:</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>
                    {generatedInvoiceModal.invoice.month}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 700 }}>
                    Due: {new Date(generatedInvoiceModal.invoice.dueDate).toLocaleDateString('en-IN')}
                  </Typography>
                </Grid>
              </Grid>

              {/* Items Table */}
              <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Item Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Rate (₹)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>Amount (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {generatedInvoiceModal.invoice.items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 600 }}>{it.description}</TableCell>
                        <TableCell align="right">{it.quantity}</TableCell>
                        <TableCell align="right">₹{it.rate.toLocaleString('en-IN')}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>₹{it.amount.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Total Summary */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Box sx={{ width: 250 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Subtotal:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{generatedInvoiceModal.invoice.subtotal.toLocaleString('en-IN')}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a' }}>Grand Total:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#16a34a' }}>
                      ₹{generatedInvoiceModal.invoice.totalAmount.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* WhatsApp Box */}
              <Box sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WhatsAppIcon color="success" fontSize="small" /> WhatsApp Bill Summary Message:
                </Typography>
                <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', display: 'block', bgcolor: 'white', p: 1.5, borderRadius: 1.5, border: '1px solid #dcfce7' }}>
                  {generatedInvoiceModal.whatsappMessage}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyWhatsApp}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            Copy WhatsApp Message
          </Button>

          <Button
            variant="contained"
            onClick={() => setGeneratedInvoiceModal(null)}
            sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#FF5200', '&:hover': { bgcolor: '#e04800' } }}
          >
            Done / Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL: CONVERT CLIENT TO AGENCY ── */}
      <Dialog
        open={showAddAgencyModal}
        onClose={() => setShowAddAgencyModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>🤝 Tag Client as Agency Partner</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            નીચેના લિસ્ટમાંથી કોઈપણ ક્લાયન્ટને <b>Agency Partner (B2B)</b> તરીકે ટેગ કરો (દા.ત. Vardhate Agency):
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Select Client</InputLabel>
            <Select
              value={clientToConvert}
              label="Select Client"
              onChange={(e) => setClientToConvert(e.target.value)}
            >
              {allClients.map(c => (
                <MenuItem key={c._id} value={c._id}>
                  {c.businessName} {c.clientType === 'agency' ? '✓ (Already Agency)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowAddAgencyModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConvertClient} sx={{ bgcolor: '#FF5200' }}>
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── TOAST NOTIFICATIONS ── */}
      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast('')}>
        <Alert severity="success" onClose={() => setToast('')} sx={{ fontWeight: 700, borderRadius: 2.5 }}>
          {toast}
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(error)} autoHideDuration={5000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')} sx={{ fontWeight: 700, borderRadius: 2.5 }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
