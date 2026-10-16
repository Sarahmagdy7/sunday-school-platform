"use strict";

/*
 * الملف المسؤول عن تطبيق إعدادات المظهر العامة
 * عند فتح صفحات منصة مدارس الأحد.
 */

(function () {

    const SETTINGS_KEY = "sundaySchoolSettings_v1";

    const AVAILABLE_COLORS = [
        "green",
        "blue",
        "purple",
        "pink",
        "orange"
    ];

    const AVAILABLE_MODES = [
        "light",
        "dark"
    ];


    // ========================================
    // قراءة الإعدادات من المتصفح
    // ========================================

    function readSettings() {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);

            if (!stored) {
                return {};
            }

            const parsed = JSON.parse(stored);

            if (
                !parsed ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                return {};
            }

            return parsed;

        } catch (error) {
            console.error("تعذر قراءة إعدادات المظهر:", error);

            return {};
        }
    }


    // ========================================
    // تحديد اللون والوضع
    // ========================================

    function getAppearanceSettings(settings) {

        let color = settings.themeColor;

        /*
         * دعم الإعدادات القديمة التي كانت تستخدم theme
         * لتخزين اللون أو الوضع.
         */

        if (!AVAILABLE_COLORS.includes(color)) {

            if (AVAILABLE_COLORS.includes(settings.theme)) {
                color = settings.theme;
            } else {
                color = "green";
            }
        }

        let mode = settings.themeMode;

        if (!AVAILABLE_MODES.includes(mode)) {

            mode =
                settings.theme === "dark"
                    ? "dark"
                    : "light";
        }

        const fontSize =
            settings.fontSize === "large"
                ? "large"
                : "normal";

        return {
            color: color,
            mode: mode,
            fontSize: fontSize
        };
    }


    // ========================================
    // تطبيق المظهر على الصفحة
    // ========================================

    function applyTheme() {

        const settings = readSettings();

        const appearance = getAppearanceSettings(settings);

        const root = document.documentElement;

        root.setAttribute(
            "data-color-theme",
            appearance.color
        );

        root.setAttribute(
            "data-theme-mode",
            appearance.mode
        );

        /*
         * خصائص إضافية للتوافق مع بعض ملفات
         * CSS القديمة في المشروع.
         */

        if (document.body) {

            document.body.setAttribute(
                "data-color-theme",
                appearance.color
            );

            document.body.setAttribute(
                "data-theme",
                appearance.mode
            );

            document.body.classList.toggle(
                "large-text",
                appearance.fontSize === "large"
            );
        }
    }


    // ========================================
    // تشغيل المظهر
    // ========================================

    applyTheme();


    /*
     * لو تغيّرت الإعدادات في تبويب آخر
     * من نفس المتصفح، تُطبّق عند وصول حدث التخزين.
     */

    window.addEventListener("storage", function (event) {

        if (event.key === SETTINGS_KEY) {
            applyTheme();
        }

    });

})();