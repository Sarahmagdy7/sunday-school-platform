"use strict";

// ========================================
// مفاتيح البيانات المخزنة
// ========================================

const ATTENDANCE_KEY = "sundaySchoolAttendance_v1";
const ACTIVITIES_KEY = "sundaySchoolActivities_v1";
const PREPARATIONS_KEY = "sundaySchoolPreparations_v1";


// ========================================
// عناصر الصفحة
// ========================================

const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const classFilter = document.getElementById("classFilter");

const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const reportPeriod = document.getElementById("reportPeriod");

const attendanceSessions = document.getElementById("attendanceSessions");
const presentTotal = document.getElementById("presentTotal");
const absentTotal = document.getElementById("absentTotal");
const lateTotal = document.getElementById("lateTotal");

const attendanceRate = document.getElementById("attendanceRate");
const attendanceProgress = document.getElementById("attendanceProgress");

const attendanceReportBody = document.getElementById("attendanceReportBody");
const attendanceEmptyState = document.getElementById("attendanceEmptyState");

const activitiesTotal = document.getElementById("activitiesTotal");
const activitiesPlanned = document.getElementById("activitiesPlanned");
const activitiesCompleted = document.getElementById("activitiesCompleted");

const activitiesReportBody = document.getElementById("activitiesReportBody");
const activitiesEmptyState = document.getElementById("activitiesEmptyState");

const preparationsTotal = document.getElementById("preparationsTotal");
const preparationsPrimary = document.getElementById("preparationsPrimary");

const preparationsReportBody = document.getElementById("preparationsReportBody");
const preparationsEmptyState = document.getElementById("preparationsEmptyState");

const exportAttendanceBtn = document.getElementById("exportAttendanceBtn");
const exportActivitiesBtn = document.getElementById("exportActivitiesBtn");
const exportPreparationsBtn = document.getElementById("exportPreparationsBtn");

const toast = document.getElementById("toast");

let toastTimer = null;


// ========================================
// أسماء الفصول والمراحل
// ========================================

const classNames = {
    all: "كل الفصول",
    first: "الصف الأول الابتدائي",
    second: "الصف الثاني الابتدائي",
    third: "الصف الثالث الابتدائي",
    fourth: "الصف الرابع الابتدائي",
    fifth: "الصف الخامس الابتدائي",
    sixth: "الصف السادس الابتدائي",
    nursery: "الحضانة",
    general: "كل الفصول",
    middle: "الإعدادي",
    secondary: "الثانوي"
};

const stageNames = {
    nursery: "الحضانة",
    primary: "الابتدائي",
    middle: "الإعدادي",
    secondary: "الثانوي"
};

const activityTypeNames = {
    game: "لعبة تعليمية",
    competition: "مسابقة",
    craft: "أعمال يدوية",
    trip: "رحلة أو زيارة",
    celebration: "احتفال",
    service: "خدمة مجتمعية",
    other: "أخرى"
};

const activityStatusNames = {
    planned: "مخطط له",
    completed: "مكتمل",
    cancelled: "ملغي"
};


// ========================================
// خريطة الأطفال التجريبيين
// ========================================

// هذه الخريطة مطابقة لبيانات الأطفال الموجودة
// في نسخة Attendance التجريبية.

function getStudentClass(studentId) {
    const id = Number(studentId);

    if (id >= 1 && id <= 3) {
        return "first";
    }

    if (id >= 4 && id <= 6) {
        return "second";
    }

    if (id >= 7 && id <= 9) {
        return "third";
    }

    if (id >= 10 && id <= 12) {
        return "fourth";
    }

    return "unknown";
}


// ========================================
// التاريخ الحالي
// ========================================

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return year + "-" + month + "-" + day;
}


// ========================================
// أول يوم في الشهر الحالي
// ========================================

function getMonthStartDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    return year + "-" + month + "-01";
}


// ========================================
// قراءة بيانات من localStorage بأمان
// ========================================

function readStoredData(key, expectedType) {
    try {
        const rawData = localStorage.getItem(key);

        if (!rawData) {
            return expectedType === "array" ? [] : {};
        }

        const parsedData = JSON.parse(rawData);

        if (
            expectedType === "array" &&
            Array.isArray(parsedData)
        ) {
            return parsedData;
        }

        if (
            expectedType === "object" &&
            parsedData &&
            typeof parsedData === "object" &&
            !Array.isArray(parsedData)
        ) {
            return parsedData;
        }

        return expectedType === "array" ? [] : {};

    } catch (error) {
        console.error(
            "تعذر قراءة البيانات:",
            key,
            error
        );

        return expectedType === "array" ? [] : {};
    }
}


// ========================================
// تحميل البيانات
// ========================================

