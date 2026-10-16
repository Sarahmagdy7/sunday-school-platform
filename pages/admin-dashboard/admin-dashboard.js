"use strict";

// ========================================
// مفاتيح البيانات المشتركة
// ========================================

const CHILDREN_KEY = "sundaySchoolChildren_v1";
const CLASSES_KEY = "sundaySchoolClasses_v1";
const LESSONS_KEY = "sundaySchoolLessons_v1";
const REQUESTS_KEY = "sundaySchoolRegistrationRequests_v1";

// ========================================
// عناصر الصفحة
// ========================================

const todayDate = document.getElementById("todayDate");

const totalChildren = document.getElementById("totalChildren");
const totalClasses = document.getElementById("totalClasses");
const totalLessons = document.getElementById("totalLessons");
const pendingRequests = document.getElementById("pendingRequests");

const recentRequestsBody = document.getElementById(
    "recentRequestsBody"
);

// ========================================
// قراءة البيانات من المتصفح
// ========================================

function readArrayFromStorage(key) {
    try {
        const savedData = localStorage.getItem(key);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        return Array.isArray(parsedData) ? parsedData : [];

    } catch (error) {
        console.error(
            `تعذر تحميل البيانات من ${key}:`,
            error
        );

        return [];
    }
}

// ========================================
// التاريخ
// ========================================

function displayTodayDate() {
    const now = new Date();

    todayDate.textContent = now.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// ========================================
// الإحصائيات
// ========================================

function updateStatistics() {
    const children = readArrayFromStorage(CHILDREN_KEY);
    const classes = readArrayFromStorage(CLASSES_KEY);
    const lessons = readArrayFromStorage(LESSONS_KEY);
    const requests = readArrayFromStorage(REQUESTS_KEY);

    const pending = requests.filter(function (request) {
        return request.status === "pending";
    });

    totalChildren.textContent = children.length;
    totalClasses.textContent = classes.length;
    totalLessons.textContent = lessons.length;
    pendingRequests.textContent = pending.length;
}

// ========================================
// ترجمة حالة طلب الحساب
// ========================================

function getRequestStatusLabel(status) {
    const labels = {
        pending: "قيد المراجعة",
        approved: "مقبول",
        rejected: "مرفوض"
    };

    return labels[status] || "غير معروف";
}

// ========================================
// إنشاء خلية آمنة
// ========================================

function createCell(text, className = "") {
    const cell = document.createElement("td");

    cell.textContent = text || "غير مسجل";

    if (className) {
        cell.className = className;
    }

    return cell;
}

// ========================================
// عرض أحدث طلبات الحسابات
// ========================================

function renderRecentRequests() {
    const requests = readArrayFromStorage(REQUESTS_KEY);

    const pending = requests
        .filter(function (request) {
            return request.status === "pending";
        })
        .sort(function (a, b) {
            return Number(b.id) - Number(a.id);
        })
        .slice(0, 5);

    recentRequestsBody.replaceChildren();

    if (pending.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "empty-message";
        cell.textContent = "لا توجد طلبات معلقة حاليًا.";

        row.appendChild(cell);
        recentRequestsBody.appendChild(row);

        return;
    }

    pending.forEach(function (request) {
        const row = document.createElement("tr");

        row.appendChild(
            createCell(request.name)
        );

        row.appendChild(
            createCell(request.email, "email-cell")
        );

        row.appendChild(
            createCell(formatDate(request.createdAt))
        );

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "request-status pending";
        badge.textContent = getRequestStatusLabel(
            request.status
        );

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        recentRequestsBody.appendChild(row);
    });
}

// ========================================
// تنسيق التاريخ
// ========================================

function formatDate(value) {
    if (!value) {
        return "غير متوفر";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "غير متوفر";
    }

    return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// ========================================
// تحديث المعلومات عند تغيير البيانات
// ========================================

window.addEventListener("storage", function (event) {
    const relevantKeys = [
        CHILDREN_KEY,
        CLASSES_KEY,
        LESSONS_KEY,
        REQUESTS_KEY
    ];

    if (event.key === null || relevantKeys.includes(event.key)) {
        updateStatistics();
        renderRecentRequests();
    }
});

// ========================================
// تشغيل الصفحة
// ========================================

function initializeAdminDashboard() {
    displayTodayDate();
    updateStatistics();
    renderRecentRequests();
}

initializeAdminDashboard();