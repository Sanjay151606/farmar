// Tamil Nadu Districts Data
const tamilNaduDistricts = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur',
    'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Thanjavur', 'Dindigul',
    'Cuddalore', 'Kanchipuram', 'Karur', 'Ramanathapuram', 'Sivaganga',
    'Virudhunagar', 'Tiruvannamalai', 'Villupuram', 'Pudukkottai', 'Nagapattinam',
    'Dharmapuri', 'Krishnagiri', 'Ariyalur', 'Perambalur', 'Theni', 'Nilgiris',
    'Namakkal', 'Tiruvallur', 'Kanyakumari', 'Tirupattur', 'Ranipet', 'Kallakurichi',
    'Tenkasi', 'Chengalpattu', 'Mayiladuthurai'
];

// Language Translations
const translations = {
    en: {
        logoText: "FARMORA",
        backText: "Back to Home",
        cardTitle: "Customer Registration",
        cardSubtitle: "Join FARMORA and connect directly with farmers",
        step1: "Personal Info",
        step2: "Address Details",
        step3: "Verification",
        personalInfoTitle: "Personal Information",
        nameLabel: "Full Name *",
        phoneLabel: "Phone Number *",
        emailLabel: "Email Address",
        addressDetailsTitle: "Address Details",
        addressLabel: "Address *",
        districtLabel: "District *",
        cityLabel: "City/Town *",
        pincodeLabel: "Pincode *",
        verificationTitle: "Verification",
        termsText: "I agree to the Terms of Service and Privacy Policy",
        prevBtnText: "Previous",
        nextBtnText: "Next",
        submitBtnText: "Register",
        otpTitle: "Verify Your Phone Number",
        otpSubtitle: "Enter the 6-digit OTP sent to your phone",
        resendText: "Resend OTP",
        verifyText: "Verify",
        // Farmer specific translations
        farmerCardTitle: "Farmer Registration",
        farmerCardSubtitle: "Join FARMORA and connect directly with consumers",
        farmerPersonalInfoTitle: "Personal Information",
        farmerFarmDetailsTitle: "Farm Details",
        farmerVerificationTitle: "Verification",
        farmerNameLabel: "Full Name *",
        farmerAadhaarLabel: "Aadhaar Number *",
        farmSizeLabel: "Farm Size (in acres) *",
        farmTypeLabel: "Farm Type *",
        cropsLabel: "What crops do you grow? *",
        farmPhotoLabel: "Farm Photo",
        farmPhotoText: "Click to upload farm photo",
        farmPhotoHint: "Optional but helps build trust",
        bankAccountLabel: "Bank Account Number",
        ifscLabel: "IFSC Code",
        farmTypeOrganic: "Organic",
        farmTypeTraditional: "Traditional",
        farmTypeMixed: "Mixed",
        cropRice: "Rice",
        cropWheat: "Wheat",
        cropTomato: "Tomato",
        cropOnion: "Onion",
        cropChili: "Chili",
        cropBanana: "Banana",
        cropCoconut: "Coconut",
        cropSugarcane: "Sugarcane"
    },
    ta: {
        logoText: "ஃபார்மோரா",
        backText: "முகப்புக்கு திரும்பு",
        cardTitle: "வாடிக்கையாளர் பதிவு",
        cardSubtitle: "ஃபார்மோராவில் சேர்ந்து விவசாயிகளுடன் நேரடியாக இணையுங்கள்",
        step1: "தனிப்பட்ட தகவல்",
        step2: "முகவரி விவரங்கள்",
        step3: "சரிபார்ப்பு",
        personalInfoTitle: "தனிப்பட்ட தகவல்கள்",
        nameLabel: "முழு பெயர் *",
        phoneLabel: "தொலைபேசி எண் *",
        emailLabel: "மின்னஞ்சல் முகவரி",
        addressDetailsTitle: "முகவரி விவரங்கள்",
        addressLabel: "முகவரி *",
        districtLabel: "மாவட்டம் *",
        cityLabel: "நகரம்/நகரம் *",
        pincodeLabel: "அஞ்சல் குறியீடு *",
        verificationTitle: "சரிபார்ப்பு",
        termsText: "நான் சேவை நிபந்தனைகள் மற்றும் தனியுரிமை கொள்கையை ஏற்கிறேன்",
        prevBtnText: "முந்தையது",
        nextBtnText: "அடுத்து",
        submitBtnText: "பதிவு செய்",
        otpTitle: "உங்கள் தொலைபேசி எண்ணை சரிபார்க்கவும்",
        otpSubtitle: "உங்கள் தொலைபேசிக்கு அனுப்பப்பட்ட 6-இலக்க OTP ஐ உள்ளிடவும்",
        resendText: "OTP மீண்டும் அனுப்பு",
        verifyText: "சரிபார்",
        // Farmer specific translations
        farmerCardTitle: "விவசாயி பதிவு",
        farmerCardSubtitle: "ஃபார்மோராவில் சேர்ந்து நுகர்வோருடன் நேரடியாக இணையுங்கள்",
        farmerPersonalInfoTitle: "தனிப்பட்ட தகவல்கள்",
        farmerFarmDetailsTitle: "பண்ணை விவரங்கள்",
        farmerVerificationTitle: "சரிபார்ப்பு",
        farmerNameLabel: "முழு பெயர் *",
        farmerAadhaarLabel: "ஆதார் எண் *",
        farmSizeLabel: "பண்ணையின் அளவு (ஏக்கரில்) *",
        farmTypeLabel: "பண்ணை வகை *",
        cropsLabel: "நீங்கள் என்ன பயிர்கள் வளர்க்கிறீர்கள்? *",
        farmPhotoLabel: "பண்ணை புகைப்படம்",
        farmPhotoText: "பண்ணை புகைப்படத்தை பதிவேற்ற கிளிக் செய்யவும்",
        farmPhotoHint: "விருப்பமானது ஆனால் நம்பிக்கையை உருவாக்க உதவுகிறது",
        bankAccountLabel: "வங்கி கணக்கு எண்",
        ifscLabel: "IFSC குறியீடு",
        farmTypeOrganic: "இயற்கை",
        farmTypeTraditional: "பாரம்பரிய",
        farmTypeMixed: "கலந்த",
        cropRice: "அரிசி",
        cropWheat: "கோதுமை",
        cropTomato: "தக்காளி",
        cropOnion: "வெங்காயம்",
        cropChili: "மிளகாய்",
        cropBanana: "வாழை",
        cropCoconut: "தென்னை",
        cropSugarcane: "கரும்பு"
    },
    hi: {
        logoText: "फार्मोरा",
        backText: "मुख्य पृष्ठ पर वापस",
        cardTitle: "ग्राहक पंजीकरण",
        cardSubtitle: "फार्मोरा में शामिल हों और किसानों से सीधे जुड़ें",
        step1: "व्यक्तिगत जानकारी",
        step2: "पता विवरण",
        step3: "सत्यापन",
        personalInfoTitle: "व्यक्तिगत जानकारी",
        nameLabel: "पूरा नाम *",
        phoneLabel: "फोन नंबर *",
        emailLabel: "ईमेल पता",
        addressDetailsTitle: "पता विवरण",
        addressLabel: "पता *",
        districtLabel: "जिला *",
        cityLabel: "शहर/कस्बा *",
        pincodeLabel: "पिनकोड *",
        verificationTitle: "सत्यापन",
        termsText: "मैं सेवा की शर्तों और गोपनीयता नीति से सहमत हूं",
        prevBtnText: "पिछला",
        nextBtnText: "अगला",
        submitBtnText: "पंजीकरण करें",
        otpTitle: "अपना फोन नंबर सत्यापित करें",
        otpSubtitle: "अपने फोन पर भेजा गया 6-अंकीय OTP दर्ज करें",
        resendText: "OTP दोबारा भेजें",
        verifyText: "सत्यापित करें",
        // Farmer specific translations
        farmerCardTitle: "किसान पंजीकरण",
        farmerCardSubtitle: "फार्मोरा में शामिल हों और उपभोक्ताओं से सीधे जुड़ें",
        farmerPersonalInfoTitle: "व्यक्तिगत जानकारी",
        farmerFarmDetailsTitle: "खेत विवरण",
        farmerVerificationTitle: "सत्यापन",
        farmerNameLabel: "पूरा नाम *",
        farmerAadhaarLabel: "आधार नंबर *",
        farmSizeLabel: "खेत का आकार (एकड़ में) *",
        farmTypeLabel: "खेत का प्रकार *",
        cropsLabel: "आप कौन सी फसलें उगाते हैं? *",
        farmPhotoLabel: "खेत की फोटो",
        farmPhotoText: "खेत की फोटो अपलोड करने के लिए क्लिक करें",
        farmPhotoHint: "वैकल्पिक लेकिन विश्वास बनाने में मदद करता है",
        bankAccountLabel: "बैंक खाता संख्या",
        ifscLabel: "IFSC कोड",
        farmTypeOrganic: "जैविक",
        farmTypeTraditional: "पारंपरिक",
        farmTypeMixed: "मिश्रित",
        cropRice: "चावल",
        cropWheat: "गेहूं",
        cropTomato: "टमाटर",
        cropOnion: "प्याज",
        cropChili: "मिर्च",
        cropBanana: "केला",
        cropCoconut: "नारियल",
        cropSugarcane: "गन्ना"
    }
};

