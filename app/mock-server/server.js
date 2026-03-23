/* Minimal dependency-free mock REST server for Health Assistant */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 4000;

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    return send(res, 200, { ok: true });
  }

  if (req.method === 'GET' && /^\/v1\/users\/.+\/chart$/.test(req.url || '')) {
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

  send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});
