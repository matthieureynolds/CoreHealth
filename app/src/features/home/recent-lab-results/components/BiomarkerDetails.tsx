import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface BiomarkerDetail {
  description: string;
  normalRange: string;
  optimalRange: string;
  whatItMeans: string;
  recommendations: string[];
  riskFactors: string[];
}

export const getBiomarkerDetails = (id: string): BiomarkerDetail => {
  const details: Record<string, BiomarkerDetail> = {
    total_cholesterol: {
      description:
        "Total cholesterol measures the total amount of cholesterol in your blood, including both HDL and LDL cholesterol.",
      normalRange: "Less than 200 mg/dL",
      optimalRange: "Less than 180 mg/dL",
      whatItMeans:
        "High total cholesterol can increase your risk of heart disease and stroke. It's important to maintain healthy levels through diet and exercise.",
      recommendations: [
        "Reduce saturated and trans fats in your diet",
        "Increase fiber intake with fruits, vegetables, and whole grains",
        "Exercise regularly (at least 150 minutes per week)",
        "Maintain a healthy weight",
        "Consider medication if lifestyle changes aren't sufficient",
      ],
      riskFactors: [
        "Family history of high cholesterol",
        "Poor diet high in saturated fats",
        "Lack of physical activity",
        "Obesity",
        "Smoking",
      ],
    },
    ldl_cholesterol: {
      description:
        'LDL (low-density lipoprotein) cholesterol is often called "bad" cholesterol because it can build up in artery walls.',
      normalRange: "Less than 100 mg/dL",
      optimalRange: "Less than 70 mg/dL",
      whatItMeans:
        "High LDL cholesterol is a major risk factor for heart disease and stroke. Lower levels are generally better for heart health.",
      recommendations: [
        "Follow a heart-healthy diet (DASH or Mediterranean)",
        "Limit red meat and full-fat dairy products",
        "Choose lean proteins and plant-based foods",
        "Exercise regularly",
        "Quit smoking if applicable",
      ],
      riskFactors: [
        "High saturated fat diet",
        "Lack of exercise",
        "Obesity",
        "Diabetes",
        "Family history",
      ],
    },
    glucose: {
      description:
        "Fasting glucose measures your blood sugar level after not eating for at least 8 hours.",
      normalRange: "70-99 mg/dL",
      optimalRange: "70-85 mg/dL",
      whatItMeans:
        "High fasting glucose can indicate prediabetes or diabetes. Maintaining healthy levels is crucial for overall health.",
      recommendations: [
        "Limit refined carbohydrates and sugary foods",
        "Eat regular, balanced meals",
        "Exercise regularly to improve insulin sensitivity",
        "Maintain a healthy weight",
        "Monitor blood sugar if recommended by your doctor",
      ],
      riskFactors: [
        "Family history of diabetes",
        "Obesity",
        "Physical inactivity",
        "Poor diet",
        "Age over 45",
      ],
    },
    creatinine: {
      description:
        "Creatinine is a waste product filtered by the kidneys. Levels indicate how well your kidneys are functioning.",
      normalRange: "0.6-1.2 mg/dL (men), 0.5-1.1 mg/dL (women)",
      optimalRange: "0.7-1.0 mg/dL",
      whatItMeans:
        "High creatinine levels may indicate kidney problems. It's important to monitor kidney function regularly.",
      recommendations: [
        "Stay well hydrated",
        "Follow a kidney-friendly diet if recommended",
        "Control blood pressure and diabetes",
        "Avoid excessive protein intake",
        "Regular check-ups with your doctor",
      ],
      riskFactors: [
        "Diabetes",
        "High blood pressure",
        "Heart disease",
        "Family history of kidney disease",
        "Age over 60",
      ],
    },
    hemoglobin: {
      description:
        "Hemoglobin is the protein in red blood cells that carries oxygen throughout your body. Levels reflect your blood's oxygen-carrying capacity and can indicate anemia or other conditions.",
      normalRange: "Approx. 12.0–15.5 g/dL (women), 13.5–17.5 g/dL (men)",
      optimalRange: "Generally mid-range for sex-specific normals",
      whatItMeans:
        "Low hemoglobin suggests anemia (due to iron, B12/folate deficiency, chronic disease, or blood loss). High levels may be seen with dehydration, smoking, lung disease, or living at altitude.",
      recommendations: [
        "Eat iron-rich foods (lean meats, beans, leafy greens) with vitamin C",
        "Ensure adequate B12 and folate intake",
        "Discuss iron supplementation with your clinician if needed",
        "Investigate sources of blood loss if low (e.g., GI tract)",
        "Stay well hydrated if elevated",
      ],
      riskFactors: [
        "Iron deficiency or poor diet",
        "Chronic kidney disease or inflammatory conditions",
        "GI blood loss (ulcers, polyps)",
        "Smoking or chronic lung disease (for high values)",
        "High altitude residence (for high values)",
      ],
    },
    platelets: {
      description:
        "Platelets help your blood to clot. Abnormal levels can increase the risk of bleeding (low) or clotting (high).",
      normalRange: "150–450 ×10^3/uL",
      optimalRange: "Mid-normal range (about 200–300 ×10^3/uL)",
      whatItMeans:
        "Low platelets (thrombocytopenia) can be due to infections, medications, immune conditions, or bone marrow disorders. High platelets (thrombocytosis) can occur with inflammation, iron deficiency, or rarely bone marrow disease.",
      recommendations: [
        "Review medications and alcohol intake if low",
        "Treat underlying causes (e.g., iron deficiency, infection, inflammation)",
        "Avoid contact sports if very low to reduce bleeding risk",
        "Follow hematology guidance if markedly abnormal",
      ],
      riskFactors: [
        "Recent infections or viral illness",
        "Autoimmune conditions",
        "Iron deficiency (for high counts)",
        "Chronic inflammation",
        "Bone marrow disorders (rare)",
      ],
    },
    // ── Liver ──
    alt: {
      description:
        "ALT (alanine aminotransferase) is an enzyme found primarily in the liver. Elevated levels can indicate liver cell damage.",
      normalRange: "7–56 U/L",
      optimalRange: "10–30 U/L",
      whatItMeans:
        "ALT is one of the most specific markers for liver health. Values within range suggest your liver cells are functioning well with no signs of inflammation or damage.",
      recommendations: [
        "Limit alcohol intake to support liver health",
        "Maintain a balanced diet low in processed foods and refined sugars",
        "Stay at a healthy weight — excess fat can cause fatty liver disease",
        "Avoid unnecessary over-the-counter medications that stress the liver (e.g. excess paracetamol)",
        "Include liver-supportive foods like leafy greens, cruciferous vegetables, and omega-3 rich fish",
      ],
      riskFactors: [
        "Excessive alcohol consumption",
        "Non-alcoholic fatty liver disease (NAFLD)",
        "Hepatitis (viral or autoimmune)",
        "Obesity or metabolic syndrome",
        "Certain medications (statins, NSAIDs, paracetamol overuse)",
      ],
    },
    ast: {
      description:
        "AST (aspartate aminotransferase) is an enzyme found in the liver, heart, and muscles. It helps assess liver function and can indicate tissue damage.",
      normalRange: "10–40 U/L",
      optimalRange: "10–25 U/L",
      whatItMeans:
        "AST is less liver-specific than ALT — it also rises with muscle or heart damage. When both ALT and AST are normal, it strongly suggests healthy liver function.",
      recommendations: [
        "Limit alcohol to reduce liver stress",
        "Avoid intense exercise 48h before blood tests (can falsely elevate AST)",
        "Eat antioxidant-rich foods to protect liver cells",
        "Stay hydrated and maintain a healthy body composition",
        "Review any supplements or medications that may affect liver enzymes",
      ],
      riskFactors: [
        "Chronic alcohol use",
        "Intense physical exercise (can transiently elevate)",
        "Liver disease (hepatitis, cirrhosis)",
        "Heart disease or muscle injury",
        "Certain medications",
      ],
    },
    ggt: {
      description:
        "GGT (gamma-glutamyl transferase) is an enzyme involved in bile metabolism. It is a sensitive marker for liver and bile duct problems, and is particularly responsive to alcohol.",
      normalRange: "9–48 U/L",
      optimalRange: "9–30 U/L",
      whatItMeans:
        "GGT is one of the earliest markers to rise with liver stress, especially alcohol-related. Normal levels suggest healthy bile flow and no significant liver inflammation.",
      recommendations: [
        "Reduce or eliminate alcohol — GGT is highly sensitive to alcohol intake",
        "Avoid high-sugar diets which can contribute to fatty liver",
        "Maintain a healthy weight to prevent bile duct issues",
        "Include bitter greens and fibre to support bile production",
        "Get regular liver panels if you take medications metabolised by the liver",
      ],
      riskFactors: [
        "Alcohol consumption (even moderate levels can elevate GGT)",
        "Fatty liver disease",
        "Bile duct obstruction",
        "Diabetes or metabolic syndrome",
        "Certain medications (anticonvulsants, statins)",
      ],
    },
    alp: {
      description:
        "ALP (alkaline phosphatase) is an enzyme found in the liver, bones, kidneys, and digestive system. It is important for assessing liver and bone health.",
      normalRange: "40–129 U/L",
      optimalRange: "50–90 U/L",
      whatItMeans:
        "ALP is useful for detecting bile duct blockages and bone disorders. Normal levels suggest healthy liver drainage and bone metabolism.",
      recommendations: [
        "Ensure adequate vitamin D and calcium for bone health",
        "Maintain a balanced diet with zinc-rich foods (supports ALP activity)",
        "Stay physically active with weight-bearing exercise to support bones",
        "Limit alcohol to protect bile duct function",
        "Monitor if you are on bone-affecting medications (e.g. bisphosphonates)",
      ],
      riskFactors: [
        "Bile duct obstruction or cholestasis",
        "Bone disorders (Paget's disease, osteomalacia)",
        "Vitamin D deficiency",
        "Liver disease",
        "Pregnancy (physiologically elevated)",
      ],
    },
    total_bilirubin: {
      description:
        "Bilirubin is a yellow pigment produced when the body breaks down red blood cells. The liver processes it for excretion. Elevated levels can cause jaundice.",
      normalRange: "0.1–1.2 mg/dL",
      optimalRange: "0.3–0.8 mg/dL",
      whatItMeans:
        "Normal bilirubin indicates efficient red blood cell turnover and healthy liver clearance. Mildly elevated bilirubin (Gilbert's syndrome) is common and usually benign.",
      recommendations: [
        "Stay well hydrated to support liver detoxification",
        "Eat a fibre-rich diet to assist bilirubin excretion through bile",
        "Limit alcohol and hepatotoxic substances",
        "Include turmeric and leafy greens which support liver conjugation",
        "Get follow-up if bilirubin rises above 2.0 mg/dL or jaundice appears",
      ],
      riskFactors: [
        "Gilbert's syndrome (benign genetic condition)",
        "Liver disease (hepatitis, cirrhosis)",
        "Haemolytic anaemia (excessive red blood cell destruction)",
        "Bile duct obstruction",
        "Certain medications",
      ],
    },
    // ── Heart / Blood ──
    ldl_c: {
      description:
        "LDL-C (low-density lipoprotein cholesterol) carries cholesterol to your arteries, where it can build up and form plaques.",
      normalRange: "Less than 100 mg/dL",
      optimalRange: "Less than 70 mg/dL",
      whatItMeans:
        "High LDL-C is a major modifiable risk factor for atherosclerosis and cardiovascular disease. Lower is generally better.",
      recommendations: [
        "Follow a heart-healthy diet (Mediterranean or DASH)",
        "Limit saturated fats from red meat and full-fat dairy",
        "Increase soluble fibre (oats, beans, flaxseed)",
        "Exercise regularly — at least 150 minutes moderate intensity per week",
        "Discuss statin therapy with your doctor if LDL remains elevated",
      ],
      riskFactors: [
        "High saturated fat diet",
        "Lack of exercise",
        "Obesity",
        "Diabetes",
        "Family history of cardiovascular disease",
      ],
    },
    hdl_c: {
      description:
        'HDL-C (high-density lipoprotein cholesterol) carries cholesterol away from arteries back to the liver. Often called "good" cholesterol.',
      normalRange: ">40 mg/dL (men), >50 mg/dL (women)",
      optimalRange: ">60 mg/dL",
      whatItMeans:
        "Higher HDL is protective against heart disease. It acts as a scavenger, removing excess cholesterol from the bloodstream.",
      recommendations: [
        "Exercise regularly — aerobic activity raises HDL",
        "Include healthy fats (olive oil, avocados, nuts, fatty fish)",
        "Quit smoking — cessation can raise HDL by 5–10%",
        "Limit refined carbohydrates and trans fats",
        "Moderate alcohol consumption may raise HDL, but risks outweigh benefits for non-drinkers",
      ],
      riskFactors: [
        "Sedentary lifestyle",
        "Smoking",
        "Poor diet high in trans fats",
        "Obesity",
        "Type 2 diabetes",
      ],
    },
    triglycerides: {
      description:
        "Triglycerides are the most common type of fat in the body. High levels increase the risk of heart disease, especially combined with high LDL or low HDL.",
      normalRange: "<150 mg/dL",
      optimalRange: "<100 mg/dL",
      whatItMeans:
        "Elevated triglycerides are often driven by diet, excess alcohol, or metabolic conditions. They are an independent risk factor for cardiovascular disease.",
      recommendations: [
        "Reduce sugar, refined carbs, and alcohol",
        "Increase omega-3 fatty acids (fatty fish, walnuts, flaxseed)",
        "Exercise regularly to lower triglycerides",
        "Lose excess weight — even modest weight loss helps",
        "Limit fructose-heavy foods and sugary drinks",
      ],
      riskFactors: [
        "High-sugar diet",
        "Excess alcohol",
        "Obesity",
        "Uncontrolled diabetes",
        "Hypothyroidism",
      ],
    },
    apob: {
      description:
        "ApoB (apolipoprotein B) is a protein on LDL and VLDL particles. It represents the total number of atherogenic particles in your blood — a more precise cardiovascular risk marker than LDL-C alone.",
      normalRange: "<1.2 g/L",
      optimalRange: "<0.8 g/L",
      whatItMeans:
        "ApoB counts the actual number of harmful cholesterol-carrying particles. Many longevity-focused physicians consider it the single best lipid marker for cardiovascular risk.",
      recommendations: [
        "Prioritise a Mediterranean-style diet rich in fibre and healthy fats",
        "Reduce saturated fat and eliminate trans fats",
        "Discuss targeted therapy (statins, ezetimibe) if ApoB remains elevated",
        "Exercise regularly and maintain a healthy weight",
        "Monitor ApoB alongside LDL-C for a complete lipid picture",
      ],
      riskFactors: [
        "Familial hypercholesterolaemia",
        "High saturated fat intake",
        "Insulin resistance",
        "Obesity",
        "Sedentary lifestyle",
      ],
    },
    hs_crp: {
      description:
        "hs-CRP (high-sensitivity C-reactive protein) is a marker of systemic inflammation. Chronic low-grade inflammation is linked to cardiovascular disease and metabolic dysfunction.",
      normalRange: "<3.0 mg/L",
      optimalRange: "<1.0 mg/L",
      whatItMeans:
        "Low hs-CRP suggests minimal systemic inflammation. Elevated levels may indicate chronic inflammation, infection, or increased cardiovascular risk even when cholesterol is normal.",
      recommendations: [
        "Follow an anti-inflammatory diet (rich in omega-3s, vegetables, turmeric)",
        "Exercise regularly — physical activity lowers CRP",
        "Manage stress through sleep, mindfulness, or meditation",
        "Maintain a healthy weight — adipose tissue drives inflammation",
        "Address any chronic infections or autoimmune conditions",
      ],
      riskFactors: [
        "Obesity",
        "Chronic stress",
        "Poor sleep",
        "Smoking",
        "Autoimmune conditions or chronic infections",
      ],
    },
    homocysteine: {
      description:
        "Homocysteine is an amino acid in the blood. High levels are associated with increased risk of cardiovascular disease, cognitive decline, and blood clots.",
      normalRange: "4–15 μmol/L",
      optimalRange: "5–10 μmol/L",
      whatItMeans:
        "Elevated homocysteine can damage blood vessel walls and promote clotting. It is often driven by B-vitamin deficiencies (B6, B12, folate).",
      recommendations: [
        "Ensure adequate B12, B6, and folate intake (leafy greens, eggs, meat)",
        "Consider methylated B-vitamin supplements if levels are elevated",
        "Limit excessive coffee consumption (>4 cups/day)",
        "Stay physically active",
        "Discuss with your doctor if levels remain high despite supplementation",
      ],
      riskFactors: [
        "B12 or folate deficiency",
        "MTHFR gene variants",
        "Kidney disease",
        "Hypothyroidism",
        "Excessive coffee or alcohol",
      ],
    },
    red_blood_cells: {
      description:
        "Red blood cells (RBCs) carry oxygen from the lungs to every tissue in the body and return carbon dioxide for exhalation.",
      normalRange: "4.5–5.5 M/μL (men), 4.0–5.0 M/μL (women)",
      optimalRange: "Mid-range for sex-specific normals",
      whatItMeans:
        "Normal RBC count means your body is producing enough cells to meet oxygen demands. Low counts suggest anaemia; high counts may indicate dehydration or polycythaemia.",
      recommendations: [
        "Eat iron-rich foods (red meat, spinach, lentils) to support RBC production",
        "Ensure adequate B12 and folate for healthy cell formation",
        "Stay well hydrated — dehydration can falsely elevate RBC count",
        "Avoid smoking, which increases RBC production abnormally",
        "Get regular blood counts if you have chronic conditions",
      ],
      riskFactors: [
        "Iron deficiency",
        "B12/folate deficiency",
        "Chronic kidney disease",
        "Bone marrow disorders",
        "Dehydration (false elevation)",
      ],
    },
    white_blood_cells: {
      description:
        "White blood cells (WBCs) are part of your immune system. They fight infections, respond to inflammation, and patrol for abnormal cells.",
      normalRange: "4.0–11.0 K/μL",
      optimalRange: "4.5–7.5 K/μL",
      whatItMeans:
        "Normal WBC count indicates a balanced immune system with no active infection or inflammatory process. Persistently elevated WBCs can signal chronic inflammation.",
      recommendations: [
        "Support immune health with adequate sleep (7–9 hours)",
        "Eat a nutrient-dense diet rich in vitamins C, D, and zinc",
        "Manage chronic stress, which can chronically elevate WBCs",
        "Exercise moderately — intense overtraining can suppress immunity",
        "Investigate if WBCs are persistently outside normal range",
      ],
      riskFactors: [
        "Active infection",
        "Chronic inflammation or autoimmune disease",
        "Severe stress",
        "Smoking",
        "Bone marrow disorders (rare)",
      ],
    },
    // ── Kidneys ──
    urea: {
      description:
        "Urea (blood urea nitrogen) is a waste product from protein metabolism, filtered by the kidneys. It reflects kidney function and protein intake.",
      normalRange: "7–20 mg/dL",
      optimalRange: "10–16 mg/dL",
      whatItMeans:
        "Normal urea suggests your kidneys are effectively filtering waste. Elevated levels can indicate kidney dysfunction, dehydration, or very high protein intake.",
      recommendations: [
        "Stay well hydrated throughout the day",
        "Moderate protein intake if levels are elevated",
        "Monitor kidney function regularly if you have diabetes or hypertension",
        "Avoid chronic NSAID use, which can impair kidney function",
        "Discuss with your doctor if urea is consistently rising",
      ],
      riskFactors: [
        "Dehydration",
        "High-protein diet",
        "Kidney disease",
        "Heart failure",
        "GI bleeding",
      ],
    },
    sodium: {
      description:
        "Sodium is a key electrolyte that regulates fluid balance, nerve function, and muscle contractions.",
      normalRange: "136–145 mmol/L",
      optimalRange: "138–142 mmol/L",
      whatItMeans:
        "Normal sodium indicates good fluid and electrolyte balance. Abnormal levels can affect brain function, blood pressure, and muscle performance.",
      recommendations: [
        "Maintain balanced fluid intake — neither excessive nor restricted",
        "Limit processed foods high in hidden sodium",
        "Replenish electrolytes during intense exercise or heat exposure",
        "Monitor if you take diuretics or blood pressure medications",
        "Seek medical advice for persistent abnormalities",
      ],
      riskFactors: [
        "Excessive water intake (dilutional hyponatraemia)",
        "Diuretic use",
        "Kidney disease",
        "Heart failure",
        "Severe dehydration",
      ],
    },
    potassium: {
      description:
        "Potassium is an essential electrolyte for heart rhythm, muscle contraction, and nerve signalling.",
      normalRange: "3.5–5.1 mmol/L",
      optimalRange: "3.8–4.6 mmol/L",
      whatItMeans:
        "Normal potassium is critical for heart function. Both high and low potassium can cause dangerous cardiac arrhythmias.",
      recommendations: [
        "Eat potassium-rich foods (bananas, sweet potatoes, avocados, spinach)",
        "Stay hydrated and replace electrolytes after intense exercise",
        "Monitor closely if you take ACE inhibitors or potassium-sparing diuretics",
        "Avoid excessive potassium supplementation without medical guidance",
        "Get urgent evaluation if potassium is outside 3.0–5.5 mmol/L",
      ],
      riskFactors: [
        "Kidney disease",
        "Certain medications (ACE inhibitors, diuretics)",
        "Excessive sweating or vomiting",
        "Adrenal insufficiency",
        "Metabolic acidosis",
      ],
    },
    magnesium: {
      description:
        "Magnesium is involved in over 300 enzymatic reactions including energy production, muscle relaxation, and nervous system regulation.",
      normalRange: "1.7–2.2 mg/dL",
      optimalRange: "2.0–2.2 mg/dL",
      whatItMeans:
        "Normal magnesium supports healthy sleep, muscle function, and stress response. Deficiency is very common and often underdiagnosed.",
      recommendations: [
        "Include magnesium-rich foods (dark chocolate, nuts, seeds, leafy greens)",
        "Consider magnesium glycinate supplementation if borderline low",
        "Limit alcohol and caffeine, which deplete magnesium",
        "Prioritise sleep — magnesium supports deep sleep quality",
        "Monitor if you take proton pump inhibitors (PPIs), which impair absorption",
      ],
      riskFactors: [
        "Poor dietary intake",
        "Alcohol use",
        "Proton pump inhibitor (PPI) use",
        "Diabetes",
        "Chronic stress",
      ],
    },
    // ── Gut / Absorption ──
    vitamin_d: {
      description:
        "Vitamin D is essential for bone health, immune function, and mood regulation. It is produced in the skin with sunlight and obtained from food.",
      normalRange: "30–100 ng/mL",
      optimalRange: "40–60 ng/mL",
      whatItMeans:
        "Adequate vitamin D supports strong bones, a healthy immune system, and reduced inflammation. Deficiency is extremely common, especially in northern latitudes.",
      recommendations: [
        "Get 15–20 minutes of midday sun exposure when possible",
        "Supplement with vitamin D3 (1000–4000 IU/day) if levels are low",
        "Eat vitamin D-rich foods (fatty fish, egg yolks, fortified foods)",
        "Take vitamin D with fat for better absorption",
        "Retest after 3 months of supplementation to dial in your dose",
      ],
      riskFactors: [
        "Limited sun exposure",
        "Dark skin pigmentation",
        "Obesity (vitamin D is sequestered in fat)",
        "Malabsorption conditions",
        "Age over 65",
      ],
    },
    vitamin_b12: {
      description:
        "Vitamin B12 is essential for nerve function, red blood cell formation, and DNA synthesis. Deficiency can cause anaemia and neurological symptoms.",
      normalRange: "200–900 pg/mL",
      optimalRange: "400–700 pg/mL",
      whatItMeans:
        "Adequate B12 supports energy, cognitive function, and healthy nerves. Deficiency develops slowly and can cause irreversible nerve damage if untreated.",
      recommendations: [
        "Eat B12-rich foods (meat, fish, eggs, dairy)",
        "Supplement if vegan or vegetarian — B12 is only found in animal products",
        "Consider methylcobalamin form for better bioavailability",
        "Check for pernicious anaemia if deficient despite adequate intake",
        "Monitor if you take metformin or PPIs, which impair B12 absorption",
      ],
      riskFactors: [
        "Vegan/vegetarian diet without supplementation",
        "Pernicious anaemia",
        "Metformin or PPI use",
        "Age over 60 (reduced absorption)",
        "Gastric surgery or Crohn's disease",
      ],
    },
    folate: {
      description:
        "Folate (vitamin B9) is critical for DNA synthesis, cell division, and red blood cell formation. It is especially important during pregnancy.",
      normalRange: "3–17 ng/mL",
      optimalRange: "8–15 ng/mL",
      whatItMeans:
        "Adequate folate supports healthy cell turnover and works synergistically with B12. Low folate can cause megaloblastic anaemia and elevated homocysteine.",
      recommendations: [
        "Eat folate-rich foods (leafy greens, legumes, asparagus, citrus)",
        "Consider methylfolate (active form) over folic acid if supplementing",
        "Ensure adequate B12 alongside folate — they work together",
        "Avoid excessive alcohol, which depletes folate",
        "Supplement before and during pregnancy to prevent neural tube defects",
      ],
      riskFactors: [
        "Poor vegetable intake",
        "Alcohol use",
        "MTHFR gene variants",
        "Pregnancy (increased demand)",
        "Malabsorption conditions",
      ],
    },
    calcium: {
      description:
        "Calcium is the most abundant mineral in the body, essential for bones, teeth, muscle contraction, and nerve function.",
      normalRange: "8.5–10.5 mg/dL",
      optimalRange: "9.0–10.0 mg/dL",
      whatItMeans:
        "Normal calcium reflects healthy parathyroid function and bone metabolism. The body tightly regulates blood calcium, so abnormalities can signal parathyroid or kidney issues.",
      recommendations: [
        "Get calcium from food first (dairy, sardines, leafy greens, fortified milks)",
        "Ensure adequate vitamin D for calcium absorption",
        "Include weight-bearing exercise for bone density",
        "Avoid excessive calcium supplementation (>1000 mg/day) without medical guidance",
        "Monitor parathyroid hormone (PTH) if calcium is consistently high",
      ],
      riskFactors: [
        "Vitamin D deficiency",
        "Parathyroid disorders",
        "Kidney disease",
        "Excessive dairy or supplement intake",
        "Certain cancers",
      ],
    },
    ferritin: {
      description:
        "Ferritin is the body's iron storage protein. It reflects total iron reserves and is the first marker to drop in iron deficiency.",
      normalRange: "20–250 ng/mL",
      optimalRange: "50–150 ng/mL",
      whatItMeans:
        "Optimal ferritin means you have healthy iron reserves for energy, oxygen transport, and immune function. Low ferritin causes fatigue even before anaemia develops.",
      recommendations: [
        "Eat iron-rich foods (red meat, lentils, spinach) with vitamin C to boost absorption",
        "Avoid tea/coffee with meals — tannins inhibit iron absorption",
        "Supplement with iron bisglycinate if deficient (gentler on the stomach)",
        "Investigate the cause if ferritin is very high (>300) — it can indicate inflammation",
        "Retest after 3 months of supplementation",
      ],
      riskFactors: [
        "Menstruation (women of reproductive age)",
        "Vegetarian/vegan diet",
        "GI blood loss",
        "Chronic inflammation (falsely elevates ferritin)",
        "Coeliac disease",
      ],
    },
    transferrin_saturation: {
      description:
        "Transferrin saturation measures the percentage of the iron-transport protein transferrin that is loaded with iron. It reflects how much iron is actively circulating.",
      normalRange: "20–50%",
      optimalRange: "25–35%",
      whatItMeans:
        "Normal transferrin saturation confirms iron is being transported effectively. Low values suggest iron deficiency; very high values may indicate iron overload (haemochromatosis).",
      recommendations: [
        "Pair with ferritin for a complete iron status picture",
        "Address iron deficiency with dietary changes or supplementation",
        "Investigate haemochromatosis if saturation is consistently >45%",
        "Avoid unnecessary iron supplements if levels are normal",
        "Retest fasting — meals can transiently affect results",
      ],
      riskFactors: [
        "Iron deficiency anaemia",
        "Hereditary haemochromatosis",
        "Chronic disease",
        "Liver disease",
        "Frequent blood transfusions",
      ],
    },
    // ── Thyroid ──
    tsh: {
      description:
        "TSH (thyroid-stimulating hormone) is produced by the pituitary gland to regulate thyroid function. It is the primary screening test for thyroid disorders.",
      normalRange: "0.4–4.0 mIU/L",
      optimalRange: "1.0–2.5 mIU/L",
      whatItMeans:
        "Normal TSH suggests your thyroid is producing the right amount of hormones. High TSH indicates hypothyroidism (underactive); low TSH indicates hyperthyroidism (overactive).",
      recommendations: [
        "Ensure adequate iodine and selenium intake for thyroid function",
        "Manage stress — chronic stress can affect thyroid regulation",
        "Get tested in the morning for most accurate TSH readings",
        "Monitor annually if you have thyroid antibodies or family history",
        "Discuss treatment if TSH is outside 0.4–4.0 even without symptoms",
      ],
      riskFactors: [
        "Family history of thyroid disease",
        "Autoimmune conditions (Hashimoto's, Graves')",
        "Iodine deficiency or excess",
        "Previous radiation to head/neck",
        "Women over 60",
      ],
    },
    free_t3: {
      description:
        "Free T3 (triiodothyronine) is the most active thyroid hormone. It drives metabolism, energy, and body temperature at the cellular level.",
      normalRange: "2.3–4.2 pg/mL",
      optimalRange: "3.0–3.8 pg/mL",
      whatItMeans:
        'Optimal Free T3 means your body is effectively converting T4 to its active form. Low T3 with normal TSH can explain fatigue and low metabolism despite "normal" thyroid tests.',
      recommendations: [
        "Support T4-to-T3 conversion with selenium (Brazil nuts, fish)",
        "Ensure adequate zinc and iron, which are needed for conversion",
        "Manage stress — cortisol blocks T4-to-T3 conversion",
        "Avoid extreme calorie restriction, which suppresses T3",
        "Request Free T3 testing alongside TSH for a complete picture",
      ],
      riskFactors: [
        "Chronic stress",
        "Selenium deficiency",
        "Extreme dieting",
        "Chronic illness (sick euthyroid syndrome)",
        "Liver disease (impairs conversion)",
      ],
    },
    free_t4: {
      description:
        "Free T4 (thyroxine) is the main hormone produced by the thyroid gland. It circulates to tissues where it is converted to active T3.",
      normalRange: "0.8–1.8 ng/dL",
      optimalRange: "1.0–1.5 ng/dL",
      whatItMeans:
        "Normal Free T4 confirms your thyroid is producing adequate hormone. Combined with TSH, it gives a complete picture of thyroid health.",
      recommendations: [
        "Ensure adequate iodine from diet (seafood, iodised salt, seaweed)",
        "Avoid goitrogenic foods in excess if thyroid function is borderline (raw cruciferous vegetables)",
        "Take thyroid medication on an empty stomach if prescribed",
        "Retest 6–8 weeks after any medication dose change",
        "Monitor during pregnancy, when thyroid demands increase",
      ],
      riskFactors: [
        "Autoimmune thyroid disease",
        "Iodine deficiency",
        "Pituitary disorders",
        "Pregnancy",
        "Certain medications (lithium, amiodarone)",
      ],
    },
    // ── Metabolic / Pancreas ──
    fasting_glucose: {
      description:
        "Fasting glucose measures blood sugar after at least 8 hours without food. It is a key marker for diabetes screening and metabolic health.",
      normalRange: "70–99 mg/dL",
      optimalRange: "75–88 mg/dL",
      whatItMeans:
        "Optimal fasting glucose reflects good insulin sensitivity and healthy blood sugar regulation. Consistently elevated levels suggest progressing insulin resistance.",
      recommendations: [
        "Limit refined carbohydrates and sugary foods",
        "Eat balanced meals with protein, fat, and fibre to stabilise blood sugar",
        "Exercise regularly — resistance training improves insulin sensitivity",
        "Prioritise quality sleep (poor sleep impairs glucose regulation)",
        "Consider continuous glucose monitoring for deeper insights",
      ],
      riskFactors: [
        "Obesity",
        "Family history of diabetes",
        "Sedentary lifestyle",
        "Poor sleep",
        "High-carbohydrate diet",
      ],
    },
    hba1c: {
      description:
        "HbA1c (glycated haemoglobin) reflects your average blood sugar over the past 2–3 months. It is the gold standard for assessing long-term glucose control.",
      normalRange: "<5.7%",
      optimalRange: "4.8–5.3%",
      whatItMeans:
        "A low HbA1c indicates excellent long-term blood sugar control. It is more reliable than fasting glucose because it is not affected by a single day's eating.",
      recommendations: [
        "Follow a low-glycaemic diet with whole foods",
        "Exercise consistently — both aerobic and resistance training",
        "Manage stress and improve sleep quality",
        "Monitor HbA1c every 3–6 months if prediabetic or diabetic",
        "Work with your doctor on medication if HbA1c exceeds 6.5%",
      ],
      riskFactors: [
        "Insulin resistance",
        "Obesity",
        "Sedentary lifestyle",
        "High-sugar/refined-carb diet",
        "Family history of diabetes",
      ],
    },
    fasting_insulin: {
      description:
        "Fasting insulin measures how much insulin your pancreas produces at rest. It is one of the earliest markers of insulin resistance — often abnormal years before glucose rises.",
      normalRange: "2–20 mIU/L",
      optimalRange: "3–8 mIU/L",
      whatItMeans:
        "Optimal fasting insulin suggests your pancreas is not overworking to keep blood sugar normal. Elevated insulin with normal glucose is an early warning of metabolic dysfunction.",
      recommendations: [
        "Reduce refined carbohydrates and sugar to lower insulin demand",
        "Practice time-restricted eating (intermittent fasting) if appropriate",
        "Prioritise resistance training — muscle is a major glucose sink",
        "Get adequate sleep — even one night of poor sleep raises insulin",
        "Monitor alongside HOMA-IR for a complete insulin resistance picture",
      ],
      riskFactors: [
        "Obesity (especially visceral fat)",
        "High-sugar diet",
        "Sedentary lifestyle",
        "PCOS",
        "Family history of type 2 diabetes",
      ],
    },
    homa_ir: {
      description:
        "HOMA-IR (Homeostatic Model Assessment of Insulin Resistance) is calculated from fasting glucose and insulin. It quantifies how resistant your cells are to insulin.",
      normalRange: "<2.0",
      optimalRange: "<1.5",
      whatItMeans:
        "A low HOMA-IR score means your cells respond efficiently to insulin. Higher values indicate the body needs more insulin to manage blood sugar — a precursor to type 2 diabetes.",
      recommendations: [
        "Focus on reducing visceral fat through exercise and diet",
        "Limit processed carbohydrates and increase fibre intake",
        "Exercise regularly — both cardio and strength training improve insulin sensitivity",
        "Improve sleep quality and manage chronic stress",
        "Consider berberine or metformin under medical supervision if HOMA-IR is elevated",
      ],
      riskFactors: [
        "Visceral obesity",
        "Sedentary lifestyle",
        "High-carb/high-sugar diet",
        "Chronic stress and poor sleep",
        "Genetic predisposition",
      ],
    },
    // ── Brain / Neuro ──
    cortisol: {
      description:
        "Cortisol is the body's primary stress hormone, produced by the adrenal glands. It follows a diurnal rhythm — highest in the morning and lowest at night.",
      normalRange: "6–18.4 μg/dL (morning)",
      optimalRange: "10–15 μg/dL (morning)",
      whatItMeans:
        "Normal cortisol indicates a healthy stress response and adrenal function. Chronically elevated cortisol disrupts sleep, immunity, metabolism, and cognitive function.",
      recommendations: [
        "Prioritise 7–9 hours of quality sleep to support cortisol rhythm",
        "Practice stress management (meditation, breathwork, nature exposure)",
        "Exercise moderately — overtraining can chronically elevate cortisol",
        "Limit caffeine after midday to avoid disrupting the cortisol curve",
        "Consider adaptogenic herbs (ashwagandha, rhodiola) under guidance",
      ],
      riskFactors: [
        "Chronic psychological stress",
        "Sleep deprivation",
        "Overtraining",
        "Cushing's syndrome (rare)",
        "Adrenal insufficiency (low cortisol)",
      ],
    },
    // ── Lungs ──
    spo2: {
      description:
        "SpO₂ (peripheral oxygen saturation) measures the percentage of haemoglobin molecules carrying oxygen. It is typically measured via pulse oximetry.",
      normalRange: "95–100%",
      optimalRange: "97–99%",
      whatItMeans:
        "Normal SpO₂ confirms your lungs are efficiently oxygenating your blood. Values below 95% may indicate respiratory issues.",
      recommendations: [
        "Practice deep breathing exercises to improve lung capacity",
        "Stay physically active — cardiovascular fitness improves oxygenation",
        "Avoid smoking and air pollution exposure",
        "Seek medical attention if SpO₂ drops below 94%",
        "Consider altitude training if you are an athlete looking to optimise",
      ],
      riskFactors: [
        "Chronic lung disease (COPD, asthma)",
        "Smoking",
        "High altitude",
        "Sleep apnoea",
        "Severe anaemia",
      ],
    },
    fev1: {
      description:
        "FEV1 (forced expiratory volume in 1 second) measures how much air you can forcefully exhale in one second. It is a key marker of lung function.",
      normalRange: ">80% of predicted value",
      optimalRange: ">90% of predicted",
      whatItMeans:
        "Normal FEV1 indicates healthy airways without obstruction. It is the primary measure used to diagnose and grade obstructive lung diseases.",
      recommendations: [
        "Do not smoke and avoid secondhand smoke",
        "Practice regular cardiovascular exercise to maintain lung health",
        "Consider breathing exercises (diaphragmatic breathing, incentive spirometry)",
        "Manage allergies and asthma proactively",
        "Get lung function testing annually if at risk for COPD",
      ],
      riskFactors: [
        "Smoking history",
        "Asthma",
        "Occupational dust/chemical exposure",
        "Recurrent respiratory infections",
        "Alpha-1 antitrypsin deficiency",
      ],
    },
    fvc: {
      description:
        "FVC (forced vital capacity) is the total volume of air you can forcefully exhale after a maximum inhalation. It assesses overall lung capacity.",
      normalRange: ">80% of predicted value",
      optimalRange: ">90% of predicted",
      whatItMeans:
        "Normal FVC means your lungs can hold and expel the expected volume of air. Reduced FVC may indicate restrictive lung disease or poor respiratory muscle strength.",
      recommendations: [
        "Maintain cardiovascular fitness with regular aerobic exercise",
        "Practice deep breathing exercises and diaphragmatic breathing",
        "Maintain a healthy weight — obesity restricts lung expansion",
        "Avoid environmental pollutants and allergens",
        "Discuss with your doctor if FVC is trending downward",
      ],
      riskFactors: [
        "Obesity",
        "Pulmonary fibrosis",
        "Neuromuscular conditions",
        "Chest wall deformity",
        "Smoking",
      ],
    },
  };

  return (
    details[id] || {
      description:
        "This biomarker provides important information about your health status.",
      normalRange: "Consult your healthcare provider",
      optimalRange: "Consult your healthcare provider",
      whatItMeans:
        "Your healthcare provider can explain what this result means for your health.",
      recommendations: [
        "Consult your healthcare provider for personalized recommendations",
      ],
      riskFactors: ["Consult your healthcare provider for risk assessment"],
    }
  );
};

