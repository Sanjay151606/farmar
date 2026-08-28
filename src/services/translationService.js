const https = require('https');

// Specialized Tamil-to-English Agriculture & Market Terminology Dictionary
const AGRI_TAMIL_DICTIONARY = {
  // Vegetables
  'தக்காளி': 'Tomatoes',
  'நாட்டு தக்காளி': 'Country Organic Tomatoes',
  'ஆப்பிள் தக்காளி': 'Hybrid Tomatoes',
  'கத்தரிக்காய்': 'Brinjal (Eggplant)',
  'வரி கத்தரி': 'Striped Brinjal',
  'வெண்டைக்காய்': 'Okra (Lady Finger)',
  'வெண்டை': 'Okra',
  'சின்ன வெங்காயம்': 'Small Onions (Shallots)',
  'சாம்பார் வெங்காயம்': 'Shallots (Sambar Onion)',
  'பெரிய வெங்காயம்': 'Big Onions',
  'வெங்காயம்': 'Onions',
  'பச்சை மிளகாய்': 'Green Chillies',
  'மிளகாய்': 'Chillies',
  'வர மிளகாய்': 'Dry Red Chillies',
  'இஞ்சி': 'Fresh Ginger',
  'பூண்டு': 'Garlic',
  'மலை பூண்டு': 'Hill Garlic',
  'முருங்கைக்காய்': 'Drumstick (Moringa)',
  'முருங்கை': 'Moringa',
  'வாழைக்காய்': 'Raw Plantain (Banana)',
  'வாழைத்தண்டு': 'Banana Stem',
  'வாழைப்பூ': 'Banana Flower',
  'சுரைக்காய்': 'Bottle Gourd',
  'பீர்க்கங்காய்': 'Ridge Gourd',
  'புடலங்காய்': 'Snake Gourd',
  'பாகற்காய்': 'Bitter Gourd',
  'மிதி பாகற்காய்': 'Small Bitter Gourd',
  'முள்ளங்கி': 'Radish',
  'கேரட்': 'Carrot',
  'பீன்ஸ்': 'Green Beans',
  'அவரைக்காய்': 'Broad Beans',
  'கொத்தவரங்காய்': 'Cluster Beans',
  'உருளைக்கிழங்கு': 'Potatoes',
  'சேனைக்கிழங்கு': 'Elephant Yam',
  'சேப்பங்கிழங்கு': 'Taro Root',
  'மரவள்ளிக்கிழங்கு': 'Tapioca',
  'சர்க்கரைவள்ளிக்கிழங்கு': 'Sweet Potato',
  'காலிஃபிளவர்': 'Cauliflower',
  'முட்டைக்கோஸ்': 'Cabbage',
  'நூல்கோல்': 'Kohlrabi',
  'குடைமிளகாய்': 'Capsicum (Bell Pepper)',

  // Greens & Herbs
  'கொத்தமல்லி': 'Fresh Coriander Leaves',
  'மல்லி': 'Coriander',
  'புதினா': 'Fresh Mint Leaves',
  'கருவேப்பிலை': 'Curry Leaves',
  'கறிவேப்பிலை': 'Curry Leaves',
  'பசலைக்கீரை': 'Spinach',
  'முருங்கைக் கீரை': 'Moringa Leaves',
  'அரைக்கீரை': 'Amaranth Greens',
  'சிறுகீரை': 'Tropical Amaranth',
  'வெந்தயக்கீரை': 'Fenugreek Leaves',
  'மணத்தக்காளி': 'Black Nightshade Leaves',
  'பொன்னாங்கண்ணி': 'Ponnanganni Greens',

  // Grains, Pulses & Cereals
  'நெல்': 'Paddy (Raw Grain)',
  'பொன்னி அரிசி': 'Ponni Boiled Rice',
  'பச்சரிசி': 'Raw Rice',
  'புழுங்கல் அரிசி': 'Parboiled Rice',
  'சீரக சம்பா': 'Seeraga Samba Rice',
  'மாப்பிள்ளை சம்பா': 'Mappillai Samba Traditional Rice',
  'கருப்பு கவுனி': 'Black Kavuni Rice',
  'கைக்குத்தல் அரிசி': 'Hand-Pounded Brown Rice',
  'கம்பு': 'Pearl Millet (Bajra)',
  'கேழ்வரகு': 'Finger Millet (Ragi)',
  'ராகி': 'Ragi',
  'சோளம்': 'Sorghum (Jowar)',
  'திணை': 'Foxtail Millet',
  'சாமை': 'Little Millet',
  'குதிரைவாலி': 'Barnyard Millet',
  'வரகு': 'Kodo Millet',
  'துவரம் பருப்பு': 'Toor Dal (Pigeon Pea)',
  'பாசிப்பருப்பு': 'Moong Dal (Yellow Gram)',
  'பாசிப்பயறு': 'Green Gram (Whole Moong)',
  'உளுத்தம் பருப்பு': 'Urad Dal (Black Gram)',
  'உளுந்து': 'Black Gram',
  'கடலைப்பருப்பு': 'Chana Dal (Bengal Gram)',
  'கொண்டைக்கடலை': 'Chickpeas (Chana)',
  'வேர்க்கடலை': 'Groundnuts (Peanuts)',
  'நிலக்கடலை': 'Peanuts',
  'எள்ளு': 'Sesame Seeds',
  'கருப்பு எள்ளு': 'Black Sesame',
  'கொள்ளு': 'Horse Gram',
  'தட்டப்பயறு': 'Cowpeas',

  // Fruits
  'வாழைப்பழம்': 'Fresh Bananas',
  'செவ்வாழை': 'Red Bananas',
  'பூவன் பழம்': 'Poovan Bananas',
  'ரஸ்தாளி': 'Rasthali Bananas',
  'மாம்பழம்': 'Mangoes',
  'அல்போன்சா': 'Alphonso Mangoes',
  'இமாம்பசந்த்': 'Imam Pasand Mangoes',
  'பலாப்பழம்': 'Jackfruit',
  'கொய்யாப்பழம்': 'Guava',
  'கொய்யா': 'Guava',
  'பப்பாளி': 'Papaya',
  'மாதுளை': 'Pomegranate',
  'சப்போட்டா': 'Sapodilla (Chikoo)',
  'எலுமிச்சை': 'Fresh Lemon',
  'நார்த்தங்காய்': 'Citron',
  'நெல்லிக்காய்': 'Amla (Indian Gooseberry)',
  'தர்பூசணி': 'Watermelon',
  'முலாம் பழம்': 'Muskmelon',
  'அன்னாசி': 'Pineapple',
  'திராட்சை': 'Grapes',
  'நாவல் பழம்': 'Jamun Fruit',

  // Plantation, Spices & Dairy
  'தேங்காய்': 'Fresh Coconut',
  'இளநீர்': 'Tender Coconut',
  'கொப்பரை': 'Dry Coconut (Copra)',
  'மஞ்சள்': 'Turmeric Rhizome',
  'விரலி மஞ்சள்': 'Raw Turmeric',
  'கரும்பு': 'Sugarcane',
  'பனை வெல்லம்': 'Palm Jaggery',
  'நாட்டு சர்க்கரை': 'Country Cane Sugar',
  'வெல்லம்': 'Jaggery',
  'கருப்பட்டி': 'Palm Karupatti',
  'பசும்பால்': 'Fresh Cow Milk',
  'எருமைப்பால்': 'Buffalo Milk',
  'தயிர்': 'Fresh Curd',
  'வெண்ணெய்': 'Country Butter',
  'நெய்': 'Pure Desi Cow Ghee',
  'நாட்டுக்கோழி முட்டை': 'Country Chicken Eggs',
  'மரச்செக்கு நல்லெண்ணெய்': 'Cold-Pressed Sesame Oil',
  'நல்லெண்ணெய்': 'Sesame Oil (Gingelly)',
  'மரச்செக்கு கடலை எண்ணெய்': 'Cold-Pressed Groundnut Oil',
  'கடலை எண்ணெய்': 'Groundnut Oil (Peanut Oil)',
  'தேங்காய் எண்ணெய்': 'Pure Coconut Oil',

  // Descriptive & Quality Terms
  'இயற்கை': 'Organic',
  'இயற்கை விவசாயம்': 'Organic Farming',
  'பூச்சிக்கொல்லி இல்லாதது': 'Pesticide-Free',
  'புதிய அறுவடை': 'Fresh Harvest',
  'தோட்டத்து காய்கறி': 'Farm-Fresh Produce',
  'செம்மண் பயிர்': 'Red Soil Cultivated',
  'வீட்டு தோட்டம்': 'Home Garden Grown',

  // Units & Quantities
  'கிலோ': 'kg',
  'கிலோகிராம்': 'kg',
  'கிராம்': 'grams',
  'லிட்டர்': 'litres',
  'மில்லி': 'ml',
  'மூட்டை': 'bag (sack)',
  'கட்டு': 'bunch',
  'டஜன்': 'dozen',
  'எண்ணிக்கை': 'units',

  // Tamil Nadu Districts & Locations
  'தஞ்சாவூர்': 'Thanjavur',
  'மதுரை': 'Madurai',
  'சிவகாசி': 'Sivakasi',
  'விருதுநகர்': 'Virudhunagar',
  'கோயம்புத்தூர்': 'Coimbatore',
  'சென்னை': 'Chennai',
  'திருச்சி': 'Trichy',
  'சேலம்': 'Salem',
  'திருநெல்வேலி': 'Tirunelveli',
  'ஈரோடு': 'Erode',
  'திண்டுக்கல்': 'Dindigul',
  'வேலூர்': 'Vellore',
  'கடலூர்': 'Cuddalore',
  'விழுப்புரம்': 'Villupuram',
  'நாகப்பட்டினம்': 'Nagapattinam',
  'திருவாரூர்': 'Tiruvarur',
  'புதுக்கோட்டை': 'Pudukkottai',
  'தேனி': 'Theni',
  'கரூர்': 'Karur',
  'நாமக்கல்': 'Namakkal',
  'கன்னியாகுமரி': 'Kanyakumari',
  'தூத்துக்குடி': 'Tuticorin',
  'சிவகங்கை': 'Sivaganga',
  'ராமநாதபுரம்': 'Ramanathapuram',
  'தர்மபுரி': 'Dharmapuri',
  'கிருஷ்ணகிரி': 'Krishnagiri',
  'திருப்பூர்': 'Tiruppur',
  'நீலகிரி': 'Nilgiris'
};

