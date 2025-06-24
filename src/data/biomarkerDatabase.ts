import { BiomarkerInfo } from '../components/common/BiomarkerModal';

export const biomarkerDatabase: { [key: string]: Omit<BiomarkerInfo, 'value' | 'status'> } = {
  'Creatinine': {
    name: 'Creatinine',
    unit: 'mg/dL',
    referenceRange: '0.6-1.2',
    category: 'Kidney Health',
    explanation: 'Creatinine is a waste product made by your muscles during normal activity. Your kidneys filter it out of your blood and remove it through urine. It\'s like checking how well your body\'s filtration system is working.',
    whatItMeans: 'Normal levels mean your kidneys are filtering waste properly. High levels might mean your kidneys aren\'t working as well as they should. Low levels are usually not a concern.',
    tips: [
      'Stay well hydrated by drinking plenty of water',
      'Limit protein supplements if levels are high',
      'Avoid excessive use of pain medications like ibuprofen',
      'Maintain a healthy blood pressure',
      'Exercise regularly but avoid extreme workouts before testing'
    ]
  },
  'eGFR': {
    name: 'eGFR (Kidney Function)',
    unit: 'mL/min/1.73m²',
    referenceRange: '>90',
    category: 'Kidney Health',
    explanation: 'eGFR measures how well your kidneys filter blood. Think of it as a percentage score for your kidney function - the higher the better. It\'s calculated using your creatinine level, age, and gender.',
    whatItMeans: 'Above 90 is excellent kidney function. 60-89 is mildly decreased but usually normal for age. Below 60 may indicate kidney disease and should be monitored closely.',
    tips: [
      'Control blood pressure and diabetes if you have them',
      'Eat a balanced diet with less salt and processed foods',
      'Stay hydrated throughout the day',
      'Don\'t smoke - it damages blood vessels in kidneys',
      'Get regular check-ups to monitor kidney health'
    ]
  },
  'ALT': {
    name: 'ALT (Liver Enzyme)',
    unit: 'U/L',
    referenceRange: '7-56',
    category: 'Liver Health',
    explanation: 'ALT is an enzyme found mainly in your liver. When liver cells are damaged, they release ALT into your blood. It\'s like a smoke alarm for your liver - higher levels suggest liver stress or damage.',
    whatItMeans: 'Normal levels mean your liver is healthy. Elevated levels might indicate liver inflammation, fatty liver, or damage from medications, alcohol, or infections.',
    tips: [
      'Limit alcohol consumption or avoid it completely',
      'Maintain a healthy weight to prevent fatty liver',
      'Eat a diet rich in fruits, vegetables, and whole grains',
      'Avoid unnecessary medications and supplements',
      'Get vaccinated for hepatitis A and B'
    ]
  },
  'AST': {
    name: 'AST (Liver Enzyme)',
    unit: 'U/L',
    referenceRange: '10-40',
    category: 'Liver Health',
    explanation: 'AST is an enzyme found in your liver, heart, and muscles. Like ALT, it\'s released when these organs are damaged. It helps doctors understand if liver problems are present.',
    whatItMeans: 'Normal levels indicate healthy liver function. High levels might suggest liver damage, heart problems, or muscle injury. It\'s often checked alongside ALT for a complete picture.',
    tips: [
      'Follow a Mediterranean-style diet rich in healthy fats',
      'Exercise regularly but avoid overexertion before testing',
      'Limit processed foods and added sugars',
      'Consider milk thistle supplement (consult your doctor first)',
      'Manage stress through relaxation techniques'
    ]
  },
  'Fasting Glucose': {
    name: 'Fasting Glucose',
    unit: 'mg/dL',
    referenceRange: '70-99',
    category: 'Blood Sugar',
    explanation: 'This measures the amount of sugar in your blood after not eating for at least 8 hours. It shows how well your body manages blood sugar when you\'re not actively digesting food.',
    whatItMeans: 'Normal levels (70-99) mean good blood sugar control. 100-125 suggests prediabetes. Over 126 may indicate diabetes. Lower levels are usually fine unless you feel symptoms.',
    tips: [
      'Eat a balanced diet with complex carbohydrates',
      'Exercise regularly to improve insulin sensitivity',
      'Maintain a healthy weight',
      'Limit sugary drinks and processed foods',
      'Get adequate sleep (7-9 hours per night)'
    ]
  },
  'HbA1c': {
    name: 'HbA1c (Average Blood Sugar)',
    unit: '%',
    referenceRange: '<5.7',
    category: 'Blood Sugar',
    explanation: 'HbA1c shows your average blood sugar over the past 2-3 months. Think of it as a long-term report card for blood sugar control, unlike daily glucose tests that show just one moment.',
    whatItMeans: 'Below 5.7% is normal. 5.7-6.4% suggests prediabetes risk. 6.5% or higher may indicate diabetes. This test helps track blood sugar trends over time.',
    tips: [
      'Focus on consistent meal timing and portion control',
      'Choose foods with a low glycemic index',
      'Include fiber-rich foods in every meal',
      'Monitor carbohydrate intake throughout the day',
      'Work with a nutritionist if levels are elevated'
    ]
  },
  'Total Cholesterol': {
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    referenceRange: '<200',
    category: 'Heart Health',
    explanation: 'This measures all the cholesterol in your blood. Cholesterol is a waxy substance your body needs, but too much can build up in arteries and increase heart disease risk.',
    whatItMeans: 'Below 200 is desirable for heart health. 200-239 is borderline high. Above 240 is considered high and increases cardiovascular risk.',
    tips: [
      'Eat foods high in soluble fiber like oats and beans',
      'Choose lean proteins like fish and poultry',
      'Use healthy fats like olive oil instead of butter',
      'Exercise at least 150 minutes per week',
      'Quit smoking if you smoke'
    ]
  },
  'LDL': {
    name: 'LDL (Bad Cholesterol)',
    unit: 'mg/dL',
    referenceRange: '<100',
    category: 'Heart Health',
    explanation: 'LDL carries cholesterol to your arteries where it can build up and form plaques. It\'s called "bad" cholesterol because high levels increase your risk of heart attacks and strokes.',
    whatItMeans: 'Below 100 is optimal. 100-129 is near optimal. 130-159 is borderline high. Above 160 is high and significantly increases cardiovascular risk.',
    tips: [
      'Reduce saturated fat intake (red meat, full-fat dairy)',
      'Avoid trans fats found in processed foods',
      'Eat more plant-based meals',
      'Include nuts and seeds in your diet',
      'Consider plant stanols/sterols supplements'
    ]
  },
  'HDL': {
    name: 'HDL (Good Cholesterol)',
    unit: 'mg/dL',
    referenceRange: '>40 (men), >50 (women)',
    category: 'Heart Health',
    explanation: 'HDL removes cholesterol from your arteries and takes it back to your liver for disposal. It\'s "good" cholesterol because higher levels protect against heart disease.',
    whatItMeans: 'Higher is better! Above 60 is protective against heart disease. 40-60 is acceptable. Below 40 (men) or 50 (women) increases cardiovascular risk.',
    tips: [
      'Exercise regularly - especially aerobic exercise',
      'Eat healthy fats like those in fish, nuts, and olive oil',
      'Maintain a healthy weight',
      'Don\'t smoke - smoking lowers HDL',
      'Limit refined carbohydrates and sugars'
    ]
  },
  'Triglycerides': {
    name: 'Triglycerides',
    unit: 'mg/dL',
    referenceRange: '<150',
    category: 'Heart Health',
    explanation: 'Triglycerides are a type of fat in your blood that your body uses for energy. High levels often occur with high blood sugar, obesity, or excessive alcohol consumption.',
    whatItMeans: 'Below 150 is normal. 150-199 is borderline high. 200-499 is high. Above 500 is very high and increases risk of heart disease and pancreatitis.',
    tips: [
      'Limit sugar and refined carbohydrates',
      'Reduce alcohol consumption',
      'Eat more omega-3 rich fish like salmon',
      'Lose weight if overweight',
      'Choose complex carbs over simple sugars'
    ]
  },
  'TSH': {
    name: 'TSH (Thyroid Function)',
    unit: 'mIU/L',
    referenceRange: '0.4-4.0',
    category: 'Hormone Health',
    explanation: 'TSH is made by your pituitary gland to control your thyroid. It\'s like a thermostat - when thyroid hormone is low, TSH goes up to stimulate more production.',
    whatItMeans: 'Normal range suggests good thyroid function. High TSH may mean underactive thyroid (hypothyroidism). Low TSH might indicate overactive thyroid (hyperthyroidism).',
    tips: [
      'Ensure adequate iodine intake through iodized salt or seafood',
      'Get enough selenium from nuts, especially Brazil nuts',
      'Manage stress as it can affect thyroid function',
      'Get adequate sleep for hormone regulation',
      'Avoid excessive soy if you have thyroid issues'
    ]
  },
  'Free T4': {
    name: 'Free T4 (Thyroid Hormone)',
    unit: 'ng/dL',
    referenceRange: '0.8-1.8',
    category: 'Hormone Health',
    explanation: 'T4 is the main hormone your thyroid makes. "Free" T4 is the active form available for your body to use. It controls your metabolism - how fast your body uses energy.',
    whatItMeans: 'Normal levels mean your thyroid is producing adequate hormone. Low levels may cause fatigue and weight gain. High levels can cause anxiety and weight loss.',
    tips: [
      'Eat a balanced diet with adequate calories',
      'Include thyroid-supporting nutrients like zinc and tyrosine',
      'Avoid excessive goitrogenic foods if levels are low',
      'Time thyroid medication properly if prescribed',
      'Monitor symptoms like energy levels and mood'
    ]
  },
  'Vitamin D': {
    name: 'Vitamin D',
    unit: 'ng/mL',
    referenceRange: '30-100',
    category: 'Nutritional Health',
    explanation: 'Vitamin D helps your body absorb calcium for strong bones and supports immune function. Your skin makes it from sunlight, but many people don\'t get enough.',
    whatItMeans: 'Above 30 is sufficient for most people. 20-30 is insufficient. Below 20 is deficient and may affect bone health and immune function.',
    tips: [
      'Get 10-15 minutes of midday sun exposure several times per week',
      'Eat vitamin D rich foods like fatty fish and egg yolks',
      'Consider a vitamin D3 supplement, especially in winter',
      'Have levels checked annually',
      'Pair with vitamin K2 for optimal bone health'
    ]
  },
  'B12': {
    name: 'Vitamin B12',
    unit: 'pg/mL',
    referenceRange: '200-900',
    category: 'Nutritional Health',
    explanation: 'B12 is essential for making red blood cells and keeping your nervous system healthy. Your body can\'t make it, so you must get it from food or supplements.',
    whatItMeans: 'Normal levels support energy and brain function. Low levels can cause fatigue, weakness, and nerve problems. Very high levels are usually not harmful.',
    tips: [
      'Eat B12-rich foods like meat, fish, eggs, and dairy',
      'Consider B12 supplements if you\'re vegetarian/vegan',
      'Older adults may need supplements due to absorption issues',
      'Look for methylcobalamin form in supplements',
      'Get levels checked if you feel constantly tired'
    ]
  },
  'Iron': {
    name: 'Iron',
    unit: 'μg/dL',
    referenceRange: '60-170',
    category: 'Nutritional Health',
    explanation: 'Iron is essential for making red blood cells that carry oxygen throughout your body. Too little causes anemia and fatigue; too much can be toxic.',
    whatItMeans: 'Normal levels support energy and oxygen delivery. Low iron causes tiredness and pale skin. High iron can damage organs over time.',
    tips: [
      'Eat iron-rich foods like lean meat, spinach, and lentils',
      'Combine iron foods with vitamin C to improve absorption',
      'Avoid tea and coffee with iron-rich meals',
      'Don\'t take iron supplements unless recommended by a doctor',
      'Women may need more iron due to menstruation'
    ]
  },
  'Free T3': {
    name: 'Free T3 (Active Thyroid Hormone)',
    unit: 'pg/mL',
    referenceRange: '2.3-4.2',
    category: 'Hormone Health',
    explanation: 'T3 is the most active thyroid hormone that directly affects your metabolism. "Free" T3 is the amount available for your cells to use. It\'s like the gas pedal for your body\'s energy production.',
    whatItMeans: 'Normal levels mean good metabolic function and energy. Low levels can cause fatigue, weight gain, and feeling cold. High levels may cause anxiety, weight loss, and feeling hot.',
    tips: [
      'Support T3 conversion with selenium and zinc',
      'Manage stress as cortisol can block T3 conversion',
      'Get adequate sleep for hormone balance',
      'Avoid extreme dieting which can lower T3',
      'Consider timing of thyroid medication if prescribed'
    ]
  },
  'Reverse T3': {
    name: 'Reverse T3 (Inactive Thyroid)',
    unit: 'ng/dL',
    referenceRange: '8-25',
    category: 'Hormone Health',
    explanation: 'Reverse T3 is an inactive form of thyroid hormone that your body makes during stress or illness. Think of it as putting the brakes on your metabolism when your body needs to conserve energy.',
    whatItMeans: 'Normal levels suggest good thyroid function. High levels might indicate chronic stress, illness, or poor T4 to T3 conversion, which can cause hypothyroid symptoms even with normal TSH.',
    tips: [
      'Reduce chronic stress through meditation or yoga',
      'Address underlying infections or inflammation',
      'Ensure adequate calories - avoid crash dieting',
      'Support liver detoxification for hormone clearance',
      'Work with a doctor if levels are consistently high'
    ]
  },
  'Anti-TPO Ab': {
    name: 'Anti-TPO Antibodies',
    unit: 'IU/mL',
    referenceRange: '<35',
    category: 'Hormone Health',
    explanation: 'These are antibodies your immune system makes against your thyroid gland. It\'s like your body\'s security system mistakenly attacking your own thyroid, which can lead to autoimmune thyroid disease.',
    whatItMeans: 'Low levels are normal. High levels suggest Hashimoto\'s thyroiditis, an autoimmune condition where your immune system attacks your thyroid, potentially leading to hypothyroidism.',
    tips: [
      'Follow an anti-inflammatory diet rich in omega-3s',
      'Consider gluten-free diet as it may help some people',
      'Manage stress which can trigger autoimmune flares',
      'Ensure adequate vitamin D and selenium',
      'Work with an endocrinologist for monitoring and treatment'
    ]
  },
  'Resting HR': {
    name: 'Resting Heart Rate',
    unit: 'bpm',
    referenceRange: '60-100',
    category: 'Heart Health',
    explanation: 'This is how many times your heart beats per minute when you\'re at rest. It\'s like checking the idle speed of your heart\'s engine - lower is usually better for fitness.',
    whatItMeans: 'Lower resting heart rates (50-60) often indicate good cardiovascular fitness. Higher rates (>100) might suggest poor fitness, stress, or heart problems.',
    tips: [
      'Exercise regularly to strengthen your heart',
      'Practice deep breathing and meditation',
      'Limit caffeine and alcohol consumption',
      'Get adequate sleep for heart recovery',
      'Maintain a healthy weight'
    ]
  },
  'VO₂ max': {
    name: 'VO₂ Max (Fitness Level)',
    unit: 'ml/kg/min',
    referenceRange: '>45',
    category: 'Heart Health',
    explanation: 'VO₂ max measures how efficiently your body uses oxygen during exercise. It\'s like measuring your body\'s horsepower - the higher the number, the fitter you are.',
    whatItMeans: 'Higher values indicate better cardiovascular fitness and endurance. Lower values suggest you could benefit from more aerobic exercise to improve heart and lung efficiency.',
    tips: [
      'Do regular cardio exercise like running or cycling',
      'Try high-intensity interval training (HIIT)',
      'Gradually increase exercise intensity over time',
      'Include both steady-state and interval cardio',
      'Stay consistent with your exercise routine'
    ]
  },
  'Blood Pressure': {
    name: 'Blood Pressure',
    unit: 'mmHg',
    referenceRange: '<120/80',
    category: 'Heart Health',
    explanation: 'Blood pressure measures the force of blood against your artery walls. Think of it like water pressure in your home\'s pipes - too high can damage the system over time.',
    whatItMeans: 'Normal is below 120/80. High blood pressure (>130/80) increases risk of heart disease and stroke. Low blood pressure can cause dizziness but is usually not dangerous.',
    tips: [
      'Reduce sodium intake and eat more potassium-rich foods',
      'Exercise regularly to strengthen your heart',
      'Maintain a healthy weight',
      'Limit alcohol and quit smoking',
      'Manage stress through relaxation techniques'
    ]
  },
  'LDL-C': {
    name: 'LDL-C (Bad Cholesterol)',
    unit: 'mg/dL',
    referenceRange: '<100',
    category: 'Heart Health',
    explanation: 'LDL cholesterol carries cholesterol to your arteries where it can build up and form plaques. It\'s called "bad" cholesterol because high levels increase your risk of heart attacks and strokes.',
    whatItMeans: 'Below 100 is optimal. 100-129 is near optimal. 130-159 is borderline high. Above 160 is high and significantly increases cardiovascular risk.',
    tips: [
      'Reduce saturated fat intake (red meat, full-fat dairy)',
      'Avoid trans fats found in processed foods',
      'Eat more plant-based meals',
      'Include nuts and seeds in your diet',
      'Consider plant stanols/sterols supplements'
    ]
  },
  'HDL-C': {
    name: 'HDL-C (Good Cholesterol)',
    unit: 'mg/dL',
    referenceRange: '>40 (men), >50 (women)',
    category: 'Heart Health',
    explanation: 'HDL cholesterol removes cholesterol from your arteries and takes it back to your liver for disposal. It\'s "good" cholesterol because higher levels protect against heart disease.',
    whatItMeans: 'Higher is better! Above 60 is protective against heart disease. 40-60 is acceptable. Below 40 (men) or 50 (women) increases cardiovascular risk.',
    tips: [
      'Exercise regularly - especially aerobic exercise',
      'Eat healthy fats like those in fish, nuts, and olive oil',
      'Maintain a healthy weight',
      'Don\'t smoke - smoking lowers HDL',
      'Limit refined carbohydrates and sugars'
    ]
  },
  'ApoB': {
    name: 'ApoB (Atherogenic Particles)',
    unit: 'mg/dL',
    referenceRange: '<90',
    category: 'Heart Health',
    explanation: 'ApoB measures the number of cholesterol-carrying particles that can cause artery blockages. Think of it as counting the actual "bad" particles rather than just the cholesterol amount.',
    whatItMeans: 'Lower levels mean fewer particles that can clog arteries. High ApoB is a strong predictor of heart disease risk, sometimes even better than LDL cholesterol alone.',
    tips: [
      'Follow a Mediterranean-style diet',
      'Reduce refined carbohydrates and sugars',
      'Include omega-3 rich fish in your diet',
      'Exercise regularly to improve particle clearance',
      'Consider medication if levels remain high despite lifestyle changes'
    ]
  },
  'Lp(a)': {
    name: 'Lp(a) (Genetic Risk Factor)',
    unit: 'mg/dL',
    referenceRange: '<30',
    category: 'Heart Health',
    explanation: 'Lp(a) is a genetic form of cholesterol that increases heart disease risk. Unlike other cholesterol, it\'s mostly determined by your genes, like having a genetic predisposition to heart problems.',
    whatItMeans: 'This is largely genetic and doesn\'t change much with diet or exercise. High levels increase heart disease risk, but knowing your level helps guide prevention strategies.',
    tips: [
      'Focus on optimizing other heart disease risk factors',
      'Exercise regularly and maintain healthy weight',
      'Don\'t smoke and limit alcohol',
      'Consider more aggressive LDL targets if Lp(a) is high',
      'Discuss family history and genetic counseling with your doctor'
    ]
  },
  'hs-CRP': {
    name: 'hs-CRP (Inflammation Marker)',
    unit: 'mg/L',
    referenceRange: '<1.0',
    category: 'Inflammatory Health',
    explanation: 'High-sensitivity CRP measures inflammation in your body. Think of it as a smoke detector for inflammation - it can indicate increased risk of heart disease and other health problems.',
    whatItMeans: 'Below 1.0 is low risk. 1.0-3.0 is moderate risk. Above 3.0 is high risk for cardiovascular disease. Very high levels might indicate infection or autoimmune disease.',
    tips: [
      'Follow an anti-inflammatory diet rich in omega-3s',
      'Exercise regularly but avoid overtraining',
      'Get adequate sleep for recovery',
      'Manage stress through meditation or yoga',
      'Address underlying infections or autoimmune conditions'
    ]
  },
  'Homocysteine': {
    name: 'Homocysteine (Vascular Risk)',
    unit: 'μmol/L',
    referenceRange: '4-15',
    category: 'Heart Health',
    explanation: 'Homocysteine is an amino acid that can damage blood vessels when levels are too high. It\'s like having a corrosive substance in your bloodstream that can harm your arteries.',
    whatItMeans: 'Normal levels support healthy blood vessels. High levels increase risk of heart disease, stroke, and blood clots. It\'s often elevated due to B-vitamin deficiencies.',
    tips: [
      'Take B-complex vitamins (B6, B12, folate)',
      'Eat leafy greens rich in folate',
      'Include B12-rich foods like fish and eggs',
      'Limit alcohol which can interfere with B-vitamin absorption',
      'Consider genetic testing for MTHFR mutations'
    ]
  },
  'NT-proBNP': {
    name: 'NT-proBNP (Heart Failure Marker)',
    unit: 'pg/mL',
    referenceRange: '<125',
    category: 'Heart Health',
    explanation: 'NT-proBNP is released when your heart is under stress or working harder than normal. It\'s like a distress signal from your heart indicating it\'s struggling to pump effectively.',
    whatItMeans: 'Normal levels suggest good heart function. Elevated levels may indicate heart failure, heart attack, or other heart problems requiring medical attention.',
    tips: [
      'Follow a heart-healthy diet low in sodium',
      'Exercise as recommended by your doctor',
      'Take prescribed heart medications consistently',
      'Monitor your weight daily for fluid retention',
      'See your cardiologist regularly for monitoring'
    ]
  },
  'ALP': {
    name: 'ALP (Alkaline Phosphatase)',
    unit: 'U/L',
    referenceRange: '44-147',
    category: 'Liver Health',
    explanation: 'ALP is an enzyme found in your liver, bones, and other tissues. High levels can indicate liver problems or bone disorders. It\'s like a general alarm that something might be wrong.',
    whatItMeans: 'Normal levels suggest healthy liver and bone function. High levels might indicate liver disease, bone problems, or blocked bile ducts.',
    tips: [
      'Avoid excessive alcohol consumption',
      'Maintain a healthy weight to prevent fatty liver',
      'Get adequate vitamin D and calcium for bone health',
      'Avoid unnecessary medications that can stress the liver',
      'Follow up with your doctor if levels are consistently high'
    ]
  },
  'GGT': {
    name: 'GGT (Liver Detox Enzyme)',
    unit: 'U/L',
    referenceRange: '9-48',
    category: 'Liver Health',
    explanation: 'GGT is an enzyme that helps your liver process toxins and medications. High levels often indicate liver stress from alcohol, medications, or other toxins.',
    whatItMeans: 'Normal levels suggest good liver detoxification. High levels often indicate alcohol use, medication effects, or liver disease.',
    tips: [
      'Limit or avoid alcohol completely',
      'Reduce exposure to environmental toxins',
      'Support liver detox with milk thistle (consult doctor first)',
      'Eat cruciferous vegetables like broccoli and Brussels sprouts',
      'Review medications with your doctor for liver effects'
    ]
  },
  'Total Bilirubin': {
    name: 'Total Bilirubin',
    unit: 'mg/dL',
    referenceRange: '0.1-1.2',
    category: 'Liver Health',
    explanation: 'Bilirubin is a yellow compound made when old red blood cells are broken down. Your liver processes it for elimination. High levels can cause jaundice (yellowing of skin/eyes).',
    whatItMeans: 'Normal levels indicate good liver function and red blood cell turnover. High levels might suggest liver problems, bile duct blockage, or excessive red blood cell breakdown.',
    tips: [
      'Stay well hydrated to help liver function',
      'Avoid excessive alcohol and liver-toxic medications',
      'Eat a liver-supportive diet with antioxidants',
      'Get adequate sleep for liver recovery',
      'See a doctor if you notice yellowing of skin or eyes'
    ]
  },
  'Insulin': {
    name: 'Insulin (Blood Sugar Control)',
    unit: 'μIU/mL',
    referenceRange: '2-20',
    category: 'Blood Sugar',
    explanation: 'Insulin is a hormone that helps your cells absorb sugar from your blood. It\'s like a key that unlocks your cells to let sugar in for energy.',
    whatItMeans: 'Normal levels suggest good blood sugar control. High levels might indicate insulin resistance, where your body needs more insulin to control blood sugar.',
    tips: [
      'Eat a low-glycemic diet with complex carbohydrates',
      'Exercise regularly to improve insulin sensitivity',
      'Maintain a healthy weight',
      'Include fiber-rich foods in every meal',
      'Consider intermittent fasting (consult doctor first)'
    ]
  },
  'C-Peptide': {
    name: 'C-Peptide (Insulin Production)',
    unit: 'ng/mL',
    referenceRange: '0.5-2.0',
    category: 'Blood Sugar',
    explanation: 'C-peptide is made along with insulin by your pancreas. It\'s like a measuring stick to see how much insulin your body is actually producing naturally.',
    whatItMeans: 'Normal levels indicate good pancreatic function. Low levels might suggest Type 1 diabetes or pancreatic problems. High levels can indicate insulin resistance.',
    tips: [
      'Support pancreatic health with a balanced diet',
      'Avoid excessive sugar and refined carbohydrates',
      'Include chromium and magnesium-rich foods',
      'Exercise regularly to support insulin function',
      'Monitor blood sugar if levels are abnormal'
    ]
  },
  'HOMA-IR': {
    name: 'HOMA-IR (Insulin Resistance)',
    unit: '',
    referenceRange: '<2.0',
    category: 'Blood Sugar',
    explanation: 'HOMA-IR calculates how resistant your cells are to insulin. It\'s like measuring how hard your body has to work to keep blood sugar normal.',
    whatItMeans: 'Lower values indicate better insulin sensitivity. Values above 2.0 suggest insulin resistance, which increases risk of diabetes and metabolic syndrome.',
    tips: [
      'Follow a low-carbohydrate or Mediterranean diet',
      'Exercise regularly, especially strength training',
      'Lose weight if overweight',
      'Get adequate sleep (7-9 hours per night)',
      'Consider metformin if prescribed by your doctor'
    ]
  },
  'Urea': {
    name: 'Urea (BUN - Kidney Function)',
    unit: 'mg/dL',
    referenceRange: '7-20',
    category: 'Kidney Health',
    explanation: 'Urea (BUN) is a waste product from protein breakdown that your kidneys filter out. It\'s like checking how well your kidneys are cleaning protein waste from your blood.',
    whatItMeans: 'Normal levels indicate good kidney function. High levels might suggest kidney problems, dehydration, or high protein intake. Low levels are usually not concerning.',
    tips: [
      'Stay well hydrated throughout the day',
      'Don\'t consume excessive protein supplements',
      'Maintain healthy blood pressure',
      'Limit salt intake to reduce kidney stress',
      'Get regular kidney function monitoring if at risk'
    ]
  },
  'Cystatin C': {
    name: 'Cystatin C (Kidney Function)',
    unit: 'mg/L',
    referenceRange: '0.6-1.0',
    category: 'Kidney Health',
    explanation: 'Cystatin C is a more accurate measure of kidney function than creatinine, especially in older adults or those with muscle loss. It\'s like a better ruler for measuring kidney health.',
    whatItMeans: 'Normal levels indicate good kidney filtration. High levels suggest declining kidney function and may detect kidney problems earlier than creatinine.',
    tips: [
      'Follow all kidney-healthy lifestyle recommendations',
      'Control blood pressure and diabetes if present',
      'Stay hydrated but don\'t overhydrate',
      'Avoid nephrotoxic medications when possible',
      'Monitor kidney function regularly if levels are elevated'
    ]
  },
  'Albumin/Creatinine Ratio': {
    name: 'Albumin/Creatinine Ratio',
    unit: 'mg/g',
    referenceRange: '<30',
    category: 'Kidney Health',
    explanation: 'This measures protein leakage in your urine, which can be an early sign of kidney damage. It\'s like checking for leaks in your kidney\'s filtering system.',
    whatItMeans: 'Normal levels mean your kidneys aren\'t leaking protein. Higher levels suggest kidney damage, often from diabetes or high blood pressure.',
    tips: [
      'Control blood sugar tightly if diabetic',
      'Maintain optimal blood pressure',
      'Follow a kidney-friendly diet with moderate protein',
      'Take ACE inhibitors or ARBs if prescribed',
      'Monitor regularly as kidney damage can be reversed if caught early'
    ]
  }
};

// Helper function to get biomarker info with current values
export const getBiomarkerInfo = (
  name: string, 
  value: number, 
  status: 'normal' | 'low' | 'high' | 'critical'
): BiomarkerInfo | null => {
  const baseInfo = biomarkerDatabase[name];
  if (!baseInfo) return null;
  
  return {
    ...baseInfo,
    value,
    status
  };
}; 