function loadAllReportData() {
    return {
        attendance: readStoredData(
            ATTENDANCE_KEY,
            "object"
        ),

        activities: readStoredData(
            ACTIVITIES_KEY,
            "array"
        ),

        preparations: readStoredData(
            PREPARATIONS_KEY,
            "array"
        )
    };
}


// ========================================
// رسائل التنبيه
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
// إنشاء عنصر نصي آمن
// ========================================

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    element.textContent =
        text === null || text === undefined
            ? ""
            : String(text);

    return element;
}


// ========================================
// تحديد الفترة والفصل
// ========================================

function getFilters() {
    return {
        dateFrom: dateFromInput.value,
        dateTo: dateToInput.value,
        classId: classFilter.value
    };
}


// ========================================
// التحقق من صحة الفترة الزمنية
// ========================================

function validateFilters() {
    const filters = getFilters();

    if (!filters.dateFrom || !filters.dateTo) {
        showToast("اختاري تاريخ البداية والنهاية.");
        return false;
    }

    if (filters.dateFrom > filters.dateTo) {
        showToast("تاريخ البداية يجب ألا يكون بعد تاريخ النهاية.");
        return false;
    }

    return true;
}


// ========================================
// هل التاريخ داخل الفترة؟
/* ===================================== */

function isDateInRange(date, filters) {
    if (!date) {
        return false;
    }

    return (
        date >= filters.dateFrom &&
        date <= filters.dateTo
    );
}


// ========================================
// هل السجل يناسب الفصل؟
/* ===================================== */

function matchesClass(recordClassId, filters) {
    if (filters.classId === "all") {
        return true;
    }

    // النشاط أو التحضير المسجل لكل الفصول
    // يظهر في تقرير أي فصل محدد.

    if (
        recordClassId === "all" ||
        recordClassId === "general"
    ) {
        return true;
    }

    return recordClassId === filters.classId;
}


// ========================================
// تقرير الحضور والغياب
// ========================================

function getAttendanceReport(attendanceData, filters) {
    const dates = Object.keys(attendanceData)
        .filter(function (date) {
            return isDateInRange(date, filters);
        })
        .sort();

    const reportRows = [];

    const totals = {
        sessions: 0,
        present: 0,
        absent: 0,
        late: 0,
        unmarked: 0,
        recorded: 0
    };

    dates.forEach(function (date) {
        const dayRecords = attendanceData[date];

        if (
            !dayRecords ||
            typeof dayRecords !== "object"
        ) {
            return;
        }

        const row = {
            date: date,
            present: 0,
            absent: 0,
            late: 0,
            unmarked: 0,
            recorded: 0
        };

        Object.entries(dayRecords).forEach(
            function (entry) {
                const studentId = entry[0];
                const status = entry[1];

                const studentClass = getStudentClass(studentId);

                if (
                    filters.classId !== "all" &&
                    studentClass !== filters.classId
                ) {
                    return;
                }

                if (status === "present") {
                    row.present++;
                    row.recorded++;
                } else if (status === "absent") {
                    row.absent++;
                    row.recorded++;
                } else if (status === "late") {
                    row.late++;
                    row.recorded++;
                }
            }
        );

        // لو لم توجد حالة مسجلة لهذا الفصل في هذا اليوم،
        // لا نعرض صفًا فارغًا.

        if (row.recorded === 0) {
            return;
        }

        row.unmarked = Math.max(
            0,
            getExpectedStudents(filters.classId) - row.recorded
        );

        reportRows.push(row);

        totals.sessions++;

        totals.present += row.present;

        totals.absent += row.absent;

        totals.late += row.late;

        totals.unmarked += row.unmarked;

        totals.recorded += row.recorded;
    });

    return {
        rows: reportRows,
        totals: totals
    };
}


// ========================================
// عدد الأطفال التجريبيين المتوقع
// ========================================

function getExpectedStudents(classId) {
    if (classId === "all") {
        return 12;
    }

    if (
        classId === "first" ||
        classId === "second" ||
        classId === "third" ||
        classId === "fourth"
    ) {
        return 3;
    }

    return 0;
}


// ========================================
// عرض حالة الحضور في الجدول
// ========================================

