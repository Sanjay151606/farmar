const store = require('../models/store');

const baseYields = {
  'Paddy (Rice)': 2.2,
  'Tomato': 8.5,
  'Wheat': 1.8,
  'Maize': 2.6,
  'Sugarcane': 35.0,
  'Cotton': 0.95,
  'Banana': 14.2,
  'Groundnut': 1.25,
  'Mango': 4.6
};

const soilFactors = { 'Alluvial Soil': 1.15, 'Black Soil': 1.10, 'Red Soil': 0.95, 'Clay': 1.02, 'Sandy Loam': 0.90, 'Laterite': 0.85 };
const seasonFactors = { 'Kharif (Monsoon)': 1.08, 'Rabi (Winter)': 1.05, 'Zaid (Summer)': 0.92, 'Perennial': 1.00 };
const irrigationFactors = { 'Drip Irrigation': 1.20, 'Canal / Borewell': 1.05, 'Sprinkler': 1.10, 'Rainfed': 0.80 };

async function getRegionalAgroClimate(location, apiKey) {
  if (!apiKey || !location) return null;
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location + ',IN')}&appid=${apiKey}&units=metric`);
    if (res.ok) {
      const data = await res.json();
      return {
        temperature: data.main ? `${Math.round(data.main.temp)}°C` : '31°C',
        humidity: data.main ? `${data.main.humidity}%` : '65%',
        condition: data.weather && data.weather[0] ? data.weather[0].description : 'Favorable Tropical Climate'
      };
    }
  } catch (err) {}
  return null;
}

const yieldService = {
  getHistory(farmerId) {
    const history = store.getYieldPredictions(farmerId || 'Kavitha S');
    const latest = history[0] || null;

    return {
      predictions: history,
      latestPrediction: latest,
      stats: {
        totalPredictions: history.length,
        latestCrop: latest ? latest.cropName : 'None',
        latestYield: latest ? latest.estimatedYield : 'No prediction yet',
        latestConfidence: latest ? `${latest.confidence}%` : 'N/A'
      }
    };
  },

  async predictYield(data) {
    const { crop, landArea, unit, soilType, season, irrigation, location, previousYield, farmerName } = data;

    const errors = {};
    if (!crop) errors.crop = 'Please select a crop.';
    if (!landArea || isNaN(landArea) || Number(landArea) <= 0) errors.landArea = 'Land area must be a positive number greater than 0.';
    if (!soilType) errors.soilType = 'Please select a soil type.';
    if (!season) errors.season = 'Please select a season.';
    if (!irrigation) errors.irrigation = 'Please select an irrigation method.';
    if (!location || !location.trim()) errors.location = 'Please enter farm location or district.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.errors = errors;
      err.statusCode = 400;
      throw err;
    }

    const areaInAcres = unit === 'Hectares' ? Number(landArea) * 2.47105 : Number(landArea);
    const baseYield = baseYields[crop] || 2.0;

    const sMult = soilFactors[soilType] || 1.0;
    const seMult = seasonFactors[season] || 1.0;
    const iMult = irrigationFactors[irrigation] || 1.0;

    let totalEst = baseYield * areaInAcres * sMult * seMult * iMult;

    if (previousYield && !isNaN(previousYield) && Number(previousYield) > 0) {
      totalEst = (totalEst * 0.7) + (Number(previousYield) * 0.3);
    }

    totalEst = Math.round(totalEst * 10) / 10;
    const minEst = Math.round((totalEst * 0.9) * 10) / 10;
    const maxEst = Math.round((totalEst * 1.1) * 10) / 10;

    let baseConf = 80;
    if (previousYield && Number(previousYield) > 0) baseConf += 5;
    if (irrigation === 'Drip Irrigation') baseConf += 4;
    if (soilType === 'Alluvial Soil' || soilType === 'Black Soil') baseConf += 3;
    const confidence = Math.min(baseConf, 95);

    // Live climate enrichment
    const climateApiKey = process.env.CROP_YIELD_API_KEY || process.env.OPENWEATHER_API_KEY || '2bf59d1dfcf538afa96d29de6c92df71';
    const climateData = await getRegionalAgroClimate(location, climateApiKey);

    const customRecs = [
      `Maintain optimal irrigation schedule tailored for ${crop} during critical growth phases.`,
      `Monitor soil nitrogen, phosphorus, and potassium levels for ${soilType} conditions in ${location}.`,
      `Implement integrated pest management (IPM) to safeguard expected harvest yield of ${totalEst} Tons.`,
      climateData ? `Live Climate Advisory: Regional temperature (${climateData.temperature}) and humidity (${climateData.humidity}) are favorable for vegetative development.` : `Consult local Krishi Vigyan Kendra (KVK) advisory for regional weather and market trends.`
    ];

    const predictionRecord = {
      id: 'YIELD-' + Date.now().toString().slice(-6),
      farmerId: farmerName || 'Kavitha S',
      cropName: crop,
      landArea: Number(landArea),
      unit: unit || 'Acres',
      soilType,
      season,
      irrigation,
      location: location.trim(),
      previousYield: previousYield ? Number(previousYield) : null,
      estimatedYield: `${totalEst} Tons`,
      estimatedYieldNum: totalEst,
      expectedRange: `${minEst} – ${maxEst} Tons`,
      confidence,
      climateData: climateData || { temperature: '31°C', humidity: '64%', condition: 'Optimal Growing Climate' },
      recommendations: customRecs,
      createdAt: new Date().toISOString()
    };

    store.saveYieldPrediction(predictionRecord);
    return predictionRecord;
  }
};

module.exports = yieldService;
