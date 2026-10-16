"use strict";

const registerForm = document.getElementById("registerForm");

const fullNameInput = document.getElementById("fullName");
const registerEmailInput = document.getElementById("registerEmail");
const phoneInput = document.getElementById("phone");

const registerPasswordInput = document.getElementById(
    "registerPassword"
);

const confirmPasswordInput = document.getElementById(
    "confirmPassword"
);

const registerMessage = document.getElementById("registerMessage");

const REQUESTS_KEY = "sundaySchoolRegistrationRequests_v1";

// إظهار وإخفاء كلمات المرور
document.querySelectorAll("[data-toggle-password]").forEach(
    function (button) {
        button.addEventListener("click", function () {
            const inputId = button.dataset.togglePassword;

            const passwordInput = document.getElementById(inputId);

            const hidden = passwordInput.type === "password";

            passwordInput.type = hidden ? "text" : "password";

            button.textContent = hidden ? "إخفاء" : "إظهار";

            button.setAttribute(
                "aria-pressed",
                String(hidden)
            );
        });
    }
);

// إرسال طلب التسجيل التجريبي
registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = fullNameInput.value.trim();

    const email = registerEmailInput.value.trim().toLowerCase();

    const phone = phoneInput.value.trim();

    const password = registerPasswordInput.value;

    const confirmPassword = confirmPasswordInput.value;

    if (!name || !email || !password || !confirmPassword) {
        showRegisterMessage(
            "من فضلك املئي الحقول المطلوبة.",
            "error"
        );

        return;
    }

    if (password.length < 8) {
        showRegisterMessage(
            "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
            "error"
        );

        return;
    }

    if (password !== confirmPassword) {
        showRegisterMessage(
            "كلمتا المرور غير متطابقتين.",
            "error"
        );

        confirmPasswordInput.focus();

        return;
    }

    // لا نحفظ كلمة المرور في localStorage.
    // هذه آلية تجريبية للـ Frontend فقط.

    let requests = [];

    try {
        const savedRequests = localStorage.getItem(REQUESTS_KEY);

        if (savedRequests) {
            requests = JSON.parse(savedRequests);

            if (!Array.isArray(requests)) {
                requests = [];
            }
        }
    } catch (error) {
        console.error("تعذر قراءة طلبات التسجيل التجريبية:", error);

        showRegisterMessage(
            "تعذر قراءة بيانات المتصفح. حاولي مرة أخرى.",
            "error"
        );

        return;
    }

    const emailAlreadyExists = requests.some(function (request) {
        return request.email === email;
    });

    if (emailAlreadyExists) {
        showRegisterMessage(
            "يوجد طلب تجريبي سابق بهذا البريد الإلكتروني على هذا المتصفح.",
            "error"
        );

        return;
    }

    const registrationRequest = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        status: "pending",
        createdAt: new Date().toISOString()
    };

    requests.push(registrationRequest);

    try {
        localStorage.setItem(
            REQUESTS_KEY,
            JSON.stringify(requests)
        );
    } catch (error) {
        console.error("تعذر حفظ طلب التسجيل التجريبي:", error);

        showRegisterMessage(
            "تعذر حفظ الطلب في المتصفح.",
            "error"
        );

        return;
    }

    registerForm.reset();

    showRegisterMessage(
        "تم تسجيل طلبك كتجربة على هذا المتصفح. لم يتم إنشاء حساب فعلي، " +
        "ويجب ربط المنصة بخادم حتى يستطيع المسؤول مراجعة الطلب والموافقة عليه.",
        "info"
    );
});

function showRegisterMessage(message, type) {
    registerMessage.textContent = message;

    registerMessage.className =
        "login-message auth-feedback " + type;
}