import type { BiomarkerInfo } from "../components/modals/BiomarkerModal";

export const mineralDatabase: {
  [key: string]: Omit<BiomarkerInfo, "value" | "status">;
} = {
  Calcium: {
    name: "Calcium",
    unit: "mg/dL",
    referenceRange: "8.5-10.5",
    category: "Mineral",
    organSystem: "General",
    lastTested: "Dec 15, 2024",
    percentile: 75,
    explanation:
      "Calcium is the most abundant mineral in the body, essential for building and maintaining strong bones and teeth.",
    whatItMeans:
      "Your calcium level of 9.8 mg/dL is in the normal range. This means you have adequate calcium to support strong bones and proper muscle function.",
    whyItMatters:
      "Calcium is crucial for bone and tooth strength, muscle function, nerve transmission, and blood clotting.",
    levelMeaning: {
      low: "Low calcium can cause weak bones, muscle cramps, and irregular heartbeat.",
      normal:
        "Your calcium level is healthy, supporting strong bones and proper muscle function.",
      high: "Very high calcium levels can cause kidney stones and heart problems.",
    },
    historyData: [9.5, 9.7, 9.8, 9.6, 9.9, 9.8, 9.7, 9.8, 9.6, 9.8, 9.7, 9.8],
    comparisonData: {
      allPopulation: 75,
      ageSexGroup: 78,
    },
    tips: [
      "Eat dairy products like milk, cheese, and yogurt",
      "Include leafy greens and fortified foods",
      "Get adequate vitamin D for calcium absorption",
      "Limit caffeine and alcohol which can reduce absorption",
    ],
  },

  Iron: {
    name: "Iron",
    unit: "μg/dL",
    referenceRange: "60-170",
    category: "Nutritional Health",
    explanation:
      "Iron is essential for making red blood cells that carry oxygen throughout your body. Too little causes anemia and fatigue; too much can be toxic.",
    whatItMeans:
      "Normal levels support energy and oxygen delivery. Low iron causes tiredness and pale skin. High iron can damage organs over time.",
    tips: [
      "Eat iron-rich foods like lean meat, spinach, and lentils",
      "Combine iron foods with vitamin C to improve absorption",
      "Avoid tea and coffee with iron-rich meals",
      "Don't take iron supplements unless recommended by a doctor",
      "Women may need more iron due to menstruation",
    ],
  },

  "Calcium (Total)": {
    name: "Calcium (Total)",
    unit: "mg/dL",
    referenceRange: "8.5-10.5",
    category: "Bone Health",
    explanation:
      "Calcium is the primary mineral that makes up your bones and teeth. It's like the building blocks that create the structure of your skeleton.",
    whatItMeans:
      "Normal levels support strong bones and proper muscle/nerve function. High levels might indicate parathyroid problems. Low levels can weaken bones.",
    tips: [
      "Eat calcium-rich foods like dairy, leafy greens, and almonds",
      "Take calcium supplements with vitamin D for absorption",
      "Spread calcium intake throughout the day",
      "Avoid excessive caffeine which can interfere with absorption",
      "Get weight-bearing exercise to help bones use calcium",
    ],
  },

  "PTH (Intact)": {
    name: "PTH (Intact)",
    unit: "pg/mL",
    referenceRange: "15-65",
    category: "Bone Health",
    explanation:
      "Parathyroid hormone regulates calcium and phosphorus levels in your blood. It's like the thermostat that controls how much calcium is available for your bones.",
    whatItMeans:
      "Normal levels maintain proper calcium balance. High levels can cause bone loss and kidney stones. Low levels may cause low calcium.",
    tips: [
      "Ensure adequate vitamin D intake",
      "Get regular calcium and PTH testing",
      "Maintain healthy kidney function",
      "Follow up with endocrinologist if levels are abnormal",
      "Consider bone density testing if PTH is elevated",
    ],
  },

  Phosphorus: {
    name: "Phosphorus",
    unit: "mg/dL",
    referenceRange: "2.5-4.5",
    category: "Bone Health",
    explanation:
      "Phosphorus works with calcium to build strong bones and teeth. It's like the partner mineral that helps calcium do its job properly.",
    whatItMeans:
      "Normal levels support bone health and energy production. High levels may indicate kidney problems. Low levels can weaken bones.",
    tips: [
      "Eat phosphorus-rich foods like dairy, meat, and nuts",
      "Balance phosphorus with calcium intake",
      "Avoid excessive phosphorus from processed foods",
      "Get adequate vitamin D for phosphorus absorption",
      "Monitor levels if you have kidney disease",
    ],
  },

  Magnesium: {
    name: "Magnesium",
    unit: "mg/dL",
    referenceRange: "1.7-2.2",
    category: "Bone Health",
    explanation:
      "Magnesium is essential for bone formation and helps your body use calcium and vitamin D. It's like the coordinator that makes bone building work smoothly.",
    whatItMeans:
      "Normal levels support bone health and muscle function. Low levels can cause muscle cramps and bone problems.",
    tips: [
      "Eat magnesium-rich foods like nuts, seeds, and leafy greens",
      "Consider magnesium supplements if levels are low",
      "Get adequate vitamin D for magnesium absorption",
      "Limit alcohol which can deplete magnesium",
      "Monitor levels if you have digestive issues",
    ],
  },

  Zinc: {
    name: "Zinc",
    unit: "μg/dL",
    referenceRange: "60-120",
    category: "Bone Health",
    explanation:
      "Zinc is essential for bone formation and helps your body make collagen, the protein framework of bones. It's like the construction worker that builds bone structure.",
    whatItMeans:
      "Normal levels support bone health and immune function. Low levels can impair bone healing and growth.",
    tips: [
      "Eat zinc-rich foods like meat, shellfish, and legumes",
      "Include vitamin C with zinc for better absorption",
      "Avoid excessive iron supplements which can block zinc",
      "Consider zinc supplements if levels are low",
      "Monitor levels if you have digestive issues",
    ],
  },

  Copper: {
    name: "Copper",
    unit: "μg/dL",
    referenceRange: "70-140",
    category: "Bone Health",
    explanation:
      "Copper is required for collagen cross-linking, which gives bones their strength. It's like the glue that holds bone structure together.",
    whatItMeans:
      "Normal levels support bone strength and connective tissue health. Low levels can weaken bones and cause joint problems.",
    tips: [
      "Eat copper-rich foods like nuts, seeds, and shellfish",
      "Balance copper with zinc intake",
      "Avoid excessive zinc which can block copper",
      "Consider copper supplements if levels are low",
      "Monitor levels if you have digestive issues",
    ],
  },

  Potassium: {
    name: "Potassium",
    unit: "mEq/L",
    referenceRange: "3.5-5.0",
    category: "Nutritional Health",
    organSystem: "Cardiovascular System",
    lastTested: "Dec 15, 2024",
    percentile: 58,
    explanation:
      "Potassium helps your heart beat regularly and muscles work properly. It's like the conductor that keeps your heart rhythm steady and muscles functioning.",
    whatItMeans:
      "Normal levels support heart rhythm and muscle function. Low levels may cause irregular heartbeat and muscle weakness.",
    whyItMatters:
      "Potassium is essential for heart health and muscle function. Imbalances can cause dangerous heart rhythm problems.",
    levelMeaning: {
      low: "Low potassium levels may cause irregular heartbeat, muscle weakness, and fatigue.",
      normal:
        "Your potassium levels are within the healthy range, supporting good heart rhythm and muscle function.",
      high: "Higher potassium levels provide excellent support for heart health and muscle function.",
    },
    historyData: [4.1, 4.2, 4.3, 4.1, 4.4, 4.2, 4.5, 4.3, 4.2, 4.4, 4.3, 4.4],
    comparisonData: {
      allPopulation: 58,
      ageSexGroup: 61,
    },
    tips: [
      "Eat potassium-rich foods like bananas, sweet potatoes, and spinach",
      "Include avocados, beans, and yogurt in your diet",
      "Limit sodium which can deplete potassium",
      "Stay hydrated to maintain electrolyte balance",
      "Consult your doctor before taking potassium supplements",
    ],
  },

  Sodium: {
    name: "Sodium",
    unit: "mEq/L",
    referenceRange: "136-145",
    category: "Nutritional Health",
    organSystem: "Cardiovascular System",
    lastTested: "Dec 15, 2024",
    percentile: 52,
    explanation:
      "Sodium helps maintain fluid balance and nerve function. It's like the regulator that keeps your body's fluid levels and nerve signals balanced.",
    whatItMeans:
      "Normal levels support fluid balance and nerve function. High levels may cause high blood pressure and fluid retention.",
    whyItMatters:
      "Sodium balance is crucial for blood pressure and fluid balance. Imbalances can cause serious health problems.",
    levelMeaning: {
      low: "Low sodium levels may cause confusion, seizures, and brain swelling.",
      normal:
        "Your sodium levels are within the healthy range, supporting good fluid balance and nerve function.",
      high: "High sodium levels may cause high blood pressure and fluid retention.",
    },
    historyData: [138, 139, 140, 138, 141, 139, 142, 140, 139, 141, 140, 141],
    comparisonData: {
      allPopulation: 52,
      ageSexGroup: 55,
    },
    tips: [
      "Limit processed foods which are high in sodium",
      "Use herbs and spices instead of salt for flavor",
      "Read food labels to monitor sodium intake",
      "Stay hydrated to maintain electrolyte balance",
      "Aim for less than 2,300mg sodium per day",
    ],
  },

  Chloride: {
    name: "Chloride",
    unit: "mEq/L",
    referenceRange: "98-107",
    category: "Nutritional Health",
    organSystem: "Cardiovascular System",
    lastTested: "Dec 15, 2024",
    percentile: 55,
    explanation:
      "Chloride helps maintain fluid balance and acid-base balance in your body. It's like the partner that works with sodium to keep everything balanced.",
    whatItMeans:
      "Normal levels support fluid balance and acid-base balance. Imbalances may affect kidney function and blood pH.",
    whyItMatters:
      "Chloride is essential for maintaining proper fluid balance and blood pH. Imbalances can affect kidney function.",
    levelMeaning: {
      low: "Low chloride levels may indicate kidney problems or acid-base imbalances.",
      normal:
        "Your chloride levels are within the healthy range, supporting good fluid balance and acid-base balance.",
      high: "High chloride levels may indicate dehydration or kidney problems.",
    },
    historyData: [102, 103, 104, 102, 105, 103, 106, 104, 103, 105, 104, 105],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      "Maintain proper hydration to support chloride balance",
      "Eat a balanced diet with adequate electrolytes",
      "Monitor kidney function if levels are abnormal",
      "Stay hydrated but avoid overhydration",
      "Work with your doctor to address any imbalances",
    ],
  },

  Sulfur: {
    name: "Sulfur",
    unit: "mg/dL",
    referenceRange: "0.5-1.5",
    category: "Nutritional Health",
    organSystem: "Connective Tissue",
    lastTested: "Dec 15, 2024",
    percentile: 62,
    explanation:
      "Sulfur is essential for making proteins, especially those in your skin, hair, and nails. It's like the building block that helps create strong connective tissues.",
    whatItMeans:
      "Normal levels support protein synthesis and connective tissue health. Low levels may affect skin, hair, and joint health.",
    whyItMatters:
      "Sulfur is crucial for making collagen, keratin, and other proteins. It's essential for healthy skin, hair, nails, and joints.",
    levelMeaning: {
      low: "Low sulfur levels may affect skin, hair, nail, and joint health.",
      normal:
        "Your sulfur levels are within the healthy range, supporting good protein synthesis and connective tissue health.",
      high: "Higher sulfur levels provide excellent support for protein synthesis and connective tissue health.",
    },
    historyData: [
      0.8, 0.9, 1.0, 0.95, 1.1, 1.05, 1.2, 1.15, 1.1, 1.25, 1.2, 1.3,
    ],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 65,
    },
    tips: [
      "Eat sulfur-rich foods like eggs, garlic, and cruciferous vegetables",
      "Include onions, leeks, and shallots in your diet",
      "Eat adequate protein to support sulfur metabolism",
      "Consider MSM supplements if levels are low",
      "Support liver function for proper sulfur metabolism",
    ],
  },

  Iodine: {
    name: "Iodine",
    unit: "μg/L",
    referenceRange: "100-300",
    category: "Nutritional Health",
    organSystem: "Thyroid",
    lastTested: "Dec 15, 2024",
    percentile: 58,
    explanation:
      "Iodine is essential for making thyroid hormones that control your metabolism. It's like the fuel that powers your body's metabolic engine.",
    whatItMeans:
      "Normal levels support thyroid function and metabolism. Low levels may cause goiter and hypothyroidism.",
    whyItMatters:
      "Iodine is crucial for thyroid function and preventing goiter. Deficiency can cause serious thyroid problems.",
    levelMeaning: {
      low: "Low iodine levels may cause goiter, hypothyroidism, and metabolic problems.",
      normal:
        "Your iodine levels are within the healthy range, supporting good thyroid function and metabolism.",
      high: "Higher iodine levels provide excellent support for thyroid function and metabolism.",
    },
    historyData: [180, 190, 200, 185, 210, 195, 220, 205, 190, 215, 200, 210],
    comparisonData: {
      allPopulation: 58,
      ageSexGroup: 61,
    },
    tips: [
      "Use iodized salt in cooking",
      "Eat iodine-rich foods like seafood and seaweed",
      "Include dairy products in your diet",
      "Consider iodine supplements if levels are low",
      "Avoid excessive iodine which can cause thyroid problems",
    ],
  },

  Selenium: {
    name: "Selenium",
    unit: "μg/L",
    referenceRange: "70-150",
    category: "Nutritional Health",
    organSystem: "Immune System",
    lastTested: "Dec 15, 2024",
    percentile: 65,
    explanation:
      "Selenium is a powerful antioxidant that supports immune function and thyroid health. It's like the bodyguard that protects your cells and supports your immune system.",
    whatItMeans:
      "Normal levels support immune function and antioxidant protection. Low levels may increase infection risk and thyroid problems.",
    whyItMatters:
      "Selenium is essential for immune function, thyroid health, and antioxidant protection. Deficiency can cause serious health problems.",
    levelMeaning: {
      low: "Low selenium levels may increase infection risk and thyroid problems.",
      normal:
        "Your selenium levels are within the healthy range, supporting good immune function and antioxidant protection.",
      high: "Higher selenium levels provide excellent immune support and antioxidant protection.",
    },
    historyData: [95, 100, 105, 102, 110, 108, 115, 112, 108, 118, 115, 120],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 68,
    },
    tips: [
      "Eat selenium-rich foods like Brazil nuts, fish, and poultry",
      "Include whole grains and eggs in your diet",
      "Consider selenium supplements if levels are low",
      "Avoid excessive selenium which can be toxic",
      "Support immune function with adequate selenium",
    ],
  },

  Manganese: {
    name: "Manganese",
    unit: "μg/L",
    referenceRange: "4-15",
    category: "Nutritional Health",
    organSystem: "Bone Health",
    lastTested: "Dec 15, 2024",
    percentile: 60,
    explanation:
      "Manganese helps your body use nutrients and supports bone health. It's like the assistant that helps other nutrients work properly and keeps your bones strong.",
    whatItMeans:
      "Normal levels support bone health and nutrient metabolism. Low levels may affect bone density and nutrient absorption.",
    whyItMatters:
      "Manganese is essential for bone formation and nutrient metabolism. Deficiency can affect bone health and nutrient absorption.",
    levelMeaning: {
      low: "Low manganese levels may affect bone density and nutrient absorption.",
      normal:
        "Your manganese levels are within the healthy range, supporting good bone health and nutrient metabolism.",
      high: "Higher manganese levels provide excellent support for bone health and nutrient metabolism.",
    },
    historyData: [
      8.5, 9.2, 10.1, 9.8, 11.2, 10.8, 12.1, 11.5, 10.9, 12.3, 11.8, 12.5,
    ],
    comparisonData: {
      allPopulation: 60,
      ageSexGroup: 63,
    },
    tips: [
      "Eat manganese-rich foods like nuts, whole grains, and leafy greens",
      "Include legumes and tea in your diet",
      "Ensure adequate calcium and vitamin D for bone health",
      "Avoid excessive manganese which can be toxic",
      "Support bone health with adequate manganese",
    ],
  },

  Chromium: {
    name: "Chromium",
    unit: "μg/L",
    referenceRange: "0.5-2.0",
    category: "Nutritional Health",
    organSystem: "Endocrine System",
    lastTested: "Dec 15, 2024",
    percentile: 55,
    explanation:
      "Chromium helps your body use insulin and control blood sugar. It's like the key that helps insulin unlock your cells to let sugar in.",
    whatItMeans:
      "Normal levels support blood sugar control and insulin function. Low levels may affect blood sugar regulation.",
    whyItMatters:
      "Chromium is essential for blood sugar control and insulin function. Deficiency can affect glucose metabolism.",
    levelMeaning: {
      low: "Low chromium levels may affect blood sugar control and insulin function.",
      normal:
        "Your chromium levels are within the healthy range, supporting good blood sugar control and insulin function.",
      high: "Higher chromium levels provide excellent support for blood sugar control and insulin function.",
    },
    historyData: [
      1.2, 1.3, 1.4, 1.35, 1.5, 1.45, 1.6, 1.55, 1.5, 1.65, 1.6, 1.7,
    ],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      "Eat chromium-rich foods like broccoli, whole grains, and nuts",
      "Include lean meats and seafood in your diet",
      "Consider chromium supplements if levels are low",
      "Support blood sugar control with adequate chromium",
      "Work with your doctor to optimize blood sugar control",
    ],
  },

  Molybdenum: {
    name: "Molybdenum",
    unit: "μg/L",
    referenceRange: "0.5-2.0",
    category: "Nutritional Health",
    organSystem: "Liver",
    lastTested: "Dec 15, 2024",
    percentile: 58,
    explanation:
      "Molybdenum helps your body process certain amino acids and supports liver function. It's like the cleaner that helps your liver process waste products.",
    whatItMeans:
      "Normal levels support liver function and amino acid metabolism. Low levels may affect liver detoxification.",
    whyItMatters:
      "Molybdenum is essential for liver function and amino acid metabolism. Deficiency can affect liver detoxification.",
    levelMeaning: {
      low: "Low molybdenum levels may affect liver function and amino acid metabolism.",
      normal:
        "Your molybdenum levels are within the healthy range, supporting good liver function and amino acid metabolism.",
      high: "Higher molybdenum levels provide excellent support for liver function and amino acid metabolism.",
    },
    historyData: [
      1.1, 1.2, 1.3, 1.25, 1.4, 1.35, 1.5, 1.45, 1.4, 1.55, 1.5, 1.6,
    ],
    comparisonData: {
      allPopulation: 58,
      ageSexGroup: 61,
    },
    tips: [
      "Eat molybdenum-rich foods like legumes, whole grains, and nuts",
      "Include leafy greens and dairy products in your diet",
      "Support liver function with adequate molybdenum",
      "Avoid excessive molybdenum which can be toxic",
      "Work with your doctor to optimize liver function",
    ],
  },

  Fluoride: {
    name: "Fluoride",
    unit: "mg/L",
    referenceRange: "0.7-1.2",
    category: "Nutritional Health",
    organSystem: "Bone Health",
    lastTested: "Dec 15, 2024",
    percentile: 62,
    explanation:
      "Fluoride helps strengthen your teeth and bones. It's like the reinforcement that makes your teeth and bones harder and more resistant to decay.",
    whatItMeans:
      "Normal levels support dental and bone health. Low levels may increase tooth decay risk. High levels may cause dental fluorosis.",
    whyItMatters:
      "Fluoride is essential for preventing tooth decay and strengthening bones. Proper levels are crucial for dental health.",
    levelMeaning: {
      low: "Low fluoride levels may increase tooth decay risk.",
      normal:
        "Your fluoride levels are within the healthy range, supporting good dental and bone health.",
      high: "High fluoride levels may cause dental fluorosis and bone problems.",
    },
    historyData: [
      0.9, 0.95, 1.0, 0.98, 1.05, 1.02, 1.1, 1.08, 1.05, 1.12, 1.1, 1.15,
    ],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 65,
    },
    tips: [
      "Use fluoride toothpaste for dental health",
      "Drink fluoridated water if available",
      "Eat fluoride-rich foods like tea and seafood",
      "Avoid excessive fluoride which can cause fluorosis",
      "Work with your dentist to optimize dental health",
    ],
  },
};