function renderAttendanceReport(report) {
    attendanceReportBody.replaceChildren();

    attendanceSessions.textContent =
        report.totals.sessions;

    presentTotal.textContent =
        report.totals.present;

    absentTotal.textContent =
        report.totals.absent;

    lateTotal.textContent =
        report.totals.late;

    const countedAttendance =
        report.totals.present +
        report.totals.absent +
        report.totals.late;

    const rate = countedAttendance > 0
        ? Math.round(
            (
                report.totals.present +
                report.totals.late
            ) / countedAttendance * 100
        )
        : 0;

    attendanceRate.textContent = rate + "%";

    attendanceProgress.style.width = rate + "%";

    attendanceProgress.setAttribute(
        "aria-valuenow",
        String(rate)
    );

    if (report.rows.length === 0) {
        attendanceEmptyState.hidden = false;
        return;
    }

    attendanceEmptyState.hidden = true;

    report.rows.forEach(function (row) {
        const tr = document.createElement("tr");

        const totalAttendance =
            row.present +
            row.absent +
            row.late;

        const rowRate = totalAttendance > 0
            ? Math.round(
                (
                    row.present +
                    row.late
                ) / totalAttendance * 100
            )
            : 0;

        const cells = [
            row.date,
            row.present,
            row.absent,
            row.late,
            row.recorded,
            rowRate + "%"
        ];

        cells.forEach(function (value) {
            const td = document.createElement("td");

            td.textContent = value;

            tr.appendChild(td);
        });

        attendanceReportBody.appendChild(tr);
    });
}


// ========================================
// تقرير الأنشطة
// ========================================

function getActivitiesReport(activities, filters) {
    return activities
        .filter(function (activity) {
            return (
                isDateInRange(activity.date, filters) &&
                matchesClass(activity.classId, filters)
            );
        })
        .sort(function (a, b) {
            return String(a.date).localeCompare(
                String(b.date)
            );
        });
}


// ========================================
// عرض تقرير الأنشطة
// ========================================

function renderActivitiesReport(activities) {
    activitiesReportBody.replaceChildren();

    const plannedCount = activities.filter(
        function (activity) {
            return activity.status === "planned";
        }
    ).length;

    const completedCount = activities.filter(
        function (activity) {
            return activity.status === "completed";
        }
    ).length;

    activitiesTotal.textContent = activities.length;

    activitiesPlanned.textContent = plannedCount;

    activitiesCompleted.textContent = completedCount;

    if (activities.length === 0) {
        activitiesEmptyState.hidden = false;
        return;
    }

    activitiesEmptyState.hidden = true;

    activities.forEach(function (activity) {
        const tr = document.createElement("tr");

        const titleCell = document.createElement("td");

        titleCell.textContent = activity.title || "بدون عنوان";

        tr.appendChild(titleCell);


        const typeCell = document.createElement("td");

        typeCell.textContent =
            activityTypeNames[activity.type] || "أخرى";

        tr.appendChild(typeCell);


        const classCell = document.createElement("td");

        classCell.textContent =
            classNames[activity.classId] || "غير محدد";

        tr.appendChild(classCell);


        const dateCell = document.createElement("td");

        dateCell.textContent = activity.date || "غير محدد";

        tr.appendChild(dateCell);


        const statusCell = document.createElement("td");

        const badge = createTextElement(
            "span",
            "table-status status-" + (
                activity.status || "planned"
            ),
            activityStatusNames[activity.status] || "غير محدد"
        );

        statusCell.appendChild(badge);

        tr.appendChild(statusCell);

        activitiesReportBody.appendChild(tr);
    });
}


// ========================================
// تقرير التحضيرات
// ========================================

function getPreparationsReport(preparations, filters) {
    return preparations
        .filter(function (preparation) {
            return (
                isDateInRange(preparation.date, filters) &&
                matchesClass(preparation.classId, filters)
            );
        })
        .sort(function (a, b) {
            return String(a.date).localeCompare(
                String(b.date)
            );
        });
}


// ========================================
// عرض تقرير التحضيرات
// ========================================

function renderPreparationsReport(preparations) {
    preparationsReportBody.replaceChildren();

    const primaryCount = preparations.filter(
        function (preparation) {
            return preparation.stage === "primary";
        }
    ).length;

    preparationsTotal.textContent = preparations.length;

    preparationsPrimary.textContent = primaryCount;

    if (preparations.length === 0) {
        preparationsEmptyState.hidden = false;
        return;
    }

    preparationsEmptyState.hidden = true;

    preparations.forEach(function (preparation) {
        const tr = document.createElement("tr");


        const titleCell = document.createElement("td");

        titleCell.textContent =
            preparation.title || "بدون عنوان";

        tr.appendChild(titleCell);


        const stageCell = document.createElement("td");

        stageCell.textContent =
            stageNames[preparation.stage] || "غير محدد";

        tr.appendChild(stageCell);


        const classCell = document.createElement("td");

        classCell.textContent =
            classNames[preparation.classId] || "غير محدد";

        tr.appendChild(classCell);


        const dateCell = document.createElement("td");

        dateCell.textContent =
            preparation.date || "غير محدد";

        tr.appendChild(dateCell);


        preparationsReportBody.appendChild(tr);
    });
}


// ========================================
// تحديث الفترة المعروضة
// ========================================

function updateReportPeriod(filters) {
    reportPeriod.textContent =
        "الفترة: " +
        filters.dateFrom +
        " إلى " +
        filters.dateTo;
}


