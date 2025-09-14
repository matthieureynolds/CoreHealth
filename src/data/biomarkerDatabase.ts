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
  'Vitamin A': {
    name: 'Vitamin A',
    unit: 'μg/dL',
    referenceRange: '20-80',
    category: 'Vitamin',
    organSystem: 'General',
    lastTested: 'Dec 15, 2024',
    percentile: 70,
    explanation:
      'Vitamin A is a fat-soluble vitamin essential for vision, immune function, and cell growth. It exists in two forms: retinol (from animal sources) and carotenoids (from plant sources).',
    whatItMeans:
      'Your vitamin A level of 45 μg/dL is in the normal range. This means you have adequate vitamin A to support healthy vision, immune function, and cell growth.',
    whyItMatters:
      'Vitamin A is crucial for maintaining healthy vision, especially night vision, supporting immune system function, and promoting healthy skin and cell growth.',
    levelMeaning: {
      low: 'Low vitamin A can cause night blindness, dry eyes, frequent infections, and poor growth.',
      normal: 'Your vitamin A level is healthy, supporting good vision and immune function.',
      high: 'Very high vitamin A levels can cause nausea, headaches, and liver damage.',
    },
    historyData: [42, 44, 45, 43, 46, 44, 45, 43, 44, 45, 42, 45],
    comparisonData: {
      allPopulation: 70,
      ageSexGroup: 72,
    },
    tips: [
      'Eat orange and yellow vegetables like carrots and sweet potatoes',
      'Include leafy greens like spinach and kale',
      'Consume liver and dairy products in moderation',
      'Avoid excessive vitamin A supplements',
    ],
  },
  'Vitamin C': {
    name: 'Vitamin C',
    unit: 'mg/dL',
    referenceRange: '0.4-2.0',
    category: 'Vitamin',
    organSystem: 'General',
    lastTested: 'Dec 15, 2024',
    percentile: 65,
    explanation:
      'Vitamin C is a water-soluble vitamin and powerful antioxidant that helps protect cells from damage and supports the immune system.',
    whatItMeans:
      'Your vitamin C level of 0.8 mg/dL is in the normal range. This means you have adequate vitamin C to support immune function and protect against cell damage.',
    whyItMatters:
      'Vitamin C is essential for immune system function, collagen synthesis for healthy skin, wound healing, and acts as a powerful antioxidant.',
    levelMeaning: {
      low: 'Low vitamin C can cause easy bruising, slow wound healing, frequent infections, and fatigue.',
      normal: 'Your vitamin C level is healthy, supporting good immune function and skin health.',
      high: 'Very high vitamin C levels are usually excreted but may cause digestive issues.',
    },
    historyData: [0.7, 0.8, 0.9, 0.8, 0.7, 0.8, 0.9, 0.8, 0.7, 0.8, 0.9, 0.8],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 68,
    },
    tips: [
      'Eat citrus fruits like oranges and grapefruits',
      'Include bell peppers, strawberries, and broccoli',
      'Consume fresh fruits and vegetables daily',
      'Avoid overcooking vegetables to preserve vitamin C',
    ],
  },
  'Vitamin K': {
    name: 'Vitamin K',
    unit: 'ng/mL',
    referenceRange: '0.2-3.2',
    category: 'Vitamin',
    organSystem: 'General',
    lastTested: 'Dec 15, 2024',
    percentile: 60,
    explanation:
      'Vitamin K is a fat-soluble vitamin essential for blood clotting and bone health. It exists in two forms: K1 (from plants) and K2 (from animal sources and fermented foods).',
    whatItMeans:
      'Your vitamin K level of 1.2 ng/mL is in the normal range. This means you have adequate vitamin K to support proper blood clotting and bone health.',
    whyItMatters:
      'Vitamin K is crucial for blood clotting to prevent excessive bleeding, supports bone health, and aids in calcium absorption.',
    levelMeaning: {
      low: 'Low vitamin K can cause easy bruising, excessive bleeding, and weak bones.',
      normal: 'Your vitamin K level is healthy, supporting good blood clotting and bone health.',
      high: 'Very high vitamin K levels are rare and usually not harmful.',
    },
    historyData: [1.0, 1.1, 1.2, 1.1, 1.3, 1.2, 1.1, 1.2, 1.0, 1.2, 1.1, 1.2],
    comparisonData: {
      allPopulation: 60,
      ageSexGroup: 62,
    },
    tips: [
      'Eat leafy greens like spinach, kale, and broccoli',
      'Include fermented foods like sauerkraut and natto',
      'Consume eggs and cheese in moderation',
      'Be consistent with vitamin K intake if on blood thinners',
    ],
  },
  'Calcium': {
    name: 'Calcium',
    unit: 'mg/dL',
    referenceRange: '8.5-10.5',
    category: 'Mineral',
    organSystem: 'General',
    lastTested: 'Dec 15, 2024',
    percentile: 75,
    explanation:
      'Calcium is the most abundant mineral in the body, essential for building and maintaining strong bones and teeth.',
    whatItMeans:
      'Your calcium level of 9.8 mg/dL is in the normal range. This means you have adequate calcium to support strong bones and proper muscle function.',
    whyItMatters:
      'Calcium is crucial for bone and tooth strength, muscle function, nerve transmission, and blood clotting.',
    levelMeaning: {
      low: 'Low calcium can cause weak bones, muscle cramps, and irregular heartbeat.',
      normal: 'Your calcium level is healthy, supporting strong bones and proper muscle function.',
      high: 'Very high calcium levels can cause kidney stones and heart problems.',
    },
    historyData: [9.5, 9.7, 9.8, 9.6, 9.9, 9.8, 9.7, 9.8, 9.6, 9.8, 9.7, 9.8],
    comparisonData: {
      allPopulation: 75,
      ageSexGroup: 78,
    },
    tips: [
      'Eat dairy products like milk, cheese, and yogurt',
      'Include leafy greens and fortified foods',
      'Get adequate vitamin D for calcium absorption',
      'Limit caffeine and alcohol which can reduce absorption',
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
  'Vitamin B12': {
    name: 'Vitamin B12',
    unit: 'pg/mL',
    referenceRange: '200-900',
    category: 'Vitamin',
    organSystem: 'General',
    lastTested: 'Dec 15, 2024',
    percentile: 75,
    explanation:
      "Vitamin B12 is a water-soluble vitamin essential for making red blood cells and keeping the nervous system healthy. Your body can't make it, so you must get it from food or supplements.",
    whatItMeans:
      'Your vitamin B12 level of 450 pg/mL is in the normal range. This means you have adequate B12 to support healthy red blood cell production and nerve function.',
    whyItMatters:
      'Vitamin B12 is crucial for preventing anemia, maintaining nerve function, and supporting brain health. Deficiency can cause serious neurological problems.',
    levelMeaning: {
      low: 'Low vitamin B12 can cause fatigue, weakness, numbness, memory problems, and anemia.',
      normal: 'Your vitamin B12 level is healthy, supporting good red blood cell production and nerve function.',
      high: 'Very high vitamin B12 levels are usually not harmful and may indicate supplementation.',
    },
    historyData: [420, 440, 450, 430, 460, 450, 440, 450, 420, 450, 440, 450],
    comparisonData: {
      allPopulation: 75,
      ageSexGroup: 78,
    },
    tips: [
      'Eat meat, fish, eggs, and dairy products',
      'Consider B12 supplements if vegetarian or vegan',
      'Get regular B12 levels checked as you age',
      'Be aware that some medications can affect B12 absorption',
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
  'NT-proBNP': {
    name: 'NT-proBNP (Heart Failure Marker)',
    unit: 'pg/mL',
    referenceRange: '<125 (age <75), <450 (age ≥75)',
    category: 'Heart Health',
    organSystem: 'Heart',
    lastTested: 'Dec 15, 2024',
    percentile: 45,
    explanation:
      "NT-proBNP is released by your heart when it's under stress or stretched. It's like a distress signal from your heart muscle when it's working too hard or not pumping effectively.",
    whatItMeans:
      'Normal levels suggest your heart is functioning well. High levels may indicate heart failure, heart strain, or other cardiac problems. Very high levels often require immediate medical attention.',
    whyItMatters:
      "NT-proBNP is one of the most important markers for detecting heart failure early. It can help diagnose heart problems before symptoms become severe and guide treatment decisions.",
    levelMeaning: {
      low: "Low NT-proBNP levels are excellent and indicate your heart is functioning well without significant stress or strain.",
      normal: "Your NT-proBNP levels are within the healthy range, suggesting good heart function and no significant cardiac stress.",
      high: "Elevated NT-proBNP levels may indicate heart failure, heart strain, or other cardiac problems requiring medical evaluation.",
      critical: "Very high NT-proBNP levels suggest severe heart problems and require immediate medical attention and treatment.",
    },
    historyData: [85, 92, 88, 95, 102, 98, 105, 110, 108, 115, 120, 125],
    comparisonData: {
      allPopulation: 45,
      ageSexGroup: 48,
    },
    tips: [
      'Follow a heart-healthy diet low in sodium',
      'Exercise regularly but avoid overexertion',
      'Take prescribed heart medications as directed',
      'Monitor fluid intake if you have heart failure',
      'Get regular cardiac check-ups',
      'Avoid excessive alcohol consumption',
      'Manage stress through relaxation techniques',
      'Maintain a healthy weight',
    ],
  },
  'Direct Bilirubin': {
    name: 'Direct Bilirubin',
    unit: 'mg/dL',
    referenceRange: '0.0-0.3',
    category: 'Liver Health',
    organSystem: 'Liver',
    lastTested: 'Dec 15, 2024',
    percentile: 35,
    explanation:
      "Direct bilirubin is the processed form of bilirubin that your liver has conjugated for elimination. It's like checking how well your liver is packaging waste for removal.",
    whatItMeans:
      'Normal levels indicate good liver function and bile flow. High levels may suggest liver disease, bile duct blockage, or problems with bilirubin processing.',
    whyItMatters:
      "Direct bilirubin helps distinguish between different types of liver problems and bile duct issues. It's crucial for diagnosing liver and gallbladder diseases.",
    levelMeaning: {
      low: "Low direct bilirubin levels are normal and indicate efficient liver processing of bilirubin.",
      normal: "Your direct bilirubin levels are within the healthy range, suggesting good liver function and bile flow.",
      high: "Elevated direct bilirubin levels may indicate liver disease, bile duct obstruction, or problems with bilirubin conjugation.",
    },
    historyData: [0.1, 0.15, 0.12, 0.18, 0.2, 0.16, 0.22, 0.19, 0.17, 0.21, 0.18, 0.2],
    comparisonData: {
      allPopulation: 35,
      ageSexGroup: 38,
    },
    tips: [
      'Maintain a healthy liver with a balanced diet',
      'Limit alcohol consumption',
      'Stay hydrated to support liver function',
      'Eat foods rich in antioxidants',
      'Avoid liver-toxic medications when possible',
    ],
  },
  'Direct Bilirubin Ratio': {
    name: 'Direct Bilirubin Ratio',
    unit: '%',
    referenceRange: '20-50',
    category: 'Liver Health',
    organSystem: 'Liver',
    lastTested: 'Dec 15, 2024',
    percentile: 42,
    explanation:
      "This ratio compares direct bilirubin to total bilirubin, helping determine if liver problems are due to conjugation issues or bile flow problems.",
    whatItMeans:
      'Normal ratios suggest good liver conjugation. High ratios may indicate bile duct obstruction. Low ratios might suggest conjugation problems.',
    whyItMatters:
      "The direct bilirubin ratio helps differentiate between different types of liver and bile duct problems, guiding appropriate treatment.",
    levelMeaning: {
      low: "Low ratios may suggest problems with bilirubin conjugation in the liver.",
      normal: "Your direct bilirubin ratio is within the healthy range, indicating good liver conjugation function.",
      high: "High ratios may suggest bile duct obstruction or other bile flow problems.",
    },
    historyData: [25, 28, 32, 30, 35, 38, 42, 40, 36, 39, 37, 35],
    comparisonData: {
      allPopulation: 42,
      ageSexGroup: 45,
    },
    tips: [
      'Support liver health with a balanced diet',
      'Stay hydrated to maintain bile flow',
      'Limit alcohol consumption',
      'Eat foods that support liver function',
      'Get regular liver function monitoring',
    ],
  },
  'Globulin': {
    name: 'Globulin',
    unit: 'g/dL',
    referenceRange: '2.0-3.5',
    category: 'Immune Health',
    organSystem: 'Immune System',
    lastTested: 'Dec 15, 2024',
    percentile: 55,
    explanation:
      "Globulins are proteins made by your immune system and liver. They include antibodies and other proteins that help fight infections and transport nutrients.",
    whatItMeans:
      'Normal levels support immune function and protein balance. High levels may indicate infection, inflammation, or immune disorders. Low levels might suggest immune deficiency.',
    whyItMatters:
      "Globulin levels help assess immune function and overall protein status. They're important for detecting infections, autoimmune diseases, and nutritional problems.",
    levelMeaning: {
      low: "Low globulin levels may indicate immune deficiency, malnutrition, or liver problems affecting protein production.",
      normal: "Your globulin levels are within the healthy range, suggesting good immune function and protein balance.",
      high: "Elevated globulin levels may indicate infection, inflammation, autoimmune disease, or certain cancers.",
    },
    historyData: [2.8, 2.9, 3.1, 3.0, 3.2, 3.3, 3.1, 3.4, 3.2, 3.0, 3.1, 3.2],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      'Eat a protein-rich diet to support globulin production',
      'Get adequate sleep for immune function',
      'Exercise regularly to boost immune health',
      'Manage stress which can affect immune function',
      'Stay hydrated to support protein metabolism',
    ],
  },
  'Albumin': {
    name: 'Albumin',
    unit: 'g/dL',
    referenceRange: '3.5-5.0',
    category: 'Nutritional Health',
    organSystem: 'Liver',
    lastTested: 'Dec 15, 2024',
    percentile: 65,
    explanation:
      "Albumin is the most abundant protein in your blood, made by your liver. It helps maintain blood volume, transport nutrients, and keep fluid in your blood vessels.",
    whatItMeans:
      'Normal levels support proper fluid balance and nutrient transport. Low levels may indicate liver disease, malnutrition, or kidney problems. High levels are usually not concerning.',
    whyItMatters:
      "Albumin is crucial for maintaining blood volume and transporting essential nutrients. Low levels can cause swelling and indicate serious health problems.",
    levelMeaning: {
      low: "Low albumin levels may indicate liver disease, malnutrition, kidney problems, or chronic inflammation.",
      normal: "Your albumin levels are within the healthy range, supporting good fluid balance and nutrient transport.",
      high: "High albumin levels are generally not concerning and may indicate good nutritional status.",
    },
    historyData: [4.2, 4.3, 4.1, 4.4, 4.2, 4.5, 4.3, 4.1, 4.4, 4.2, 4.3, 4.4],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 68,
    },
    tips: [
      'Eat adequate protein to support albumin production',
      'Maintain a balanced diet with all essential nutrients',
      'Stay hydrated to support blood volume',
      'Limit alcohol which can affect liver function',
      'Get regular health check-ups',
    ],
  },
  // Spine Biomarkers
  'Spine T-Score': {
    name: 'Spine T-Score',
    unit: '',
    referenceRange: '>-1.0',
    category: 'Bone Health',
    organSystem: 'Spine',
    lastTested: 'Dec 15, 2024',
    percentile: 70,
    explanation:
      "T-score compares your bone density to a healthy 30-year-old. It's like measuring how strong your spine bones are compared to peak bone strength.",
    whatItMeans:
      'Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia (low bone density). Below -2.5 suggests osteoporosis (very low bone density).',
    whyItMatters:
      "Spine T-score is crucial for detecting osteoporosis early. The spine is often the first place to show bone loss, and fractures here can be devastating.",
    levelMeaning: {
      low: "Low T-scores indicate reduced bone density and increased fracture risk in the spine.",
      normal: "Your spine T-score is within the healthy range, indicating good bone density and low fracture risk.",
      high: "Higher T-scores indicate better bone density and lower fracture risk.",
    },
    historyData: [-0.5, -0.3, -0.7, -0.4, -0.6, -0.2, -0.8, -0.5, -0.3, -0.6, -0.4, -0.5],
    comparisonData: {
      allPopulation: 70,
      ageSexGroup: 72,
    },
    tips: [
      'Do weight-bearing exercises like walking and jogging',
      'Ensure adequate calcium intake (1000-1200mg daily)',
      'Get enough vitamin D (1000-2000 IU daily)',
      'Include strength training in your routine',
      'Avoid smoking and excessive alcohol',
    ],
  },
  'Spine T-score (L1-L4)': {
    name: 'Spine T-score (L1-L4)',
    unit: 'SD',
    referenceRange: '>-1.0',
    category: 'Bone Health',
    organSystem: 'Spine',
    lastTested: 'Dec 15, 2024',
    percentile: 70,
    explanation:
      "T-score compares your lumbar spine bone density (L1-L4 vertebrae) to a healthy 30-year-old. It's like measuring how strong your lower spine bones are compared to peak bone strength.",
    whatItMeans:
      'Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia (low bone density). Below -2.5 suggests osteoporosis (very low bone density).',
    whyItMatters:
      "Lumbar spine T-score is crucial for detecting osteoporosis early. The lower spine is often the first place to show bone loss, and fractures here can be devastating.",
    levelMeaning: {
      low: "Low T-scores indicate reduced bone density and increased fracture risk in the lumbar spine.",
      normal: "Your lumbar spine T-score is within the healthy range, indicating good bone density and low fracture risk.",
      high: "Higher T-scores indicate better bone density and lower fracture risk.",
    },
    historyData: [-0.5, -0.3, -0.7, -0.4, -0.6, -0.2, -0.8, -0.5, -0.3, -0.6, -0.4, -0.5],
    comparisonData: {
      allPopulation: 70,
      ageSexGroup: 72,
    },
    tips: [
      'Do weight-bearing exercises like walking and jogging',
      'Ensure adequate calcium intake (1000-1200mg daily)',
      'Get enough vitamin D (1000-2000 IU daily)',
      'Include strength training in your routine',
      'Avoid smoking and excessive alcohol',
    ],
  },
  'Spine Z-Score': {
    name: 'Spine Z-Score',
    unit: '',
    referenceRange: '>-2.0',
    category: 'Bone Health',
    organSystem: 'Spine',
    lastTested: 'Dec 15, 2024',
    percentile: 60,
    explanation:
      "Z-score compares your bone density to others your age and gender. It's like seeing how your spine bones compare to your peers.",
    whatItMeans:
      'Above -2.0 is normal for your age. Below -2.0 may indicate bone density lower than expected for your age group.',
    whyItMatters:
      "Z-score helps identify if bone loss is age-appropriate or if there are underlying conditions causing premature bone loss.",
    levelMeaning: {
      low: "Low Z-scores may indicate bone density lower than expected for your age, suggesting underlying health issues.",
      normal: "Your spine Z-score is appropriate for your age group, indicating normal bone development.",
      high: "Higher Z-scores indicate better bone density than average for your age group.",
    },
    historyData: [-0.8, -0.5, -1.2, -0.7, -1.0, -0.3, -1.5, -0.9, -0.6, -1.1, -0.8, -0.9],
    comparisonData: {
      allPopulation: 60,
      ageSexGroup: 62,
    },
    tips: [
      'Focus on age-appropriate bone health strategies',
      'Ensure adequate nutrition for bone building',
      'Stay active with age-appropriate exercises',
      'Monitor bone health regularly',
      'Discuss any concerns with your healthcare provider',
    ],
  },
  'Spine BMD': {
    name: 'Spine BMD (Bone Mineral Density)',
    unit: 'g/cm²',
    referenceRange: '>0.8',
    category: 'Bone Health',
    organSystem: 'Spine',
    lastTested: 'Dec 15, 2024',
    percentile: 65,
    explanation:
      "BMD measures the actual amount of bone mineral in your spine. It's like measuring the density of the bone material itself.",
    whatItMeans:
      'Higher BMD values indicate stronger, denser bones. Lower values suggest weaker bones that may be more prone to fractures.',
    whyItMatters:
      "BMD is the most direct measure of bone strength. It helps predict fracture risk and guides treatment decisions for bone health.",
    levelMeaning: {
      low: "Low BMD values indicate reduced bone mineral content and increased fracture risk.",
      normal: "Your spine BMD is within the healthy range, indicating good bone mineral content.",
      high: "Higher BMD values indicate stronger bones with lower fracture risk.",
    },
    historyData: [0.95, 0.98, 0.92, 0.96, 0.94, 1.01, 0.89, 0.93, 0.97, 0.91, 0.95, 0.96],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 68,
    },
    tips: [
      'Maximize bone mineral density through proper nutrition',
      'Do weight-bearing exercises regularly',
      'Ensure adequate calcium and vitamin D',
      'Include strength training for bone building',
      'Monitor BMD changes over time',
    ],
  },
  // Hip Biomarkers
  'Hip T-Score': {
    name: 'Hip T-Score',
    unit: '',
    referenceRange: '>-1.0',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 68,
    explanation:
      "Hip T-score compares your hip bone density to a healthy 30-year-old. It's crucial because hip fractures are often the most serious type of bone fracture.",
    whatItMeans:
      'Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.',
    whyItMatters:
      "Hip fractures are among the most serious bone fractures, often requiring surgery and long recovery. Early detection of hip bone loss is crucial.",
    levelMeaning: {
      low: "Low hip T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal: "Your hip T-score is within the healthy range, indicating good hip bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger hip bones and lower fracture risk.",
    },
    historyData: [-0.4, -0.2, -0.6, -0.3, -0.5, -0.1, -0.7, -0.4, -0.2, -0.5, -0.3, -0.4],
    comparisonData: {
      allPopulation: 68,
      ageSexGroup: 70,
    },
    tips: [
      'Focus on hip-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Do weight-bearing activities like walking',
      'Include balance exercises to prevent falls',
      'Avoid smoking and excessive alcohol',
    ],
  },
  'Left Hip T-score (Total)': {
    name: 'Left Hip T-score (Total)',
    unit: 'SD',
    referenceRange: '>-1.0',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 68,
    explanation:
      "Left hip T-score compares your left hip bone density to a healthy 30-year-old. It's crucial because hip fractures are often the most serious type of bone fracture.",
    whatItMeans:
      'Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.',
    whyItMatters:
      "Hip fractures are among the most serious bone fractures, often requiring surgery and long recovery. Early detection of hip bone loss is crucial.",
    levelMeaning: {
      low: "Low left hip T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal: "Your left hip T-score is within the healthy range, indicating good hip bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger hip bones and lower fracture risk.",
    },
    historyData: [-0.4, -0.2, -0.6, -0.3, -0.5, -0.1, -0.7, -0.4, -0.2, -0.5, -0.3, -0.4],
    comparisonData: {
      allPopulation: 68,
      ageSexGroup: 70,
    },
    tips: [
      'Focus on hip-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Do weight-bearing activities like walking',
      'Include balance exercises to prevent falls',
      'Avoid smoking and excessive alcohol',
    ],
  },
  'Right Hip T-score (Total)': {
    name: 'Right Hip T-score (Total)',
    unit: 'SD',
    referenceRange: '>-1.0',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 68,
    explanation:
      "Right hip T-score compares your right hip bone density to a healthy 30-year-old. It's crucial because hip fractures are often the most serious type of bone fracture.",
    whatItMeans:
      'Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.',
    whyItMatters:
      "Hip fractures are among the most serious bone fractures, often requiring surgery and long recovery. Early detection of hip bone loss is crucial.",
    levelMeaning: {
      low: "Low right hip T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal: "Your right hip T-score is within the healthy range, indicating good hip bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger hip bones and lower fracture risk.",
    },
    historyData: [-0.4, -0.2, -0.6, -0.3, -0.5, -0.1, -0.7, -0.4, -0.2, -0.5, -0.3, -0.4],
    comparisonData: {
      allPopulation: 68,
      ageSexGroup: 70,
    },
    tips: [
      'Focus on hip-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Do weight-bearing activities like walking',
      'Include balance exercises to prevent falls',
      'Avoid smoking and excessive alcohol',
    ],
  },
  'Hip Z-Score': {
    name: 'Hip Z-Score',
    unit: '',
    referenceRange: '>-2.0',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 62,
    explanation:
      "Hip Z-score compares your hip bone density to others your age and gender. It helps identify if hip bone loss is age-appropriate.",
    whatItMeans:
      'Above -2.0 is normal for your age. Below -2.0 may indicate hip bone density lower than expected for your age group.',
    whyItMatters:
      "Hip Z-score helps determine if hip bone loss is normal aging or if there are underlying conditions affecting hip bone health.",
    levelMeaning: {
      low: "Low hip Z-scores may indicate premature hip bone loss or underlying health conditions.",
      normal: "Your hip Z-score is appropriate for your age group, indicating normal hip bone development.",
      high: "Higher Z-scores indicate better hip bone density than average for your age group.",
    },
    historyData: [-0.7, -0.4, -1.1, -0.6, -0.9, -0.2, -1.3, -0.8, -0.5, -1.0, -0.7, -0.8],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 64,
    },
    tips: [
      'Focus on hip-specific bone health strategies',
      'Ensure adequate nutrition for hip bone strength',
      'Stay active with hip-friendly exercises',
      'Monitor hip bone health regularly',
      'Discuss any concerns with your healthcare provider',
    ],
  },
  'Hip BMD': {
    name: 'Hip BMD (Bone Mineral Density)',
    unit: 'g/cm²',
    referenceRange: '>0.7',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 67,
    explanation:
      "Hip BMD measures the actual amount of bone mineral in your hip bones. It's the most important predictor of hip fracture risk.",
    whatItMeans:
      'Higher hip BMD values indicate stronger hip bones. Lower values suggest increased risk of hip fractures.',
    whyItMatters:
      "Hip BMD is the gold standard for predicting hip fracture risk. Hip fractures are among the most serious and costly bone fractures.",
    levelMeaning: {
      low: "Low hip BMD values indicate increased risk of hip fractures, which can be devastating injuries.",
      normal: "Your hip BMD is within the healthy range, indicating good hip bone mineral content.",
      high: "Higher BMD values indicate stronger hip bones with lower fracture risk.",
    },
    historyData: [0.85, 0.88, 0.82, 0.86, 0.84, 0.91, 0.79, 0.83, 0.87, 0.81, 0.85, 0.86],
    comparisonData: {
      allPopulation: 67,
      ageSexGroup: 69,
    },
    tips: [
      'Maximize hip bone mineral density through nutrition',
      'Do hip-strengthening exercises regularly',
      'Ensure adequate calcium and vitamin D intake',
      'Include weight-bearing activities',
      'Monitor hip BMD changes over time',
    ],
  },
  // Vitamins
  'Vitamin E': {
    name: 'Vitamin E',
    unit: 'mg/dL',
    referenceRange: '5.5-17.0',
    category: 'Nutritional Health',
    organSystem: 'Immune System',
    lastTested: 'Dec 15, 2024',
    percentile: 58,
    explanation:
      "Vitamin E is a powerful antioxidant that protects your cells from damage. It's like having a bodyguard for your cells against harmful free radicals.",
    whatItMeans:
      'Normal levels support immune function and protect against oxidative stress. Low levels may increase infection risk and cell damage.',
    whyItMatters:
      "Vitamin E is crucial for immune function, skin health, and protecting against chronic diseases. Deficiency can cause nerve and muscle problems.",
    levelMeaning: {
      low: "Low vitamin E levels may indicate deficiency, increasing risk of infections and cell damage.",
      normal: "Your vitamin E levels are within the healthy range, supporting good immune function and antioxidant protection.",
      high: "Higher vitamin E levels provide excellent antioxidant protection and immune support.",
    },
    historyData: [8.2, 8.5, 8.8, 8.3, 9.1, 8.7, 9.3, 8.9, 8.6, 9.0, 8.8, 9.2],
    comparisonData: {
      allPopulation: 58,
      ageSexGroup: 61,
    },
    tips: [
      'Eat vitamin E-rich foods like nuts, seeds, and vegetable oils',
      'Include leafy greens and avocados in your diet',
      'Consider vitamin E supplements if levels are low',
      'Pair with healthy fats for better absorption',
      'Avoid excessive vitamin E supplements without medical supervision',
    ],
  },
  'Vitamin B1 (Thiamine)': {
    name: 'Vitamin B1 (Thiamine)',
    unit: 'ng/mL',
    referenceRange: '70-180',
    category: 'Nutritional Health',
    organSystem: 'Nervous System',
    lastTested: 'Dec 15, 2024',
    percentile: 52,
    explanation:
      "Thiamine helps your body convert food into energy and is essential for nerve function. It's like the spark plug that helps your body's engine run smoothly.",
    whatItMeans:
      'Normal levels support energy production and nerve function. Low levels can cause fatigue, weakness, and nerve problems.',
    whyItMatters:
      "Thiamine deficiency can cause beriberi and Wernicke-Korsakoff syndrome. It's essential for brain and nerve health.",
    levelMeaning: {
      low: "Low thiamine levels may cause fatigue, weakness, and nerve problems.",
      normal: "Your thiamine levels are within the healthy range, supporting good energy production and nerve function.",
      high: "Higher thiamine levels provide excellent support for energy metabolism and nerve health.",
    },
    historyData: [95, 98, 102, 105, 108, 110, 112, 115, 118, 120, 122, 125],
    comparisonData: {
      allPopulation: 52,
      ageSexGroup: 55,
    },
    tips: [
      'Eat thiamine-rich foods like whole grains, pork, and legumes',
      'Include fortified cereals in your diet',
      'Limit alcohol which can deplete thiamine',
      'Consider B-complex supplements if levels are low',
      'Cook foods properly to preserve thiamine content',
    ],
  },
  'Vitamin B2 (Riboflavin)': {
    name: 'Vitamin B2 (Riboflavin)',
    unit: 'μg/dL',
    referenceRange: '4-24',
    category: 'Nutritional Health',
    organSystem: 'Immune System',
    lastTested: 'Dec 15, 2024',
    percentile: 48,
    explanation:
      "Riboflavin helps your body use energy from food and supports healthy skin and eyes. It's like the assistant that helps other nutrients do their job.",
    whatItMeans:
      'Normal levels support energy metabolism and skin health. Low levels may cause mouth sores, skin problems, and eye issues.',
    whyItMatters:
      "Riboflavin is essential for energy production, antioxidant function, and healthy skin. Deficiency can cause angular cheilitis and other problems.",
    levelMeaning: {
      low: "Low riboflavin levels may cause mouth sores, skin problems, and eye issues.",
      normal: "Your riboflavin levels are within the healthy range, supporting good energy metabolism and skin health.",
      high: "Higher riboflavin levels provide excellent support for energy production and skin health.",
    },
    historyData: [12, 14, 16, 15, 18, 17, 19, 20, 18, 21, 19, 20],
    comparisonData: {
      allPopulation: 48,
      ageSexGroup: 51,
    },
    tips: [
      'Eat riboflavin-rich foods like dairy, eggs, and leafy greens',
      'Include lean meats and fortified cereals',
      'Store foods properly as light destroys riboflavin',
      'Consider B-complex supplements if levels are low',
      'Pair with other B vitamins for optimal absorption',
    ],
  },
  'Vitamin B3 (Niacin)': {
    name: 'Vitamin B3 (Niacin)',
    unit: 'mg/dL',
    referenceRange: '0.5-8.5',
    category: 'Nutritional Health',
    organSystem: 'Cardiovascular System',
    lastTested: 'Dec 15, 2024',
    percentile: 55,
    explanation:
      "Niacin helps your body use energy and supports healthy cholesterol levels. It's like the regulator that helps keep your energy and cholesterol systems balanced.",
    whatItMeans:
      'Normal levels support energy metabolism and heart health. Low levels may cause skin problems and digestive issues.',
    whyItMatters:
      "Niacin is essential for energy production and can help improve cholesterol levels. Deficiency can cause pellagra.",
    levelMeaning: {
      low: "Low niacin levels may cause skin problems, digestive issues, and fatigue.",
      normal: "Your niacin levels are within the healthy range, supporting good energy metabolism and heart health.",
      high: "Higher niacin levels provide excellent support for energy production and cardiovascular health.",
    },
    historyData: [3.2, 3.5, 3.8, 3.6, 4.1, 3.9, 4.3, 4.0, 3.7, 4.2, 3.8, 4.1],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      'Eat niacin-rich foods like poultry, fish, and nuts',
      'Include whole grains and legumes in your diet',
      'Consider niacin supplements under medical supervision',
      'Avoid excessive niacin which can cause flushing',
      'Pair with other B vitamins for optimal function',
    ],
  },
  'Vitamin B5 (Pantothenic Acid)': {
    name: 'Vitamin B5 (Pantothenic Acid)',
    unit: 'μg/dL',
    referenceRange: '25-100',
    category: 'Nutritional Health',
    organSystem: 'Endocrine System',
    lastTested: 'Dec 15, 2024',
    percentile: 62,
    explanation:
      "Pantothenic acid helps your body make hormones and use energy from food. It's like the coordinator that helps your body's systems work together smoothly.",
    whatItMeans:
      'Normal levels support hormone production and energy metabolism. Low levels may cause fatigue and digestive problems.',
    whyItMatters:
      "Pantothenic acid is essential for making stress hormones and energy production. Deficiency is rare but can cause burning feet syndrome.",
    levelMeaning: {
      low: "Low pantothenic acid levels may cause fatigue, digestive problems, and stress intolerance.",
      normal: "Your pantothenic acid levels are within the healthy range, supporting good hormone production and energy metabolism.",
      high: "Higher pantothenic acid levels provide excellent support for stress management and energy production.",
    },
    historyData: [45, 48, 52, 50, 55, 53, 58, 56, 54, 57, 55, 58],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 65,
    },
    tips: [
      'Eat pantothenic acid-rich foods like meat, fish, and whole grains',
      'Include avocados and sweet potatoes in your diet',
      'Consider B-complex supplements if levels are low',
      'Manage stress as it can deplete pantothenic acid',
      'Cook foods gently to preserve pantothenic acid',
    ],
  },
  'Vitamin B6 (Pyridoxine)': {
    name: 'Vitamin B6 (Pyridoxine)',
    unit: 'ng/mL',
    referenceRange: '5-50',
    category: 'Nutritional Health',
    organSystem: 'Nervous System',
    lastTested: 'Dec 15, 2024',
    percentile: 58,
    explanation:
      "Pyridoxine helps your body make neurotransmitters and process protein. It's like the messenger that helps your brain communicate with your body.",
    whatItMeans:
      'Normal levels support brain function and protein metabolism. Low levels may cause depression, confusion, and nerve problems.',
    whyItMatters:
      "Vitamin B6 is crucial for brain health, mood regulation, and protein metabolism. Deficiency can cause neurological problems.",
    levelMeaning: {
      low: "Low vitamin B6 levels may cause depression, confusion, and nerve problems.",
      normal: "Your vitamin B6 levels are within the healthy range, supporting good brain function and protein metabolism.",
      high: "Higher vitamin B6 levels provide excellent support for brain health and mood regulation.",
    },
    historyData: [22, 25, 28, 26, 30, 29, 32, 31, 29, 33, 30, 32],
    comparisonData: {
      allPopulation: 58,
      ageSexGroup: 61,
    },
    tips: [
      'Eat vitamin B6-rich foods like poultry, fish, and bananas',
      'Include chickpeas and potatoes in your diet',
      'Consider B-complex supplements if levels are low',
      'Avoid excessive vitamin B6 which can cause nerve damage',
      'Pair with other B vitamins for optimal function',
    ],
  },
  'Vitamin B7 (Biotin)': {
    name: 'Vitamin B7 (Biotin)',
    unit: 'ng/mL',
    referenceRange: '0.2-2.0',
    category: 'Nutritional Health',
    organSystem: 'Skin',
    lastTested: 'Dec 15, 2024',
    percentile: 65,
    explanation:
      "Biotin helps your body process fats and supports healthy hair, skin, and nails. It's like the beautician that helps keep your hair, skin, and nails looking their best.",
    whatItMeans:
      'Normal levels support healthy hair, skin, and nails. Low levels may cause hair loss, skin rashes, and brittle nails.',
    whyItMatters:
      "Biotin is essential for healthy hair, skin, and nails. Deficiency can cause alopecia and skin problems.",
    levelMeaning: {
      low: "Low biotin levels may cause hair loss, skin rashes, and brittle nails.",
      normal: "Your biotin levels are within the healthy range, supporting healthy hair, skin, and nails.",
      high: "Higher biotin levels provide excellent support for hair, skin, and nail health.",
    },
    historyData: [0.8, 0.9, 1.0, 0.95, 1.1, 1.05, 1.2, 1.15, 1.1, 1.25, 1.2, 1.3],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 68,
    },
    tips: [
      'Eat biotin-rich foods like eggs, nuts, and salmon',
      'Include sweet potatoes and avocados in your diet',
      'Consider biotin supplements if levels are low',
      'Avoid raw egg whites which can block biotin absorption',
      'Be patient as hair and nail improvements take time',
    ],
  },
  'Vitamin B9 (Folate)': {
    name: 'Vitamin B9 (Folate)',
    unit: 'ng/mL',
    referenceRange: '3.0-20.0',
    category: 'Nutritional Health',
    organSystem: 'Blood System',
    lastTested: 'Dec 15, 2024',
    percentile: 60,
    explanation:
      "Folate helps your body make DNA and red blood cells. It's like the construction worker that helps build new cells and genetic material.",
    whatItMeans:
      'Normal levels support cell division and prevent birth defects. Low levels may cause anemia and birth defects.',
    whyItMatters:
      "Folate is crucial for preventing birth defects and making healthy red blood cells. Deficiency can cause megaloblastic anemia.",
    levelMeaning: {
      low: "Low folate levels may cause anemia, birth defects, and poor cell division.",
      normal: "Your folate levels are within the healthy range, supporting good cell division and red blood cell production.",
      high: "Higher folate levels provide excellent support for cell division and prevent birth defects.",
    },
    historyData: [8.5, 9.2, 10.1, 9.8, 11.2, 10.8, 12.1, 11.5, 10.9, 12.3, 11.8, 12.5],
    comparisonData: {
      allPopulation: 60,
      ageSexGroup: 63,
    },
    tips: [
      'Eat folate-rich foods like leafy greens, beans, and citrus fruits',
      'Include fortified cereals and grains in your diet',
      'Consider folic acid supplements if levels are low',
      'Take folate before and during pregnancy',
      'Avoid excessive folate which can mask B12 deficiency',
    ],
  },
  // Minerals
  'Potassium': {
    name: 'Potassium',
    unit: 'mEq/L',
    referenceRange: '3.5-5.0',
    category: 'Nutritional Health',
    organSystem: 'Cardiovascular System',
    lastTested: 'Dec 15, 2024',
    percentile: 58,
    explanation:
      "Potassium helps your heart beat regularly and muscles work properly. It's like the conductor that keeps your heart rhythm steady and muscles functioning.",
    whatItMeans:
      'Normal levels support heart rhythm and muscle function. Low levels may cause irregular heartbeat and muscle weakness.',
    whyItMatters:
      "Potassium is essential for heart health and muscle function. Imbalances can cause dangerous heart rhythm problems.",
    levelMeaning: {
      low: "Low potassium levels may cause irregular heartbeat, muscle weakness, and fatigue.",
      normal: "Your potassium levels are within the healthy range, supporting good heart rhythm and muscle function.",
      high: "Higher potassium levels provide excellent support for heart health and muscle function.",
    },
    historyData: [4.1, 4.2, 4.3, 4.1, 4.4, 4.2, 4.5, 4.3, 4.2, 4.4, 4.3, 4.4],
    comparisonData: {
      allPopulation: 58,
      ageSexGroup: 61,
    },
    tips: [
      'Eat potassium-rich foods like bananas, sweet potatoes, and spinach',
      'Include avocados, beans, and yogurt in your diet',
      'Limit sodium which can deplete potassium',
      'Stay hydrated to maintain electrolyte balance',
      'Consult your doctor before taking potassium supplements',
    ],
  },
  'Sodium': {
    name: 'Sodium',
    unit: 'mEq/L',
    referenceRange: '136-145',
    category: 'Nutritional Health',
    organSystem: 'Cardiovascular System',
    lastTested: 'Dec 15, 2024',
    percentile: 52,
    explanation:
      "Sodium helps maintain fluid balance and nerve function. It's like the regulator that keeps your body's fluid levels and nerve signals balanced.",
    whatItMeans:
      'Normal levels support fluid balance and nerve function. High levels may cause high blood pressure and fluid retention.',
    whyItMatters:
      "Sodium balance is crucial for blood pressure and fluid balance. Imbalances can cause serious health problems.",
    levelMeaning: {
      low: "Low sodium levels may cause confusion, seizures, and brain swelling.",
      normal: "Your sodium levels are within the healthy range, supporting good fluid balance and nerve function.",
      high: "High sodium levels may cause high blood pressure and fluid retention.",
    },
    historyData: [138, 139, 140, 138, 141, 139, 142, 140, 139, 141, 140, 141],
    comparisonData: {
      allPopulation: 52,
      ageSexGroup: 55,
    },
    tips: [
      'Limit processed foods which are high in sodium',
      'Use herbs and spices instead of salt for flavor',
      'Read food labels to monitor sodium intake',
      'Stay hydrated to maintain electrolyte balance',
      'Aim for less than 2,300mg sodium per day',
    ],
  },
  'Chloride': {
    name: 'Chloride',
    unit: 'mEq/L',
    referenceRange: '98-107',
    category: 'Nutritional Health',
    organSystem: 'Cardiovascular System',
    lastTested: 'Dec 15, 2024',
    percentile: 55,
    explanation:
      "Chloride helps maintain fluid balance and acid-base balance in your body. It's like the partner that works with sodium to keep everything balanced.",
    whatItMeans:
      'Normal levels support fluid balance and acid-base balance. Imbalances may affect kidney function and blood pH.',
    whyItMatters:
      "Chloride is essential for maintaining proper fluid balance and blood pH. Imbalances can affect kidney function.",
    levelMeaning: {
      low: "Low chloride levels may indicate kidney problems or acid-base imbalances.",
      normal: "Your chloride levels are within the healthy range, supporting good fluid balance and acid-base balance.",
      high: "High chloride levels may indicate dehydration or kidney problems.",
    },
    historyData: [102, 103, 104, 102, 105, 103, 106, 104, 103, 105, 104, 105],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      'Maintain proper hydration to support chloride balance',
      'Eat a balanced diet with adequate electrolytes',
      'Monitor kidney function if levels are abnormal',
      'Stay hydrated but avoid overhydration',
      'Work with your doctor to address any imbalances',
    ],
  },
  'Sulfur': {
    name: 'Sulfur',
    unit: 'mg/dL',
    referenceRange: '0.5-1.5',
    category: 'Nutritional Health',
    organSystem: 'Connective Tissue',
    lastTested: 'Dec 15, 2024',
    percentile: 62,
    explanation:
      "Sulfur is essential for making proteins, especially those in your skin, hair, and nails. It's like the building block that helps create strong connective tissues.",
    whatItMeans:
      'Normal levels support protein synthesis and connective tissue health. Low levels may affect skin, hair, and joint health.',
    whyItMatters:
      "Sulfur is crucial for making collagen, keratin, and other proteins. It's essential for healthy skin, hair, nails, and joints.",
    levelMeaning: {
      low: "Low sulfur levels may affect skin, hair, nail, and joint health.",
      normal: "Your sulfur levels are within the healthy range, supporting good protein synthesis and connective tissue health.",
      high: "Higher sulfur levels provide excellent support for protein synthesis and connective tissue health.",
    },
    historyData: [0.8, 0.9, 1.0, 0.95, 1.1, 1.05, 1.2, 1.15, 1.1, 1.25, 1.2, 1.3],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 65,
    },
    tips: [
      'Eat sulfur-rich foods like eggs, garlic, and cruciferous vegetables',
      'Include onions, leeks, and shallots in your diet',
      'Eat adequate protein to support sulfur metabolism',
      'Consider MSM supplements if levels are low',
      'Support liver function for proper sulfur metabolism',
    ],
  },
  'Iodine': {
    name: 'Iodine',
    unit: 'μg/L',
    referenceRange: '100-300',
    category: 'Nutritional Health',
    organSystem: 'Thyroid',
    lastTested: 'Dec 15, 2024',
    percentile: 58,
    explanation:
      "Iodine is essential for making thyroid hormones that control your metabolism. It's like the fuel that powers your body's metabolic engine.",
    whatItMeans:
      'Normal levels support thyroid function and metabolism. Low levels may cause goiter and hypothyroidism.',
    whyItMatters:
      "Iodine is crucial for thyroid function and preventing goiter. Deficiency can cause serious thyroid problems.",
    levelMeaning: {
      low: "Low iodine levels may cause goiter, hypothyroidism, and metabolic problems.",
      normal: "Your iodine levels are within the healthy range, supporting good thyroid function and metabolism.",
      high: "Higher iodine levels provide excellent support for thyroid function and metabolism.",
    },
    historyData: [180, 190, 200, 185, 210, 195, 220, 205, 190, 215, 200, 210],
    comparisonData: {
      allPopulation: 58,
      ageSexGroup: 61,
    },
    tips: [
      'Use iodized salt in cooking',
      'Eat iodine-rich foods like seafood and seaweed',
      'Include dairy products in your diet',
      'Consider iodine supplements if levels are low',
      'Avoid excessive iodine which can cause thyroid problems',
    ],
  },
  'Selenium': {
    name: 'Selenium',
    unit: 'μg/L',
    referenceRange: '70-150',
    category: 'Nutritional Health',
    organSystem: 'Immune System',
    lastTested: 'Dec 15, 2024',
    percentile: 65,
    explanation:
      "Selenium is a powerful antioxidant that supports immune function and thyroid health. It's like the bodyguard that protects your cells and supports your immune system.",
    whatItMeans:
      'Normal levels support immune function and antioxidant protection. Low levels may increase infection risk and thyroid problems.',
    whyItMatters:
      "Selenium is essential for immune function, thyroid health, and antioxidant protection. Deficiency can cause serious health problems.",
    levelMeaning: {
      low: "Low selenium levels may increase infection risk and thyroid problems.",
      normal: "Your selenium levels are within the healthy range, supporting good immune function and antioxidant protection.",
      high: "Higher selenium levels provide excellent immune support and antioxidant protection.",
    },
    historyData: [95, 100, 105, 102, 110, 108, 115, 112, 108, 118, 115, 120],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 68,
    },
    tips: [
      'Eat selenium-rich foods like Brazil nuts, fish, and poultry',
      'Include whole grains and eggs in your diet',
      'Consider selenium supplements if levels are low',
      'Avoid excessive selenium which can be toxic',
      'Support immune function with adequate selenium',
    ],
  },
  'Manganese': {
    name: 'Manganese',
    unit: 'μg/L',
    referenceRange: '4-15',
    category: 'Nutritional Health',
    organSystem: 'Bone Health',
    lastTested: 'Dec 15, 2024',
    percentile: 60,
    explanation:
      "Manganese helps your body use nutrients and supports bone health. It's like the assistant that helps other nutrients work properly and keeps your bones strong.",
    whatItMeans:
      'Normal levels support bone health and nutrient metabolism. Low levels may affect bone density and nutrient absorption.',
    whyItMatters:
      "Manganese is essential for bone formation and nutrient metabolism. Deficiency can affect bone health and nutrient absorption.",
    levelMeaning: {
      low: "Low manganese levels may affect bone density and nutrient absorption.",
      normal: "Your manganese levels are within the healthy range, supporting good bone health and nutrient metabolism.",
      high: "Higher manganese levels provide excellent support for bone health and nutrient metabolism.",
    },
    historyData: [8.5, 9.2, 10.1, 9.8, 11.2, 10.8, 12.1, 11.5, 10.9, 12.3, 11.8, 12.5],
    comparisonData: {
      allPopulation: 60,
      ageSexGroup: 63,
    },
    tips: [
      'Eat manganese-rich foods like nuts, whole grains, and leafy greens',
      'Include legumes and tea in your diet',
      'Ensure adequate calcium and vitamin D for bone health',
      'Avoid excessive manganese which can be toxic',
      'Support bone health with adequate manganese',
    ],
  },
  'Chromium': {
    name: 'Chromium',
    unit: 'μg/L',
    referenceRange: '0.5-2.0',
    category: 'Nutritional Health',
    organSystem: 'Endocrine System',
    lastTested: 'Dec 15, 2024',
    percentile: 55,
    explanation:
      "Chromium helps your body use insulin and control blood sugar. It's like the key that helps insulin unlock your cells to let sugar in.",
    whatItMeans:
      'Normal levels support blood sugar control and insulin function. Low levels may affect blood sugar regulation.',
    whyItMatters:
      "Chromium is essential for blood sugar control and insulin function. Deficiency can affect glucose metabolism.",
    levelMeaning: {
      low: "Low chromium levels may affect blood sugar control and insulin function.",
      normal: "Your chromium levels are within the healthy range, supporting good blood sugar control and insulin function.",
      high: "Higher chromium levels provide excellent support for blood sugar control and insulin function.",
    },
    historyData: [1.2, 1.3, 1.4, 1.35, 1.5, 1.45, 1.6, 1.55, 1.5, 1.65, 1.6, 1.7],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      'Eat chromium-rich foods like broccoli, whole grains, and nuts',
      'Include lean meats and seafood in your diet',
      'Consider chromium supplements if levels are low',
      'Support blood sugar control with adequate chromium',
      'Work with your doctor to optimize blood sugar control',
    ],
  },
  'Molybdenum': {
    name: 'Molybdenum',
    unit: 'μg/L',
    referenceRange: '0.5-2.0',
    category: 'Nutritional Health',
    organSystem: 'Liver',
    lastTested: 'Dec 15, 2024',
    percentile: 58,
    explanation:
      "Molybdenum helps your body process certain amino acids and supports liver function. It's like the cleaner that helps your liver process waste products.",
    whatItMeans:
      'Normal levels support liver function and amino acid metabolism. Low levels may affect liver detoxification.',
    whyItMatters:
      "Molybdenum is essential for liver function and amino acid metabolism. Deficiency can affect liver detoxification.",
    levelMeaning: {
      low: "Low molybdenum levels may affect liver function and amino acid metabolism.",
      normal: "Your molybdenum levels are within the healthy range, supporting good liver function and amino acid metabolism.",
      high: "Higher molybdenum levels provide excellent support for liver function and amino acid metabolism.",
    },
    historyData: [1.1, 1.2, 1.3, 1.25, 1.4, 1.35, 1.5, 1.45, 1.4, 1.55, 1.5, 1.6],
    comparisonData: {
      allPopulation: 58,
      ageSexGroup: 61,
    },
    tips: [
      'Eat molybdenum-rich foods like legumes, whole grains, and nuts',
      'Include leafy greens and dairy products in your diet',
      'Support liver function with adequate molybdenum',
      'Avoid excessive molybdenum which can be toxic',
      'Work with your doctor to optimize liver function',
    ],
  },
  'Fluoride': {
    name: 'Fluoride',
    unit: 'mg/L',
    referenceRange: '0.7-1.2',
    category: 'Nutritional Health',
    organSystem: 'Bone Health',
    lastTested: 'Dec 15, 2024',
    percentile: 62,
    explanation:
      "Fluoride helps strengthen your teeth and bones. It's like the reinforcement that makes your teeth and bones harder and more resistant to decay.",
    whatItMeans:
      'Normal levels support dental and bone health. Low levels may increase tooth decay risk. High levels may cause dental fluorosis.',
    whyItMatters:
      "Fluoride is essential for preventing tooth decay and strengthening bones. Proper levels are crucial for dental health.",
    levelMeaning: {
      low: "Low fluoride levels may increase tooth decay risk.",
      normal: "Your fluoride levels are within the healthy range, supporting good dental and bone health.",
      high: "High fluoride levels may cause dental fluorosis and bone problems.",
    },
    historyData: [0.9, 0.95, 1.0, 0.98, 1.05, 1.02, 1.1, 1.08, 1.05, 1.12, 1.1, 1.15],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 65,
    },
    tips: [
      'Use fluoride toothpaste for dental health',
      'Drink fluoridated water if available',
      'Eat fluoride-rich foods like tea and seafood',
      'Avoid excessive fluoride which can cause fluorosis',
      'Work with your dentist to optimize dental health',
    ],
  },
  // Additional Skeleton Body Map Biomarkers
  'Vertebral Fracture Risk (10-yr)': {
    name: 'Vertebral Fracture Risk (10-yr)',
    unit: '%',
    referenceRange: '<10',
    category: 'Bone Health',
    organSystem: 'Spine',
    lastTested: 'Dec 15, 2024',
    percentile: 45,
    explanation:
      "This calculates your 10-year risk of having a vertebral (spine) fracture. It's like a weather forecast for your spine health over the next decade.",
    whatItMeans:
      'Lower percentages indicate lower fracture risk. Above 10% suggests increased risk of spine fractures over the next 10 years.',
    whyItMatters:
      "Vertebral fractures can cause severe pain, height loss, and deformity. Early identification of high-risk individuals allows for preventive treatment.",
    levelMeaning: {
      low: "Low vertebral fracture risk indicates good spine bone health and low fracture probability.",
      normal: "Your vertebral fracture risk is within acceptable limits for your age and bone health.",
      high: "High vertebral fracture risk suggests increased likelihood of spine fractures requiring preventive measures.",
    },
    historyData: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    comparisonData: {
      allPopulation: 45,
      ageSexGroup: 48,
    },
    tips: [
      'Focus on spine-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Maintain good posture and ergonomics',
      'Consider bone-building medications if risk is high',
      'Get regular bone density monitoring',
    ],
  },
  'Spine Z-score (Age-matched)': {
    name: 'Spine Z-score (Age-matched)',
    unit: 'SD',
    referenceRange: '>-2.0',
    category: 'Bone Health',
    organSystem: 'Spine',
    lastTested: 'Dec 15, 2024',
    percentile: 60,
    explanation:
      "Z-score compares your spine bone density to others your age and gender. It's like seeing how your spine bones compare to your peers.",
    whatItMeans:
      'Above -2.0 is normal for your age. Below -2.0 may indicate bone density lower than expected for your age group.',
    whyItMatters:
      "Z-score helps identify if bone loss is age-appropriate or if there are underlying conditions causing premature bone loss.",
    levelMeaning: {
      low: "Low Z-scores may indicate bone density lower than expected for your age, suggesting underlying health issues.",
      normal: "Your spine Z-score is appropriate for your age group, indicating normal bone development.",
      high: "Higher Z-scores indicate better bone density than average for your age group.",
    },
    historyData: [-0.8, -0.5, -1.2, -0.7, -1.0, -0.3, -1.5, -0.9, -0.6, -1.1, -0.8, -0.9],
    comparisonData: {
      allPopulation: 60,
      ageSexGroup: 62,
    },
    tips: [
      'Focus on age-appropriate bone health strategies',
      'Ensure adequate nutrition for bone building',
      'Stay active with age-appropriate exercises',
      'Monitor bone health regularly',
      'Discuss any concerns with your healthcare provider',
    ],
  },
  'Vertebral Height Loss': {
    name: 'Vertebral Height Loss',
    unit: '',
    referenceRange: 'None detected',
    category: 'Bone Health',
    organSystem: 'Spine',
    lastTested: 'Dec 15, 2024',
    percentile: 85,
    explanation:
      "This measures if any of your vertebrae have collapsed or lost height due to fractures. It's like checking if any building floors have collapsed.",
    whatItMeans:
      'No height loss indicates healthy vertebrae. Any height loss suggests previous vertebral fractures that may have gone unnoticed.',
    whyItMatters:
      "Vertebral height loss is often the first sign of osteoporosis and can cause chronic back pain and deformity.",
    levelMeaning: {
      low: "No vertebral height loss indicates healthy spine structure and no compression fractures.",
      normal: "Your spine shows no signs of vertebral height loss, indicating good bone health.",
      high: "Vertebral height loss suggests previous fractures and increased risk of future fractures.",
    },
    historyData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    comparisonData: {
      allPopulation: 85,
      ageSexGroup: 88,
    },
    tips: [
      'Maintain good posture to prevent further compression',
      'Focus on spine-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Consider bone-building medications if fractures are present',
      'Get regular spine imaging to monitor changes',
    ],
  },
  'Left Femoral Neck T-score': {
    name: 'Left Femoral Neck T-score',
    unit: 'SD',
    referenceRange: '>-1.0',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 65,
    explanation:
      "T-score compares your left femoral neck bone density to a healthy 30-year-old. The femoral neck is the most common site of hip fractures.",
    whatItMeans:
      'Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.',
    whyItMatters:
      "The femoral neck is the most common site of hip fractures. Early detection of bone loss here is crucial for preventing devastating hip fractures.",
    levelMeaning: {
      low: "Low femoral neck T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal: "Your left femoral neck T-score is within the healthy range, indicating good bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger femoral neck bones and lower fracture risk.",
    },
    historyData: [-0.8, -0.6, -1.0, -0.7, -0.9, -0.5, -1.1, -0.8, -0.6, -1.0, -0.7, -0.8],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 67,
    },
    tips: [
      'Focus on hip-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Do weight-bearing activities like walking',
      'Include balance exercises to prevent falls',
      'Avoid smoking and excessive alcohol',
    ],
  },
  'FRAX Left Hip Risk (10-yr)': {
    name: 'FRAX Left Hip Risk (10-yr)',
    unit: '%',
    referenceRange: '<3',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 55,
    explanation:
      "FRAX calculates your 10-year risk of hip fracture based on bone density and other risk factors. It's like a personalized fracture risk calculator.",
    whatItMeans:
      'Below 3% is low risk. 3-20% is moderate risk. Above 20% is high risk for hip fracture over the next 10 years.',
    whyItMatters:
      "FRAX helps determine if you need bone-building medications to prevent hip fractures, which can be devastating and life-changing.",
    levelMeaning: {
      low: "Low FRAX risk indicates good hip bone health and low fracture probability.",
      normal: "Your FRAX hip risk is within acceptable limits for your age and risk factors.",
      high: "High FRAX risk suggests increased likelihood of hip fractures requiring preventive treatment.",
    },
    historyData: [1.5, 1.8, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5, 4.8],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      'Focus on hip-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Consider bone-building medications if risk is high',
      'Maintain good balance to prevent falls',
      'Get regular bone density monitoring',
    ],
  },
  'Left Hip Z-score': {
    name: 'Left Hip Z-score',
    unit: 'SD',
    referenceRange: '>-2.0',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 62,
    explanation:
      "Z-score compares your left hip bone density to others your age and gender. It helps identify if hip bone loss is age-appropriate.",
    whatItMeans:
      'Above -2.0 is normal for your age. Below -2.0 may indicate hip bone density lower than expected for your age group.',
    whyItMatters:
      "Hip Z-score helps determine if hip bone loss is normal aging or if there are underlying conditions affecting hip bone health.",
    levelMeaning: {
      low: "Low hip Z-scores may indicate premature hip bone loss or underlying health conditions.",
      normal: "Your left hip Z-score is appropriate for your age group, indicating normal hip bone development.",
      high: "Higher Z-scores indicate better hip bone density than average for your age group.",
    },
    historyData: [-0.7, -0.4, -1.1, -0.6, -0.9, -0.2, -1.3, -0.8, -0.5, -1.0, -0.7, -0.8],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 64,
    },
    tips: [
      'Focus on hip-specific bone health strategies',
      'Ensure adequate nutrition for hip bone strength',
      'Stay active with hip-friendly exercises',
      'Monitor hip bone health regularly',
      'Discuss any concerns with your healthcare provider',
    ],
  },
  'Right Femoral Neck T-score': {
    name: 'Right Femoral Neck T-score',
    unit: 'SD',
    referenceRange: '>-1.0',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 65,
    explanation:
      "T-score compares your right femoral neck bone density to a healthy 30-year-old. The femoral neck is the most common site of hip fractures.",
    whatItMeans:
      'Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.',
    whyItMatters:
      "The femoral neck is the most common site of hip fractures. Early detection of bone loss here is crucial for preventing devastating hip fractures.",
    levelMeaning: {
      low: "Low femoral neck T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal: "Your right femoral neck T-score is within the healthy range, indicating good bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger femoral neck bones and lower fracture risk.",
    },
    historyData: [-0.6, -0.4, -0.8, -0.5, -0.7, -0.3, -0.9, -0.6, -0.4, -0.8, -0.5, -0.6],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 67,
    },
    tips: [
      'Focus on hip-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Do weight-bearing activities like walking',
      'Include balance exercises to prevent falls',
      'Avoid smoking and excessive alcohol',
    ],
  },
  'FRAX Right Hip Risk (10-yr)': {
    name: 'FRAX Right Hip Risk (10-yr)',
    unit: '%',
    referenceRange: '<3',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 55,
    explanation:
      "FRAX calculates your 10-year risk of hip fracture based on bone density and other risk factors. It's like a personalized fracture risk calculator.",
    whatItMeans:
      'Below 3% is low risk. 3-20% is moderate risk. Above 20% is high risk for hip fracture over the next 10 years.',
    whyItMatters:
      "FRAX helps determine if you need bone-building medications to prevent hip fractures, which can be devastating and life-changing.",
    levelMeaning: {
      low: "Low FRAX risk indicates good hip bone health and low fracture probability.",
      normal: "Your FRAX hip risk is within acceptable limits for your age and risk factors.",
      high: "High FRAX risk suggests increased likelihood of hip fractures requiring preventive treatment.",
    },
    historyData: [1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      'Focus on hip-strengthening exercises',
      'Ensure adequate calcium and vitamin D',
      'Consider bone-building medications if risk is high',
      'Maintain good balance to prevent falls',
      'Get regular bone density monitoring',
    ],
  },
  'Right Hip Z-score': {
    name: 'Right Hip Z-score',
    unit: 'SD',
    referenceRange: '>-2.0',
    category: 'Bone Health',
    organSystem: 'Hip',
    lastTested: 'Dec 15, 2024',
    percentile: 62,
    explanation:
      "Z-score compares your right hip bone density to others your age and gender. It helps identify if hip bone loss is age-appropriate.",
    whatItMeans:
      'Above -2.0 is normal for your age. Below -2.0 may indicate hip bone density lower than expected for your age group.',
    whyItMatters:
      "Hip Z-score helps determine if hip bone loss is normal aging or if there are underlying conditions affecting hip bone health.",
    levelMeaning: {
      low: "Low hip Z-scores may indicate premature hip bone loss or underlying health conditions.",
      normal: "Your right hip Z-score is appropriate for your age group, indicating normal hip bone development.",
      high: "Higher Z-scores indicate better hip bone density than average for your age group.",
    },
    historyData: [-0.5, -0.2, -0.8, -0.3, -0.6, -0.1, -1.0, -0.5, -0.2, -0.7, -0.4, -0.5],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 64,
    },
    tips: [
      'Focus on hip-specific bone health strategies',
      'Ensure adequate nutrition for hip bone strength',
      'Stay active with hip-friendly exercises',
      'Monitor hip bone health regularly',
      'Discuss any concerns with your healthcare provider',
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
