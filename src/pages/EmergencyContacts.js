// src/pages/EmergencyContacts.js
import React, { useEffect, useMemo, useState } from 'react';
import { getContacts, createContact, updateContact, deleteContact } from '../api';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete as DeleteIcon,
  Phone,
  Email,
  LocationOn,
  ContentCopy,
  OpenInNew,
  Star,
  StarBorder,
  FileUpload,
  FileDownload,
  WhatsApp,
} from '@mui/icons-material';

const types = ['police', 'fire', 'ambulance', 'hospital', 'disaster_management', 'rescue', 'ngo'];

const indiaDefaults = [
  { name: 'Emergency Services', type: 'police', phone: '112', email: '', address: '', hours: '24x7', website: '112.gov.in', notes: 'Single emergency number', favorite: true },
  { name: 'Police Control Room', type: 'police', phone: '100', email: '', address: 'Local Police Station', hours: '24x7', website: 'incredibleindia.org', notes: 'Dial emergency number for immediate assistance', favorite: true },
  { name: 'Fire & Rescue', type: 'fire', phone: '101', email: '', address: 'Nearest Fire Station', hours: '24x7', website: 'incredibleindia.org', notes: '', favorite: true },
  { name: 'Ambulance', type: 'ambulance', phone: '102', email: '', address: 'Nearest Hospital', hours: '24x7', website: 'incredibleindia.org', notes: 'Provide location clearly when calling', favorite: true },
  { name: 'Emergency Ambulance', type: 'ambulance', phone: '108', email: '', address: '', hours: '24x7', website: 'incredibleindia.org', notes: '', favorite: false },
  { name: 'Women Helpline', type: 'police', phone: '1091', email: '', address: '', hours: '24x7', website: 'en.wikipedia.org', notes: '', favorite: false },
  { name: 'Disaster Management Helpline', type: 'disaster_management', phone: '1077', email: '', address: '', hours: '24x7', website: '', notes: '', favorite: false },
  { name: 'Child Helpline', type: 'ngo', phone: '1098', email: '', address: '', hours: '24x7', website: 'indianhelpline.com', notes: '', favorite: false },
];

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importCsvOpen, setImportCsvOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [serverMode, setServerMode] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await getContacts();
        const mapped = list.map((c) => ({
          id: c._id,
          name: c.name,
          type: c.type,
          phone: c.phone,
          email: c.email,
          address: c.address,
          hours: c.hours,
          website: c.website,
          notes: c.notes,
          favorite: !!c.favorite,
        }));
        setContacts(mapped);
        setServerMode(true);
      } catch {
        const stored = localStorage.getItem('emergency_contacts') || sessionStorage.getItem('emergency_contacts');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setContacts(parsed);
            } else {
              setContacts(indiaDefaults.map((d) => ({ ...d, id: crypto.randomUUID() })));
            }
          } catch {
            setContacts(indiaDefaults.map((d) => ({ ...d, id: crypto.randomUUID() })));
          }
        } else {
          setContacts(indiaDefaults.map((d) => ({ ...d, id: crypto.randomUUID() })));
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!serverMode) return;
      const params = {
        q: search || undefined,
        type: filterType !== 'all' ? filterType : undefined,
      };
      try {
        const list = await getContacts(params);
        const mapped = list.map((c) => ({
          id: c._id,
          name: c.name,
          type: c.type,
          phone: c.phone,
          email: c.email,
          address: c.address,
          hours: c.hours,
          website: c.website,
          notes: c.notes,
          favorite: !!c.favorite,
        }));
        setContacts(mapped);
      } catch {}
    })();
  }, [serverMode, search, filterType]);

  useEffect(() => {
    try {
      localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
    } catch {}
  }, [contacts]);

  const filtered = useMemo(() => {
    let list = contacts.slice();
    if (!serverMode) {
      if (filterType !== 'all') list = list.filter((c) => c.type === filterType);
      const q = (search || '').trim().toLowerCase();
      if (q) {
        list = list.filter((c) => (
          (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.address || '').toLowerCase().includes(q) ||
          (c.notes || '').toLowerCase().includes(q)
        ));
      }
    }
    return list.sort((a, b) => (b.favorite === true) - (a.favorite === true));
  }, [contacts, serverMode, filterType, search]);

  const confirmTarget = useMemo(() => contacts.find((c) => c.id === confirmDeleteId) || null, [contacts, confirmDeleteId]);

  const startCreate = () => {
    setEditing({
      id: null,
      name: '',
      type: 'police',
      phone: '',
      email: '',
      address: '',
      hours: '',
      website: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const startEdit = (c) => {
    setEditing({ ...c });
    setDialogOpen(true);
  };

  const remove = async (id) => {
    if (serverMode && id && String(id).length === 24) {
      try {
        await deleteContact(id);
        setContacts((prev) => prev.filter((c) => c.id !== id));
        return;
      } catch {}
    }
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const save = async () => {
    if (!editing?.name || !editing?.type || (!editing?.phone && !editing?.email)) return;
    const existsIndex = contacts.findIndex((c) => c.name === editing.name && c.phone === editing.phone);
    if (serverMode) {
      try {
        if (editing.id && String(editing.id).length === 24) {
          const updated = await updateContact(editing.id, editing);
          setContacts((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...updated, id: updated._id } : c)));
        } else {
          const created = await createContact(editing);
          setContacts((prev) => [{
            id: created._id,
            name: created.name,
            type: created.type,
            phone: created.phone,
            email: created.email,
            address: created.address,
            hours: created.hours,
            website: created.website,
            notes: created.notes,
            favorite: !!created.favorite,
          }, ...prev]);
        }
        setDialogOpen(false);
        setEditing(null);
        return;
      } catch {}
    }
    if (editing.id) {
      setContacts((prev) => prev.map((c) => (c.id === editing.id ? editing : c)));
    } else if (existsIndex !== -1) {
      const updated = [...contacts];
      updated[existsIndex] = { ...updated[existsIndex], ...editing };
      setContacts(updated);
    } else {
      setContacts((prev) => [{ ...editing, id: crypto.randomUUID(), favorite: false }, ...prev]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const call = (phone) => {
    if (!phone) return;
    window.open(`tel:${phone}`);
  };

  const mail = (email) => {
    if (!email) return;
    window.open(`mailto:${email}`);
  };

  const mapTo = (address) => {
    if (!address) return;
    const q = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  const openSite = (url) => {
    if (!url) return;
    const u = url.startsWith('http') ? url : `https://${url}`;
    window.open(u, '_blank');
  };

  const whatsapp = (phone) => {
    if (!phone) return;
    const digits = String(phone).replace(/[^0-9]/g, '');
    if (!digits) return;
    const url = `https://wa.me/${digits}`;
    window.open(url, '_blank');
  };

  const copyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const toggleFavorite = async (id) => {
    let nextFav = false;
    setContacts((prev) => prev.map((c) => {
      if (c.id === id) {
        nextFav = !c.favorite;
        return { ...c, favorite: nextFav };
      }
      return c;
    }));
    if (serverMode && id && String(id).length === 24) {
      try {
        const updated = await updateContact(id, { favorite: nextFav });
        setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !!updated.favorite } : c)));
      } catch {}
    }
  };

  const exportContacts = () => {
    const dataStr = JSON.stringify(contacts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emergency_contacts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportContactsCsv = () => {
    const header = ['name','type','phone','email','address','hours','website','notes','favorite'];
    const rows = contacts.map(c => header.map(h => {
      const val = (c[h] !== undefined && c[h] !== null) ? String(c[h]) : '';
      const escaped = '"' + val.replace(/"/g, '""') + '"';
      return escaped;
    }).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emergency_contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportVCard = (c) => {
    if (!c) return;
    const esc = (s) => String(s || '').replace(/\r|\n/g, ' ');
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${esc(c.name)}`,
      c.phone ? `TEL;TYPE=CELL:${esc(c.phone)}` : '',
      c.email ? `EMAIL:${esc(c.email)}` : '',
      c.address ? `ADR;TYPE=HOME:;;${esc(c.address)}` : '',
      c.website ? `URL:${esc(c.website)}` : '',
      c.notes ? `NOTE:${esc(c.notes)}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');
    const blob = new Blob([lines], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(c.name || 'contact').replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importContacts = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) return;
      const merged = [...contacts];
      parsed.forEach((item) => {
        if (!item?.name || (!item?.phone && !item?.email)) return;
        const idx = merged.findIndex((c) => c.name === item.name && c.phone === item.phone);
        if (idx !== -1) {
          merged[idx] = { ...merged[idx], ...item, id: merged[idx].id || crypto.randomUUID() };
        } else {
          merged.unshift({ ...item, id: crypto.randomUUID() });
        }
      });
      setContacts(merged);
      setImportOpen(false);
      setImportText('');
    } catch {}
  };

  const importContactsCsv = () => {
    try {
      const text = importCsvText.trim();
      if (!text) return;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length);
      if (lines.length < 2) return;
      const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const idx = (key) => header.indexOf(key);
      const merged = [...contacts];
      const parseCsvLine = (line) => {
        const out = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
            else { inQuotes = !inQuotes; }
          } else if (ch === ',' && !inQuotes) {
            out.push(cur);
            cur = '';
          } else {
            cur += ch;
          }
        }
        out.push(cur);
        return out.map(s => s.trim());
      };
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        const item = {
          name: cols[idx('name')] || '',
          type: cols[idx('type')] || 'police',
          phone: cols[idx('phone')] || '',
          email: cols[idx('email')] || '',
          address: cols[idx('address')] || '',
          hours: cols[idx('hours')] || '',
          website: cols[idx('website')] || '',
          notes: cols[idx('notes')] || '',
          favorite: (cols[idx('favorite')] || '').toLowerCase() === 'true',
        };
        if (!item.name || (!item.phone && !item.email)) continue;
        const existingIndex = merged.findIndex((c) => c.name === item.name && c.phone === item.phone);
        if (existingIndex !== -1) {
          merged[existingIndex] = { ...merged[existingIndex], ...item };
        } else {
          merged.unshift({ ...item, id: crypto.randomUUID() });
        }
      }
      setContacts(merged);
      setImportCsvOpen(false);
      setImportCsvText('');
    } catch {}
  };

  const addIndiaDefaults = () => {
    const merged = [...contacts];
    indiaDefaults.forEach((d) => {
      const idx = merged.findIndex((c) => c.name === d.name && c.phone === d.phone);
      if (idx === -1) merged.unshift({ ...d, id: crypto.randomUUID() });
    });
    setContacts(merged);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Emergency Contacts</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Type</InputLabel>
            <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {types.map((t) => (
                <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search by name, phone, address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outlined" startIcon={<FileDownload />} onClick={exportContacts}>Export</Button>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={exportContactsCsv}>Export CSV</Button>
          <Button variant="outlined" startIcon={<FileUpload />} onClick={() => setImportOpen(true)}>Import</Button>
          <Button variant="outlined" startIcon={<FileUpload />} onClick={() => setImportCsvOpen(true)}>Import CSV</Button>
          <Button variant="outlined" onClick={addIndiaDefaults}>Add Defaults (India)</Button>
          <Button variant="contained" color="error" onClick={() => call('112')}>SOS 112</Button>
          <Button variant="contained" startIcon={<Add />} onClick={startCreate}>Add Contact</Button>
        </Box>
      </Box>

      {serverMode ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Connected to server. Search and filters query the backend. Favorites sync online.
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Offline mode. Contacts are stored locally in your browser.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Service Numbers (India)</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 1, mt: 1 }}>
            <Typography variant="body2">All-in-one Emergency (police / ambulance / fire)</Typography>
            <Typography variant="body2">112</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<OpenInNew />} onClick={() => openSite('112.gov.in')}>112.gov.in</Button>
              <Button size="small" startIcon={<OpenInNew />} onClick={() => openSite('incredibleindia.org')}>Incredible India</Button>
            </Box>

            <Typography variant="body2">Police (alternative)</Typography>
            <Typography variant="body2">100 / 112</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<OpenInNew />} onClick={() => openSite('incredibleindia.org')}>Incredible India</Button>
            </Box>

            <Typography variant="body2">Fire</Typography>
            <Typography variant="body2">101</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<OpenInNew />} onClick={() => openSite('incredibleindia.org')}>Incredible India</Button>
            </Box>

            <Typography variant="body2">Ambulance / Medical Emergencies</Typography>
            <Typography variant="body2">102 / 108</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<OpenInNew />} onClick={() => openSite('incredibleindia.org')}>Incredible India</Button>
            </Box>

            <Typography variant="body2">Women Helpline</Typography>
            <Typography variant="body2">1091</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<OpenInNew />} onClick={() => openSite('en.wikipedia.org')}>Wikipedia</Button>
            </Box>

            <Typography variant="body2">Child Helpline / Distress to Children</Typography>
            <Typography variant="body2">1098</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<OpenInNew />} onClick={() => openSite('indianhelpline.com')}>Indianhelpline.com</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filtered.map((c) => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={c.type.replace('_', ' ')} color={c.type === 'police' ? 'primary' : c.type === 'fire' ? 'error' : c.type === 'ambulance' ? 'success' : 'default'} size="small" />
                    <Typography variant="h6">{c.name}</Typography>
                  </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton aria-label="favorite" onClick={() => toggleFavorite(c.id)} size="small">
                    {c.favorite ? <Star /> : <StarBorder />}
                  </IconButton>
                  <IconButton aria-label="edit" onClick={() => startEdit(c)} size="small"><Edit /></IconButton>
                  <IconButton aria-label="delete" onClick={() => setConfirmDeleteId(c.id)} size="small"><DeleteIcon /></IconButton>
                </Box>
              </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography variant="body2">Phone: {c.phone || '-'}</Typography>
                  <Typography variant="body2">Email: {c.email || '-'}</Typography>
                  <Typography variant="body2">Address: {c.address || '-'}</Typography>
                  <Typography variant="body2">Hours: {c.hours || '-'}</Typography>
                  <Typography variant="body2">Website: {c.website || '-'}</Typography>
                </Box>
                {c.notes ? (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">{c.notes}</Typography>
                  </Box>
                ) : null}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Button variant="outlined" startIcon={<Phone />} onClick={() => call(c.phone)} disabled={!c.phone}>Call</Button>
                  <Button variant="outlined" startIcon={<WhatsApp />} onClick={() => whatsapp(c.phone)} disabled={!c.phone}>WhatsApp</Button>
                  <Button variant="outlined" startIcon={<Email />} onClick={() => mail(c.email)} disabled={!c.email}>Email</Button>
                  <Button variant="outlined" startIcon={<LocationOn />} onClick={() => mapTo(c.address)} disabled={!c.address}>Map</Button>
                  <Button variant="outlined" startIcon={<OpenInNew />} onClick={() => openSite(c.website)} disabled={!c.website}>Website</Button>
                  <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => copyText(`${c.name}\n${c.phone || ''}\n${c.address || ''}`)}>Copy</Button>
                  <Button variant="outlined" startIcon={<FileDownload />} onClick={() => exportVCard(c)}>vCard</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">No contacts found</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?.id ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={editing?.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={editing?.type || 'police'} label="Type" onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  {types.map((t) => (
                    <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" value={editing?.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={editing?.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Website" value={editing?.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" value={editing?.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Hours" value={editing?.hours || ''} onChange={(e) => setEditing({ ...editing, hours: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Notes" value={editing?.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} multiline rows={3} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setEditing(null); }}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Contacts (JSON)</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={6}
            placeholder="Paste JSON array of contacts here"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={importContacts}>Import</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importCsvOpen} onClose={() => setImportCsvOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Contacts (CSV)</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={6}
            placeholder="Paste CSV with columns: name,type,phone,email,address,hours,website,notes,favorite"
            value={importCsvText}
            onChange={(e) => setImportCsvText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportCsvOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={importContactsCsv}>Import</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete {confirmTarget ? confirmTarget.name : 'this contact'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { if (confirmDeleteId) remove(confirmDeleteId); setConfirmDeleteId(null); }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyContacts;