// ========================================
// تشغيل التقرير
// ========================================

function generateReport() {
    if (!validateFilters()) {
        return;
    }

    const filters = getFilters();

    const data = loadAllReportData();

    const attendanceReport = getAttendanceReport(
        data.attendance,
        filters
    );

    const filteredActivities = getActivitiesReport(
        data.activities,
        filters
    );

    const filteredPreparations = getPreparationsReport(
        data.preparations,
        filters
    );

    renderAttendanceReport(attendanceReport);

    renderActivitiesReport(filteredActivities);

    renderPreparationsReport(filteredPreparations);

    updateReportPeriod(filters);
}


// ========================================
// تصدير CSV
// ========================================

function downloadCSV(filename, headers, rows) {
    const allRows = [headers].concat(rows);

    const csvContent = allRows
        .map(function (row) {
            return row
                .map(function (value) {
                    const text = String(
                        value === null || value === undefined
                            ? ""
                            : value
                    );

                    return '"' + text.replace(/"/g, '""') + '"';
                })
                .join(",");
        })
        .join("\r\n");

    // BOM للمساعدة على فتح العربية بشكل صحيح في Excel.

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast("تم تجهيز ملف CSV للتنزيل.");
}


// ========================================
// تصدير تقرير الحضور
// ========================================

function exportAttendanceReport() {
    if (!validateFilters()) {
        return;
    }

    const filters = getFilters();

    const data = loadAllReportData();

    const report = getAttendanceReport(
        data.attendance,
        filters
    );

    const rows = report.rows.map(function (row) {
        const total = row.present + row.absent + row.late;

        const rate = total > 0
            ? Math.round(
                (
                    row.present +
                    row.late
                ) / total * 100
            )
            : 0;

        return [
            row.date,
            row.present,
            row.absent,
            row.late,
            row.recorded,
            rate + "%"
        ];
    });

    downloadCSV(
        "attendance-report.csv",
        [
            "التاريخ",
            "الحضور",
            "الغياب",
            "التأخير",
            "الحالات المسجلة",
            "نسبة الحضور"
        ],
        rows
    );
}


// ========================================
// تصدير تقرير الأنشطة
// ========================================

function exportActivitiesReport() {
    if (!validateFilters()) {
        return;
    }

    const filters = getFilters();

    const data = loadAllReportData();

    const activities = getActivitiesReport(
        data.activities,
        filters
    );

    const rows = activities.map(function (activity) {
        return [
            activity.title || "",
            activityTypeNames[activity.type] || "",
            classNames[activity.classId] || "",
            activity.date || "",
            activityStatusNames[activity.status] || "",
            activity.description || "",
            activity.materials || "",
            activity.notes || ""
        ];
    });

    downloadCSV(
        "activities-report.csv",
        [
            "اسم النشاط",
            "نوع النشاط",
            "الفصل",
            "التاريخ",
            "الحالة",
            "الوصف",
            "الأدوات",
            "ملاحظات"
        ],
        rows
    );
}


// ========================================
// تصدير تقرير التحضيرات
// ========================================

function exportPreparationsReport() {
    if (!validateFilters()) {
        return;
    }

    const filters = getFilters();

    const data = loadAllReportData();

    const preparations = getPreparationsReport(
        data.preparations,
        filters
    );

    const rows = preparations.map(function (preparation) {
        return [
            preparation.title || "",
            stageNames[preparation.stage] || "",
            classNames[preparation.classId] || "",
            preparation.date || "",
            preparation.reference || "",
            preparation.objective || ""
        ];
    });

    downloadCSV(
        "preparations-report.csv",
        [
            "عنوان الدرس",
            "المرحلة",
            "الفصل",
            "التاريخ",
            "المرجع",
            "الهدف"
        ],
        rows
    );
}


// ========================================
// تطبيق الفلاتر
// ========================================

applyFiltersBtn.addEventListener(
    "click",
    generateReport
);


// ========================================
// إعادة ضبط الفلاتر
// ========================================

resetFiltersBtn.addEventListener("click", function () {
    dateFromInput.value = getMonthStartDate();

    dateToInput.value = getTodayDate();

    classFilter.value = "all";

    generateReport();
});


// ========================================
// أحداث التصدير
// ========================================

exportAttendanceBtn.addEventListener(
    "click",
    exportAttendanceReport
);

exportActivitiesBtn.addEventListener(
    "click",
    exportActivitiesReport
);

exportPreparationsBtn.addEventListener(
    "click",
    exportPreparationsReport
);


// ========================================
// تشغيل الصفحة
// ========================================

dateFromInput.value = getMonthStartDate();

dateToInput.value = getTodayDate();

classFilter.value = "all";

generateReport();