/* Minimal dependency-free mock REST server for Health Assistant actions */
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 4000;

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function notFound(res) {
  send(res, 404, { error: 'Not Found' });
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        const json = data ? JSON.parse(data) : {};
        resolve(json);
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return send(res, 200, { ok: true });
  }

  const parsed = url.parse(req.url || '', true);
  const pathname = parsed.pathname || '';

  try {
    // User chart (mock)
    if (req.method === 'GET' && /^\/v1\/users\/.+\/chart$/.test(pathname)) {
      const chartPath = path.join(__dirname, 'mock-user-chart.json');
      let chart = {};
      try {
        chart = JSON.parse(fs.readFileSync(chartPath, 'utf8'));
      } catch {
        chart = {
          version: 1,
          generatedAt: new Date().toISOString(),
          user: { email: 'demo@example.com', displayName: 'Demo User' },
          profile: { age: 30, gender: 'other', height: 170, weight: 70 },
          biomarkers: [],
          labResults: [],
          deviceData: [],
          connectedDevices: ['Apple Health'],
          healthScore: { overall: 82 },
          settings: { general: { timeFormat: '24h', dateFormat: 'DD/MM/YYYY', units: 'metric', language: 'English', theme: 'auto' } },
          notifications: { medicationAlerts: ['1 hour before'], appointmentAlerts: ['1 hour before'], toggles: { medication: true } },
          legal: { tos: { lastUpdated: 'December 2024' }, privacy: { effectiveDate: '1 January 2025' } },
          lastSyncAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        };
      }
      return send(res, 200, chart);
    }

    // Timeseries (mock)
    if (req.method === 'GET' && /^\/v1\/users\/.+\/timeseries$/.test(pathname)) {
      const q = parsed.query || {};
      const now = Date.now();
      const points = Array.from({ length: 14 }, (_, i) => ({
        ts: new Date(now - (13 - i) * 24 * 3600 * 1000).toISOString(),
        value: Math.round(60 + Math.random() * 20),
      }));
      return send(res, 200, { metric: q.metric || 'hr', granularity: 'daily', points });
    }

    // Commands (mock)
    if (req.method === 'POST' && pathname === '/v1/commands') {
      const body = await parseBody(req);
      return send(res, 200, { ok: true, command: body.command || 'noop', version: (body.version || 0) + 1 });
    }

    // Timeline write
    if (req.method === 'POST' && pathname === '/api/timeline') {
      const body = await parseBody(req);
      const entry = {
        id: `tl_${Date.now()}`,
        type: body.type || 'System',
        title: body.title || 'Entry',
        description: body.description || '',
        occurredAt: body.occurredAt || new Date().toISOString(),
        meta: body.meta || {},
      };
      return send(res, 200, entry);
    }

    // Supplements advice
    if (req.method === 'POST' && pathname === '/api/supplements/advice') {
      const body = await parseBody(req);
      const dose = body.dosePreferenceMg || 500;
      return send(res, 200, {
        recommendedDoseMg: dose,
        timing: 'with_food',
        notes: [
          'Avoid >1g/day chronically unless advised by your clinician',
          body.constraints?.includes('low-acid') ? 'Prefer buffered/low-acid forms' : 'Standard ascorbic acid is fine',
        ],
        products: [
          { name: 'Vitamin C 500mg', form: 'tablet', doseMg: 500, price: 7.99 },
          { name: 'Vitamin C 1000mg', form: 'tablet', doseMg: 1000, price: 11.99 },
        ],
      });
    }

    // Appointment reschedule
    if (req.method === 'POST' && /\/api\/appointments\/.+\/reschedule$/.test(pathname)) {
      const id = pathname.split('/')[3] || `apt_${Date.now()}`;
      const body = await parseBody(req);
      const oldDateTime = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const newDateTime = body.newDate && body.newTime ? `${body.newDate}T${body.newTime}:00Z` : new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString();
      return send(res, 200, {
        appointmentId: id,
        oldDateTime,
        newDateTime,
        location: body.locationPreference === 'virtual' ? 'Virtual' : 'In person',
        status: 'confirmed',
      });
    }

    // Symptoms - leg pain
    if (req.method === 'POST' && pathname === '/api/symptoms/leg') {
      const body = await parseBody(req);
      return send(res, 200, {
        symptomId: `sym_${Date.now()}`,
        plan: {
          steps: [
            { order: 1, title: 'Rest & Ice', details: '15–20 min, 3–4x/day', toggleKey: 'rice' },
            { order: 2, title: 'Gentle Stretching', details: '2–3 sets, pain-free range', toggleKey: 'stretch' },
            { order: 3, title: 'Calf Raises', details: '3x10, progress as tolerated', toggleKey: 'calf_raise' },
          ],
          checkins: { frequency: 'daily', questions: ['Pain today (0–10)?', 'Any swelling?', 'Could you walk normally?'] },
          safety: { urgentCareCriteria: ['Sudden swelling/redness', 'Fever', 'Shortness of breath'] },
        },
      });
    }

    // Toggle completion
    if (req.method === 'POST' && pathname === '/api/toggles') {
      const body = await parseBody(req);
      return send(res, 200, { ok: true, toggleKey: body.toggleKey, completed: !!body.completed });
    }

    // Allergies
    if (req.method === 'POST' && pathname === '/api/allergies') {
      const body = await parseBody(req);
      return send(res, 200, {
        allergyId: `alg_${Date.now()}`,
        status: body.action || 'update',
      });
    }

    // Travel country card
    if (req.method === 'POST' && pathname === '/api/travel/country-card') {
      await parseBody(req);
      return send(res, 200, { cardId: `card_${Date.now()}` });
    }

    // Labs submit
    if (req.method === 'POST' && pathname === '/api/labs/submit') {
      const body = await parseBody(req);
      const updated = (body.values || []).slice(0, 3).map((v) => ({
        name: v.biomarker,
        trend: 'flat',
        status: 'normal',
      }));
      return send(res, 200, {
        panelId: `lab_${Date.now()}`,
        updatedBiomarkers: updated,
      });
    }

    // Travel trip change
    if (req.method === 'POST' && /\/api\/travel\/trips\/.+\/change$/.test(pathname)) {
      const id = pathname.split('/')[4] || `trip_${Date.now()}`;
      const body = await parseBody(req);
      return send(res, 200, {
        tripId: id,
        old: { start: body.oldStart || body.startDate, end: body.oldEnd || body.endDate },
        now: { start: body.startDate, end: body.endDate },
        advisoriesRefreshed: true,
      });
    }

    return notFound(res);
  } catch (e) {
    return send(res, 500, { error: e.message || 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});


