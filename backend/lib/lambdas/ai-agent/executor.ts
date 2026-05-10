import { Pool } from 'pg';

const VALID_CATEGORIES = new Set(['cardiovascular', 'metabolic', 'hormonal', 'inflammatory', 'nutritional', 'other']);
const VALID_SEVERITIES  = new Set(['mild', 'moderate', 'severe']);
const VALID_ALLERGY_SEVERITIES = new Set(['mild', 'moderate', 'severe', 'life_threatening']);
const VALID_MODALITIES  = new Set(['x-ray', 'mri', 'ct', 'ultrasound', 'pet', 'dexa', 'ecg', 'echo', 'endoscopy', 'other']);

/** Returns an error string if invalid, undefined if ok. Used to return clean errors to the AI model. */
function validateBiomarker(args: Record<string, unknown>): string | undefined {
  const value = Number(args.value);
  if (typeof args.name !== 'string' || !args.name) return 'name must be a non-empty string';
  if (isNaN(value) || !isFinite(value)) return `value must be a finite number, got "${args.value}"`;
  if (typeof args.unit !== 'string') return 'unit must be a string';
  if (!VALID_CATEGORIES.has(args.category as string)) return `category must be one of: ${[...VALID_CATEGORIES].join(', ')}`;
  return undefined;
}

/**
 * Execute a single Toto tool call against the database.
 * All write operations are scoped to `userId` — no cross-user access is possible.
 */
