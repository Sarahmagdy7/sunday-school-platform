"use strict";

const forgotPasswordForm = document.getElementById(
    "forgotPasswordForm"
);

const resetEmail = document.getElementById("resetEmail");

const resetMessage = document.getElementById("resetMessage");

forgotPasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = resetEmail.value.trim();

    if (!email) {
        showResetMessage(
            "من فضلك اكتبي البريد الإلكتروني.",
            "error"
        );

        return;
    }

    showResetMessage(
        "تم التحقق من صيغة البريد الإلكتروني. إرسال رابط الاستعادة " +
        "غير متاح حاليًا لأن المنصة لم تُربط بخادم البريد الإلكتروني.",
        "info"
    );
});

function showResetMessage(message, type) {
    resetMessage.textContent = message;

    resetMessage.className =
        "login-message auth-feedback " + type;
}