interface BiomarkerDetailsProps {
  details: BiomarkerDetail;
}

const BiomarkerDetails: React.FC<BiomarkerDetailsProps> = ({ details }) => (
  <>
    <View style={styles.modalSection}>
      <Text style={styles.sectionTitle}>What is this test?</Text>
      <Text style={styles.sectionContent}>{details.description}</Text>
    </View>

    <View style={styles.modalSection}>
      <Text style={styles.sectionTitle}>What this means for you:</Text>
      <Text style={styles.sectionContent}>{details.whatItMeans}</Text>
    </View>

    <View style={styles.modalSection}>
      <Text style={styles.sectionTitle}>Recommendations:</Text>
      {details.recommendations.map((rec, index) => (
        <View key={index} style={styles.recommendationItem}>
          <Ionicons name="arrow-forward" size={16} color="#3AABF0" />
          <Text style={styles.recommendationText}>{rec}</Text>
        </View>
      ))}
    </View>

    <View style={[styles.modalSection, { borderBottomWidth: 0 }]}>
      <Text style={styles.sectionTitle}>Risk Factors:</Text>
      {details.riskFactors.map((factor, index) => (
        <View key={index} style={styles.riskItem}>
          <Ionicons name="warning" size={16} color="#FF9500" />
          <Text style={styles.riskText}>{factor}</Text>
        </View>
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
  modalSection: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: "#EBEBF5",
    lineHeight: 20,
    textAlign: "justify",
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#EBEBF5",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  riskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    color: "#EBEBF5",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default BiomarkerDetails;
