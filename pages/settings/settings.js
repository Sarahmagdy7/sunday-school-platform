"use strict";

// ========================================
// إعدادات التخزين
// ========================================

const SETTINGS_KEY = "sundaySchoolSettings_v1";

const DEFAULT_SETTINGS = {
    churchName: "",
    serviceName: "خدمة مدارس الأحد",
    serviceDescription: "",

    displayName: "",
    userRole: "teacher",

    themeColor: "green",
    themeMode: "light",

    // للتوافق مع الإعدادات القديمة
    theme: "light",

    fontSize: "normal",
    defaultPage: "dashboard",

    attendanceNotifications: true,
    activityNotifications: true,
    preparationNotifications: true
};

const COLOR_NAMES = {
    green: "الأخضر الهادئ",
    blue: "الأزرق",
    purple: "البنفسجي",
    pink: "الوردي",
    orange: "البرتقالي"
};

const MODE_NAMES = {
    light: "الفاتح",
    dark: "الداكن"
};

let toastTimer = null;


// ========================================
// عناصر الصفحة
// ========================================

const settingsForm = document.getElementById("settingsForm");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const churchName = document.getElementById("churchName");
const serviceName = document.getElementById("serviceName");
const serviceDescription = document.getElementById("serviceDescription");

const displayName = document.getElementById("displayName");
const userRole = document.getElementById("userRole");

const colorThemeSelect = document.getElementById("colorThemeSelect");
const themeModeSelect = document.getElementById("themeModeSelect");

const fontSizeSelect = document.getElementById("fontSize");
const defaultPageSelect = document.getElementById("defaultPage");

const attendanceNotifications =
    document.getElementById("attendanceNotifications");

const activityNotifications =
    document.getElementById("activityNotifications");

const preparationNotifications =
    document.getElementById("preparationNotifications");

const themePreviewText = document.getElementById("themePreviewText");
const fontPreview = document.getElementById("fontPreview");

const toast = document.getElementById("toast");


// ========================================
// التحقق من عناصر الصفحة
// ========================================

function checkRequiredElements() {
    const requiredElements = {
        settingsForm,
        resetSettingsBtn,
        colorThemeSelect,
        themeModeSelect,
        fontSizeSelect,
        toast
    };

    const missingElements = Object.entries(requiredElements)
        .filter(function ([name, element]) {
            return !element;
        })
        .map(function ([name]) {
            return name;
        });

    if (missingElements.length > 0) {
        console.error(
            "بعض عناصر صفحة الإعدادات غير موجودة:",
            missingElements
        );

        return false;
    }

    return true;
}


// ========================================
// قراءة الإعدادات المحفوظة
// ========================================

function loadSettings() {
    try {
        const savedData = localStorage.getItem(SETTINGS_KEY);

        if (!savedData) {
            return { ...DEFAULT_SETTINGS };
        }

        const parsed = JSON.parse(savedData);

        if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            return { ...DEFAULT_SETTINGS };
        }

        let themeColor = parsed.themeColor;

        const validColors = [
            "green",
            "blue",
            "purple",
            "pink",
            "orange"
        ];

        // الحفاظ على اللون القديم إن كان محفوظًا في theme
        if (!validColors.includes(themeColor)) {
            themeColor = validColors.includes(parsed.theme)
                ? parsed.theme
                : "green";
        }

        let themeMode = parsed.themeMode;

        if (themeMode !== "light" && themeMode !== "dark") {
            themeMode = parsed.theme === "dark"
                ? "dark"
                : "light";
        }

        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            themeColor,
            themeMode,
            theme: themeMode,
            fontSize: parsed.fontSize === "large"
                ? "large"
                : "normal"
        };

    } catch (error) {
        console.error("خطأ أثناء قراءة الإعدادات:", error);

        return { ...DEFAULT_SETTINGS };
    }
}


// ========================================
// تطبيق المظهر
// ========================================

function applyAppearance() {
    const color = colorThemeSelect.value;
    const mode = themeModeSelect.value;
    const fontSize = fontSizeSelect.value;

    document.documentElement.setAttribute(
        "data-color-theme",
        color
    );

    document.documentElement.setAttribute(
        "data-theme-mode",
        mode
    );

    document.body.setAttribute(
        "data-color-theme",
        color
    );

    document.body.setAttribute(
        "data-theme",
        mode
    );

    document.body.classList.toggle(
        "large-text",
        fontSize === "large"
    );

    updateAppearancePreview();
}


// ========================================
// معاينة المظهر
// ========================================

