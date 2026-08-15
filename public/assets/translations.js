// Centralized Multi-Language Translation System for Farmora (English / Tamil / Hindi)
(function() {
    const translations = {
        en: {
            // Navigation & Header
            "nav_home": "Home",
            "nav_smart_journey": "Smart Journey",
            "nav_shop": "Customer Shop",
            "nav_farmer_portal": "Farmer Portal",
            "nav_delivery_app": "Delivery App",
            "nav_live_track": "Live Track",
            "nav_cart": "Cart & Orders",
            "nav_analytics": "Analytics",
            "nav_ai_assistant": "AI Assistant",
            "role_switcher": "Role Switcher:",
            "active_role": "Active Role",

            // General & Common UI
            "btn_explore": "Explore Journey",
            "btn_go_shop": "Go to Marketplace",
            "btn_submit": "Submit",
            "btn_cancel": "Cancel",
            "btn_save": "Save Changes",
            "btn_add_cart": "Add to Cart",
            "btn_buy_now": "Buy Now",
            "btn_accept": "Accept Order",
            "btn_confirm": "Confirm Order",
            "btn_assign": "Assign Delivery",
            "btn_picked_up": "Mark As Picked Up",
            "btn_out_for_delivery": "Mark As Out For Delivery",
            "btn_delivered": "Mark As Delivered",
            "btn_track": "Track Live Status",
            "btn_try_now": "Try Now",
            "btn_coming_soon": "Coming Soon",
            "btn_view_overview": "View Tamil Nadu Overview",
            "btn_analyze_region": "Analyze Region",

            // Smart Demand Prediction & Market Intelligence
            "market_intelligence": "Market Intelligence & Demand Prediction",
            "select_region": "Select Region / District",
            "all_districts": "All Tamil Nadu Districts",
            "your_region": "Your Region",
            "high_demand": "High Demand",
            "medium_demand": "Medium Demand",
            "low_demand": "Low Demand",
            "predicted_demand": "Predicted 7-Day Demand",
            "current_supply": "Current Available Supply",
            "potential_shortage": "Potential Shortage",
            "recommendation": "Farmora Recommendation",
            "trend_increasing": "Increasing Demand",
            "trend_stable": "Stable Demand",
            "trend_decreasing": "Decreasing Demand",
            "top_demand_products": "Top Demand Products",
            "fastest_growing": "Fastest Growing",
            "declining_demand": "Declining Demand",
            "confidence_high": "High Confidence",
            "confidence_medium": "Medium Confidence",
            "insufficient_data": "Not enough order history for a reliable forecast in this region.",
            "market_unavailable": "Market intelligence is temporarily unavailable.",

            // Dashboards & Statuses
            "status_placed": "Placed",
            "status_confirmed": "Confirmed",
            "status_assigned": "Assigned",
            "status_picked_up": "Picked Up",
            "status_out_for_delivery": "Out For Delivery",
            "status_delivered": "Delivered",
            "total_products": "Total Products",
            "pending_orders": "Pending Orders",
            "confirmed_orders": "Confirmed Orders",
            "delivered_orders": "Delivered Orders",
            "total_revenue": "Total Revenue",
            "available_stock": "Available Stock",
            "unit_kg": "kg",
            "unit_liter": "liter",
            "unit_piece": "piece"
        },

        ta: {
            // Navigation & Header
            "nav_home": "முகப்பு",
            "nav_smart_journey": "ஸ்மார்ட் பயணம்",
            "nav_shop": "சந்தை",
            "nav_farmer_portal": "விவசாயி போர்டல்",
            "nav_delivery_app": "டெலிவரி ஆப்",
            "nav_live_track": "நேரடி கண்காணிப்பு",
            "nav_cart": "கூடை & ஆர்டர்கள்",
            "nav_analytics": "பகுப்பாய்வு",
            "nav_ai_assistant": "AI உதவியாளர்",
            "role_switcher": "பங்கு மாற்றி:",
            "active_role": "செயலில் உள்ள பங்கு",

            // General & Common UI
            "btn_explore": "பயணத்தை ஆராயுங்கள்",
            "btn_go_shop": "சந்தைக்குச் செல்லுங்கள்",
            "btn_submit": "சமர்ப்பி",
            "btn_cancel": "ரத்து செய்",
            "btn_save": "சேமிக்கவும்",
            "btn_add_cart": "கூடையில் சேர்",
            "btn_buy_now": "இப்போதே வாங்கு",
            "btn_accept": "ஆர்டரை ஏற்றுக்கொள்",
            "btn_confirm": "ஆர்டரை உறுதிசெய்",
            "btn_assign": "டெலிவரியை ஒதுக்கு",
            "btn_picked_up": "எடுத்துக்கொண்டதாக குறிக்கவும்",
            "btn_out_for_delivery": "டெலிவரிக்கு சென்றதாக குறிக்கவும்",
            "btn_delivered": "டெலிவரி செய்யப்பட்டதாக குறிக்கவும்",
            "btn_track": "நேரலை நிலையைக் கண்காணிக்கவும்",
            "btn_try_now": "இப்போது முயற்சிக்கவும்",
            "btn_coming_soon": "விரைவில் வருகிறது",
            "btn_view_overview": "தமிழ்நாடு மேலோட்டத்தைப் பார்க்கவும்",
            "btn_analyze_region": "மண்டலத்தைப் பகுப்பாய்வு செய்க",

            // Smart Demand Prediction & Market Intelligence
            "market_intelligence": "சந்தை நுண்ணறிவு & தேவை கணிப்பு",
            "select_region": "மாவட்டம் / பகுதியைத் தேர்ந்தெடுக்கவும்",
            "all_districts": "அனைத்து தமிழ்நாடு மாவட்டங்கள்",
            "your_region": "உங்கள் பகுதி",
            "high_demand": "அதிக தேவை",
            "medium_demand": "மிதமான தேவை",
            "low_demand": "குறைந்த தேவை",
            "predicted_demand": "அடுத்த 7 நாட்களுக்கான கணிப்பு",
            "current_supply": "தற்போதைய இருப்பு",
            "potential_shortage": "சாத்தியமான பற்றாக்குறை",
            "recommendation": "Farmora பரிந்துரை",
            "trend_increasing": "தேவை அதிகரிக்கிறது",
            "trend_stable": "நிலையான தேவை",
            "trend_decreasing": "தேவை குறைகிறது",
            "top_demand_products": "அதிக தேவை உள்ள பொருட்கள்",
            "fastest_growing": "வேகமாக வளரும் பொருட்கள்",
            "declining_demand": "குறையும் தேவை",
            "confidence_high": "அதிக நம்பிக்கை",
            "confidence_medium": "மிதமான நம்பிக்கை",
            "insufficient_data": "இந்த பகுதியில் நம்பகமான கணிப்பை உருவாக்க போதுமான ஆர்டர் தரவு இல்லை.",
            "market_unavailable": "சந்தை நுண்ணறிவு தற்போது கிடைக்கவில்லை.",

            // Dashboards & Statuses
            "status_placed": "பதிவு செய்யப்பட்டது",
            "status_confirmed": "உறுதி செய்யப்பட்டது",
            "status_assigned": "ஒதுக்கப்பட்டது",
            "status_picked_up": "எடுக்கப்பட்டது",
            "status_out_for_delivery": "டெலிவரியில் உள்ளது",
            "status_delivered": "டெலிவரி செய்யப்பட்டது",
            "total_products": "மொத்த பொருட்கள்",
            "pending_orders": "நிலுவையில் உள்ள ஆர்டர்கள்",
            "confirmed_orders": "உறுதிசெய்யப்பட்ட ஆர்டர்கள்",
            "delivered_orders": "டெலிவரி செய்யப்பட்ட ஆர்டர்கள்",
            "total_revenue": "மொத்த வருவாய்",
            "available_stock": "கிடைக்கும் இருப்பு",
            "unit_kg": "கிலோ",
            "unit_liter": "லிட்டர்",
            "unit_piece": "எண்ணிக்கை"
        },

        hi: {
            // Navigation & Header
            "nav_home": "होम",
            "nav_smart_journey": "स्मार्ट यात्रा",
            "nav_shop": "ग्राहक बाज़ार",
            "nav_farmer_portal": "किसान पोर्टल",
            "nav_delivery_app": "डिलीवरी ऐप",
            "nav_live_track": "लाइव ट्रैकिंग",
            "nav_cart": "कार्ट और ऑर्डर",
            "nav_analytics": "विश्लेषण",
            "nav_ai_assistant": "एआई सहायक",
            "role_switcher": "भूमिका बदलें:",
            "active_role": "सक्रिय भूमिका",

            // General & Common UI
            "btn_explore": "यात्रा देखें",
            "btn_go_shop": "बाज़ार जाएं",
            "btn_submit": "सबमिट करें",
            "btn_cancel": "रद्द करें",
            "btn_save": "सुरक्षित करें",
            "btn_add_cart": "कार्ट में जोड़ें",
            "btn_buy_now": "अभी खरीदें",
            "btn_accept": "ऑर्डर स्वीकार करें",
            "btn_confirm": "ऑर्डर की पुष्टि करें",
            "btn_assign": "डिलीवरी सौंपें",
            "btn_picked_up": "पिकअप मार्क करें",
            "btn_out_for_delivery": "डिलीवरी के लिए निकल गया",
            "btn_delivered": "डिलीवर मार्क करें",
            "btn_track": "लाइव स्थिति ट्रैक करें",
            "btn_try_now": "अभी आज़माएं",
            "btn_coming_soon": "जल्द आ रहा है",
            "btn_view_overview": "तमिलनाडु अवलोकन देखें",
            "btn_analyze_region": "क्षेत्र का विश्लेषण करें",

            // Smart Demand Prediction & Market Intelligence
            "market_intelligence": "बाज़ार जानकारी और मांग पूर्वानुमान",
            "select_region": "क्षेत्र / ज़िला चुनें",
            "all_districts": "सभी तमिलनाडु ज़िले",
            "your_region": "आपका क्षेत्र",
            "high_demand": "उच्च मांग",
            "medium_demand": "मध्यम मांग",
            "low_demand": "कम मांग",
            "predicted_demand": "अगले 7 दिनों की अनुमानित मांग",
            "current_supply": "वर्तमान आपूर्ति",
            "potential_shortage": "संभावित कमी",
            "recommendation": "Farmora सिफारिश",
            "trend_increasing": "मांग बढ़ रही है",
            "trend_stable": "स्थिर मांग",
            "trend_decreasing": "मांग घट रही है",
            "top_demand_products": "सर्वश्रेष्ठ मांग वाले उत्पाद",
            "fastest_growing": "तेज़ी से बढ़ते उत्पाद",
            "declining_demand": "घटती मांग",
            "confidence_high": "उच्च विश्वसनीयता",
            "confidence_medium": "मध्यम विश्वसनीयता",
            "insufficient_data": "इस क्षेत्र के लिए सटीक पूर्वानुमान बनाने हेतु पर्याप्त ऑर्डर डेटा उपलब्ध नहीं है।",
            "market_unavailable": "बाज़ार जानकारी वर्तमान में उपलब्ध नहीं है।",

            // Dashboards & Statuses
            "status_placed": "दर्ज किया गया",
            "status_confirmed": "पुष्टि की गई",
            "status_assigned": "सौंपा गया",
            "status_picked_up": "पिकअप किया गया",
            "status_out_for_delivery": "डिलीवरी पर",
            "status_delivered": "डिलीवर हुआ",
            "total_products": "कुल उत्पाद",
            "pending_orders": "लंबित ऑर्डर",
            "confirmed_orders": "पुष्ट ऑर्डर",
            "delivered_orders": "डिलीवर हुए ऑर्डर",
            "total_revenue": "कुल राजस्व",
            "available_stock": "उपलब्ध स्टॉक",
            "unit_kg": "किग्रा",
            "unit_liter": "लीटर",
            "unit_piece": "नग"
        }
    };

    window.TRANSLATIONS = translations;

    // Translation Function with Safe Multi-Level Fallback
    window.t = function(key, fallbackText = '') {
        const lang = localStorage.getItem('selectedLanguage') || 'en';
        if (translations[lang] && translations[lang][key]) {
            return translations[lang][key];
        }
        if (translations['en'] && translations['en'][key]) {
            return translations['en'][key];
        }
        return fallbackText || key;
    };

    // Apply Translations Dynamic DOM Traversal
    window.applyTranslations = function() {
        const lang = localStorage.getItem('selectedLanguage') || 'en';
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = window.t(key, el.textContent.trim());
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // Update active language selector dropdowns
        document.querySelectorAll('.lang-select-dropdown').forEach(sel => {
            sel.value = lang;
        });
    };

    // Change Language Handler
    window.setLanguage = function(lang) {
        if (!['en', 'ta', 'hi'].includes(lang)) lang = 'en';
        localStorage.setItem('selectedLanguage', lang);
        window.applyTranslations();
        if (window.showToast) {
            const labelMap = { en: 'English', ta: 'தமிழ் (Tamil)', hi: 'हिन्दी (Hindi)' };
            window.showToast(`Language changed to ${labelMap[lang]}`, 'info');
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.applyTranslations();
    });
})();
