import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Select, MenuItem, FormControl,
  InputLabel, Alert, Snackbar, Tooltip, Grid, Checkbox, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Divider, Tabs, Tab, InputAdornment
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StoreIcon from '@mui/icons-material/Store';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  getAgencyPartners,
  getAgencyBillingSummary,
  generateAgencyInvoice,
  updateClientAgencyStatus,
  createAgencyPartner,
  deleteAgencyPartner
} from '../api/agencyOsApi';
import { getClients } from '../api/clientsApi';

export default function AgencyBillingView() {
  const [activeTab, setActiveTab] = useState(0); // 0 = Agency Directory, 1 = Monthly Bill Generator
  const [agencies, setAgencies] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Invoice Result Modal
  const [generatedInvoiceModal, setGeneratedInvoiceModal] = useState(null);

  // Convert Client to Agency Modal
  const [showAddAgencyModal, setShowAddAgencyModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [clientToConvert, setClientToConvert] = useState('');

  // Create New Agency Partner Modal
  const [showCreateAgencyModal, setShowCreateAgencyModal] = useState(false);
  const [newAgencyForm, setNewAgencyForm] = useState({
    businessName: '',
    ownerName: '',
    mobile: '',
    email: '',
    city: 'Surat',
    defaultShootRate: '',
    defaultEditRate: '',
    defaultFullRate: '',
  });

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
    if (selectedAgencyId) {
      loadSummary();
    }
  }, [selectedAgencyId, loadSummary]);

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

  // Switch to Billing tab for specific agency
  const handleOpenAgencyBilling = (agencyId) => {
    setSelectedAgencyId(agencyId);
    setActiveTab(1);
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
      loadAgencies();
    } catch (err) {
      console.error('generateInvoice error:', err);
      setError(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  // Delete or Untag Agency
  const handleExecuteDelete = async (actionType) => {
    if (!deleteTarget) return;
    try {
      const res = await deleteAgencyPartner(deleteTarget._id, { action: actionType });
      setToast(res.data?.message || 'Action completed!');
      setDeleteTarget(null);
      await loadAgencies();
      if (selectedAgencyId === deleteTarget._id) {
        setSelectedAgencyId('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete agency');
    }
  };

  // Convert Existing Client to Agency
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

  // Create Brand New Agency Partner
  const handleCreateAgency = async (e) => {
    e.preventDefault();
    try {
      const res = await createAgencyPartner({
        businessName: newAgencyForm.businessName,
        ownerName: newAgencyForm.ownerName,
        mobile: newAgencyForm.mobile,
        email: newAgencyForm.email,
        city: newAgencyForm.city,
        agencyRates: {
          defaultShootRate: Number(newAgencyForm.defaultShootRate) || 0,
          defaultEditRate: Number(newAgencyForm.defaultEditRate) || 0,
          defaultFullRate: Number(newAgencyForm.defaultFullRate) || 0,
        }
      });

      setToast(res.data?.message || 'New Agency added successfully! 🤝');
      setShowCreateAgencyModal(false);
      setNewAgencyForm({
        businessName: '',
        ownerName: '',
        mobile: '',
        email: '',
        city: 'Surat',
        defaultShootRate: '',
        defaultEditRate: '',
        defaultFullRate: '',
      });
      await loadAgencies();
      if (res.data?.agency?._id) {
        setSelectedAgencyId(res.data.agency._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create agency');
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

  // Filtered agencies for directory tab
  const filteredAgencies = agencies.filter(ag => {
    const q = searchQuery.toLowerCase();
    return (
      (ag.businessName || '').toLowerCase().includes(q) ||
      (ag.ownerName || '').toLowerCase().includes(q) ||
      (ag.mobile || '').includes(q) ||
      (ag.city || '').toLowerCase().includes(q)
    );
  });

  const totalAllUnbilledDues = agencies.reduce((sum, ag) => sum + (ag.unbilledAmount || 0), 0);
  const totalAllReelsProduced = agencies.reduce((sum, ag) => sum + (ag.totalReels || 0), 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, margin: '0 auto' }}>
      {/* ── HEADER ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            🤝 Agency & B2B Partner Hub
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontWeight: 500 }}>
            બધી પાર્ટનર એજન્સીઓનું લિસ્ટ (દા.ત. Vardhate), રેટ્સ, કરેલું કામ અને ૧-ક્લિક મંથલી બિલિંગ.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateAgencyModal(true)}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, bgcolor: '#FF5200', '&:hover': { bgcolor: '#e04800' } }}
          >
            + Create New Agency
          </Button>

          <Button
            variant="outlined"
            startIcon={<HandshakeIcon />}
            onClick={() => setShowAddAgencyModal(true)}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, borderColor: '#cbd5e1', color: '#334155' }}
          >
            Tag Existing Client
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { loadAgencies(); loadSummary(); }}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, borderColor: '#cbd5e1', color: '#334155' }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ── MAIN TABS: 1. ALL AGENCIES DIRECTORY | 2. MONTHLY BILL GENERATOR ── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 800,
              fontSize: { xs: 13, sm: 14 },
              textTransform: 'none',
              minHeight: 48,
              color: '#64748b',
              '&.Mui-selected': { color: '#FF5200' }
            },
            '& .MuiTabs-indicator': { bgcolor: '#FF5200', height: 3, borderRadius: 3 }
          }}
        >
          <Tab
            icon={<StoreIcon sx={{ fontSize: 18, mr: 1 }} />}
            iconPosition="start"
            label={`🏢 All Agencies Directory (${agencies.length})`}
          />
          <Tab
            icon={<ReceiptLongIcon sx={{ fontSize: 18, mr: 1 }} />}
            iconPosition="start"
            label="🧾 Monthly Bill Generator (ઇન્વોઇસિંગ)"
          />
        </Tabs>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 0: ALL AGENCIES DIRECTORY (બધી એજન્સીઓનું લિસ્ટ)                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Box>
          {/* Top KPI Cards for all agencies */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2.5, bgcolor: '#f8fafc' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>TOTAL AGENCY PARTNERS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                  {agencies.length} <span style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>Agencies</span>
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Active B2B collaborative clients</Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, border: '1px solid #fed7aa', p: 2.5, bgcolor: '#fff7ed' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#c2410c' }}>TOTAL REELS DELIVERED</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#9a3412', mt: 0.5 }}>
                  {totalAllReelsProduced} <span style={{ fontSize: 14, fontWeight: 700, color: '#ea580c' }}>Videos</span>
                </Typography>
                <Typography variant="caption" sx={{ color: '#fb923c' }}>Across all agencies</Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 3, border: '1px solid #bbf7d0', p: 2.5, bgcolor: '#f0fdf4' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#15803d' }}>TOTAL UNBILLED OUTSTANDING</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#166534', mt: 0.5 }}>
                  ₹{totalAllUnbilledDues.toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#4ade80' }}>Ready to generate monthly bills</Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Search bar & Directory Table */}
          <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid #f1f5f9' }}>
              <TextField
                size="small"
                placeholder="Search agency name, owner, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: 350 }, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />

              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                Showing <b>{filteredAgencies.length}</b> of <b>{agencies.length}</b> agencies
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Agency Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Contact Person</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Default Rates</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="center">Total Work</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="right">Unbilled Dues</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAgencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                        <StoreIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1, display: 'block', margin: '0 auto' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>કોઈ એજન્સી પાર્ટનર મળ્યા નથી.</Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setShowCreateAgencyModal(true)}
                          sx={{ mt: 2, bgcolor: '#FF5200', textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
                        >
                          + Add First Agency (દા.ત. Vardhate)
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAgencies.map((ag) => (
                      <TableRow key={ag._id} hover sx={{ transition: 'all 0.2s' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              width: 38, height: 38, borderRadius: 2.5, bgcolor: '#fff7ed',
                              border: '1px solid #fed7aa', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#c2410c'
                            }}>
                              🤝
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a' }}>
                                {ag.businessName}
                              </Typography>
                              <Chip
                                size="small"
                                label="Agency Partner (B2B)"
                                sx={{ fontSize: 9, height: 16, fontWeight: 800, bgcolor: '#ede9fe', color: '#6d28d9' }}
                              />
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {ag.ownerName || 'N/A'}
                          </Typography>
                          {ag.mobile && (
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 12 }} /> {ag.mobile}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 14, color: '#94a3b8' }} /> {ag.city || 'Surat'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              size="small"
                              label={`🎥 ₹${ag.agencyRates?.defaultShootRate || 0}`}
                              title="Default Shoot Rate"
                              sx={{ fontSize: 10, fontWeight: 700, bgcolor: '#eff6ff', color: '#1d4ed8' }}
                            />
                            <Chip
                              size="small"
                              label={`✂️ ₹${ag.agencyRates?.defaultEditRate || 0}`}
                              title="Default Edit Rate"
                              sx={{ fontSize: 10, fontWeight: 700, bgcolor: '#faf5ff', color: '#7e22ce' }}
                            />
                            <Chip
                              size="small"
                              label={`🎬 ₹${ag.agencyRates?.defaultFullRate || 0}`}
                              title="Default Shoot+Edit Rate"
                              sx={{ fontSize: 10, fontWeight: 700, bgcolor: '#fff7ed', color: '#c2410c' }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${ag.totalReels || 0} Videos`}
                            sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#334155' }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: ag.unbilledAmount > 0 ? '#166534' : '#64748b' }}>
                            ₹{(ag.unbilledAmount || 0).toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: ag.unbilledReels > 0 ? '#ea580c' : '#94a3b8', fontWeight: 700 }}>
                            {ag.unbilledReels || 0} unbilled reels
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Button
                              variant="contained"
                              size="small"
                              endIcon={<ArrowForwardIcon />}
                              onClick={() => handleOpenAgencyBilling(ag._id)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 800,
                                borderRadius: 2,
                                fontSize: 11,
                                bgcolor: '#FF5200',
                                '&:hover': { bgcolor: '#e04800' }
                              }}
                            >
                              Open Bill
                            </Button>

                            <Tooltip title="Delete or Untag Agency">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteTarget(ag)}
                                sx={{ border: '1px solid #fee2e2', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' }, p: 0.8 }}
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: MONTHLY BILL GENERATOR (મંથલી બિલ અને ઇન્વોઇસિંગ)                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Box>
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
            <Grid item xs={6} sm={3} md={2.4}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2, bgcolor: '#f8fafc' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>TOTAL VIDEOS</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                  {stats.totalTasks}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>For this period</Typography>
              </Card>
            </Grid>

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
        </Box>
      )}

      {/* ── MODAL: CREATE BRAND NEW AGENCY PARTNER ── */}
      <Dialog
        open={showCreateAgencyModal}
        onClose={() => setShowCreateAgencyModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5 } }}
      >
        <form onSubmit={handleCreateAgency}>
          <DialogTitle sx={{ fontWeight: 900, color: '#0f172a' }}>
            🤝 Add New Agency Partner (નવી એજન્સી ઉમેરો)
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Agency / Business Name"
                  placeholder="e.g. Vardhate Agency / Creative Media"
                  value={newAgencyForm.businessName}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, businessName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Contact Person / Owner Name"
                  placeholder="e.g. Manish Bhai"
                  value={newAgencyForm.ownerName}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, ownerName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Mobile Number (WhatsApp)"
                  placeholder="e.g. 9876543210"
                  value={newAgencyForm.mobile}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, mobile: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email (Optional)"
                  placeholder="agency@gmail.com"
                  value={newAgencyForm.email}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, email: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  value={newAgencyForm.city}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, city: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Chip label="Default Agreed Rates / નક્કી કરેલા ડિફોલ્ટ ભાવ (ઓપ્શનલ)" size="small" sx={{ fontSize: 11, fontWeight: 700 }} />
                </Divider>
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Only Shoot Rate (₹)"
                  placeholder="e.g. 1000"
                  value={newAgencyForm.defaultShootRate}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, defaultShootRate: e.target.value })}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Only Edit Rate (₹)"
                  placeholder="e.g. 600"
                  value={newAgencyForm.defaultEditRate}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, defaultEditRate: e.target.value })}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Full Package Rate (₹)"
                  placeholder="e.g. 1500"
                  value={newAgencyForm.defaultFullRate}
                  onChange={(e) => setNewAgencyForm({ ...newAgencyForm, defaultFullRate: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowCreateAgencyModal(false)} sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ fontWeight: 800, bgcolor: '#FF5200', '&:hover': { bgcolor: '#e04800' } }}
            >
              Save Agency Partner 🤝
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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

      {/* ── MODAL: DELETE / UNTAG AGENCY CONFIRMATION ── */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon /> Delete Agency Partner
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: '#334155', mb: 1.5, fontWeight: 600 }}>
            તમે <strong>"{deleteTarget?.businessName}"</strong> ને કેવી રીતે દૂર કરવા માંગો છો?
          </Typography>

          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              Contact: <b>{deleteTarget?.ownerName}</b> ({deleteTarget?.mobile || 'No phone'})
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Total Reels: <b>{deleteTarget?.totalReels || 0}</b> | Unbilled Dues: <b>₹{(deleteTarget?.unbilledAmount || 0).toLocaleString('en-IN')}</b>
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.6 }}>
            • <b>Remove Tag Only:</b> ક્લાયન્ટ ડેટાબેઝમાં રહેશે, ફક્ત એજન્સી લિસ્ટમાંથી હટીને સામાન્ય ક્લાયન્ટ બનશે.<br />
            • <b>Delete Permanently:</b> આ એજન્સી સિસ્ટમમાંથી કાયમ માટે ડિલીટ થઈ જશે.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleExecuteDelete('untag')}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, borderColor: '#cbd5e1', color: '#475569' }}
          >
            🏷️ Remove Tag Only (માત્ર એજન્સી ટેગ હટાવો)
          </Button>

          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => handleExecuteDelete('delete')}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
          >
            🗑️ Delete Permanently (કાયમ માટે ડિલીટ કરો)
          </Button>

          <Button
            fullWidth
            onClick={() => setDeleteTarget(null)}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 700 }}
          >
            Cancel
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