export async function executeToolCall(
  name: string,
  args: Record<string, unknown>,
  db: Pool,
  userId: string,
): Promise<string> {
  switch (name) {
    case 'create_vaccination': {
      const r = await db.query(
        `INSERT INTO vaccinations (user_id, name, date, next_due, location, batch_number, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [userId, args.name, args.date, args.nextDue ?? null, args.location ?? null, args.batchNumber ?? null, args.notes ?? null],
      );
      return `Vaccination "${args.name}" added (id: ${r.rows[0].id})`;
    }
    case 'update_vaccination': {
      await db.query(
        `UPDATE vaccinations SET
           name = COALESCE($2, name), date = COALESCE($3, date),
           next_due = COALESCE($4, next_due), location = COALESCE($5, location),
           batch_number = COALESCE($6, batch_number), notes = COALESCE($7, notes)
         WHERE id = $1 AND user_id = $8`,
        [args.id, args.name ?? null, args.date ?? null, args.nextDue ?? null, args.location ?? null, args.batchNumber ?? null, args.notes ?? null, userId],
      );
      return `Vaccination updated`;
    }
    case 'delete_vaccination': {
      await db.query(`DELETE FROM vaccinations WHERE id = $1 AND user_id = $2`, [args.id, userId]);
      return `Vaccination deleted`;
    }
    case 'create_medication': {
      const r = await db.query(
        `INSERT INTO medications (user_id, name, dosage, frequency, start_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, args.name, args.dosage ?? null, args.frequency ?? null, args.startDate ?? null, args.notes ?? null],
      );
      return `Medication "${args.name}" added (id: ${r.rows[0].id})`;
    }
    case 'update_medication': {
      await db.query(
        `UPDATE medications SET
           name = COALESCE($2, name), dosage = COALESCE($3, dosage),
           frequency = COALESCE($4, frequency), end_date = COALESCE($5, end_date),
           notes = COALESCE($6, notes), updated_at = NOW()
         WHERE id = $1 AND user_id = $7`,
        [args.id, args.name ?? null, args.dosage ?? null, args.frequency ?? null, args.endDate ?? null, args.notes ?? null, userId],
      );
      return `Medication updated`;
    }
    case 'delete_medication': {
      await db.query(`DELETE FROM medications WHERE id = $1 AND user_id = $2`, [args.id, userId]);
      return `Medication deleted`;
    }
    case 'create_condition': {
      if (args.severity && !VALID_SEVERITIES.has(args.severity as string)) {
        return `Validation error: severity must be one of: ${[...VALID_SEVERITIES].join(', ')}`;
      }
      const r = await db.query(
        `INSERT INTO medical_conditions (user_id, name, severity, diagnosed_date, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, args.name, args.severity ?? 'mild', args.diagnosedDate ?? null, args.status ?? 'active', args.notes ?? null],
      );
      return `Condition "${args.name}" added (id: ${r.rows[0].id})`;
    }
    case 'update_condition': {
      await db.query(
        `UPDATE medical_conditions SET
           severity = COALESCE($2, severity), status = COALESCE($3, status),
           resolved_date = COALESCE($4, resolved_date), notes = COALESCE($5, notes),
           updated_at = NOW()
         WHERE id = $1 AND user_id = $6`,
        [args.id, args.severity ?? null, args.status ?? null, args.resolvedDate ?? null, args.notes ?? null, userId],
      );
      return `Condition updated`;
    }
    case 'delete_condition': {
      await db.query(`DELETE FROM medical_conditions WHERE id = $1 AND user_id = $2`, [args.id, userId]);
      return `Condition deleted`;
    }
    case 'create_appointment': {
      const r = await db.query(
        `INSERT INTO appointments (user_id, title, subtitle, event_date, doctor, location, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [userId, args.title, args.subtitle ?? null, args.eventDate, args.doctor ?? null, args.location ?? null, args.notes ?? null],
      );
      return `Appointment "${args.title}" added for ${args.eventDate} (id: ${r.rows[0].id})`;
    }
    case 'update_appointment': {
      await db.query(
        `UPDATE appointments SET
           title = COALESCE($2, title), subtitle = COALESCE($3, subtitle),
           event_date = COALESCE($4, event_date), doctor = COALESCE($5, doctor),
           location = COALESCE($6, location), notes = COALESCE($7, notes),
           updated_at = NOW()
         WHERE id = $1 AND user_id = $8`,
        [args.id, args.title ?? null, args.subtitle ?? null, args.eventDate ?? null, args.doctor ?? null, args.location ?? null, args.notes ?? null, userId],
      );
      return `Appointment updated`;
    }
    case 'delete_appointment': {
      await db.query(`DELETE FROM appointments WHERE id = $1 AND user_id = $2`, [args.id, userId]);
      return `Appointment deleted`;
    }
    case 'create_allergy': {
      if (!VALID_ALLERGY_SEVERITIES.has(args.severity as string)) {
        return `Validation error: severity must be one of: ${[...VALID_ALLERGY_SEVERITIES].join(', ')}`;
      }
      const r = await db.query(
        `INSERT INTO allergies (user_id, name, severity, reaction, status, notes)
         VALUES ($1, $2, $3, $4, 'active', $5) RETURNING id`,
        [userId, args.name, args.severity, args.reaction ?? null, args.notes ?? null],
      );
      return `Allergy "${args.name}" added (id: ${r.rows[0].id})`;
    }
    case 'update_allergy': {
      await db.query(
        `UPDATE allergies SET
           name = COALESCE($2, name), severity = COALESCE($3, severity),
           reaction = COALESCE($4, reaction), notes = COALESCE($5, notes),
           updated_at = NOW()
         WHERE id = $1 AND user_id = $6`,
        [args.id, args.name ?? null, args.severity ?? null, args.reaction ?? null, args.notes ?? null, userId],
      );
      return `Allergy updated`;
    }
    case 'resolve_allergy': {
      await db.query(
        `UPDATE allergies SET status = 'resolved', updated_at = NOW() WHERE id = $1 AND user_id = $2`,
        [args.id, userId],
      );
      return `Allergy marked as resolved`;
    }
    case 'create_trip': {
      const r = await db.query(
        `INSERT INTO trips (user_id, departure_location, destination, departure_date, return_date, timezone, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [userId, args.departureLocation, args.destination, args.departureDate, args.returnDate ?? null, args.timezone ?? null, args.notes ?? null],
      );
      return `Trip to ${args.destination} added (id: ${r.rows[0].id})`;
    }
    case 'update_trip': {
      await db.query(
        `UPDATE trips SET
           departure_location = COALESCE($2, departure_location),
           destination = COALESCE($3, destination),
           departure_date = COALESCE($4, departure_date),
           return_date = COALESCE($5, return_date),
           timezone = COALESCE($6, timezone),
           notes = COALESCE($7, notes),
           updated_at = NOW()
         WHERE id = $1 AND user_id = $8`,
        [args.id, args.departureLocation ?? null, args.destination ?? null, args.departureDate ?? null, args.returnDate ?? null, args.timezone ?? null, args.notes ?? null, userId],
      );
      return `Trip updated`;
    }
    case 'delete_trip': {
      await db.query(`DELETE FROM trips WHERE id = $1 AND user_id = $2`, [args.id, userId]);
      return `Trip deleted`;
    }
    case 'log_symptom': {
      const r = await db.query(
        `INSERT INTO symptoms (user_id, type, category, severity, duration, location, notes, factors, logged_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [userId, args.type, args.category, args.severity, args.duration ?? null, args.location ?? null, args.notes ?? null, args.factors ?? [], args.loggedAt ?? new Date()],
      );
      return `Symptom "${args.category}" logged (id: ${r.rows[0].id})`;
    }
    case 'delete_symptom': {
      await db.query(`DELETE FROM symptoms WHERE id = $1 AND user_id = $2`, [args.id, userId]);
      return `Symptom deleted`;
    }

    // ── Profile data helpers (atomic jsonb ops — no read-modify-write race) ──

    case 'update_blood_type': {
      await db.query(
        `UPDATE users SET profile_data = COALESCE(profile_data,'{}')::jsonb || $2::jsonb, updated_at = NOW() WHERE id = $1`,
        [userId, JSON.stringify({ bloodType: args.bloodType })],
      );
      return `Blood type set to ${args.bloodType}`;
    }
    case 'update_lifestyle': {
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{lifestyle}',
             COALESCE(profile_data->'lifestyle','{}') || $2::jsonb),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, JSON.stringify(args)],
      );
      return `Lifestyle info updated`;
    }
    case 'add_health_id': {
      const entry = JSON.stringify({ _id: Date.now().toString(36), ...args });
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{healthIDs}',
             COALESCE(profile_data->'healthIDs','[]') || $2::jsonb),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, `[${entry}]`],
      );
      return `Health ID added`;
    }
    case 'update_health_id': {
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{healthIDs}',
             (SELECT jsonb_agg(CASE WHEN e->>'_id' = $2 THEN e || $3::jsonb ELSE e END)
              FROM jsonb_array_elements(COALESCE(profile_data->'healthIDs','[]')) e)),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id, JSON.stringify(args)],
      );
      return `Health ID updated`;
    }
    case 'delete_health_id': {
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{healthIDs}',
             (SELECT COALESCE(jsonb_agg(e),'[]') FROM jsonb_array_elements(COALESCE(profile_data->'healthIDs','[]')) e WHERE e->>'_id' != $2)),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id],
      );
      return `Health ID deleted`;
    }
    case 'add_emergency_contact': {
      const contact = JSON.stringify({ _id: Date.now().toString(36), ...args });
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{emergencyContacts}',
             COALESCE(profile_data->'emergencyContacts','[]') || $2::jsonb),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, `[${contact}]`],
      );
      return `Emergency contact added`;
    }
    case 'update_emergency_contact': {
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{emergencyContacts}',
             (SELECT jsonb_agg(CASE WHEN e->>'_id' = $2 THEN e || $3::jsonb ELSE e END)
              FROM jsonb_array_elements(COALESCE(profile_data->'emergencyContacts','[]')) e)),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id, JSON.stringify(args)],
      );
      return `Emergency contact updated`;
    }
    case 'delete_emergency_contact': {
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{emergencyContacts}',
             (SELECT COALESCE(jsonb_agg(e),'[]') FROM jsonb_array_elements(COALESCE(profile_data->'emergencyContacts','[]')) e WHERE e->>'_id' != $2)),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id],
      );
      return `Emergency contact deleted`;
    }
    case 'add_doctor': {
      const doc = JSON.stringify({ _id: Date.now().toString(36), ...args });
      if (args.isPrimary) {
        await db.query(
          `UPDATE users SET profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{primaryDoctor}', $2::jsonb), updated_at = NOW() WHERE id = $1`,
          [userId, doc],
        );
      } else {
        await db.query(
          `UPDATE users SET
             profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{doctors}',
               COALESCE(profile_data->'doctors','[]') || $2::jsonb),
             updated_at = NOW()
           WHERE id = $1`,
          [userId, `[${doc}]`],
        );
      }
      return `Doctor added`;
    }
    case 'update_doctor': {
      await db.query(
        `UPDATE users SET
           profile_data = CASE
             WHEN profile_data->'primaryDoctor'->>'_id' = $2
               THEN jsonb_set(profile_data, '{primaryDoctor}', profile_data->'primaryDoctor' || $3::jsonb)
             ELSE jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{doctors}',
               (SELECT jsonb_agg(CASE WHEN e->>'_id' = $2 THEN e || $3::jsonb ELSE e END)
                FROM jsonb_array_elements(COALESCE(profile_data->'doctors','[]')) e))
           END,
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id, JSON.stringify(args)],
      );
      return `Doctor updated`;
    }
    case 'delete_doctor': {
      await db.query(
        `UPDATE users SET
           profile_data = CASE
             WHEN profile_data->'primaryDoctor'->>'_id' = $2
               THEN profile_data - 'primaryDoctor'
             ELSE jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{doctors}',
               (SELECT COALESCE(jsonb_agg(e),'[]') FROM jsonb_array_elements(COALESCE(profile_data->'doctors','[]')) e WHERE e->>'_id' != $2))
           END,
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id],
      );
      return `Doctor deleted`;
    }
    case 'add_screening': {
      const screening = JSON.stringify({ _id: Date.now().toString(36), ...args });
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{screenings}',
             COALESCE(profile_data->'screenings','[]') || $2::jsonb),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, `[${screening}]`],
      );
      return `Screening added`;
    }
    case 'update_screening': {
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{screenings}',
             (SELECT jsonb_agg(CASE WHEN e->>'_id' = $2 THEN e || $3::jsonb ELSE e END)
              FROM jsonb_array_elements(COALESCE(profile_data->'screenings','[]')) e)),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id, JSON.stringify(args)],
      );
      return `Screening updated`;
    }
    case 'delete_screening': {
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{screenings}',
             (SELECT COALESCE(jsonb_agg(e),'[]') FROM jsonb_array_elements(COALESCE(profile_data->'screenings','[]')) e WHERE e->>'_id' != $2)),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id],
      );
      return `Screening deleted`;
    }
    case 'add_family_history': {
      const fh = JSON.stringify({ _id: Date.now().toString(36), ...args });
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{familyHistory}',
             COALESCE(profile_data->'familyHistory','[]') || $2::jsonb),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, `[${fh}]`],
      );
      return `Family history entry added`;
    }
    case 'delete_family_history': {
      await db.query(
        `UPDATE users SET
           profile_data = jsonb_set(COALESCE(profile_data,'{}')::jsonb, '{familyHistory}',
             (SELECT COALESCE(jsonb_agg(e),'[]') FROM jsonb_array_elements(COALESCE(profile_data->'familyHistory','[]')) e WHERE e->>'_id' != $2)),
           updated_at = NOW()
         WHERE id = $1`,
        [userId, args._id],
      );
      return `Family history entry deleted`;
    }
    case 'add_biomarker': {
      const biomarkerErr = validateBiomarker(args);
      if (biomarkerErr) return `Validation error: ${biomarkerErr}`;
      const r = await db.query(
        `INSERT INTO biomarkers (user_id, name, value, unit, category, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, name, recorded_at) DO UPDATE SET value = EXCLUDED.value
         RETURNING id`,
        [userId, args.name, Number(args.value), args.unit, args.category, args.recordedAt ?? new Date()],
      );
      return `Biomarker "${args.name}" = ${args.value} ${args.unit} recorded (id: ${r.rows[0].id})`;
    }
    case 'update_biomarker': {
      if (args.value !== undefined && (isNaN(Number(args.value)) || !isFinite(Number(args.value)))) {
        return `Validation error: value must be a finite number, got "${args.value}"`;
      }
      if (args.category !== undefined && !VALID_CATEGORIES.has(args.category as string)) {
        return `Validation error: category must be one of: ${[...VALID_CATEGORIES].join(', ')}`;
      }
      await db.query(
        `UPDATE biomarkers SET
           value = COALESCE($2, value),
           unit = COALESCE($3, unit),
           category = COALESCE($4, category),
           updated_at = NOW()
         WHERE id = $1 AND user_id = $5`,
        [args.id, args.value != null ? Number(args.value) : null, args.unit ?? null, args.category ?? null, userId],
      );
      return `Biomarker updated`;
    }
    case 'delete_biomarker': {
      await db.query(`DELETE FROM biomarkers WHERE id = $1 AND user_id = $2`, [args.id, userId]);
      return `Biomarker deleted`;
    }
    case 'add_imaging_result': {
      if (args.modality && !VALID_MODALITIES.has(args.modality as string)) {
        return `Validation error: modality must be one of: ${[...VALID_MODALITIES].join(', ')}`;
      }
      const r = await db.query(
        `INSERT INTO imaging_results
           (user_id, modality, body_part, study_date, facility, radiologist, findings, impression, measurements, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [userId, args.modality, args.bodyPart ?? null, args.studyDate ?? null,
         args.facility ?? null, args.radiologist ?? null, args.findings ?? null,
         args.impression ?? null, args.measurements ? JSON.stringify(args.measurements) : null, args.notes ?? null],
      );
      return `Imaging result (${args.modality}${args.bodyPart ? ` — ${args.bodyPart}` : ''}) saved (id: ${r.rows[0].id})`;
    }
    case 'update_imaging_result': {
      await db.query(
        `UPDATE imaging_results SET
           modality = COALESCE($2, modality),
           body_part = COALESCE($3, body_part),
           study_date = COALESCE($4, study_date),
           facility = COALESCE($5, facility),
           radiologist = COALESCE($6, radiologist),
           findings = COALESCE($7, findings),
           impression = COALESCE($8, impression),
           measurements = COALESCE($9, measurements),
           notes = COALESCE($10, notes),
           updated_at = NOW()
         WHERE id = $1 AND user_id = $11`,
        [args.id, args.modality ?? null, args.bodyPart ?? null, args.studyDate ?? null,
         args.facility ?? null, args.radiologist ?? null, args.findings ?? null,
         args.impression ?? null, args.measurements ? JSON.stringify(args.measurements) : null,
         args.notes ?? null, userId],
      );
      return `Imaging result updated`;
    }
    case 'delete_imaging_result': {
      await db.query(`DELETE FROM imaging_results WHERE id = $1 AND user_id = $2`, [args.id, userId]);
      return `Imaging result deleted`;
    }
    default:
      return `Unknown tool: ${name}`;
  }
}
