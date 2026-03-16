// JSON Schema for the CoreHealth event envelope (v1)
export const eventEnvelopeSchemaV1 = {
  $id: 'https://corehealth.app/schemas/eventEnvelope.v1.json',
  type: 'object',
  required: ['id', 'user_id', 'type', 'ts', 'source', 'hash'],
  properties: {
    id: { type: 'string' },
    user_id: { type: 'string' },
    type: { type: 'string' },
    ts: { type: 'string', format: 'date-time' },
    source: { type: 'string' },
    hash: { type: 'string' },
    payload: { type: 'object', additionalProperties: true }
  },
  additionalProperties: false
} as const;


