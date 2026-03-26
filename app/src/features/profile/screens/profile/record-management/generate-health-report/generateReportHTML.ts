import { UserProfile } from '../../../../../../shared/types';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

export const generateHTML = (
  patientName: string,
  profile: UserProfile | null | undefined,
  selectedSections: string[]
): string => {
  const currentDate = new Date().toLocaleDateString();

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TOTO Health Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: white;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #3AABF0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title { font-size: 28px; font-weight: bold; color: #3AABF0; margin-bottom: 10px; }
        .subtitle { font-size: 16px; color: #666; margin-bottom: 5px; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        .section-title {
          font-size: 20px; font-weight: bold; color: #3AABF0;
          border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;
        }
        .item {
          background-color: #f8f9fa; border-left: 4px solid #3AABF0;
          padding: 15px; margin-bottom: 10px; border-radius: 4px;
        }
        .item-title { font-weight: bold; color: #333; margin-bottom: 5px; }
        .item-detail { color: #666; font-size: 14px; margin-bottom: 3px; }
        .empty-section {
          color: #999; font-style: italic; text-align: center;
          padding: 20px; background-color: #f8f9fa; border-radius: 4px;
        }
        .footer {
          margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;
          text-align: center; color: #666; font-size: 12px;
        }
        .warning {
          background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404;
          padding: 15px; border-radius: 4px; margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">TOTO Health Report</div>
        <div class="subtitle">Generated on ${currentDate}</div>
        <div class="subtitle">Patient: ${patientName}</div>
      </div>
      <div class="warning">
        <strong>⚠️ Confidential Medical Information</strong><br>
        This report contains sensitive health information. Please handle with appropriate care and only share with authorized healthcare providers.
      </div>
  `;

  if (selectedSections.includes('personal_info')) {
    html += `
      <div class="section">
        <div class="section-title">Personal Information</div>
        <div class="item">
          <div class="item-title">Basic Information</div>
          <div class="item-detail">Name: ${patientName}</div>
          <div class="item-detail">Age: ${profile?.age || 'Not specified'} years</div>
          <div class="item-detail">Gender: ${profile?.gender || 'Not specified'}</div>
          ${profile?.height ? `<div class="item-detail">Height: ${profile.height} cm</div>` : ''}
          ${profile?.weight ? `<div class="item-detail">Weight: ${profile.weight} kg</div>` : ''}
          ${profile?.bloodType ? `<div class="item-detail">Blood Type: ${profile.bloodType}</div>` : ''}
        </div>
      </div>
    `;
  }

  if (selectedSections.includes('medical_conditions') && profile?.medicalHistory && profile.medicalHistory.length > 0) {
    html += `<div class="section"><div class="section-title">Medical Conditions</div>`;
    profile.medicalHistory.forEach((condition) => {
      html += `
        <div class="item">
          <div class="item-title">${condition.condition}</div>
          <div class="item-detail">Diagnosed: ${formatDate(condition.diagnosedDate)}</div>
          <div class="item-detail">Severity: ${condition.severity}</div>
          <div class="item-detail">Status: ${condition.status}</div>
          ${condition.resolvedDate ? `<div class="item-detail">Resolved: ${formatDate(condition.resolvedDate)}</div>` : ''}
          ${condition.notes ? `<div class="item-detail">Notes: ${condition.notes}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  } else if (selectedSections.includes('medical_conditions')) {
    html += `<div class="section"><div class="section-title">Medical Conditions</div><div class="empty-section">No medical conditions recorded</div></div>`;
  }

  if (selectedSections.includes('medications') && profile?.medications && profile.medications.length > 0) {
    html += `<div class="section"><div class="section-title">Current Medications</div>`;
    profile.medications.forEach((medication) => {
      html += `
        <div class="item">
          <div class="item-title">${medication.name}</div>
          ${medication.dosage ? `<div class="item-detail">Dosage: ${medication.dosage}</div>` : ''}
          ${medication.frequency ? `<div class="item-detail">Frequency: ${medication.frequency}</div>` : ''}
          ${medication.startDate ? `<div class="item-detail">Started: ${formatDate(medication.startDate)}</div>` : ''}
          ${medication.duration ? `<div class="item-detail">Duration: ${medication.duration}</div>` : ''}
          ${medication.notes ? `<div class="item-detail">Notes: ${medication.notes}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  } else if (selectedSections.includes('medications')) {
    html += `<div class="section"><div class="section-title">Current Medications</div><div class="empty-section">No medications recorded</div></div>`;
  }

  if (selectedSections.includes('allergies') && profile?.allergies && profile.allergies.length > 0) {
    html += `<div class="section"><div class="section-title">Allergies</div>`;
    profile.allergies.forEach((allergy) => {
      html += `
        <div class="item">
          <div class="item-title">${allergy.name}</div>
          <div class="item-detail">Severity: ${allergy.severity}</div>
          <div class="item-detail">Status: ${allergy.status}</div>
          <div class="item-detail">Started: ${formatDate(allergy.startDate)}</div>
          ${allergy.endDate ? `<div class="item-detail">Resolved: ${formatDate(allergy.endDate)}</div>` : ''}
          ${allergy.reaction ? `<div class="item-detail">Reaction: ${allergy.reaction}</div>` : ''}
          ${allergy.notes ? `<div class="item-detail">Notes: ${allergy.notes}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  } else if (selectedSections.includes('allergies')) {
    html += `<div class="section"><div class="section-title">Allergies</div><div class="empty-section">No allergies recorded</div></div>`;
  }

  if (selectedSections.includes('family_history') && profile?.familyHistory && profile.familyHistory.length > 0) {
    html += `<div class="section"><div class="section-title">Family Medical History</div>`;
    profile.familyHistory.forEach((condition) => {
      html += `
        <div class="item">
          <div class="item-title">${condition.condition}</div>
          <div class="item-detail">Relation: ${condition.relation}</div>
          ${condition.ageOfOnset ? `<div class="item-detail">Age of Onset: ${condition.ageOfOnset} years</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  } else if (selectedSections.includes('family_history')) {
    html += `<div class="section"><div class="section-title">Family Medical History</div><div class="empty-section">No family history recorded</div></div>`;
  }

  if (selectedSections.includes('vaccinations') && profile && (profile.vaccinations?.length ?? 0) > 0) {
    html += `<div class="section"><div class="section-title">Vaccinations</div>`;
    profile.vaccinations!.forEach((vaccination) => {
      html += `
        <div class="item">
          <div class="item-title">${vaccination.name}</div>
          <div class="item-detail">Date Received: ${formatDate(vaccination.date.toISOString())}</div>
          ${vaccination.nextDue ? `<div class="item-detail">Next Due: ${formatDate(vaccination.nextDue.toISOString())}</div>` : ''}
          ${vaccination.location ? `<div class="item-detail">Location: ${vaccination.location}</div>` : ''}
          ${vaccination.batchNumber ? `<div class="item-detail">Batch Number: ${vaccination.batchNumber}</div>` : ''}
          ${vaccination.notes ? `<div class="item-detail">Notes: ${vaccination.notes}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  } else if (selectedSections.includes('vaccinations')) {
    html += `<div class="section"><div class="section-title">Vaccinations</div><div class="empty-section">No vaccinations recorded</div></div>`;
  }

  if (selectedSections.includes('screenings') && profile && (profile.screenings?.length ?? 0) > 0) {
    html += `<div class="section"><div class="section-title">Health Screenings</div>`;
    profile.screenings!.forEach((screening) => {
      html += `
        <div class="item">
          <div class="item-title">${screening.name}</div>
          <div class="item-detail">Date: ${formatDate(screening.date.toISOString())}</div>
          <div class="item-detail">Result: ${screening.result}</div>
          ${screening.nextDue ? `<div class="item-detail">Next Due: ${formatDate(screening.nextDue.toISOString())}</div>` : ''}
          ${screening.location ? `<div class="item-detail">Location: ${screening.location}</div>` : ''}
          ${screening.notes ? `<div class="item-detail">Notes: ${screening.notes}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  } else if (selectedSections.includes('screenings')) {
    html += `<div class="section"><div class="section-title">Health Screenings</div><div class="empty-section">No screenings recorded</div></div>`;
  }

  if (selectedSections.includes('medical_records') && profile && (profile.medicalRecords?.length ?? 0) > 0) {
    html += `<div class="section"><div class="section-title">Medical Records</div>`;
    profile.medicalRecords!.forEach((record) => {
      html += `
        <div class="item">
          <div class="item-title">${record.name}</div>
          <div class="item-detail">Type: ${record.type}</div>
          <div class="item-detail">Date: ${formatDate(record.date.toISOString())}</div>
          ${record.fileSize ? `<div class="item-detail">File Size: ${record.fileSize} KB</div>` : ''}
          ${record.notes ? `<div class="item-detail">Notes: ${record.notes}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  } else if (selectedSections.includes('medical_records')) {
    html += `<div class="section"><div class="section-title">Medical Records</div><div class="empty-section">No medical records uploaded</div></div>`;
  }

  html += `
      <div class="footer">
        <p>Generated by TOTO App</p>
        <p>This report is for informational purposes only and should not replace professional medical advice.</p>
      </div>
    </body>
    </html>
  `;

  return html;
};
