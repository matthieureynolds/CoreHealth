import { UserProfile } from "@shared/types";

const fmt = (dateString: string) => new Date(dateString).toLocaleDateString();

export const generateReportHTML = (
  patientName: string,
  selectedSections: string[],
  profile: UserProfile | null | undefined,
): string => {
  const currentDate = new Date().toLocaleDateString();

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>TOTO Health Report</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:20px;background-color:white;color:#333;line-height:1.6;}
.header{text-align:center;border-bottom:2px solid #3AABF0;padding-bottom:20px;margin-bottom:30px;}
.title{font-size:28px;font-weight:bold;color:#3AABF0;margin-bottom:10px;}
.subtitle{font-size:16px;color:#666;margin-bottom:5px;}
.section{margin-bottom:30px;page-break-inside:avoid;}
.section-title{font-size:20px;font-weight:bold;color:#3AABF0;border-bottom:1px solid #eee;padding-bottom:10px;margin-bottom:15px;}
.item{background-color:#f8f9fa;border-left:4px solid #3AABF0;padding:15px;margin-bottom:10px;border-radius:4px;}
.item-title{font-weight:bold;color:#333;margin-bottom:5px;}
.item-detail{color:#666;font-size:14px;margin-bottom:3px;}
.empty-section{color:#999;font-style:italic;text-align:center;padding:20px;background-color:#f8f9fa;border-radius:4px;}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#666;font-size:12px;}
.warning{background-color:#fff3cd;border:1px solid #ffeaa7;color:#856404;padding:15px;border-radius:4px;margin-bottom:20px;}
</style></head><body>
<div class="header"><div class="title">TOTO Health Report</div><div class="subtitle">Generated on ${currentDate}</div><div class="subtitle">Patient: ${patientName}</div></div>
<div class="warning"><strong>⚠️ Confidential Medical Information</strong><br>This report contains sensitive health information. Please handle with appropriate care and only share with authorized healthcare providers.</div>`;

  if (selectedSections.includes("personal_info")) {
    html += `<div class="section"><div class="section-title">Personal Information</div><div class="item"><div class="item-title">Basic Information</div><div class="item-detail">Name: ${patientName}</div><div class="item-detail">Age: ${profile?.age || "Not specified"} years</div><div class="item-detail">Gender: ${profile?.gender || "Not specified"}</div>${profile?.height ? `<div class="item-detail">Height: ${profile.height} cm</div>` : ""}${profile?.weight ? `<div class="item-detail">Weight: ${profile.weight} kg</div>` : ""}${profile?.bloodType ? `<div class="item-detail">Blood Type: ${profile.bloodType}</div>` : ""}</div></div>`;
  }

  if (
    selectedSections.includes("medical_conditions") &&
    profile?.medicalHistory?.length
  ) {
    html += `<div class="section"><div class="section-title">Medical Conditions</div>`;
    profile.medicalHistory.forEach((c) => {
      html += `<div class="item"><div class="item-title">${c.condition}</div><div class="item-detail">Diagnosed: ${fmt(c.diagnosedDate)}</div><div class="item-detail">Severity: ${c.severity}</div><div class="item-detail">Status: ${c.status}</div>${c.resolvedDate ? `<div class="item-detail">Resolved: ${fmt(c.resolvedDate)}</div>` : ""}${c.notes ? `<div class="item-detail">Notes: ${c.notes}</div>` : ""}</div>`;
    });
    html += `</div>`;
  } else if (selectedSections.includes("medical_conditions")) {
    html += `<div class="section"><div class="section-title">Medical Conditions</div><div class="empty-section">No medical conditions recorded</div></div>`;
  }

  if (
    selectedSections.includes("medications") &&
    profile?.medications?.length
  ) {
    html += `<div class="section"><div class="section-title">Current Medications</div>`;
    profile.medications.forEach((m) => {
      html += `<div class="item"><div class="item-title">${m.name}</div>${m.dosage ? `<div class="item-detail">Dosage: ${m.dosage}</div>` : ""}${m.frequency ? `<div class="item-detail">Frequency: ${m.frequency}</div>` : ""}${m.startDate ? `<div class="item-detail">Started: ${fmt(m.startDate)}</div>` : ""}${m.duration ? `<div class="item-detail">Duration: ${m.duration}</div>` : ""}${m.notes ? `<div class="item-detail">Notes: ${m.notes}</div>` : ""}</div>`;
    });
    html += `</div>`;
  } else if (selectedSections.includes("medications")) {
    html += `<div class="section"><div class="section-title">Current Medications</div><div class="empty-section">No medications recorded</div></div>`;
  }

  if (selectedSections.includes("allergies") && profile?.allergies?.length) {
    html += `<div class="section"><div class="section-title">Allergies</div>`;
    profile.allergies.forEach((a) => {
      html += `<div class="item"><div class="item-title">${a.name}</div><div class="item-detail">Severity: ${a.severity}</div><div class="item-detail">Status: ${a.status}</div><div class="item-detail">Started: ${fmt(a.startDate)}</div>${a.endDate ? `<div class="item-detail">Resolved: ${fmt(a.endDate)}</div>` : ""}${a.reaction ? `<div class="item-detail">Reaction: ${a.reaction}</div>` : ""}${a.notes ? `<div class="item-detail">Notes: ${a.notes}</div>` : ""}</div>`;
    });
    html += `</div>`;
  } else if (selectedSections.includes("allergies")) {
    html += `<div class="section"><div class="section-title">Allergies</div><div class="empty-section">No allergies recorded</div></div>`;
  }

  if (
    selectedSections.includes("family_history") &&
    profile?.familyHistory?.length
  ) {
    html += `<div class="section"><div class="section-title">Family Medical History</div>`;
    profile.familyHistory.forEach((c) => {
      html += `<div class="item"><div class="item-title">${c.condition}</div><div class="item-detail">Relation: ${c.relation}</div>${c.ageOfOnset ? `<div class="item-detail">Age of Onset: ${c.ageOfOnset} years</div>` : ""}</div>`;
    });
    html += `</div>`;
  } else if (selectedSections.includes("family_history")) {
    html += `<div class="section"><div class="section-title">Family Medical History</div><div class="empty-section">No family history recorded</div></div>`;
  }

  if (
    selectedSections.includes("vaccinations") &&
    (profile?.vaccinations?.length ?? 0) > 0
  ) {
    html += `<div class="section"><div class="section-title">Vaccinations</div>`;
    profile!.vaccinations!.forEach((v) => {
      html += `<div class="item"><div class="item-title">${v.name}</div><div class="item-detail">Date Received: ${fmt(v.date.toISOString())}</div>${v.nextDue ? `<div class="item-detail">Next Due: ${fmt(v.nextDue.toISOString())}</div>` : ""}${v.location ? `<div class="item-detail">Location: ${v.location}</div>` : ""}${v.batchNumber ? `<div class="item-detail">Batch Number: ${v.batchNumber}</div>` : ""}${v.notes ? `<div class="item-detail">Notes: ${v.notes}</div>` : ""}</div>`;
    });
    html += `</div>`;
  } else if (selectedSections.includes("vaccinations")) {
    html += `<div class="section"><div class="section-title">Vaccinations</div><div class="empty-section">No vaccinations recorded</div></div>`;
  }

  if (
    selectedSections.includes("screenings") &&
    (profile?.screenings?.length ?? 0) > 0
  ) {
    html += `<div class="section"><div class="section-title">Health Screenings</div>`;
    profile!.screenings!.forEach((s) => {
      html += `<div class="item"><div class="item-title">${s.name}</div><div class="item-detail">Date: ${fmt(s.date.toISOString())}</div><div class="item-detail">Result: ${s.result}</div>${s.nextDue ? `<div class="item-detail">Next Due: ${fmt(s.nextDue.toISOString())}</div>` : ""}${s.location ? `<div class="item-detail">Location: ${s.location}</div>` : ""}${s.notes ? `<div class="item-detail">Notes: ${s.notes}</div>` : ""}</div>`;
    });
    html += `</div>`;
  } else if (selectedSections.includes("screenings")) {
    html += `<div class="section"><div class="section-title">Health Screenings</div><div class="empty-section">No screenings recorded</div></div>`;
  }

  if (
    selectedSections.includes("medical_records") &&
    (profile?.medicalRecords?.length ?? 0) > 0
  ) {
    html += `<div class="section"><div class="section-title">Medical Records</div>`;
    profile!.medicalRecords!.forEach((r) => {
      html += `<div class="item"><div class="item-title">${r.name}</div><div class="item-detail">Type: ${r.type}</div><div class="item-detail">Date: ${fmt(r.date.toISOString())}</div>${r.fileSize ? `<div class="item-detail">File Size: ${r.fileSize} KB</div>` : ""}${r.notes ? `<div class="item-detail">Notes: ${r.notes}</div>` : ""}</div>`;
    });
    html += `</div>`;
  } else if (selectedSections.includes("medical_records")) {
    html += `<div class="section"><div class="section-title">Medical Records</div><div class="empty-section">No medical records uploaded</div></div>`;
  }

  html += `<div class="footer"><p>Generated by TOTO App</p><p>This report is for informational purposes only and should not replace professional medical advice.</p></div></body></html>`;
  return html;
};
