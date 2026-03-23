// JSON Schema for the CoreHealth user chart snapshot (v1)
export const userChartSchemaV1 = {
  $id: 'https://corehealth.app/schemas/userChart.v1.json',
  type: 'object',
  required: ['version', 'generatedAt'],
  properties: {
    version: { type: 'integer', const: 1 },
    generatedAt: { type: 'string', format: 'date-time' },
    user: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        displayName: { type: 'string' },
        preferredName: { type: 'string' }
      },
      additionalProperties: true
    },
    profile: { type: 'object', additionalProperties: true },
    biomarkers: { type: 'array', items: { type: 'object' } },
    labResults: { type: 'array', items: { type: 'object' } },
    deviceData: { type: 'array', items: { type: 'object' } },
    connectedDevices: { type: 'array', items: { type: 'string' } },
    healthScore: { type: 'object', additionalProperties: true },
    settings: { type: 'object', additionalProperties: true },
    notifications: {
      type: 'object',
      properties: {
        medicationAlerts: { type: 'array', items: { type: 'string' } },
        appointmentAlerts: { type: 'array', items: { type: 'string' } },
        toggles: { type: 'object', additionalProperties: { type: 'boolean' } },
        quietHours: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            startTime: { type: 'string' },
            endTime: { type: 'string' }
          }
        }
      }
    },
    legal: {
      type: 'object',
      properties: {
        tos: { type: 'object', properties: { lastUpdated: { type: 'string' }, effectiveDate: { type: 'string' } } },
        privacy: { type: 'object', properties: { effectiveDate: { type: 'string' } } }
      }
    },
    lastSyncAt: { type: 'string', format: 'date-time' }
  }
} as const;


