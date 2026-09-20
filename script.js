// ==========================================
// XANTER MP3 - MSIMBO KAMILI WA JAVASCRIPT
// ==========================================

let usersList = JSON.parse(localStorage.getItem('xanter_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('xanter_current_user')) || null;

// Elementi za Popup na Player kutoka kwenye HTML yako
const genericPopupModal = document.getElementById('genericPopupModal');
const popupTitle = document.getElementById('popupTitle');
const popupBodyContent = document.getElementById('popupBodyContent');

// 1. Kazi ya kufunga Popup
function closePopup() {
    if (genericPopupModal) {
        genericPopupModal.style.display = 'none';
    }
}

// 2. Kazi ya kupandisha mafaili kwenda Cloudinary
async function uploadToCloudinary(file, type = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Badilisha preset yako kama ni tofauti

    const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', { // Badilisha 'demo' kuwa cloud name yako kama unatumia halisi
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    if (data.secure_url) {
        return data.secure_url;
    } else {
        throw new Error('Imeshindikana kupandisha faili kwenda Cloudinary.');
    }
}

// 3. Kazi ya kucheza wimbo na Auto-Play
function playSong(songData) {
    let audioElement = document.getElementById('mainAudioPlayer'); 
    
    if (!audioElement) {
        audioElement = document.createElement('audio');
        audioElement.id = 'mainAudioPlayer';
        document.body.appendChild(audioElement);
    }

    // Weka kiungo cha wimbo
    audioElement.src = songData.url || songData.fileUrl;
    
    // Anza kucheza wimbo moja kwa moja (Auto-Play)
    audioElement.play().then(() => {
        console.log("Wimbo umeanza kucheza kiotomatiki.");
    }).catch(error => {
        console.log("Auto-play imezuiwa na kivinjari hadi mtumiaji aguse ukurasa:", error);
    });

    // Sasisha mwonekano wa player kama ipo kazi hiyo kwenye mfumo wako
    if (typeof updatePlayerUI === 'function') {
        updatePlayerUI(songData);
    }
}

// 4. Kazi ya Kuingia kwenye Akaunti (Login Modal)
function openLoginModal() {
    popupTitle.textContent = "Login to Your Account";
    popupBodyContent.innerHTML = `
        <div class="upload-form-group">
            <label>Email Address</label>
            <input type="email" id="loginEmail" placeholder="Enter your email...">
        </div>
        <div class="upload-form-group">
            <label>Password</label>
            <input type="password" id="loginPassword" placeholder="Enter your password...">
        </div>
        <button class="btn-save-upload" id="submitLoginBtn">Login</button>
        <div class="auth-switch-text">Don't have an account? <span id="switchToSignup" style="color: var(--accent-red); cursor: pointer; font-weight: bold;">Sign Up</span></div>
    `;
    genericPopupModal.style.display = 'flex';

    document.getElementById('submitLoginBtn').addEventListener('click', () => {
        const emailVal = document.getElementById('loginEmail').value.trim().toLowerCase();
        const passVal = document.getElementById('loginPassword').value.trim();

        const foundUser = usersList.find(u => u.email === emailVal && u.password === passVal);
        if (foundUser) {
            currentUser = foundUser;
            localStorage.setItem('xanter_current_user', JSON.stringify(currentUser));
            alert('Umeingia kwenye akaunti kwa mafanikio!');
            closePopup();
            openProfileModal();
        } else {
            alert('Barua pepe au neno la siri si sahihi!');
        }
    });

    document.getElementById('switchToSignup').addEventListener('click', () => {
        openSignupModal();
    });
}

// 5. Kazi ya Kujisajili (Signup Modal) na Jina, Email, Nchi na Picha ya Profaili
function openSignupModal() {
    popupTitle.textContent = "Create an Account (Sign Up)";
    popupBodyContent.innerHTML = `
        <div class="upload-form-group">
            <label>Full Name</label>
            <input type="text" id="signupName" placeholder="Enter your full name...">
        </div>
        <div class="upload-form-group">
            <label>Email Address</label>
            <input type="email" id="signupEmail" placeholder="Enter your email...">
        </div>
        <div class="upload-form-group">
            <label>Country</label>
            <input type="text" id="signupCountry" placeholder="Enter your country (e.g. Tanzania)...">
        </div>
        <div class="upload-form-group">
            <label>Profile Picture</label>
            <input type="file" id="signupAvatarFile" accept="image/*">
        </div>
        <div class="upload-form-group">
            <label>Password</label>
            <input type="password" id="signupPassword" placeholder="Choose a password...">
        </div>
        <button class="btn-save-upload" id="submitSignupBtn">Sign Up</button>
        <div id="signupProgressText" style="text-align: center; font-size: 11px; color: var(--accent-red); display: none; margin-top: 5px;">Creating account, please wait...</div>
        <div class="auth-switch-text">Already have an account? <span id="switchToLogin" style="color: var(--accent-red); cursor: pointer; font-weight: bold;">Login</span></div>
    `;
    genericPopupModal.style.display = 'flex';

    document.getElementById('submitSignupBtn').addEventListener('click', async () => {
        const nameVal = document.getElementById('signupName').value.trim();
        const emailVal = document.getElementById('signupEmail').value.trim().toLowerCase();
        const countryVal = document.getElementById('signupCountry').value.trim();
        const passVal = document.getElementById('signupPassword').value.trim();
        const avatarInput = document.getElementById('signupAvatarFile');
        const progressText = document.getElementById('signupProgressText');
        const submitBtn = document.getElementById('submitSignupBtn');

        if (!nameVal || !emailVal || !countryVal || !passVal) {
            alert('Tafadhali jaza sehemu zote zinazohitajika!');
            return;
        }

        if (!emailVal.includes('@') || !emailVal.includes('.')) {
            alert('Tafadhali ingiza barua pepe (email) sahihi!');
            return;
        }

        if (usersList.some(x => x.email === emailVal)) {
            alert('Barua pepe hii imeshajisajili tayari! Tafadhali ingia (Login).');
            return;
        }

        progressText.style.display = 'block';
        submitBtn.disabled = true;

        try {
            let avatarUrl = 'https://picsum.photos/seed/' + encodeURIComponent(emailVal) + '/300';
            if (avatarInput.files.length > 0) {
                avatarUrl = await uploadToCloudinary(avatarInput.files[0], 'image');
            }

            const newUser = { 
                name: nameVal, 
                email: emailVal, 
                country: countryVal, 
                avatar: avatarUrl, 
                password: passVal 
            };
            
            usersList.push(newUser);
            localStorage.setItem('xanter_users', JSON.stringify(usersList));

            currentUser = newUser;
            localStorage.setItem('xanter_current_user', JSON.stringify(currentUser));

            alert('Akaunti imetengenezwa na umezamia kwa mafanikio!');
            closePopup();
            openProfileModal();
        } catch (error) {
            console.error(error);
            alert('Kosa limetokea wakati wa kujisajili: ' + error.message);
        } finally {
            progressText.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    document.getElementById('switchToLogin').addEventListener('click', () => {
        openLoginModal();
    });
}

// 6. Kazi ya Kuangalia Profaili ya Mtumiaji
function openProfileModal() {
    if (!currentUser) {
        openLoginModal();
        return;
    }

    popupTitle.textContent = "My Profile";
    popupBodyContent.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 5px;">
            <img src="${currentUser.avatar || 'https://picsum.photos/seed/user/300'}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">
            <div style="overflow: hidden;">
                <h4 style="font-size: 15px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700;">${currentUser.name}</h4>
                <p class="email-text" style="font-size: 11px; color: var(--text-muted);">${currentUser.email}</p>
                <p style="font-size: 10px; color: var(--accent-red); margin-top: 2px;"><i class="fa-solid fa-location-dot"></i> ${currentUser.country}</p>
            </div>
        </div>

        <div class="popup-option-item" onclick="openSubSectionList('downloads')">
            <div style="display: flex; align-items: center; gap: 12px;"><i class="fa-solid fa-download" style="color: #f59e0b; font-size: 16px;"></i> Downloads</div>
            <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: var(--text-muted);"></i>
        </div>

        <div class="popup-option-item" onclick="openSubSectionList('playlists')">
            <div style="display: flex; align-items: center; gap: 12px;"><i class="fa-solid fa-list-ul" style="color: #3b82f6; font-size: 16px;"></i> Playlists</div>
            <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: var(--text-muted);"></i>
        </div>

        <div class="popup-option-item" onclick="openSubSectionList('uploads')">
            <div style="display: flex; align-items: center; gap: 12px;"><i class="fa-solid fa-cloud-arrow-up" style="color: #10b981; font-size: 16px;"></i> Uploads</div>
            <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: var(--text-muted);"></i>
        </div>

        <button class="btn-save-upload" id="logoutBtn" style="background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px solid var(--border-color); margin-top: 15px;">Logout</button>
    `;
    genericPopupModal.style.display = 'flex';

    document.getElementById('logoutBtn').addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('xanter_current_user');
        alert('Umetoka kwenye akaunti kwa mafanikio!');
        closePopup();
    });
}
