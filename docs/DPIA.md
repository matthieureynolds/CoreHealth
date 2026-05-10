# Data Protection Impact Assessment (DPIA)

**Controller:** CoreHealth (sole trader / company to be incorporated)  
**Product:** CoreHealth mobile application  
**DPO / Privacy Contact:** privacy@corehealth.ai  
**Version:** 1.0  
**Date:** 2026-05-01  
**Next Review:** 2027-05-01  
**Status:** DRAFT — requires legal review before App Store launch

---

## 1. Necessity of DPIA

A DPIA is mandatory under GDPR Article 35 when processing is "likely to result in a high risk to the rights and freedoms of natural persons." CoreHealth meets **three** triggers:

| Trigger | Status |
|---|---|
| Systematic processing of health data (Art. 9 special category) | ✓ Yes |
| Large-scale profiling and evaluation | ✓ Yes |
| Innovative technology (AI/ML applied to personal health data) | ✓ Yes |

---

## 2. Description of Processing

### 2.1 What data is processed

| Category | Examples | Legal Basis |
|---|---|---|
| Identity | Name, email, date of birth, gender | Art. 6(1)(b) contract |
| Health (special category) | Biomarkers, lab results, symptoms, medications, conditions, vaccinations, wearable data | Art. 9(2)(a) explicit consent |
| AI-generated health insights | Health scores, trend analysis, risk flags, personalised recommendations | Art. 9(2)(a) explicit consent |
| Conversation history | AI chat messages with Toto | Art. 9(2)(a) explicit consent |
| Location | GPS coordinates, city-level travel health data | Art. 6(1)(a) consent |
| Device data | Step count, sleep, heart rate from Whoop/Oura/Apple Health | Art. 9(2)(a) explicit consent |
| Family health signals | Hereditary risk signals shared by family members | Art. 9(2)(a) explicit consent of both parties |
| Imaging results | Medical imaging metadata and AI-extracted findings | Art. 9(2)(a) explicit consent |

### 2.2 Purpose of processing

1. Providing the CoreHealth AI health intelligence platform
2. Generating personalised health insights and recommendations
3. Storing and displaying user health records
4. Enabling AI-to-user conversation (Toto)
5. Travel health risk assessment
6. Family hereditary risk analysis (opt-in)
7. GDPR compliance (consent records, audit trails)

### 2.3 Who processes the data

| Processor | Role | Location | Transfer mechanism |
|---|---|---|---|
| AWS (RDS, Cognito, Lambda, S3) | Cloud infrastructure | EU (eu-north-1, Stockholm) | EU-based, no transfer |
| OpenAI | AI inference (Toto chat) | USA | Standard Contractual Clauses (SCCs) + DPA required |
| Google Cloud Vision | Lab result OCR | USA | Standard Contractual Clauses (SCCs) + DPA |
| Expo / EAS | App build + push notifications | USA | SCCs |

### 2.4 Retention periods

| Data type | Retention |
|---|---|
| Chat messages | 365 days (automated deletion) |
| Device/wearable data | 730 days |
| Symptoms | 1,825 days (5 years, clinical relevance) |
| Health alerts | 365 days |
| Medical records (biomarkers, lab results, etc.) | Until account deletion |
| Consent records | 7 years (legal obligation) |
| Account data | Until account deletion |
| Backups | 7 days rolling |

---

## 3. Necessity and Proportionality

### 3.1 Is processing necessary?

- Health data is the core product — without it, the service cannot function.
- AI processing is the differentiating feature — without it, no personalised insights.
- Location data is optional and separately consented — user can disable.
- Family signals require explicit bilateral consent.

### 3.2 Proportionality measures

- Users can delete their account and all data at any time
- Granular consent: location separately gated
- Automated retention cleanup for time-limited data categories
- Data minimisation: location stored as city-level, not precise coordinates in AI context
- Purpose limitation: health data not used for advertising or third-party sale

---

## 4. Risks Identified and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Unauthorised access to health records | Low | Very High | AWS Cognito auth, API-level authorisation (requireSelf), RDS in private VPC subnet, WAF, encryption at rest and in transit |
| AI model (OpenAI) retaining training data | Medium | High | OpenAI Business API with DPA and no-training addendum required before launch |
| Data breach — S3 lab result documents | Low | Very High | Private S3 bucket, presigned GET URLs (short-lived), no public access |
| Inaccurate AI health recommendations | Medium | High | Disclaimer in app: not a medical device, not medical advice; EU AI Act transparency notice |
| User under 18 accessing the service | Low | Medium | Age gate at registration (client-side DOB check); server-side DOB validation recommended before launch |
| Consent not properly recorded (social login) | Low | Medium | Pending consent flushed in Hub signedIn event; retry logic implemented |
| Cross-border transfer to OpenAI/Google | Medium | Medium | SCCs and DPAs required; currently mitigated by API-key access only (no bulk transfer) |
| Family member sharing sensitive genetic data without understanding implications | Low | High | Bilateral consent required; clear in-app messaging about nature of shared data |
| Data subject rights requests not fulfilled within 30 days | Low | Medium | Data export endpoint (GDPR Art. 20), account deletion (Art. 17), consent withdrawal (Art. 7(3)) all implemented |

---

## 5. Residual Risks and Accepted Risks

| Risk | Residual Level | Acceptance |
|---|---|---|
| OpenAI data processing without signed DPA | HIGH | **Not accepted** — DPA must be signed before launch |
| Age gate server-side validation missing | MEDIUM | Accepted with mitigation: server-side DOB field present; validation to be added |
| MFA not mandatory | LOW | Accepted: TOTP MFA available as optional; mandatory MFA would harm UX for health app |
| CloudFront distribution without signed URL enforcement | LOW | Accepted with mitigation: downloads now use presigned S3 GET URLs via Lambda |

---

## 6. Consultation

- [ ] Legal counsel to review before App Store submission
- [ ] OpenAI DPA to be signed: dashboard.openai.com → Settings → Privacy → DPA
- [ ] Google Cloud DPA: console.cloud.google.com → IAM → Data Processing Amendment
- [ ] UK ICO pre-consultation (optional, recommended given health data category)
- [ ] Notify ICO/DPA if any high residual risk remains unmitigated before launch

---

## 7. Sign-off

| Role | Name | Date |
|---|---|---|
| Controller (founder) | Marie-Hélène Reynolds | |
| Legal advisor | TBC | |
| DPO (if appointed) | N/A (< 250 employees) | |

---

## 8. Review Trigger Events

This DPIA must be reviewed when:
- A new category of personal data is processed
- A new AI model or processor is introduced
- A new country of operation is targeted
- A data breach occurs
- Significant feature changes affect data flows
- 12 months have elapsed since last review
