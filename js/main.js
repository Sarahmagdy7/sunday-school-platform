const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

togglePassword.addEventListener("click", function () {
const isPasswordHidden = passwordInput.type === "password";

```
passwordInput.type = isPasswordHidden ? "text" : "password";

togglePassword.textContent = isPasswordHidden ? "إخفاء" : "إظهار";

togglePassword.setAttribute(
    "aria-label",
    isPasswordHidden ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
);

togglePassword.setAttribute(
    "aria-pressed",
    String(isPasswordHidden)
);
```

});

// ========================================
// تسجيل الدخول التجريبي
// ========================================

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    // التأكد من إدخال البيانات
    if (!email || !password) {
        loginMessage.textContent =
            "من فضلك اكتبي البريد الإلكتروني وكلمة المرور.";

        return;
    }

    // تسجيل الدخول التجريبي
    loginMessage.textContent = "جاري فتح لوحة التحكم...";
    localStorage.setItem("sundaySchoolCurrentUserEmail", email);

    // الانتقال إلى Dashboard
    window.location.href = "pages/dashboard/dashboard.html";
});


