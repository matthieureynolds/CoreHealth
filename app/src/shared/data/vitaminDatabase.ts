import type { BiomarkerInfo } from '../components/modals/BiomarkerModal';

export const vitaminDatabase: {
  [key: string]: Omit<BiomarkerInfo, 'value' | 'status'>;
} = {
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

};
