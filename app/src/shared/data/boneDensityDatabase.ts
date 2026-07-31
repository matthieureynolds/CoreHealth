import type { BiomarkerInfo } from "../components/modals/BiomarkerModal";

export const boneDensityDatabase: {
  [key: string]: Omit<BiomarkerInfo, "value" | "status">;
} = {
  BSAP: {
    name: "BSAP (Bone Formation Marker)",
    unit: "μg/L",
    referenceRange: "6.5-20.1",
    category: "Bone Health",
    explanation:
      "BSAP is produced by bone-forming cells and indicates how actively your body is building new bone. It's like measuring construction activity in your skeleton.",
    whatItMeans:
      "Normal levels suggest healthy bone formation. High levels may indicate increased bone turnover or healing. Low levels might suggest poor bone formation.",
    tips: [
      "Ensure adequate calcium and vitamin D intake",
      "Do weight-bearing exercises regularly",
      "Get adequate protein for bone building",
      "Monitor levels during bone health treatments",
      "Consider bone density testing if levels are abnormal",
    ],
  },

  Osteocalcin: {
    name: "Osteocalcin",
    unit: "ng/mL",
    referenceRange: "11-43",
    category: "Bone Health",
    explanation:
      "Osteocalcin is a protein made by bone-forming cells that helps bind calcium to bone. It's like the glue that holds calcium in place in your bones.",
    whatItMeans:
      "Normal levels indicate healthy bone formation. High levels may suggest increased bone turnover. Low levels might indicate poor bone formation.",
    tips: [
      "Ensure adequate vitamin K intake (leafy greens)",
      "Get regular weight-bearing exercise",
      "Maintain healthy vitamin D levels",
      "Consider bone health supplements if levels are low",
      "Monitor during bone health treatments",
    ],
  },

  CTX: {
    name: "CTX (Bone Resorption Marker)",
    unit: "ng/mL",
    referenceRange: "0.104-0.704",
    category: "Bone Health",
    explanation:
      "CTX measures how quickly your body is breaking down old bone. It's like measuring demolition activity in your skeleton.",
    whatItMeans:
      "Normal levels suggest balanced bone turnover. High levels may indicate excessive bone loss. Low levels might suggest reduced bone turnover.",
    tips: [
      "Ensure adequate calcium and vitamin D",
      "Do weight-bearing exercises to reduce bone loss",
      "Consider bone-building medications if levels are high",
      "Monitor levels during osteoporosis treatment",
      "Get regular bone density scans",
    ],
  },

  P1NP: {
    name: "P1NP (Bone Formation Marker)",
    unit: "ng/mL",
    referenceRange: "16.3-78.1",
    category: "Bone Health",
    explanation:
      "P1NP is a marker of bone formation activity. It's like measuring how actively your body is building new bone tissue.",
    whatItMeans:
      "Normal levels suggest healthy bone formation. High levels may indicate increased bone turnover. Low levels might suggest poor bone formation.",
    tips: [
      "Ensure adequate calcium and vitamin D intake",
      "Do weight-bearing exercises regularly",
      "Get adequate protein for bone building",
      "Monitor levels during bone health treatments",
      "Consider bone density testing if levels are abnormal",
    ],
  },

  NTX: {
    name: "NTX (Bone Resorption Marker)",
    unit: "nmol BCE/mmol Cr",
    referenceRange: "5.4-24.2",
    category: "Bone Health",
    explanation:
      "NTX measures how quickly your body is breaking down old bone. It's like measuring demolition activity in your skeleton.",
    whatItMeans:
      "Normal levels suggest balanced bone turnover. High levels may indicate excessive bone loss. Low levels might suggest reduced bone turnover.",
    tips: [
      "Ensure adequate calcium and vitamin D",
      "Do weight-bearing exercises to reduce bone loss",
      "Consider bone-building medications if levels are high",
      "Monitor levels during osteoporosis treatment",
      "Get regular bone density scans",
    ],
  },

  "TRACP-5b": {
    name: "TRACP-5b (Osteoclast Marker)",
    unit: "U/L",
    referenceRange: "1.03-4.15",
    category: "Bone Health",
    explanation:
      "TRACP-5b is produced by bone-resorbing cells (osteoclasts). It's like measuring the activity of cells that break down bone.",
    whatItMeans:
      "Normal levels suggest balanced bone resorption. High levels may indicate excessive bone breakdown. Low levels might suggest reduced bone turnover.",
    tips: [
      "Ensure adequate calcium and vitamin D",
      "Do weight-bearing exercises to reduce bone loss",
      "Consider bone-building medications if levels are high",
      "Monitor levels during osteoporosis treatment",
      "Get regular bone density scans",
    ],
  },

  "Spine T-Score": {
    name: "Spine T-Score",
    unit: "",
    referenceRange: ">-1.0",
    category: "Bone Health",
    organSystem: "Spine",
    lastTested: "Dec 15, 2024",
    percentile: 70,
    explanation:
      "T-score compares your bone density to a healthy 30-year-old. It's like measuring how strong your spine bones are compared to peak bone strength.",
    whatItMeans:
      "Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia (low bone density). Below -2.5 suggests osteoporosis (very low bone density).",
    whyItMatters:
      "Spine T-score is crucial for detecting osteoporosis early. The spine is often the first place to show bone loss, and fractures here can be devastating.",
    levelMeaning: {
      low: "Low T-scores indicate reduced bone density and increased fracture risk in the spine.",
      normal:
        "Your spine T-score is within the healthy range, indicating good bone density and low fracture risk.",
      high: "Higher T-scores indicate better bone density and lower fracture risk.",
    },
    historyData: [
      -0.5, -0.3, -0.7, -0.4, -0.6, -0.2, -0.8, -0.5, -0.3, -0.6, -0.4, -0.5,
    ],
    comparisonData: {
      allPopulation: 70,
      ageSexGroup: 72,
    },
    tips: [
      "Do weight-bearing exercises like walking and jogging",
      "Ensure adequate calcium intake (1000-1200mg daily)",
      "Get enough vitamin D (1000-2000 IU daily)",
      "Include strength training in your routine",
      "Avoid smoking and excessive alcohol",
    ],
  },

  "Spine T-score (L1-L4)": {
    name: "Spine T-score (L1-L4)",
    unit: "SD",
    referenceRange: ">-1.0",
    category: "Bone Health",
    organSystem: "Spine",
    lastTested: "Dec 15, 2024",
    percentile: 70,
    explanation:
      "T-score compares your lumbar spine bone density (L1-L4 vertebrae) to a healthy 30-year-old. It's like measuring how strong your lower spine bones are compared to peak bone strength.",
    whatItMeans:
      "Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia (low bone density). Below -2.5 suggests osteoporosis (very low bone density).",
    whyItMatters:
      "Lumbar spine T-score is crucial for detecting osteoporosis early. The lower spine is often the first place to show bone loss, and fractures here can be devastating.",
    levelMeaning: {
      low: "Low T-scores indicate reduced bone density and increased fracture risk in the lumbar spine.",
      normal:
        "Your lumbar spine T-score is within the healthy range, indicating good bone density and low fracture risk.",
      high: "Higher T-scores indicate better bone density and lower fracture risk.",
    },
    historyData: [
      -0.5, -0.3, -0.7, -0.4, -0.6, -0.2, -0.8, -0.5, -0.3, -0.6, -0.4, -0.5,
    ],
    comparisonData: {
      allPopulation: 70,
      ageSexGroup: 72,
    },
    tips: [
      "Do weight-bearing exercises like walking and jogging",
      "Ensure adequate calcium intake (1000-1200mg daily)",
      "Get enough vitamin D (1000-2000 IU daily)",
      "Include strength training in your routine",
      "Avoid smoking and excessive alcohol",
    ],
  },

  "Spine Z-Score": {
    name: "Spine Z-Score",
    unit: "",
    referenceRange: ">-2.0",
    category: "Bone Health",
    organSystem: "Spine",
    lastTested: "Dec 15, 2024",
    percentile: 60,
    explanation:
      "Z-score compares your bone density to others your age and gender. It's like seeing how your spine bones compare to your peers.",
    whatItMeans:
      "Above -2.0 is normal for your age. Below -2.0 may indicate bone density lower than expected for your age group.",
    whyItMatters:
      "Z-score helps identify if bone loss is age-appropriate or if there are underlying conditions causing premature bone loss.",
    levelMeaning: {
      low: "Low Z-scores may indicate bone density lower than expected for your age, suggesting underlying health issues.",
      normal:
        "Your spine Z-score is appropriate for your age group, indicating normal bone development.",
      high: "Higher Z-scores indicate better bone density than average for your age group.",
    },
    historyData: [
      -0.8, -0.5, -1.2, -0.7, -1.0, -0.3, -1.5, -0.9, -0.6, -1.1, -0.8, -0.9,
    ],
    comparisonData: {
      allPopulation: 60,
      ageSexGroup: 62,
    },
    tips: [
      "Focus on age-appropriate bone health strategies",
      "Ensure adequate nutrition for bone building",
      "Stay active with age-appropriate exercises",
      "Monitor bone health regularly",
      "Discuss any concerns with your healthcare provider",
    ],
  },

  "Spine BMD": {
    name: "Spine BMD (Bone Mineral Density)",
    unit: "g/cm²",
    referenceRange: ">0.8",
    category: "Bone Health",
    organSystem: "Spine",
    lastTested: "Dec 15, 2024",
    percentile: 65,
    explanation:
      "BMD measures the actual amount of bone mineral in your spine. It's like measuring the density of the bone material itself.",
    whatItMeans:
      "Higher BMD values indicate stronger, denser bones. Lower values suggest weaker bones that may be more prone to fractures.",
    whyItMatters:
      "BMD is the most direct measure of bone strength. It helps predict fracture risk and guides treatment decisions for bone health.",
    levelMeaning: {
      low: "Low BMD values indicate reduced bone mineral content and increased fracture risk.",
      normal:
        "Your spine BMD is within the healthy range, indicating good bone mineral content.",
      high: "Higher BMD values indicate stronger bones with lower fracture risk.",
    },
    historyData: [
      0.95, 0.98, 0.92, 0.96, 0.94, 1.01, 0.89, 0.93, 0.97, 0.91, 0.95, 0.96,
    ],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 68,
    },
    tips: [
      "Maximize bone mineral density through proper nutrition",
      "Do weight-bearing exercises regularly",
      "Ensure adequate calcium and vitamin D",
      "Include strength training for bone building",
      "Monitor BMD changes over time",
    ],
  },

  "Hip T-Score": {
    name: "Hip T-Score",
    unit: "",
    referenceRange: ">-1.0",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 68,
    explanation:
      "Hip T-score compares your hip bone density to a healthy 30-year-old. It's crucial because hip fractures are often the most serious type of bone fracture.",
    whatItMeans:
      "Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.",
    whyItMatters:
      "Hip fractures are among the most serious bone fractures, often requiring surgery and long recovery. Early detection of hip bone loss is crucial.",
    levelMeaning: {
      low: "Low hip T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal:
        "Your hip T-score is within the healthy range, indicating good hip bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger hip bones and lower fracture risk.",
    },
    historyData: [
      -0.4, -0.2, -0.6, -0.3, -0.5, -0.1, -0.7, -0.4, -0.2, -0.5, -0.3, -0.4,
    ],
    comparisonData: {
      allPopulation: 68,
      ageSexGroup: 70,
    },
    tips: [
      "Focus on hip-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Do weight-bearing activities like walking",
      "Include balance exercises to prevent falls",
      "Avoid smoking and excessive alcohol",
    ],
  },

  "Left Hip T-score (Total)": {
    name: "Left Hip T-score (Total)",
    unit: "SD",
    referenceRange: ">-1.0",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 68,
    explanation:
      "Left hip T-score compares your left hip bone density to a healthy 30-year-old. It's crucial because hip fractures are often the most serious type of bone fracture.",
    whatItMeans:
      "Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.",
    whyItMatters:
      "Hip fractures are among the most serious bone fractures, often requiring surgery and long recovery. Early detection of hip bone loss is crucial.",
    levelMeaning: {
      low: "Low left hip T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal:
        "Your left hip T-score is within the healthy range, indicating good hip bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger hip bones and lower fracture risk.",
    },
    historyData: [
      -0.4, -0.2, -0.6, -0.3, -0.5, -0.1, -0.7, -0.4, -0.2, -0.5, -0.3, -0.4,
    ],
    comparisonData: {
      allPopulation: 68,
      ageSexGroup: 70,
    },
    tips: [
      "Focus on hip-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Do weight-bearing activities like walking",
      "Include balance exercises to prevent falls",
      "Avoid smoking and excessive alcohol",
    ],
  },

  "Right Hip T-score (Total)": {
    name: "Right Hip T-score (Total)",
    unit: "SD",
    referenceRange: ">-1.0",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 68,
    explanation:
      "Right hip T-score compares your right hip bone density to a healthy 30-year-old. It's crucial because hip fractures are often the most serious type of bone fracture.",
    whatItMeans:
      "Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.",
    whyItMatters:
      "Hip fractures are among the most serious bone fractures, often requiring surgery and long recovery. Early detection of hip bone loss is crucial.",
    levelMeaning: {
      low: "Low right hip T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal:
        "Your right hip T-score is within the healthy range, indicating good hip bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger hip bones and lower fracture risk.",
    },
    historyData: [
      -0.4, -0.2, -0.6, -0.3, -0.5, -0.1, -0.7, -0.4, -0.2, -0.5, -0.3, -0.4,
    ],
    comparisonData: {
      allPopulation: 68,
      ageSexGroup: 70,
    },
    tips: [
      "Focus on hip-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Do weight-bearing activities like walking",
      "Include balance exercises to prevent falls",
      "Avoid smoking and excessive alcohol",
    ],
  },

  "Hip Z-Score": {
    name: "Hip Z-Score",
    unit: "",
    referenceRange: ">-2.0",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 62,
    explanation:
      "Hip Z-score compares your hip bone density to others your age and gender. It helps identify if hip bone loss is age-appropriate.",
    whatItMeans:
      "Above -2.0 is normal for your age. Below -2.0 may indicate hip bone density lower than expected for your age group.",
    whyItMatters:
      "Hip Z-score helps determine if hip bone loss is normal aging or if there are underlying conditions affecting hip bone health.",
    levelMeaning: {
      low: "Low hip Z-scores may indicate premature hip bone loss or underlying health conditions.",
      normal:
        "Your hip Z-score is appropriate for your age group, indicating normal hip bone development.",
      high: "Higher Z-scores indicate better hip bone density than average for your age group.",
    },
    historyData: [
      -0.7, -0.4, -1.1, -0.6, -0.9, -0.2, -1.3, -0.8, -0.5, -1.0, -0.7, -0.8,
    ],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 64,
    },
    tips: [
      "Focus on hip-specific bone health strategies",
      "Ensure adequate nutrition for hip bone strength",
      "Stay active with hip-friendly exercises",
      "Monitor hip bone health regularly",
      "Discuss any concerns with your healthcare provider",
    ],
  },

  "Hip BMD": {
    name: "Hip BMD (Bone Mineral Density)",
    unit: "g/cm²",
    referenceRange: ">0.7",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 67,
    explanation:
      "Hip BMD measures the actual amount of bone mineral in your hip bones. It's the most important predictor of hip fracture risk.",
    whatItMeans:
      "Higher hip BMD values indicate stronger hip bones. Lower values suggest increased risk of hip fractures.",
    whyItMatters:
      "Hip BMD is the gold standard for predicting hip fracture risk. Hip fractures are among the most serious and costly bone fractures.",
    levelMeaning: {
      low: "Low hip BMD values indicate increased risk of hip fractures, which can be devastating injuries.",
      normal:
        "Your hip BMD is within the healthy range, indicating good hip bone mineral content.",
      high: "Higher BMD values indicate stronger hip bones with lower fracture risk.",
    },
    historyData: [
      0.85, 0.88, 0.82, 0.86, 0.84, 0.91, 0.79, 0.83, 0.87, 0.81, 0.85, 0.86,
    ],
    comparisonData: {
      allPopulation: 67,
      ageSexGroup: 69,
    },
    tips: [
      "Maximize hip bone mineral density through nutrition",
      "Do hip-strengthening exercises regularly",
      "Ensure adequate calcium and vitamin D intake",
      "Include weight-bearing activities",
      "Monitor hip BMD changes over time",
    ],
  },

  "Vertebral Fracture Risk (10-yr)": {
    name: "Vertebral Fracture Risk (10-yr)",
    unit: "%",
    referenceRange: "<10",
    category: "Bone Health",
    organSystem: "Spine",
    lastTested: "Dec 15, 2024",
    percentile: 45,
    explanation:
      "This calculates your 10-year risk of having a vertebral (spine) fracture. It's like a weather forecast for your spine health over the next decade.",
    whatItMeans:
      "Lower percentages indicate lower fracture risk. Above 10% suggests increased risk of spine fractures over the next 10 years.",
    whyItMatters:
      "Vertebral fractures can cause severe pain, height loss, and deformity. Early identification of high-risk individuals allows for preventive treatment.",
    levelMeaning: {
      low: "Low vertebral fracture risk indicates good spine bone health and low fracture probability.",
      normal:
        "Your vertebral fracture risk is within acceptable limits for your age and bone health.",
      high: "High vertebral fracture risk suggests increased likelihood of spine fractures requiring preventive measures.",
    },
    historyData: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    comparisonData: {
      allPopulation: 45,
      ageSexGroup: 48,
    },
    tips: [
      "Focus on spine-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Maintain good posture and ergonomics",
      "Consider bone-building medications if risk is high",
      "Get regular bone density monitoring",
    ],
  },

  "Spine Z-score (Age-matched)": {
    name: "Spine Z-score (Age-matched)",
    unit: "SD",
    referenceRange: ">-2.0",
    category: "Bone Health",
    organSystem: "Spine",
    lastTested: "Dec 15, 2024",
    percentile: 60,
    explanation:
      "Z-score compares your spine bone density to others your age and gender. It's like seeing how your spine bones compare to your peers.",
    whatItMeans:
      "Above -2.0 is normal for your age. Below -2.0 may indicate bone density lower than expected for your age group.",
    whyItMatters:
      "Z-score helps identify if bone loss is age-appropriate or if there are underlying conditions causing premature bone loss.",
    levelMeaning: {
      low: "Low Z-scores may indicate bone density lower than expected for your age, suggesting underlying health issues.",
      normal:
        "Your spine Z-score is appropriate for your age group, indicating normal bone development.",
      high: "Higher Z-scores indicate better bone density than average for your age group.",
    },
    historyData: [
      -0.8, -0.5, -1.2, -0.7, -1.0, -0.3, -1.5, -0.9, -0.6, -1.1, -0.8, -0.9,
    ],
    comparisonData: {
      allPopulation: 60,
      ageSexGroup: 62,
    },
    tips: [
      "Focus on age-appropriate bone health strategies",
      "Ensure adequate nutrition for bone building",
      "Stay active with age-appropriate exercises",
      "Monitor bone health regularly",
      "Discuss any concerns with your healthcare provider",
    ],
  },

  "Vertebral Height Loss": {
    name: "Vertebral Height Loss",
    unit: "",
    referenceRange: "None detected",
    category: "Bone Health",
    organSystem: "Spine",
    lastTested: "Dec 15, 2024",
    percentile: 85,
    explanation:
      "This measures if any of your vertebrae have collapsed or lost height due to fractures. It's like checking if any building floors have collapsed.",
    whatItMeans:
      "No height loss indicates healthy vertebrae. Any height loss suggests previous vertebral fractures that may have gone unnoticed.",
    whyItMatters:
      "Vertebral height loss is often the first sign of osteoporosis and can cause chronic back pain and deformity.",
    levelMeaning: {
      low: "No vertebral height loss indicates healthy spine structure and no compression fractures.",
      normal:
        "Your spine shows no signs of vertebral height loss, indicating good bone health.",
      high: "Vertebral height loss suggests previous fractures and increased risk of future fractures.",
    },
    historyData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    comparisonData: {
      allPopulation: 85,
      ageSexGroup: 88,
    },
    tips: [
      "Maintain good posture to prevent further compression",
      "Focus on spine-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Consider bone-building medications if fractures are present",
      "Get regular spine imaging to monitor changes",
    ],
  },

  "Left Femoral Neck T-score": {
    name: "Left Femoral Neck T-score",
    unit: "SD",
    referenceRange: ">-1.0",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 65,
    explanation:
      "T-score compares your left femoral neck bone density to a healthy 30-year-old. The femoral neck is the most common site of hip fractures.",
    whatItMeans:
      "Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.",
    whyItMatters:
      "The femoral neck is the most common site of hip fractures. Early detection of bone loss here is crucial for preventing devastating hip fractures.",
    levelMeaning: {
      low: "Low femoral neck T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal:
        "Your left femoral neck T-score is within the healthy range, indicating good bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger femoral neck bones and lower fracture risk.",
    },
    historyData: [
      -0.8, -0.6, -1.0, -0.7, -0.9, -0.5, -1.1, -0.8, -0.6, -1.0, -0.7, -0.8,
    ],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 67,
    },
    tips: [
      "Focus on hip-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Do weight-bearing activities like walking",
      "Include balance exercises to prevent falls",
      "Avoid smoking and excessive alcohol",
    ],
  },

  "FRAX Left Hip Risk (10-yr)": {
    name: "FRAX Left Hip Risk (10-yr)",
    unit: "%",
    referenceRange: "<3",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 55,
    explanation:
      "FRAX calculates your 10-year risk of hip fracture based on bone density and other risk factors. It's like a personalized fracture risk calculator.",
    whatItMeans:
      "Below 3% is low risk. 3-20% is moderate risk. Above 20% is high risk for hip fracture over the next 10 years.",
    whyItMatters:
      "FRAX helps determine if you need bone-building medications to prevent hip fractures, which can be devastating and life-changing.",
    levelMeaning: {
      low: "Low FRAX risk indicates good hip bone health and low fracture probability.",
      normal:
        "Your FRAX hip risk is within acceptable limits for your age and risk factors.",
      high: "High FRAX risk suggests increased likelihood of hip fractures requiring preventive treatment.",
    },
    historyData: [1.5, 1.8, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5, 4.8],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      "Focus on hip-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Consider bone-building medications if risk is high",
      "Maintain good balance to prevent falls",
      "Get regular bone density monitoring",
    ],
  },

  "Left Hip Z-score": {
    name: "Left Hip Z-score",
    unit: "SD",
    referenceRange: ">-2.0",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 62,
    explanation:
      "Z-score compares your left hip bone density to others your age and gender. It helps identify if hip bone loss is age-appropriate.",
    whatItMeans:
      "Above -2.0 is normal for your age. Below -2.0 may indicate hip bone density lower than expected for your age group.",
    whyItMatters:
      "Hip Z-score helps determine if hip bone loss is normal aging or if there are underlying conditions affecting hip bone health.",
    levelMeaning: {
      low: "Low hip Z-scores may indicate premature hip bone loss or underlying health conditions.",
      normal:
        "Your left hip Z-score is appropriate for your age group, indicating normal hip bone development.",
      high: "Higher Z-scores indicate better hip bone density than average for your age group.",
    },
    historyData: [
      -0.7, -0.4, -1.1, -0.6, -0.9, -0.2, -1.3, -0.8, -0.5, -1.0, -0.7, -0.8,
    ],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 64,
    },
    tips: [
      "Focus on hip-specific bone health strategies",
      "Ensure adequate nutrition for hip bone strength",
      "Stay active with hip-friendly exercises",
      "Monitor hip bone health regularly",
      "Discuss any concerns with your healthcare provider",
    ],
  },

  "Right Femoral Neck T-score": {
    name: "Right Femoral Neck T-score",
    unit: "SD",
    referenceRange: ">-1.0",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 65,
    explanation:
      "T-score compares your right femoral neck bone density to a healthy 30-year-old. The femoral neck is the most common site of hip fractures.",
    whatItMeans:
      "Above -1.0 is normal. -1.0 to -2.5 indicates osteopenia. Below -2.5 suggests osteoporosis with high hip fracture risk.",
    whyItMatters:
      "The femoral neck is the most common site of hip fractures. Early detection of bone loss here is crucial for preventing devastating hip fractures.",
    levelMeaning: {
      low: "Low femoral neck T-scores indicate increased risk of hip fractures, which can be life-changing injuries.",
      normal:
        "Your right femoral neck T-score is within the healthy range, indicating good bone density and low fracture risk.",
      high: "Higher T-scores indicate stronger femoral neck bones and lower fracture risk.",
    },
    historyData: [
      -0.6, -0.4, -0.8, -0.5, -0.7, -0.3, -0.9, -0.6, -0.4, -0.8, -0.5, -0.6,
    ],
    comparisonData: {
      allPopulation: 65,
      ageSexGroup: 67,
    },
    tips: [
      "Focus on hip-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Do weight-bearing activities like walking",
      "Include balance exercises to prevent falls",
      "Avoid smoking and excessive alcohol",
    ],
  },

  "FRAX Right Hip Risk (10-yr)": {
    name: "FRAX Right Hip Risk (10-yr)",
    unit: "%",
    referenceRange: "<3",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 55,
    explanation:
      "FRAX calculates your 10-year risk of hip fracture based on bone density and other risk factors. It's like a personalized fracture risk calculator.",
    whatItMeans:
      "Below 3% is low risk. 3-20% is moderate risk. Above 20% is high risk for hip fracture over the next 10 years.",
    whyItMatters:
      "FRAX helps determine if you need bone-building medications to prevent hip fractures, which can be devastating and life-changing.",
    levelMeaning: {
      low: "Low FRAX risk indicates good hip bone health and low fracture probability.",
      normal:
        "Your FRAX hip risk is within acceptable limits for your age and risk factors.",
      high: "High FRAX risk suggests increased likelihood of hip fractures requiring preventive treatment.",
    },
    historyData: [1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.2, 4.5],
    comparisonData: {
      allPopulation: 55,
      ageSexGroup: 58,
    },
    tips: [
      "Focus on hip-strengthening exercises",
      "Ensure adequate calcium and vitamin D",
      "Consider bone-building medications if risk is high",
      "Maintain good balance to prevent falls",
      "Get regular bone density monitoring",
    ],
  },

  "Right Hip Z-score": {
    name: "Right Hip Z-score",
    unit: "SD",
    referenceRange: ">-2.0",
    category: "Bone Health",
    organSystem: "Hip",
    lastTested: "Dec 15, 2024",
    percentile: 62,
    explanation:
      "Z-score compares your right hip bone density to others your age and gender. It helps identify if hip bone loss is age-appropriate.",
    whatItMeans:
      "Above -2.0 is normal for your age. Below -2.0 may indicate hip bone density lower than expected for your age group.",
    whyItMatters:
      "Hip Z-score helps determine if hip bone loss is normal aging or if there are underlying conditions affecting hip bone health.",
    levelMeaning: {
      low: "Low hip Z-scores may indicate premature hip bone loss or underlying health conditions.",
      normal:
        "Your right hip Z-score is appropriate for your age group, indicating normal hip bone development.",
      high: "Higher Z-scores indicate better hip bone density than average for your age group.",
    },
    historyData: [
      -0.5, -0.2, -0.8, -0.3, -0.6, -0.1, -1.0, -0.5, -0.2, -0.7, -0.4, -0.5,
    ],
    comparisonData: {
      allPopulation: 62,
      ageSexGroup: 64,
    },
    tips: [
      "Focus on hip-specific bone health strategies",
      "Ensure adequate nutrition for hip bone strength",
      "Stay active with hip-friendly exercises",
      "Monitor hip bone health regularly",
      "Discuss any concerns with your healthcare provider",
    ],
  },
};
