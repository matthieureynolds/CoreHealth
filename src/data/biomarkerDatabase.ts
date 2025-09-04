import { BiomarkerInfo } from '../components/common/BiomarkerModal';

export const biomarkerDatabase: {
  [key: string]: Omit<BiomarkerInfo, 'value' | 'status'>;
} = {
  Creatinine: {
    name: 'Creatinine',
    unit: 'mg/dL',
    referenceRange: '0.6-1.2',
    category: 'Kidney Health',
    organSystem: 'Kidney',
    lastTested: 'Dec 15, 2024',
    percentile: 68,
    explanation:
      "Creatinine is a waste product made by your muscles during normal activity. Your kidneys filter it out of your blood and remove it through urine. It's like checking how well your body's filtration system is working.",
    whatItMeans:
      "Normal levels mean your kidneys are filtering waste properly. High levels might mean your kidneys aren't working as well as they should. Low levels are usually not a concern.",
    whyItMatters:
      "Creatinine levels are crucial for monitoring kidney function. Early detection of kidney problems can prevent serious complications like kidney failure, which affects millions of people worldwide.",
    levelMeaning: {
      low: "Low creatinine levels are generally not concerning and may indicate lower muscle mass or good kidney function.",
      normal: "Your creatinine levels are within the healthy range, indicating good kidney function and proper waste filtration.",
      high: "Elevated creatinine levels may indicate reduced kidney function, dehydration, or muscle breakdown. This requires medical attention.",
    },
    historyData: [0.8, 0.85, 0.9, 0.88, 0.93, 0.95, 0.92, 0.89, 0.91, 0.93, 0.94, 0.93],
    comparisonData: {
      allPopulation: 68,
      ageSexGroup: 72,
    },
    tips: [
      'Stay well hydrated by drinking plenty of water',
      'Limit protein supplements if levels are high',
      'Avoid excessive use of pain medications like ibuprofen',
      'Maintain a healthy blood pressure',
      'Exercise regularly but avoid extreme workouts before testing',
    ],
  },
  eGFR: {
    name: 'eGFR (Kidney Function)',
    unit: 'mL/min/1.73m²',
    referenceRange: '>90',
    category: 'Kidney Health',
    organSystem: 'Kidney',
    lastTested: 'Dec 15, 2024',
    percentile: 75,
    explanation:
      "eGFR measures how well your kidneys filter blood. Think of it as a percentage score for your kidney function - the higher the better. It's calculated using your creatinine level, age, and gender.",
    whatItMeans:
      'Above 90 is excellent kidney function. 60-89 is mildly decreased but usually normal for age. Below 60 may indicate kidney disease and should be monitored closely.',
    whyItMatters:
      "eGFR is the gold standard for assessing kidney function. It helps detect kidney disease early, when treatment is most effective, and guides medication dosing.",
    levelMeaning: {
      low: "Low eGFR indicates reduced kidney function and may require medical monitoring and lifestyle changes.",
      normal: "Your eGFR shows excellent kidney function, indicating your kidneys are filtering waste effectively.",
      high: "High eGFR is generally good, showing strong kidney function and efficient waste filtration.",
    },
    historyData: [95, 98, 102, 99, 105, 103, 101, 97, 100, 102, 104, 103],
    comparisonData: {
      allPopulation: 75,
      ageSexGroup: 78,
    },
    tips: [
      'Control blood pressure and diabetes if you have them',
      'Eat a balanced diet with less salt and processed foods',
      'Stay hydrated throughout the day',
      "Don't smoke - it damages blood vessels in kidneys",
      'Get regular check-ups to monitor kidney health',
    ],
  },
  ALT: {
    name: 'ALT (Liver Enzyme)',
    unit: 'U/L',
    referenceRange: '7-56',
    category: 'Liver Health',
    organSystem: 'Liver',
    lastTested: 'Dec 10, 2024',
    percentile: 45,
    explanation:
      "ALT is an enzyme found mainly in your liver. When liver cells are damaged, they release ALT into your blood. It's like a smoke alarm for your liver - higher levels suggest liver stress or damage.",
    whatItMeans:
      'Normal levels mean your liver is healthy. Elevated levels might indicate liver inflammation, fatty liver, or damage from medications, alcohol, or infections.',
    whyItMatters:
      "ALT is a sensitive marker for liver health. Early detection of liver problems can prevent serious conditions like cirrhosis and liver failure.",
    levelMeaning: {
      low: "Low ALT levels are generally good and indicate healthy liver function with minimal cell damage.",
      normal: "Your ALT levels are within the healthy range, indicating good liver health and minimal liver cell damage.",
      high: "Elevated ALT levels suggest liver stress or damage and may require further investigation and lifestyle changes.",
    },
    historyData: [28, 32, 35, 30, 38, 42, 40, 36, 34, 32, 30, 28],
    comparisonData: {
      allPopulation: 45,
      ageSexGroup: 48,
    },
    tips: [
      'Limit alcohol consumption or avoid it completely',
      'Maintain a healthy weight to prevent fatty liver',
      'Eat a diet rich in fruits, vegetables, and whole grains',
      'Avoid unnecessary medications and supplements',
      'Get vaccinated for hepatitis A and B',
    ],
  },
  AST: {
    name: 'AST (Liver Enzyme)',
    unit: 'U/L',
    referenceRange: '10-40',
    category: 'Liver Health',
    explanation:
      "AST is an enzyme found in your liver, heart, and muscles. Like ALT, it's released when these organs are damaged. It helps doctors understand if liver problems are present.",
    whatItMeans:
      "Normal levels indicate healthy liver function. High levels might suggest liver damage, heart problems, or muscle injury. It's often checked alongside ALT for a complete picture.",
    tips: [
      'Follow a Mediterranean-style diet rich in healthy fats',
      'Exercise regularly but avoid overexertion before testing',
      'Limit processed foods and added sugars',
      'Consider milk thistle supplement (consult your doctor first)',
      'Manage stress through relaxation techniques',
    ],
  },
  'Fasting Glucose': {
    name: 'Fasting Glucose',
    unit: 'mg/dL',
    referenceRange: '70-99',
    category: 'Blood Sugar',
    explanation:
      "This measures the amount of sugar in your blood after not eating for at least 8 hours. It shows how well your body manages blood sugar when you're not actively digesting food.",
    whatItMeans:
      'Normal levels (70-99) mean good blood sugar control. 100-125 suggests prediabetes. Over 126 may indicate diabetes. Lower levels are usually fine unless you feel symptoms.',
    tips: [
      'Eat a balanced diet with complex carbohydrates',
      'Exercise regularly to improve insulin sensitivity',
      'Maintain a healthy weight',
      'Limit sugary drinks and processed foods',
      'Get adequate sleep (7-9 hours per night)',
    ],
  },
  HbA1c: {
    name: 'HbA1c (Average Blood Sugar)',
    unit: '%',
    referenceRange: '<5.7',
    category: 'Blood Sugar',
    explanation:
      'HbA1c shows your average blood sugar over the past 2-3 months. Think of it as a long-term report card for blood sugar control, unlike daily glucose tests that show just one moment.',
    whatItMeans:
      'Below 5.7% is normal. 5.7-6.4% suggests prediabetes risk. 6.5% or higher may indicate diabetes. This test helps track blood sugar trends over time.',
    tips: [
      'Focus on consistent meal timing and portion control',
      'Choose foods with a low glycemic index',
      'Include fiber-rich foods in every meal',
      'Monitor carbohydrate intake throughout the day',
      'Work with a nutritionist if levels are elevated',
    ],
  },
  'Total Cholesterol': {
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    referenceRange: '<200',
    category: 'Heart Health',
    explanation:
      'This measures all the cholesterol in your blood. Cholesterol is a waxy substance your body needs, but too much can build up in arteries and increase heart disease risk.',
    whatItMeans:
      'Below 200 is desirable for heart health. 200-239 is borderline high. Above 240 is considered high and increases cardiovascular risk.',
    tips: [
      'Eat foods high in soluble fiber like oats and beans',
      'Choose lean proteins like fish and poultry',
      'Use healthy fats like olive oil instead of butter',
      'Exercise at least 150 minutes per week',
      'Quit smoking if you smoke',
    ],
  },
  LDL: {
    name: 'LDL (Bad Cholesterol)',
    unit: 'mg/dL',
    referenceRange: '<100',
    category: 'Heart Health',
    explanation:
      'LDL carries cholesterol to your arteries where it can build up and form plaques. It\'s called "bad" cholesterol because high levels increase your risk of heart attacks and strokes.',
    whatItMeans:
      'Below 100 is optimal. 100-129 is near optimal. 130-159 is borderline high. Above 160 is high and significantly increases cardiovascular risk.',
    tips: [
      'Reduce saturated fat intake (red meat, full-fat dairy)',
      'Avoid trans fats found in processed foods',
      'Eat more plant-based meals',
      'Include nuts and seeds in your diet',
      'Consider plant stanols/sterols supplements',
    ],
  },
  HDL: {
    name: 'HDL (Good Cholesterol)',
    unit: 'mg/dL',
    referenceRange: '>40 (men), >50 (women)',
    category: 'Heart Health',
    explanation:
      'HDL removes cholesterol from your arteries and takes it back to your liver for disposal. It\'s "good" cholesterol because higher levels protect against heart disease.',
    whatItMeans:
      'Higher is better! Above 60 is protective against heart disease. 40-60 is acceptable. Below 40 (men) or 50 (women) increases cardiovascular risk.',
    tips: [
      'Exercise regularly - especially aerobic exercise',
      'Eat healthy fats like those in fish, nuts, and olive oil',
      'Maintain a healthy weight',
      "Don't smoke - smoking lowers HDL",
      'Limit refined carbohydrates and sugars',
    ],
  },
  Triglycerides: {
    name: 'Triglycerides',
    unit: 'mg/dL',
    referenceRange: '<150',
    category: 'Heart Health',
    explanation:
      'Triglycerides are a type of fat in your blood that your body uses for energy. High levels often occur with high blood sugar, obesity, or excessive alcohol consumption.',
    whatItMeans:
      'Below 150 is normal. 150-199 is borderline high. 200-499 is high. Above 500 is very high and increases risk of heart disease and pancreatitis.',
    tips: [
      'Limit sugar and refined carbohydrates',
      'Reduce alcohol consumption',
      'Eat more omega-3 rich fish like salmon',
      'Lose weight if overweight',
      'Choose complex carbs over simple sugars',
    ],
  },
  TSH: {
    name: 'TSH (Thyroid Function)',
    unit: 'mIU/L',
    referenceRange: '0.4-4.0',
    category: 'Hormone Health',
    explanation:
      "TSH is made by your pituitary gland to control your thyroid. It's like a thermostat - when thyroid hormone is low, TSH goes up to stimulate more production.",
    whatItMeans:
      'Normal range suggests good thyroid function. High TSH may mean underactive thyroid (hypothyroidism). Low TSH might indicate overactive thyroid (hyperthyroidism).',
    tips: [
      'Ensure adequate iodine intake through iodized salt or seafood',
      'Get enough selenium from nuts, especially Brazil nuts',
      'Manage stress as it can affect thyroid function',
      'Get adequate sleep for hormone regulation',
      'Avoid excessive soy if you have thyroid issues',
    ],
  },
  'Free T4': {
    name: 'Free T4 (Thyroid Hormone)',
    unit: 'ng/dL',
    referenceRange: '0.8-1.8',
    category: 'Hormone Health',
    explanation:
      'T4 is the main hormone your thyroid makes. "Free" T4 is the active form available for your body to use. It controls your metabolism - how fast your body uses energy.',
    whatItMeans:
      'Normal levels mean your thyroid is producing adequate hormone. Low levels may cause fatigue and weight gain. High levels can cause anxiety and weight loss.',
    tips: [
      'Eat a balanced diet with adequate calories',
      'Include thyroid-supporting nutrients like zinc and tyrosine',
      'Avoid excessive goitrogenic foods if levels are low',
      'Time thyroid medication properly if prescribed',
      'Monitor symptoms like energy levels and mood',
    ],
  },
  'Vitamin D': {
    name: 'Vitamin D',
    unit: 'ng/mL',
    referenceRange: '30-100',
    category: 'Nutritional Health',
    explanation:
      "Vitamin D helps your body absorb calcium for strong bones and supports immune function. Your skin makes it from sunlight, but many people don't get enough.",
    whatItMeans:
      'Above 30 is sufficient for most people. 20-30 is insufficient. Below 20 is deficient and may affect bone health and immune function.',
    tips: [
      'Get 10-15 minutes of midday sun exposure several times per week',
      'Eat vitamin D rich foods like fatty fish and egg yolks',
      'Consider a vitamin D3 supplement, especially in winter',
      'Have levels checked annually',
      'Pair with vitamin K2 for optimal bone health',
    ],
  },
  B12: {
    name: 'Vitamin B12',
    unit: 'pg/mL',
    referenceRange: '200-900',
    category: 'Nutritional Health',
    explanation:
      "B12 is essential for making red blood cells and keeping your nervous system healthy. Your body can't make it, so you must get it from food or supplements.",
    whatItMeans:
      'Normal levels support energy and brain function. Low levels can cause fatigue, weakness, and nerve problems. Very high levels are usually not harmful.',
    tips: [
      'Eat B12-rich foods like meat, fish, eggs, and dairy',
      "Consider B12 supplements if you're vegetarian/vegan",
      'Older adults may need supplements due to absorption issues',
      'Look for methylcobalamin form in supplements',
      'Get levels checked if you feel constantly tired',
    ],
  },
  Iron: {
    name: 'Iron',
    unit: 'μg/dL',
    referenceRange: '60-170',
    category: 'Nutritional Health',
    explanation:
      'Iron is essential for making red blood cells that carry oxygen throughout your body. Too little causes anemia and fatigue; too much can be toxic.',
    whatItMeans:
      'Normal levels support energy and oxygen delivery. Low iron causes tiredness and pale skin. High iron can damage organs over time.',
    tips: [
      'Eat iron-rich foods like lean meat, spinach, and lentils',
      'Combine iron foods with vitamin C to improve absorption',
      'Avoid tea and coffee with iron-rich meals',
      "Don't take iron supplements unless recommended by a doctor",
      'Women may need more iron due to menstruation',
    ],
  },
  'Free T3': {
    name: 'Free T3 (Active Thyroid Hormone)',
    unit: 'pg/mL',
    referenceRange: '2.3-4.2',
    category: 'Hormone Health',
    explanation:
      'T3 is the most active thyroid hormone that directly affects your metabolism. "Free" T3 is the amount available for your cells to use. It\'s like the gas pedal for your body\'s energy production.',
    whatItMeans:
      'Normal levels mean good metabolic function and energy. Low levels can cause fatigue, weight gain, and feeling cold. High levels may cause anxiety, weight loss, and feeling hot.',
    tips: [
      'Support T3 conversion with selenium and zinc',
      'Manage stress as cortisol can block T3 conversion',
      'Get adequate sleep for hormone balance',
      'Avoid extreme dieting which can lower T3',
      'Consider timing of thyroid medication if prescribed',
    ],
  },
  'Reverse T3': {
    name: 'Reverse T3 (Inactive Thyroid)',
    unit: 'ng/dL',
    referenceRange: '8-25',
    category: 'Hormone Health',
    explanation:
      'Reverse T3 is an inactive form of thyroid hormone that your body makes during stress or illness. Think of it as putting the brakes on your metabolism when your body needs to conserve energy.',
    whatItMeans:
      'Normal levels suggest good thyroid function. High levels might indicate chronic stress, illness, or poor T4 to T3 conversion, which can cause hypothyroid symptoms even with normal TSH.',
    tips: [
      'Reduce chronic stress through meditation or yoga',
      'Address underlying infections or inflammation',
      'Ensure adequate calories - avoid crash dieting',
      'Support liver detoxification for hormone clearance',
      'Work with a doctor if levels are consistently high',
    ],
  },
  'Anti-TPO Ab': {
    name: 'Anti-TPO Antibodies',
    unit: 'IU/mL',
    referenceRange: '<35',
    category: 'Hormone Health',
    explanation:
      "These are antibodies your immune system makes against your thyroid gland. It's like your body's security system mistakenly attacking your own thyroid, which can lead to autoimmune thyroid disease.",
    whatItMeans:
      "Low levels are normal. High levels suggest Hashimoto's thyroiditis, an autoimmune condition where your immune system attacks your thyroid, potentially leading to hypothyroidism.",
    tips: [
      'Follow an anti-inflammatory diet rich in omega-3s',
      'Consider gluten-free diet as it may help some people',
      'Manage stress which can trigger autoimmune flares',
      'Ensure adequate vitamin D and selenium',
      'Work with an endocrinologist for monitoring and treatment',
    ],
  },
  'Resting HR': {
    name: 'Resting Heart Rate',
    unit: 'bpm',
    referenceRange: '60-100',
    category: 'Heart Health',
    explanation:
      "This is how many times your heart beats per minute when you're at rest. It's like checking the idle speed of your heart's engine - lower is usually better for fitness.",
    whatItMeans:
      'Lower resting heart rates (50-60) often indicate good cardiovascular fitness. Higher rates (>100) might suggest poor fitness, stress, or heart problems.',
    tips: [
      'Exercise regularly to strengthen your heart',
      'Practice deep breathing and meditation',
      'Limit caffeine and alcohol consumption',
      'Get adequate sleep for heart recovery',
      'Maintain a healthy weight',
    ],
  },
  'VO₂ max': {
    name: 'VO₂ Max (Fitness Level)',
    unit: 'ml/kg/min',
    referenceRange: '>45',
    category: 'Heart Health',
    explanation:
      "VO₂ max measures how efficiently your body uses oxygen during exercise. It's like measuring your body's horsepower - the higher the number, the fitter you are.",
    whatItMeans:
      'Higher values indicate better cardiovascular fitness and endurance. Lower values suggest you could benefit from more aerobic exercise to improve heart and lung efficiency.',
    tips: [
      'Do regular cardio exercise like running or cycling',
      'Try high-intensity interval training (HIIT)',
      'Gradually increase exercise intensity over time',
      'Include both steady-state and interval cardio',
      'Stay consistent with your exercise routine',
    ],
  },
  'Blood Pressure': {
    name: 'Blood Pressure',
    unit: 'mmHg',
    referenceRange: '<120/80',
    category: 'Heart Health',
    explanation:
      "Blood pressure measures the force of blood against your artery walls. Think of it like water pressure in your home's pipes - too high can damage the system over time.",
    whatItMeans:
      'Normal is below 120/80. High blood pressure (>130/80) increases risk of heart disease and stroke. Low blood pressure can cause dizziness but is usually not dangerous.',
    tips: [
      'Reduce sodium intake and eat more potassium-rich foods',
      'Exercise regularly to strengthen your heart',
      'Maintain a healthy weight',
      'Limit alcohol and quit smoking',
      'Manage stress through relaxation techniques',
    ],
  },
  'LDL-C': {
    name: 'LDL-C (Bad Cholesterol)',
    unit: 'mg/dL',
    referenceRange: '<100',
    category: 'Heart Health',
    explanation:
      'LDL cholesterol carries cholesterol to your arteries where it can build up and form plaques. It\'s called "bad" cholesterol because high levels increase your risk of heart attacks and strokes.',
    whatItMeans:
      'Below 100 is optimal. 100-129 is near optimal. 130-159 is borderline high. Above 160 is high and significantly increases cardiovascular risk.',
    tips: [
      'Reduce saturated fat intake (red meat, full-fat dairy)',
      'Avoid trans fats found in processed foods',
      'Eat more plant-based meals',
      'Include nuts and seeds in your diet',
      'Consider plant stanols/sterols supplements',
    ],
  },
  'HDL-C': {
    name: 'HDL-C (Good Cholesterol)',
    unit: 'mg/dL',
    referenceRange: '>40 (men), >50 (women)',
    category: 'Heart Health',
    explanation:
      'HDL cholesterol removes cholesterol from your arteries and takes it back to your liver for disposal. It\'s "good" cholesterol because higher levels protect against heart disease.',
    whatItMeans:
      'Higher is better! Above 60 is protective against heart disease. 40-60 is acceptable. Below 40 (men) or 50 (women) increases cardiovascular risk.',
    tips: [
      'Exercise regularly - especially aerobic exercise',
      'Eat healthy fats like those in fish, nuts, and olive oil',
      'Maintain a healthy weight',
      "Don't smoke - smoking lowers HDL",
      'Limit refined carbohydrates and sugars',
    ],
  },
  ApoB: {
    name: 'ApoB (Atherogenic Particles)',
    unit: 'mg/dL',
    referenceRange: '<90',
    category: 'Heart Health',
    explanation:
      'ApoB measures the number of cholesterol-carrying particles that can cause artery blockages. Think of it as counting the actual "bad" particles rather than just the cholesterol amount.',
    whatItMeans:
      'Lower levels mean fewer particles that can clog arteries. High ApoB is a strong predictor of heart disease risk, sometimes even better than LDL cholesterol alone.',
    tips: [
      'Follow a Mediterranean-style diet',
      'Reduce refined carbohydrates and sugars',
      'Include omega-3 rich fish in your diet',
      'Exercise regularly to improve particle clearance',
      'Consider medication if levels remain high despite lifestyle changes',
    ],
  },
  'Lp(a)': {
    name: 'Lp(a) (Genetic Risk Factor)',
    unit: 'mg/dL',
    referenceRange: '<30',
    category: 'Heart Health',
    explanation:
      "Lp(a) is a genetic form of cholesterol that increases heart disease risk. Unlike other cholesterol, it's mostly determined by your genes, like having a genetic predisposition to heart problems.",
    whatItMeans:
      "This is largely genetic and doesn't change much with diet or exercise. High levels increase heart disease risk, but knowing your level helps guide prevention strategies.",
    tips: [
      'Focus on optimizing other heart disease risk factors',
      'Exercise regularly and maintain healthy weight',
      "Don't smoke and limit alcohol",
      'Consider more aggressive LDL targets if Lp(a) is high',
      'Discuss family history and genetic counseling with your doctor',
    ],
  },
  'hs-CRP': {
    name: 'hs-CRP (Inflammation Marker)',
    unit: 'mg/L',
    referenceRange: '<1.0',
    category: 'Inflammatory Health',
    explanation:
      'High-sensitivity CRP measures inflammation in your body. Think of it as a smoke detector for inflammation - it can indicate increased risk of heart disease and other health problems.',
    whatItMeans:
      'Below 1.0 is low risk. 1.0-3.0 is moderate risk. Above 3.0 is high risk for cardiovascular disease. Very high levels might indicate infection or autoimmune disease.',
    tips: [
      'Follow an anti-inflammatory diet rich in omega-3s',
      'Exercise regularly but avoid overtraining',
      'Get adequate sleep for recovery',
      'Manage stress through meditation or yoga',
      'Address underlying infections or autoimmune conditions',
    ],
  },
  Homocysteine: {
    name: 'Homocysteine (Vascular Risk)',
    unit: 'μmol/L',
    referenceRange: '4-15',
    category: 'Heart Health',
    explanation:
      "Homocysteine is an amino acid that can damage blood vessels when levels are too high. It's like having a corrosive substance in your bloodstream that can harm your arteries.",
    whatItMeans:
      "Normal levels support healthy blood vessels. High levels increase risk of heart disease, stroke, and blood clots. It's often elevated due to B-vitamin deficiencies.",
    tips: [
      'Take B-complex vitamins (B6, B12, folate)',
      'Eat leafy greens rich in folate',
      'Include B12-rich foods like fish and eggs',
      'Limit alcohol which can interfere with B-vitamin absorption',
      'Consider genetic testing for MTHFR mutations',
    ],
  },

  ALP: {
    name: 'ALP (Alkaline Phosphatase)',
    unit: 'U/L',
    referenceRange: '44-147',
    category: 'Liver Health',
    explanation:
      "ALP is an enzyme found in your liver, bones, and other tissues. High levels can indicate liver problems or bone disorders. It's like a general alarm that something might be wrong.",
    whatItMeans:
      'Normal levels suggest healthy liver and bone function. High levels might indicate liver disease, bone problems, or blocked bile ducts.',
    tips: [
      'Avoid excessive alcohol consumption',
      'Maintain a healthy weight to prevent fatty liver',
      'Get adequate vitamin D and calcium for bone health',
      'Avoid unnecessary medications that can stress the liver',
      'Follow up with your doctor if levels are consistently high',
    ],
  },
  GGT: {
    name: 'GGT (Liver Detox Enzyme)',
    unit: 'U/L',
    referenceRange: '9-48',
    category: 'Liver Health',
    explanation:
      'GGT is an enzyme that helps your liver process toxins and medications. High levels often indicate liver stress from alcohol, medications, or other toxins.',
    whatItMeans:
      'Normal levels suggest good liver detoxification. High levels often indicate alcohol use, medication effects, or liver disease.',
    tips: [
      'Limit or avoid alcohol completely',
      'Reduce exposure to environmental toxins',
      'Support liver detox with milk thistle (consult doctor first)',
      'Eat cruciferous vegetables like broccoli and Brussels sprouts',
      'Review medications with your doctor for liver effects',
    ],
  },
  'Total Bilirubin': {
    name: 'Total Bilirubin',
    unit: 'mg/dL',
    referenceRange: '0.1-1.2',
    category: 'Liver Health',
    explanation:
      'Bilirubin is a yellow compound made when old red blood cells are broken down. Your liver processes it for elimination. High levels can cause jaundice (yellowing of skin/eyes).',
    whatItMeans:
      'Normal levels indicate good liver function and red blood cell turnover. High levels might suggest liver problems, bile duct blockage, or excessive red blood cell breakdown.',
    tips: [
      'Stay well hydrated to help liver function',
      'Avoid excessive alcohol and liver-toxic medications',
      'Eat a liver-supportive diet with antioxidants',
      'Get adequate sleep for liver recovery',
      'See a doctor if you notice yellowing of skin or eyes',
    ],
  },
  Insulin: {
    name: 'Insulin (Blood Sugar Control)',
    unit: 'μIU/mL',
    referenceRange: '2-20',
    category: 'Blood Sugar',
    explanation:
      "Insulin is a hormone that helps your cells absorb sugar from your blood. It's like a key that unlocks your cells to let sugar in for energy.",
    whatItMeans:
      'Normal levels suggest good blood sugar control. High levels might indicate insulin resistance, where your body needs more insulin to control blood sugar.',
    tips: [
      'Eat a low-glycemic diet with complex carbohydrates',
      'Exercise regularly to improve insulin sensitivity',
      'Maintain a healthy weight',
      'Include fiber-rich foods in every meal',
      'Consider intermittent fasting (consult doctor first)',
    ],
  },
  'C-Peptide': {
    name: 'C-Peptide (Insulin Production)',
    unit: 'ng/mL',
    referenceRange: '0.5-2.0',
    category: 'Blood Sugar',
    explanation:
      "C-peptide is made along with insulin by your pancreas. It's like a measuring stick to see how much insulin your body is actually producing naturally.",
    whatItMeans:
      'Normal levels indicate good pancreatic function. Low levels might suggest Type 1 diabetes or pancreatic problems. High levels can indicate insulin resistance.',
    tips: [
      'Support pancreatic health with a balanced diet',
      'Avoid excessive sugar and refined carbohydrates',
      'Include chromium and magnesium-rich foods',
      'Exercise regularly to support insulin function',
      'Monitor blood sugar if levels are abnormal',
    ],
  },
  'HOMA-IR': {
    name: 'HOMA-IR (Insulin Resistance)',
    unit: '',
    referenceRange: '<2.0',
    category: 'Blood Sugar',
    explanation:
      "HOMA-IR calculates how resistant your cells are to insulin. It's like measuring how hard your body has to work to keep blood sugar normal.",
    whatItMeans:
      'Lower values indicate better insulin sensitivity. Values above 2.0 suggest insulin resistance, which increases risk of diabetes and metabolic syndrome.',
    tips: [
      'Follow a low-carbohydrate or Mediterranean diet',
      'Exercise regularly, especially strength training',
      'Lose weight if overweight',
      'Get adequate sleep (7-9 hours per night)',
      'Consider metformin if prescribed by your doctor',
    ],
  },
  Urea: {
    name: 'Urea (BUN - Kidney Function)',
    unit: 'mg/dL',
    referenceRange: '7-20',
    category: 'Kidney Health',
    explanation:
      "Urea (BUN) is a waste product from protein breakdown that your kidneys filter out. It's like checking how well your kidneys are cleaning protein waste from your blood.",
    whatItMeans:
      'Normal levels indicate good kidney function. High levels might suggest kidney problems, dehydration, or high protein intake. Low levels are usually not concerning.',
    tips: [
      'Stay well hydrated throughout the day',
      "Don't consume excessive protein supplements",
      'Maintain healthy blood pressure',
      'Limit salt intake to reduce kidney stress',
      'Get regular kidney function monitoring if at risk',
    ],
  },
  'Cystatin C': {
    name: 'Cystatin C (Kidney Function)',
    unit: 'mg/L',
    referenceRange: '0.6-1.0',
    category: 'Kidney Health',
    explanation:
      "Cystatin C is a more accurate measure of kidney function than creatinine, especially in older adults or those with muscle loss. It's like a better ruler for measuring kidney health.",
    whatItMeans:
      'Normal levels indicate good kidney filtration. High levels suggest declining kidney function and may detect kidney problems earlier than creatinine.',
    tips: [
      'Follow all kidney-healthy lifestyle recommendations',
      'Control blood pressure and diabetes if present',
      "Stay hydrated but don't overhydrate",
      'Avoid nephrotoxic medications when possible',
      'Monitor kidney function regularly if levels are elevated',
    ],
  },
  'Albumin/Creatinine Ratio': {
    name: 'Albumin/Creatinine Ratio',
    unit: 'mg/g',
    referenceRange: '<30',
    category: 'Kidney Health',
    explanation:
      "This measures protein leakage in your urine, which can be an early sign of kidney damage. It's like checking for leaks in your kidney's filtering system.",
    whatItMeans:
      "Normal levels mean your kidneys aren't leaking protein. Higher levels suggest kidney damage, often from diabetes or high blood pressure.",
    tips: [
      'Control blood sugar tightly if diabetic',
      'Maintain optimal blood pressure',
      'Follow a kidney-friendly diet with moderate protein',
      'Take ACE inhibitors or ARBs if prescribed',
      'Monitor regularly as kidney damage can be reversed if caught early',
    ],
  },
  // Skeleton/Bone Health Biomarkers
  'Vitamin D (25-OH)': {
    name: 'Vitamin D (25-OH)',
    unit: 'ng/mL',
    referenceRange: '30-100',
    category: 'Bone Health',
    explanation:
      "Vitamin D is essential for calcium absorption and bone mineralization. It's like the key that unlocks your body's ability to use calcium for strong bones.",
    whatItMeans:
      'Levels 30-100 ng/mL are optimal for bone health. Below 30 indicates deficiency that can weaken bones. Above 100 may be excessive.',
    tips: [
      'Get 10-30 minutes of sun exposure daily',
      'Eat vitamin D-rich foods like fatty fish and egg yolks',
      'Consider vitamin D3 supplements (2000-4000 IU daily)',
      'Get your levels tested annually',
      'Combine with calcium for maximum bone benefit',
    ],
  },
  'Calcium (Total)': {
    name: 'Calcium (Total)',
    unit: 'mg/dL',
    referenceRange: '8.5-10.5',
    category: 'Bone Health',
    explanation:
      "Calcium is the primary mineral that makes up your bones and teeth. It's like the building blocks that create the structure of your skeleton.",
    whatItMeans:
      'Normal levels support strong bones and proper muscle/nerve function. High levels might indicate parathyroid problems. Low levels can weaken bones.',
    tips: [
      'Eat calcium-rich foods like dairy, leafy greens, and almonds',
      'Take calcium supplements with vitamin D for absorption',
      'Spread calcium intake throughout the day',
      'Avoid excessive caffeine which can interfere with absorption',
      'Get weight-bearing exercise to help bones use calcium',
    ],
  },
  'PTH (Intact)': {
    name: 'PTH (Intact)',
    unit: 'pg/mL',
    referenceRange: '15-65',
    category: 'Bone Health',
    explanation:
      "Parathyroid hormone regulates calcium and phosphorus levels in your blood. It's like the thermostat that controls how much calcium is available for your bones.",
    whatItMeans:
      'Normal levels maintain proper calcium balance. High levels can cause bone loss and kidney stones. Low levels may cause low calcium.',
    tips: [
      'Ensure adequate vitamin D intake',
      'Get regular calcium and PTH testing',
      'Maintain healthy kidney function',
      'Follow up with endocrinologist if levels are abnormal',
      'Consider bone density testing if PTH is elevated',
    ],
  },
  'BSAP': {
    name: 'BSAP (Bone Formation Marker)',
    unit: 'μg/L',
    referenceRange: '6.5-20.1',
    category: 'Bone Health',
    explanation:
      "BSAP is produced by bone-forming cells and indicates how actively your body is building new bone. It's like measuring construction activity in your skeleton.",
    whatItMeans:
      'Normal levels suggest healthy bone formation. High levels may indicate increased bone turnover or healing. Low levels might suggest poor bone formation.',
    tips: [
      'Ensure adequate calcium and vitamin D intake',
      'Do weight-bearing exercises regularly',
      'Get adequate protein for bone building',
      'Monitor levels during bone health treatments',
      'Consider bone density testing if levels are abnormal',
    ],
  },
  'Osteocalcin': {
    name: 'Osteocalcin',
    unit: 'ng/mL',
    referenceRange: '11-43',
    category: 'Bone Health',
    explanation:
      "Osteocalcin is a protein made by bone-forming cells that helps bind calcium to bone. It's like the glue that holds calcium in place in your bones.",
    whatItMeans:
      'Normal levels indicate healthy bone formation. High levels may suggest increased bone turnover. Low levels might indicate poor bone formation.',
    tips: [
      'Ensure adequate vitamin K intake (leafy greens)',
      'Get regular weight-bearing exercise',
      'Maintain healthy vitamin D levels',
      'Consider bone health supplements if levels are low',
      'Monitor during bone health treatments',
    ],
  },
  'CTX': {
    name: 'CTX (Bone Resorption Marker)',
    unit: 'ng/mL',
    referenceRange: '0.104-0.704',
    category: 'Bone Health',
    explanation:
      "CTX measures how quickly your body is breaking down old bone. It's like measuring demolition activity in your skeleton.",
    whatItMeans:
      'Normal levels suggest balanced bone turnover. High levels may indicate excessive bone loss. Low levels might suggest reduced bone turnover.',
    tips: [
      'Ensure adequate calcium and vitamin D',
      'Do weight-bearing exercises to reduce bone loss',
      'Consider bone-building medications if levels are high',
      'Monitor levels during osteoporosis treatment',
      'Get regular bone density scans',
    ],
  },


  'Fibrinogen': {
    name: 'Fibrinogen',
    unit: 'mg/dL',
    referenceRange: '200-400',
    category: 'Heart Health',
    explanation:
      "Fibrinogen is a protein involved in blood clotting. High levels can increase blood clot risk and heart disease.",
    whatItMeans:
      'Normal levels support healthy blood clotting. High levels increase heart disease and stroke risk.',
    tips: [
      'Follow a heart-healthy diet',
      'Exercise regularly to improve blood flow',
      'Maintain a healthy weight',
      'Quit smoking if you smoke',
      'Consider omega-3 supplements',
    ],
  },
  'D-dimer': {
    name: 'D-dimer',
    unit: 'μg/mL',
    referenceRange: '<0.5',
    category: 'Heart Health',
    explanation:
      "D-dimer is a protein fragment released when blood clots break down. It's used to detect blood clotting problems.",
    whatItMeans:
      'Normal levels suggest no active blood clotting. High levels may indicate blood clots or other clotting disorders.',
    tips: [
      'Stay active to prevent blood clots',
      'Stay hydrated to maintain blood flow',
      'Move regularly during long periods of sitting',
      'Follow doctor recommendations if elevated',
      'Monitor for symptoms of blood clots',
    ],
  },
  'Platelet Count': {
    name: 'Platelet Count',
    unit: 'K/μL',
    referenceRange: '150-450',
    category: 'Blood Health',
    explanation:
      "Platelets are blood cells that help with clotting and wound healing. They're like the body's natural band-aids.",
    whatItMeans:
      'Normal levels support healthy blood clotting. High levels may increase clot risk. Low levels may cause bleeding problems.',
    tips: [
      'Eat a balanced diet rich in iron and B12',
      'Stay hydrated to maintain blood volume',
      'Avoid excessive alcohol which can affect platelets',
      'Get regular blood tests if levels are abnormal',
      'Follow doctor recommendations for treatment',
    ],
  },
  'Hemoglobin': {
    name: 'Hemoglobin',
    unit: 'g/dL',
    referenceRange: '12-16 (women), 14-18 (men)',
    category: 'Blood Health',
    explanation:
      "Hemoglobin carries oxygen from your lungs to your body's tissues. It's like the delivery trucks for oxygen in your bloodstream.",
    whatItMeans:
      'Normal levels ensure adequate oxygen delivery. Low levels (anemia) can cause fatigue and shortness of breath.',
    tips: [
      'Eat iron-rich foods like red meat, spinach, and beans',
      'Include vitamin C with iron-rich foods for absorption',
      'Consider iron supplements if prescribed',
      'Get adequate B12 and folate',
      'Treat underlying causes of anemia',
    ],
  },
  'SpO₂': {
    name: 'SpO₂ (Blood Oxygen)',
    unit: '%',
    referenceRange: '95-100',
    category: 'Oxygenation',
    explanation:
      "SpO₂ measures how much oxygen your blood is carrying. It's like checking the oxygen level in your body's fuel tank.",
    whatItMeans:
      '95-100% is normal. Below 95% may indicate breathing problems or lung disease.',
    tips: [
      'Practice deep breathing exercises',
      'Exercise regularly to improve lung function',
      'Avoid smoking and secondhand smoke',
      'Get adequate sleep for respiratory health',
      'See a doctor if levels are consistently low',
    ],
  },
  'FEV1': {
    name: 'FEV1 (Lung Function)',
    unit: '% predicted',
    referenceRange: '>80',
    category: 'Oxygenation',
    explanation:
      "FEV1 measures how much air you can exhale in one second. It's like measuring your lungs' power output.",
    whatItMeans:
      'Above 80% is normal. Lower values may indicate lung disease or breathing problems.',
    tips: [
      'Quit smoking if you smoke',
      'Exercise regularly to improve lung function',
      'Avoid air pollution when possible',
      'Practice breathing exercises',
      'Follow doctor recommendations for lung conditions',
    ],
  },
  'FVC': {
    name: 'FVC (Total Lung Capacity)',
    unit: '% predicted',
    referenceRange: '>80',
    category: 'Oxygenation',
    explanation:
      "FVC measures your total lung capacity - how much air your lungs can hold. It's like measuring your lungs' storage capacity.",
    whatItMeans:
      'Above 80% is normal. Lower values may indicate restrictive lung disease.',
    tips: [
      'Practice deep breathing exercises',
      'Exercise regularly to maintain lung capacity',
      'Maintain good posture for optimal breathing',
      'Avoid smoking and air pollution',
      'Get regular lung function testing if needed',
    ],
  },
  'DLCO': {
    name: 'DLCO (Gas Exchange)',
    unit: '% predicted',
    referenceRange: '>80',
    category: 'Oxygenation',
    explanation:
      "DLCO measures how well your lungs transfer oxygen from air to blood. It's like measuring the efficiency of your lungs' oxygen exchange system.",
    whatItMeans:
      'Above 80% is normal. Lower values may indicate lung disease affecting gas exchange.',
    tips: [
      'Quit smoking if you smoke',
      'Exercise regularly to improve lung efficiency',
      'Avoid exposure to lung irritants',
      'Practice breathing exercises',
      'Follow doctor recommendations for lung conditions',
    ],
  },
  'Carbon Monoxide': {
    name: 'Carbon Monoxide',
    unit: 'ppm',
    referenceRange: '<9',
    category: 'Oxygenation',
    explanation:
      "Carbon monoxide is a toxic gas that can interfere with oxygen delivery. It's like having a poison in your bloodstream.",
    whatItMeans:
      'Low levels are normal. High levels can cause oxygen deprivation and serious health problems.',
    tips: [
      'Install carbon monoxide detectors in your home',
      'Never use gas appliances in enclosed spaces',
      'Avoid smoking and secondhand smoke',
      'Get fresh air if you suspect exposure',
      'Seek immediate medical attention for high levels',
    ],
  },
  'Pulmonary Function': {
    name: 'Pulmonary Function',
    unit: '% predicted',
    referenceRange: '>80',
    category: 'Oxygenation',
    explanation:
      "Pulmonary function tests measure overall lung health and breathing capacity. It's like a comprehensive health check for your respiratory system.",
    whatItMeans:
      'Above 80% is normal. Lower values may indicate lung disease or breathing problems.',
    tips: [
      'Quit smoking if you smoke',
      'Exercise regularly to maintain lung function',
      'Practice breathing exercises',
      'Avoid air pollution and lung irritants',
      'Get regular lung function testing if needed',
    ],
  },
  // Additional Skeleton/Bone Health Biomarkers
  'Phosphorus': {
    name: 'Phosphorus',
    unit: 'mg/dL',
    referenceRange: '2.5-4.5',
    category: 'Bone Health',
    explanation:
      "Phosphorus works with calcium to build strong bones and teeth. It's like the partner mineral that helps calcium do its job properly.",
    whatItMeans:
      'Normal levels support bone health and energy production. High levels may indicate kidney problems. Low levels can weaken bones.',
    tips: [
      'Eat phosphorus-rich foods like dairy, meat, and nuts',
      'Balance phosphorus with calcium intake',
      'Avoid excessive phosphorus from processed foods',
      'Get adequate vitamin D for phosphorus absorption',
      'Monitor levels if you have kidney disease',
    ],
  },
  'Magnesium': {
    name: 'Magnesium',
    unit: 'mg/dL',
    referenceRange: '1.7-2.2',
    category: 'Bone Health',
    explanation:
      "Magnesium is essential for bone formation and helps your body use calcium and vitamin D. It's like the coordinator that makes bone building work smoothly.",
    whatItMeans:
      'Normal levels support bone health and muscle function. Low levels can cause muscle cramps and bone problems.',
    tips: [
      'Eat magnesium-rich foods like nuts, seeds, and leafy greens',
      'Consider magnesium supplements if levels are low',
      'Get adequate vitamin D for magnesium absorption',
      'Limit alcohol which can deplete magnesium',
      'Monitor levels if you have digestive issues',
    ],
  },
  'Zinc': {
    name: 'Zinc',
    unit: 'μg/dL',
    referenceRange: '60-120',
    category: 'Bone Health',
    explanation:
      "Zinc is essential for bone formation and helps your body make collagen, the protein framework of bones. It's like the construction worker that builds bone structure.",
    whatItMeans:
      'Normal levels support bone health and immune function. Low levels can impair bone healing and growth.',
    tips: [
      'Eat zinc-rich foods like meat, shellfish, and legumes',
      'Include vitamin C with zinc for better absorption',
      'Avoid excessive iron supplements which can block zinc',
      'Consider zinc supplements if levels are low',
      'Monitor levels if you have digestive issues',
    ],
  },
  'Copper': {
    name: 'Copper',
    unit: 'μg/dL',
    referenceRange: '70-140',
    category: 'Bone Health',
    explanation:
      "Copper is required for collagen cross-linking, which gives bones their strength. It's like the glue that holds bone structure together.",
    whatItMeans:
      'Normal levels support bone strength and connective tissue health. Low levels can weaken bones and cause joint problems.',
    tips: [
      'Eat copper-rich foods like nuts, seeds, and shellfish',
      'Balance copper with zinc intake',
      'Avoid excessive zinc which can block copper',
      'Consider copper supplements if levels are low',
      'Monitor levels if you have digestive issues',
    ],
  },
  'CRP (hs-CRP)': {
    name: 'CRP (hs-CRP)',
    unit: 'mg/L',
    referenceRange: '<3.0',
    category: 'Bone Health',
    explanation:
      "CRP measures inflammation in your body, which can affect bone metabolism and healing. It's like checking if there's inflammation that might be affecting your bones.",
    whatItMeans:
      'Lower levels indicate less inflammation and better bone health. High levels may suggest inflammation affecting bone metabolism.',
    tips: [
      'Follow an anti-inflammatory diet',
      'Exercise regularly to reduce inflammation',
      'Maintain a healthy weight',
      'Quit smoking if you smoke',
      'Consider omega-3 supplements',
    ],
  },
  'ESR': {
    name: 'ESR',
    unit: 'mm/hr',
    referenceRange: '<20',
    category: 'Bone Health',
    explanation:
      "ESR measures inflammation and can indicate conditions that affect bone health. It's like a general inflammation marker that can signal bone-related problems.",
    whatItMeans:
      'Normal levels suggest no significant inflammation. High levels may indicate inflammatory conditions affecting bones.',
    tips: [
      'Follow an anti-inflammatory diet',
      'Exercise regularly to reduce inflammation',
      'Get adequate sleep for immune function',
      'Manage stress which can affect inflammation',
      'See a doctor if levels are consistently high',
    ],
  },
  'P1NP': {
    name: 'P1NP (Bone Formation Marker)',
    unit: 'ng/mL',
    referenceRange: '16.3-78.1',
    category: 'Bone Health',
    explanation:
      "P1NP is a marker of bone formation activity. It's like measuring how actively your body is building new bone tissue.",
    whatItMeans:
      'Normal levels suggest healthy bone formation. High levels may indicate increased bone turnover. Low levels might suggest poor bone formation.',
    tips: [
      'Ensure adequate calcium and vitamin D intake',
      'Do weight-bearing exercises regularly',
      'Get adequate protein for bone building',
      'Monitor levels during bone health treatments',
      'Consider bone density testing if levels are abnormal',
    ],
  },
  'NTX': {
    name: 'NTX (Bone Resorption Marker)',
    unit: 'nmol BCE/mmol Cr',
    referenceRange: '5.4-24.2',
    category: 'Bone Health',
    explanation:
      "NTX measures how quickly your body is breaking down old bone. It's like measuring demolition activity in your skeleton.",
    whatItMeans:
      'Normal levels suggest balanced bone turnover. High levels may indicate excessive bone loss. Low levels might suggest reduced bone turnover.',
    tips: [
      'Ensure adequate calcium and vitamin D',
      'Do weight-bearing exercises to reduce bone loss',
      'Consider bone-building medications if levels are high',
      'Monitor levels during osteoporosis treatment',
      'Get regular bone density scans',
    ],
  },
  'TRACP-5b': {
    name: 'TRACP-5b (Osteoclast Marker)',
    unit: 'U/L',
    referenceRange: '1.03-4.15',
    category: 'Bone Health',
    explanation:
      "TRACP-5b is produced by bone-resorbing cells (osteoclasts). It's like measuring the activity of cells that break down bone.",
    whatItMeans:
      'Normal levels suggest balanced bone resorption. High levels may indicate excessive bone breakdown. Low levels might suggest reduced bone turnover.',
    tips: [
      'Ensure adequate calcium and vitamin D',
      'Do weight-bearing exercises to reduce bone loss',
      'Consider bone-building medications if levels are high',
      'Monitor levels during osteoporosis treatment',
      'Get regular bone density scans',
    ],
  },
};

// Helper function to get biomarker info with current values
export const getBiomarkerInfo = (
  name: string,
  value: number,
  status: 'normal' | 'low' | 'high' | 'critical',
): BiomarkerInfo | null => {
  const baseInfo = biomarkerDatabase[name];
  if (!baseInfo) return null;

  return {
    ...baseInfo,
    value,
    status,
  };
};