function updateAppearancePreview() {
    const colorName =
        COLOR_NAMES[colorThemeSelect.value] || "الأخضر الهادئ";

    const modeName =
        MODE_NAMES[themeModeSelect.value] || "الفاتح";

    if (themePreviewText) {
        themePreviewText.textContent =
            "اللون " + colorName + " مع الوضع " + modeName + ".";
    }

    if (fontPreview) {
        fontPreview.textContent =
            fontSizeSelect.value === "large"
                ? "خط كبير"
                : "خط عادي";
    }
}


// ========================================
// تعبئة النموذج بالإعدادات المحفوظة
// ========================================

function fillSettingsForm(settings) {
    churchName.value = settings.churchName || "";

    serviceName.value =
        settings.serviceName || "خدمة مدارس الأحد";

    serviceDescription.value =
        settings.serviceDescription || "";

    displayName.value = settings.displayName || "";

    userRole.value = settings.userRole || "teacher";

    colorThemeSelect.value =
        settings.themeColor || "green";

    themeModeSelect.value =
        settings.themeMode || "light";

    fontSizeSelect.value =
        settings.fontSize || "normal";

    defaultPageSelect.value =
        settings.defaultPage || "dashboard";

    // التحقق من وجود خيارات التنبيهات قبل استخدامها

    if (attendanceNotifications) {
        attendanceNotifications.checked =
            settings.attendanceNotifications !== false;
    }

    if (activityNotifications) {
        activityNotifications.checked =
            settings.activityNotifications !== false;
    }

    if (preparationNotifications) {
        preparationNotifications.checked =
            settings.preparationNotifications !== false;
    }

    applyAppearance();
}


// ========================================
// جمع بيانات النموذج قبل الحفظ
// ========================================

function getSettingsFromForm() {
    const previousSettings = loadSettings();

    return {
        churchName: churchName.value.trim(),

        serviceName: serviceName.value.trim(),

        serviceDescription: serviceDescription.value.trim(),

        displayName: displayName.value.trim(),

        userRole: userRole.value,

        themeColor: colorThemeSelect.value,

        themeMode: themeModeSelect.value,

        // للتوافق مع الإعدادات القديمة
        theme: themeModeSelect.value,

        fontSize: fontSizeSelect.value,

        defaultPage: defaultPageSelect.value,

        // لو عناصر التنبيهات غير موجودة، نحافظ على قيمها المحفوظة

        attendanceNotifications: attendanceNotifications
            ? attendanceNotifications.checked
            : previousSettings.attendanceNotifications,

        activityNotifications: activityNotifications
            ? activityNotifications.checked
            : previousSettings.activityNotifications,

        preparationNotifications: preparationNotifications
            ? preparationNotifications.checked
            : previousSettings.preparationNotifications
    };
}
// ========================================
// حفظ الإعدادات
// ========================================

function saveSettings(settings) {
    try {
        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(settings)
        );

        return true;

    } catch (error) {
        console.error("خطأ أثناء حفظ الإعدادات:", error);

        showToast(
            "تعذر الحفظ. تحققي من إعدادات المتصفح."
        );

        return false;
    }
}


// ========================================
// رسالة التأكيد
// ========================================

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}


// ========================================
// زر حفظ الإعدادات
// ========================================

function handleSaveSettings(event) {
    event.preventDefault();

    const settings = getSettingsFromForm();

    if (!settings.serviceName) {
        showToast("من فضلك اكتبي اسم الخدمة.");
        serviceName.focus();
        return;
    }

    const saved = saveSettings(settings);

    if (!saved) {
        return;
    }

    applyAppearance();

    showToast("✅ تم حفظ الإعدادات بنجاح.");
}


// ========================================
// زر إعادة الإعدادات الافتراضية
// ========================================

function handleResetSettings() {
    const confirmed = confirm(
        "هل تريدين إعادة جميع الإعدادات إلى الوضع الافتراضي؟"
    );

    if (!confirmed) {
        return;
    }

    const settings = { ...DEFAULT_SETTINGS };

    const saved = saveSettings(settings);

    if (!saved) {
        return;
    }

    fillSettingsForm(settings);

    showToast("✅ تمت إعادة الإعدادات الافتراضية.");
}


// ========================================
// تشغيل الصفحة
// ========================================

function initializeSettingsPage() {
    if (!checkRequiredElements()) {
        showToast("يوجد خطأ في عناصر الصفحة. راجعي Console.");
        return;
    }

    const settings = loadSettings();

    fillSettingsForm(settings);

    settingsForm.addEventListener(
        "submit",
        handleSaveSettings
    );

    resetSettingsBtn.addEventListener(
        "click",
        handleResetSettings
    );

    colorThemeSelect.addEventListener(
        "change",
        applyAppearance
    );

    themeModeSelect.addEventListener(
        "change",
        applyAppearance
    );

    fontSizeSelect.addEventListener(
        "change",
        applyAppearance
    );
}

initializeSettingsPage();