// Global Variables
let currentStep = 1;
let isVoiceRecording = false;
let recognition;

// Initialize Web Speech API
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
}

// Language Functions
function loadSavedLanguage(pageType) {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    document.getElementById('languageSelect').value = savedLang;
    changeLanguage(pageType);
}

function changeLanguage(pageType) {
    const selectedLang = document.getElementById('languageSelect').value;
    const translation = translations[selectedLang];

    Object.keys(translation).forEach((key) => {
        const element = document.getElementById(key);
        if (element) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                const placeholderKey = `${key}Placeholder`;
                element.placeholder = translation[placeholderKey] || element.placeholder;
            } else {
                element.textContent = translation[key];
            }
        }
    });

    if (pageType === 'farmer') {
        const farmerSpecificTranslations = translations[selectedLang];
        document.getElementById('cardTitle').textContent = farmerSpecificTranslations.farmerCardTitle;
        document.getElementById('cardSubtitle').textContent = farmerSpecificTranslations.farmerCardSubtitle;
        document.getElementById('personalInfoTitle').textContent = farmerSpecificTranslations.farmerPersonalInfoTitle;
        document.getElementById('farmDetailsTitle').textContent = farmerSpecificTranslations.farmerFarmDetailsTitle;
        document.getElementById('verificationTitle').textContent = farmerSpecificTranslations.farmerVerificationTitle;
        document.getElementById('nameLabel').textContent = farmerSpecificTranslations.farmerNameLabel;
        document.getElementById('aadhaarLabel').textContent = farmerSpecificTranslations.farmerAadhaarLabel;
        document.getElementById('farmSizeLabel').textContent = farmerSpecificTranslations.farmSizeLabel;
        document.getElementById('farmTypeLabel').textContent = farmerSpecificTranslations.farmTypeLabel;
        document.getElementById('cropsLabel').textContent = farmerSpecificTranslations.cropsLabel;
        document.getElementById('farmPhotoLabel').textContent = farmerSpecificTranslations.farmPhotoLabel;
        document.getElementById('farmPhotoText').textContent = farmerSpecificTranslations.farmPhotoText;
        document.getElementById('farmPhotoHint').textContent = farmerSpecificTranslations.farmPhotoHint;
        document.getElementById('bankAccountLabel').textContent = farmerSpecificTranslations.bankAccountLabel;
        document.getElementById('ifscLabel').textContent = farmerSpecificTranslations.ifscLabel;
        document.getElementById('farmTypeOrganic').textContent = farmerSpecificTranslations.farmTypeOrganic;
        document.getElementById('farmTypeTraditional').textContent = farmerSpecificTranslations.farmTypeTraditional;
        document.getElementById('farmTypeMixed').textContent = farmerSpecificTranslations.farmTypeMixed;
        document.getElementById('cropRice').textContent = farmerSpecificTranslations.cropRice;
        document.getElementById('cropWheat').textContent = farmerSpecificTranslations.cropWheat;
        document.getElementById('cropTomato').textContent = farmerSpecificTranslations.cropTomato;
        document.getElementById('cropOnion').textContent = farmerSpecificTranslations.cropOnion;
        document.getElementById('cropChili').textContent = farmerSpecificTranslations.cropChili;
        document.getElementById('cropBanana').textContent = farmerSpecificTranslations.cropBanana;
        document.getElementById('cropCoconut').textContent = farmerSpecificTranslations.cropCoconut;
        document.getElementById('cropSugarcane').textContent = farmerSpecificTranslations.cropSugarcane;
    } else {
        const consumerSpecificTranslations = translations[selectedLang];
        document.getElementById('cardTitle').textContent = consumerSpecificTranslations.cardTitle;
        document.getElementById('cardSubtitle').textContent = consumerSpecificTranslations.cardSubtitle;
        document.getElementById('personalInfoTitle').textContent = consumerSpecificTranslations.personalInfoTitle;
        document.getElementById('addressDetailsTitle').textContent = consumerSpecificTranslations.addressDetailsTitle;
        document.getElementById('verificationTitle').textContent = consumerSpecificTranslations.verificationTitle;
        document.getElementById('nameLabel').textContent = consumerSpecificTranslations.nameLabel;
        document.getElementById('phoneLabel').textContent = consumerSpecificTranslations.phoneLabel;
        document.getElementById('emailLabel').textContent = consumerSpecificTranslations.emailLabel;
        document.getElementById('addressLabel').textContent = consumerSpecificTranslations.addressLabel;
        document.getElementById('districtLabel').textContent = consumerSpecificTranslations.districtLabel;
        document.getElementById('cityLabel').textContent = consumerSpecificTranslations.cityLabel;
        document.getElementById('pincodeLabel').textContent = consumerSpecificTranslations.pincodeLabel;
        document.getElementById('termsText').textContent = consumerSpecificTranslations.termsText;
    }

    if (recognition) {
        recognition.lang = selectedLang === 'ta' ? 'ta-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
    }
    localStorage.setItem('preferredLanguage', selectedLang);
}

