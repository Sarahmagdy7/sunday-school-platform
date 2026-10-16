"use strict";

// ========================================
// إعدادات الملف الشخصي
// ========================================

const PROFILE_STORAGE_KEY = "sundaySchoolProfile_v1";
const LOGIN_EMAIL_KEY = "sundaySchoolCurrentUserEmail";

// عناصر الصفحة
const profileForm = document.getElementById("profileForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const serviceInput = document.getElementById("service");
const bioInput = document.getElementById("bio");

const profileMessage = document.getElementById("profileMessage");
const resetFormBtn = document.getElementById("resetFormBtn");

const profileAvatar = document.getElementById("profileAvatar");
const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");

const sidebarAvatar = document.getElementById("sidebarAvatar");
const sidebarName = document.getElementById("sidebarName");

// البيانات الافتراضية
function getDefaultProfile() {
    let loginEmail = "";

    try {
        loginEmail = localStorage.getItem(LOGIN_EMAIL_KEY) || "";
    } catch (error) {
        console.warn("تعذر قراءة البريد التجريبي.", error);
    }

    return {
        fullName: "مدرس الفصل",
        email: loginEmail,
        phone: "",
        service: "",
        bio: ""
    };
}

// ========================================
// قراءة البيانات المحفوظة
// ========================================

function loadProfile() {
    const defaultProfile = getDefaultProfile();

    try {
        const savedData = localStorage.getItem(PROFILE_STORAGE_KEY);

        if (!savedData) {
            return defaultProfile;
        }

        const parsedData = JSON.parse(savedData);

        if (!parsedData || typeof parsedData !== "object") {
            return defaultProfile;
        }

        return {
            ...defaultProfile,
            ...parsedData
        };

    } catch (error) {
        console.error("تعذر تحميل الملف الشخصي:", error);
        return defaultProfile;
    }
}

let profile = loadProfile();

// ========================================
// إظهار رسالة
// ========================================

function showMessage(message, type = "success") {
    profileMessage.textContent = message;

    profileMessage.className =
        "message-box show " + type;
}

// ========================================
// الحرف المستخدم في الصورة الشخصية
// ========================================

function getInitial(name) {
    const cleanName = String(name || "").trim();

    return cleanName ? cleanName.charAt(0) : "م";
}

// ========================================
// عرض البيانات داخل الصفحة
// ========================================

function renderProfile() {
    fullNameInput.value = profile.fullName || "";
    emailInput.value = profile.email || "";
    phoneInput.value = profile.phone || "";
    serviceInput.value = profile.service || "";
    bioInput.value = profile.bio || "";

    const name = profile.fullName || "مدرس الفصل";
    const email = profile.email || "لم يتم تحديد البريد الإلكتروني";
    const initial = getInitial(name);

    displayName.textContent = name;
    displayEmail.textContent = email;

    profileAvatar.textContent = initial;
    sidebarAvatar.textContent = initial;
    sidebarName.textContent = name;
}

// ========================================
// حفظ البيانات
// ========================================

function saveProfile(event) {
    event.preventDefault();

    const newProfile = {
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        service: serviceInput.value.trim(),
        bio: bioInput.value.trim()
    };

    if (!newProfile.fullName) {
        showMessage("من فضلك اكتبي الاسم بالكامل.", "error");
        fullNameInput.focus();
        return;
    }

    if (!newProfile.email) {
        showMessage("من فضلك اكتبي البريد الإلكتروني.", "error");
        emailInput.focus();
        return;
    }

    // الاحتفاظ بنسخة احتياطية
    const previousProfile = { ...profile };

    profile = newProfile;

    try {
        localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify(profile)
        );

        renderProfile();

        showMessage("تم حفظ بيانات الملف الشخصي بنجاح.");

    } catch (error) {
        profile = previousProfile;

        console.error("تعذر حفظ الملف الشخصي:", error);

        showMessage(
            "تعذر حفظ التغييرات في المتصفح. حاولي مرة أخرى.",
            "error"
        );

        renderProfile();
    }
}

// ========================================
// إلغاء التعديلات غير المحفوظة
// ========================================

function resetUnsavedChanges() {
    renderProfile();

    profileMessage.textContent = "";
    profileMessage.className = "message-box";
}

// ========================================
// أحداث الصفحة
// ========================================

profileForm.addEventListener("submit", saveProfile);

resetFormBtn.addEventListener("click", resetUnsavedChanges);

// تشغيل الصفحة
renderProfile();