/**
 * Clean & normalize text helper
 */
function cleanText(txt) {
  return (txt || '').trim().replace(/\s+/g, ' ');
}

/**
 * Check if text has exact or composite match in Agri Dictionary
 */
function lookupAgriDictionary(tamilText) {
  const norm = cleanText(tamilText).toLowerCase();
  
  // Exact match
  for (const [ta, en] of Object.entries(AGRI_TAMIL_DICTIONARY)) {
    if (norm === ta.toLowerCase()) {
      return en;
    }
  }

  // Multi-term substring replacement
  let translated = cleanText(tamilText);
  let matchedAny = false;

  // Sort dictionary keys by length descending to match longest phrases first
  const keys = Object.keys(AGRI_TAMIL_DICTIONARY).sort((a, b) => b.length - a.length);

  for (const ta of keys) {
    if (translated.includes(ta)) {
      const en = AGRI_TAMIL_DICTIONARY[ta];
      translated = translated.split(ta).join(en + ' ');
      matchedAny = true;
    }
  }

  if (matchedAny) {
    return cleanText(translated);
  }

  return null;
}

/**
 * Translate using Free MyMemory API with timeout
 */
function translateWithMyMemory(tamilText) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(tamilText);
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=ta|en`;

    const req = https.get(url, { timeout: 4500 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.responseData && parsed.responseData.translatedText) {
            let result = parsed.responseData.translatedText;
            // Clean up any html entities or uppercase artifacts
            result = result.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
            resolve({ success: true, text: result, source: 'mymemory' });
          } else {
            resolve({ success: false });
          }
        } catch (e) {
          resolve({ success: false });
        }
      });
    });

    req.on('error', () => resolve({ success: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false });
    });
  });
}

/**
 * Translate using OpenAI (if OPENAI_API_KEY is configured in Vercel environment)
 */
async function translateWithOpenAI(tamilText, apiKey) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Tamil to English agricultural translator. Translate the farmer voice transcript into concise, standard English product names or descriptions.'
        },
        {
          role: 'user',
          content: `Translate this Tamil agricultural text into English: "${tamilText}"`
        }
      ],
      temperature: 0.2,
      max_tokens: 60
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const reply = parsed.choices[0].message.content.trim().replace(/^"|"$/g, '');
          resolve({ success: true, text: reply, source: 'openai' });
        } catch (e) {
          resolve({ success: false });
        }
      });
    });

    req.on('error', () => resolve({ success: false }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false }); });
    req.write(postData);
    req.end();
  });
}

/**
 * Translate using Sarvam AI (if VOICE_TRANSLATOR_API_KEY / SARVAM_API_KEY is provided)
 */
async function translateWithSarvam(tamilText, apiKey) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      input: tamilText,
      source_language_code: 'ta-IN',
      target_language_code: 'en-IN',
      mode: 'formal',
      model: 'mayura:v1'
    });

    const req = https.request({
      hostname: 'api.sarvam.ai',
      path: '/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.translated_text) {
            resolve({ success: true, text: parsed.translated_text, source: 'sarvam' });
          } else {
            resolve({ success: false });
          }
        } catch (e) {
          resolve({ success: false });
        }
      });
    });

    req.on('error', () => resolve({ success: false }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false }); });
    req.write(postData);
    req.end();
  });
}

/**
 * Main Translation Orchestrator
 */
async function translateTamilToEnglish(tamilText) {
  if (!tamilText || typeof tamilText !== 'string' || !tamilText.trim()) {
    return { success: false, error: 'Text is required for translation' };
  }

  const raw = cleanText(tamilText);

  // 1. If Sarvam / Voice Translator API Key is configured, use Sarvam AI
  const sarvamKey = process.env.VOICE_TRANSLATOR_API_KEY || process.env.SARVAM_API_KEY;
  if (sarvamKey) {
    const sarvamRes = await translateWithSarvam(raw, sarvamKey);
    if (sarvamRes.success && sarvamRes.text) {
      return {
        success: true,
        original: raw,
        translatedText: sarvamRes.text,
        source: 'sarvam_ai'
      };
    }
  }

  // 2. If OpenAI API Key is configured in environment, use OpenAI GPT-4o-mini
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    const openAiRes = await translateWithOpenAI(raw, openAiKey);
    if (openAiRes.success && openAiRes.text) {
      return {
        success: true,
        original: raw,
        translatedText: openAiRes.text,
        source: 'openai'
      };
    }
  }

  // 3. Check specialized Agricultural Dictionary (instant zero-latency fallback)
  const dictMatch = lookupAgriDictionary(raw);
  if (dictMatch) {
    return {
      success: true,
      original: raw,
      translatedText: dictMatch,
      source: 'agri_dict'
    };
  }

  // 4. Use Free MyMemory Translation API
  const myMemoryRes = await translateWithMyMemory(raw);
  if (myMemoryRes.success && myMemoryRes.text && myMemoryRes.text !== raw) {
    return {
      success: true,
      original: raw,
      translatedText: myMemoryRes.text,
      source: 'mymemory'
    };
  }

  // 5. Raw fallback if offline
  return {
    success: true,
    original: raw,
    translatedText: raw,
    source: 'raw_fallback'
  };
}

module.exports = {
  translateTamilToEnglish,
  lookupAgriDictionary
};