// Step Navigation Functions
function changeStep(direction, validateFn) {
    if (direction === 1 && validateFn && !validateFn()) {
        return;
    }
    const currentFormStep = document.getElementById(`formStep${currentStep}`);
    if (currentFormStep) {
        currentFormStep.style.display = 'none';
    }
    currentStep += direction;
    const newStep = document.getElementById(`formStep${currentStep}`);
    if (newStep) {
        newStep.style.display = 'block';
        newStep.classList.remove('slide-up');
        void newStep.offsetWidth;
        newStep.classList.add('slide-up');
    }
    updateProgress();
    updateNavigationButtons();
}

function updateProgress() {
    const progressPercentage = ((currentStep - 1) / 2) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progressPercentage + '%';
    }
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.toggle('active', index < currentStep);
    });
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    if (prevBtn) {
        prevBtn.style.display = currentStep > 1 ? 'flex' : 'none';
    }
    if (nextBtn) {
        nextBtn.style.display = currentStep < 3 ? 'flex' : 'none';
    }
    if (submitBtn) {
        submitBtn.style.display = currentStep === 3 ? 'flex' : 'none';
    }
}

// Utility functions for validation
function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    const inputElement = errorElement.previousElementSibling;
    errorElement.style.display = 'flex';
    errorElement.querySelector('span').textContent = message;
    if (inputElement) {
        inputElement.classList.add('error');
        inputElement.classList.remove('success');
    }
}

