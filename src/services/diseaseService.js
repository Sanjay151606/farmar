const store = require('../models/store');

const diseaseKnowledge = [
  {
    crop_name: 'Tomato',
    disease_name: 'Early Blight (Alternaria solani)',
    confidence: 92,
    severity: 'Moderate',
    is_healthy: false,
    symptoms: [
      'Dark brown concentric rings (target spots) on mature lower leaves',
      'Yellowing (chlorosis) around dark lesion areas',
      'Stem lesion girdling near ground level on young seedlings'
    ],
    recommendations: [
      'Prune and safely destroy lower infected leaves immediately.',
      'Apply bio-fungicide (Trichoderma viride or Neem Oil 5ml/L).',
      'Avoid overhead watering; use drip irrigation to keep foliage dry.',
      'Ensure proper crop spacing for maximum sunlight and ventilation.'
    ]
  },
  {
    crop_name: 'Paddy (Rice)',
    disease_name: 'Rice Blast (Magnaporthe oryzae)',
    confidence: 89,
    severity: 'High',
    is_healthy: false,
    symptoms: [
      'Spindle-shaped or diamond-shaped lesions with greyish-white centers',
      'Brownish-red borders on leaf blades',
      'Neck rot causing empty/chaffy grains during flowering'
    ],
    recommendations: [
      'Avoid excessive Nitrogen fertilizer application.',
      'Spray Pseudomonas fluorescens @ 10g/L during early booting stage.',
      'Maintain continuous shallow water layer (2-5cm) in paddy field.',
      'Sow blast-resistant certified seed varieties.'
    ]
  },
  {
    crop_name: 'Cotton',
    disease_name: 'Bacterial Blight (Xanthomonas citri)',
    confidence: 86,
    severity: 'Moderate',
    is_healthy: false,
    symptoms: [
      'Angular water-soaked spots bounded by leaf veinlets',
      'Black arm lesions on green bolls and fruiting branches',
      'Boll rot reducing lint quality'
    ],
    recommendations: [
      'Apply Copper Oxychloride 50 WP (2.5g/L) + Streptocycline (0.1g/L).',
      'Collect and burn infected crop residues post-harvest.',
      'Maintain field hygiene and avoid working in wet foliage.'
    ]
  },
  {
    crop_name: 'Tomato',
    disease_name: 'Healthy Crop (No Disease Detected)',
    confidence: 97,
    severity: 'None',
    is_healthy: true,
    symptoms: [
      'Vibrant green uniform leaf pigmentation',
      'No necrotic lesions, fungal spots, or insect damage',
      'Robust root system and healthy stem vascular bundles'
    ],
    recommendations: [
      'Continue regular organic liquid fertilizer schedule (Jeevamrutha).',
      'Maintain consistent soil moisture levels.',
      'Perform regular weekly scouting for early pest detection.'
    ]
  }
];

const diseaseService = {
  getHistory(farmerId) {
    const history = store.getDiseaseDiagnoses(farmerId || 'Kavitha S');
    const latest = history[0] || null;

    const healthyCount = history.filter(h => h.isHealthy).length;
    const diseaseCount = history.length - healthyCount;

    return {
      diagnoses: history,
      latest,
      stats: {
        totalAnalyses: history.length,
        healthyCount,
        diseaseCount,
        recentCrop: latest ? latest.cropName : 'None',
        recentDisease: latest ? latest.diseaseName : 'No diagnosis yet'
      }
    };
  },

  analyzeCropImage({ image, farmerName, cropHint }) {
    if (!image) {
      throw new Error('Image data is required');
    }

    let selected = diseaseKnowledge[0];
    if (cropHint) {
      const hintLower = cropHint.toLowerCase();
      if (hintLower.includes('paddy') || hintLower.includes('rice')) selected = diseaseKnowledge[1];
      else if (hintLower.includes('cotton')) selected = diseaseKnowledge[2];
      else if (hintLower.includes('healthy')) selected = diseaseKnowledge[3];
    } else {
      selected = diseaseKnowledge[Math.floor(Math.random() * diseaseKnowledge.length)];
    }

    const diagnosisRecord = {
      id: 'DIAG-' + Date.now().toString().slice(-6),
      farmerId: farmerName || 'Kavitha S',
      cropName: selected.crop_name,
      diseaseName: selected.disease_name,
      confidence: selected.confidence,
      severity: selected.severity,
      isHealthy: selected.is_healthy,
      symptoms: selected.symptoms,
      recommendations: selected.recommendations,
      createdAt: new Date().toISOString()
    };

    return store.saveDiseaseDiagnosis(diagnosisRecord);
  }
};

module.exports = diseaseService;
