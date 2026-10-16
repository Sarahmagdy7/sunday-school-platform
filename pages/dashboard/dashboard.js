"use strict";
console.log("تم تحميل dashboard.js الجديد");
// ========================================
// عناصر القائمة الجانبية
// ========================================

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");


// ========================================
// فتح القائمة الجانبية
// ========================================

function openSidebar() {
    if (!sidebar || !sidebarOverlay || !menuToggle) {
        return;
    }

    sidebar.classList.add("open");
    sidebarOverlay.classList.add("show");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "إغلاق القائمة");
}


// ========================================
// إغلاق القائمة الجانبية
// ========================================

function closeSidebar() {
    if (!sidebar || !sidebarOverlay || !menuToggle) {
        return;
    }

    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "فتح القائمة");
}


// ========================================
// التحكم في زر القائمة
// ========================================

if (menuToggle) {
    menuToggle.addEventListener("click", function () {
        if (sidebar && sidebar.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}


// إغلاق القائمة عند الضغط خارجها

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
}


// ========================================
// مسارات صفحات المنصة
// ========================================

const pageRoutes = {
    dashboard: "dashboard.html",
    classes: "../classes/classes.html",
    children: "../children/children.html",
    attendance: "../attendance/attendance.html",
    lessons: "../lessons/lessons.html",
    preparation: "../preparation/preparation.html",
    activities: "../activities/activities.html",
    tasks: "../tasks/tasks.html",
    reports: "../reports/reports.html",
    teachers: "../teachers/teachers.html",
    settings: "../settings/settings.html"
};

// ========================================
// أسماء الأقسام
// ========================================

const sectionNames = {
    dashboard: "الرئيسية",
    classes: "الفصول",
    children: "الأطفال",
    attendance: "الحضور والغياب",
    lessons: "مكتبة الدروس",
    preparation: "تحضير الدروس",
    activities: "الأنشطة",
    tasks: "مهامي القادمة",
    reports: "التقارير",

    settings: "الإعدادات",
    teachers: "إدارة المدرسين"
};


// ========================================
// التنقل بين صفحات المنصة
// ========================================

document.addEventListener("click", function (event) {
    const item = event.target.closest("[data-section]");

    // لو الضغط مش على عنصر مخصص للتنقل، نخرج.
    if (!item) {
        return;
    }

    const sectionName = item.dataset.section;
    const route = pageRoutes[sectionName];

    // لو المسار غير موجود.
    if (!route) {
        event.preventDefault();

        alert(
            "القسم غير متاح حاليًا: " +
            (sectionNames[sectionName] || sectionName)
        );

        return;
    }

    // منع التصرف الافتراضي ثم الانتقال للمسار.
    event.preventDefault();

    window.location.href = route;
});


// ========================================
// تسجيل الخروج
// ========================================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();

        const confirmed = confirm(
            "هل تريدين تسجيل الخروج والعودة إلى صفحة الدخول؟"
        );

        if (confirmed) {
            window.location.href = "../../index.html";
        }
    });
}
// ========================================
// عرض المهام القادمة في Dashboard
// ========================================

const dashboardTasksList = document.getElementById(
    "dashboardTasksList"
);

const dashboardTasksEmpty = document.getElementById(
    "dashboardTasksEmpty"
);

const DASHBOARD_TASKS_KEY = "sundaySchoolTasks_v1";

const dashboardTaskStatusNames = {
    pending: "لم تبدأ",
    "in-progress": "قيد التنفيذ",
    completed: "مكتملة"
};

const dashboardTaskTypeNames = {
    lesson: "تحضير درس",
    activity: "تجهيز نشاط",
    attendance: "متابعة الحضور",
    meeting: "اجتماع الخدمة",
    general: "مهمة عامة"
};


// قراءة المهام المحفوظة

function loadDashboardTasks() {
    try {
        const savedTasks = localStorage.getItem(
            DASHBOARD_TASKS_KEY
        );

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        return Array.isArray(parsedTasks)
            ? parsedTasks
            : [];

    } catch (error) {
        console.error(
            "تعذر تحميل المهام في لوحة التحكم:",
            error
        );

        return [];
    }
}


// إنشاء عنصر نصي

function createDashboardTaskText(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text || "";

    return element;
}


// عرض المهام القادمة

function renderDashboardTasks() {
    if (!dashboardTasksList || !dashboardTasksEmpty) {
        return;
    }

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    const todayString = year + "-" + month + "-" + day;

    const tasks = loadDashboardTasks();

    // إظهار المهام غير المكتملة التي موعدها اليوم أو في المستقبل.

    const upcomingTasks = tasks
        .filter(function (task) {
            return (
                task &&
                task.status !== "completed" &&
                task.date >= todayString
            );
        })
        .sort(function (a, b) {
            return String(a.date).localeCompare(
                String(b.date)
            );
        })
        .slice(0, 4);

    dashboardTasksList.replaceChildren();

    if (upcomingTasks.length === 0) {
        dashboardTasksEmpty.hidden = false;
        return;
    }

    dashboardTasksEmpty.hidden = true;

    upcomingTasks.forEach(function (task) {
        const item = document.createElement("article");

        item.className = "dashboard-task-item";

        const icon = createDashboardTaskText(
            "div",
            "dashboard-task-icon",
            task.type === "lesson"
                ? "📖"
                : task.type === "activity"
                    ? "🎨"
                    : task.type === "attendance"
                        ? "✓"
                        : "📋"
        );

        const content = document.createElement("div");

        content.className = "dashboard-task-content";

        const title = createDashboardTaskText(
            "h3",
            "",
            task.title || "مهمة بدون عنوان"
        );

        const date = createDashboardTaskText(
            "p",
            "",
            "الموعد: " + (task.date || "غير محدد")
        );

        const type = createDashboardTaskText(
            "p",
            "",
            dashboardTaskTypeNames[task.type] || "مهمة عامة"
        );

        const status = createDashboardTaskText(
            "span",
            "dashboard-task-status " +
                (task.status || "pending"),
            dashboardTaskStatusNames[task.status] || "لم تبدأ"
        );

        content.appendChild(title);

        content.appendChild(date);

        content.appendChild(type);

        content.appendChild(status);

        item.appendChild(icon);

        item.appendChild(content);

        dashboardTasksList.appendChild(item);
    });
}


// تشغيل العرض عند فتح الصفحة

renderDashboardTasks();


// تحديث المهام عند العودة إلى Dashboard

window.addEventListener(
    "pageshow",
    renderDashboardTasks
);


// استقبال إشعار التحديث عند تغيّر المهام
// إذا كانت الصفحة مفتوحة في التبويب نفسه.

window.addEventListener(
    "sundaySchoolTasksUpdated",
    renderDashboardTasks
);