function hideError(errorId) {
    const errorElement = document.getElementById(errorId);
    const inputElement = errorElement.previousElementSibling;
    errorElement.style.display = 'none';
    if (inputElement) {
        inputElement.classList.remove('error');
        inputElement.classList.add('success');
    }
}

// District Search Setup
function setupDistrictSearch() {
    const districtInput = document.getElementById('district');
    const dropdown = document.getElementById('districtDropdown');
    if (districtInput && dropdown) {
        districtInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            const filtered = tamilNaduDistricts.filter(district =>
                district.toLowerCase().includes(query)
            );
            showDistrictDropdown(filtered);
        });
        districtInput.addEventListener('focus', function () {
            showDistrictDropdown(tamilNaduDistricts);
        });
        document.addEventListener('click', function (e) {
            if (!districtInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
}

function showDistrictDropdown(districts) {
    const dropdown = document.getElementById('districtDropdown');
    if (dropdown) {
        dropdown.innerHTML = '';
        districts.forEach(district => {
            const option = document.createElement('div');
            option.className = 'district-option';
            option.textContent = district;
            option.onclick = () => selectDistrict(district);
            dropdown.appendChild(option);
        });
        dropdown.style.display = districts.length > 0 ? 'block' : 'none';
    }
}

function selectDistrict(district) {
    const districtInput = document.getElementById('district');
    const dropdown = document.getElementById('districtDropdown');
    if (districtInput && dropdown) {
        districtInput.value = district;
        dropdown.style.display = 'none';
        hideError('districtError');
    }
}

// Voice Input Functions
function startVoiceInput(inputId) {
    if (!recognition) {
        alert('Voice input not supported in your browser');
        return;
    }
    const voiceBtn = event.target.closest('.voice-btn');
    const inputElement = document.getElementById(inputId);
    if (isVoiceRecording) {
        recognition.stop();
        return;
    }
    isVoiceRecording = true;
    if (voiceBtn) {
        voiceBtn.classList.add('recording');
    }
    recognition.onstart = function () {
        if (inputElement) {
            inputElement.placeholder = 'Listening...';
        }
    };
    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        if (inputElement) {
            inputElement.value = transcript;
            inputElement.dispatchEvent(new Event('input'));
        }
    };
    recognition.onerror = function (event) {
        console.error('Speech recognition error:', event.error);
        if (inputElement) {
            inputElement.placeholder = 'Voice input failed, please try again';
        }
    };
    recognition.onend = function () {
        isVoiceRecording = false;
        if (voiceBtn) {
            voiceBtn.classList.remove('recording');
        }
        if (inputElement) {
            inputElement.placeholder = '';
        }
    };
    recognition.start();
}

// OTP Inputs Setup
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function () {
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
}

// Ripple effect on buttons
function setupRippleEffects() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Crop selection toggle function
function toggleCrop(cropName) {
    const checkbox = document.getElementById(`crop_${cropName}`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        const cropCard = checkbox.closest('.crop-item');
        if (cropCard) {
            cropCard.classList.toggle('selected', checkbox.checked);
        }
    }
}

// File upload setup function
function setupFileUpload() {
    const fileInput = document.getElementById('farmPhoto');
    const hint = document.getElementById('farmPhotoText');
    if (fileInput && hint) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                hint.textContent = `Selected: ${this.files[0].name}`;
            }
        });
    }
}

