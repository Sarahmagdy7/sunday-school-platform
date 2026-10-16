"use strict";

// ========================================
// عناصر الصفحة
// ========================================

const activityForm = document.getElementById("activityForm");

const activityIdInput = document.getElementById("activityId");
const activityTitleInput = document.getElementById("activityTitle");
const activityTypeInput = document.getElementById("activityType");
const activityClassInput = document.getElementById("activityClass");
const activityDateInput = document.getElementById("activityDate");
const activityDurationInput = document.getElementById("activityDuration");
const activityStatusInput = document.getElementById("activityStatus");
const activityDescriptionInput = document.getElementById("activityDescription");
const activityMaterialsInput = document.getElementById("activityMaterials");
const activityNotesInput = document.getElementById("activityNotes");

const formHeading = document.getElementById("formHeading");
const saveActivityBtn = document.getElementById("saveActivityBtn");
const resetActivityBtn = document.getElementById("resetActivityBtn");

const totalActivitiesElement = document.getElementById("totalActivities");
const upcomingActivitiesElement = document.getElementById("upcomingActivities");
const completedActivitiesElement = document.getElementById("completedActivities");

const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const statusFilter = document.getElementById("statusFilter");

const activitiesList = document.getElementById("activitiesList");
const activityCount = document.getElementById("activityCount");
const emptyState = document.getElementById("emptyState");

const toast = document.getElementById("toast");


// ========================================
// بيانات الأنشطة
// ========================================

const STORAGE_KEY = "sundaySchoolActivities_v1";

let activities = loadActivities();

let toastTimer = null;


// ========================================
// أسماء الأنشطة
// ========================================

const activityTypes = {
    game: "لعبة تعليمية",
    competition: "مسابقة",
    craft: "أعمال يدوية",
    trip: "رحلة أو زيارة",
    celebration: "احتفال",
    service: "خدمة مجتمعية",
    other: "أخرى"
};


// ========================================
// رموز الأنشطة
// ========================================

const activityIcons = {
    game: "🎲",
    competition: "🏆",
    craft: "🎨",
    trip: "🚌",
    celebration: "🎉",
    service: "🤝",
    other: "🌟"
};


// ========================================
// أسماء الفصول
// ========================================

const activityClasses = {
    all: "كل الفصول",
    nursery: "الحضانة",
    first: "الصف الأول الابتدائي",
    second: "الصف الثاني الابتدائي",
    third: "الصف الثالث الابتدائي",
    fourth: "الصف الرابع الابتدائي",
    fifth: "الصف الخامس الابتدائي",
    sixth: "الصف السادس الابتدائي",
    middle: "الإعدادي",
    secondary: "الثانوي"
};


// ========================================
// أسماء الحالات
// ========================================

const activityStatuses = {
    planned: "مخطط له",
    completed: "مكتمل",
    cancelled: "ملغي"
};


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
// تحميل الأنشطة
// ========================================

function loadActivities() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData)) {
            return parsedData.filter(function (activity) {
                return (
                    activity &&
                    typeof activity === "object" &&
                    typeof activity.id === "string"
                );
            });
        }

        return [];

    } catch (error) {
        console.error(
            "تعذر تحميل الأنشطة:",
            error
        );

        return [];
    }
}


// ========================================
// حفظ الأنشطة
// ========================================

function saveActivities() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(activities)
        );

        return true;

    } catch (error) {
        console.error(
            "تعذر حفظ الأنشطة:",
            error
        );

        showToast(
            "تعذر حفظ البيانات. تحققي من مساحة التخزين في المتصفح."
        );

        return false;
    }
}


// ========================================
// عرض رسالة للمستخدم
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
// جمع البيانات من النموذج
// ========================================

function getActivityFormData() {
    return {
        id: activityIdInput.value ||
            "activity-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2, 8),

        title: activityTitleInput.value.trim(),

        type: activityTypeInput.value,

        classId: activityClassInput.value,

        date: activityDateInput.value,

        duration: activityDurationInput.value
            ? Number(activityDurationInput.value)
            : null,

        status: activityStatusInput.value,

        description: activityDescriptionInput.value.trim(),

        materials: activityMaterialsInput.value.trim(),

        notes: activityNotesInput.value.trim(),

        updatedAt: new Date().toISOString()
    };
}


// ========================================
// حفظ نشاط جديد أو تعديل نشاط
// ========================================

activityForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!activityForm.checkValidity()) {
        activityForm.reportValidity();
        return;
    }

    const activity = getActivityFormData();

    if (
        !activity.title ||
        !activity.description ||
        !activity.date
    ) {
        showToast(
            "من فضلك املئي اسم النشاط والوصف والتاريخ."
        );

        return;
    }

    const existingIndex = activities.findIndex(
        function (item) {
            return item.id === activity.id;
        }
    );

    if (existingIndex !== -1) {
        activities[existingIndex] = activity;
    } else {
        activities.unshift(activity);
    }

    const saved = saveActivities();

    if (!saved) {
        return;
    }

    renderActivities();

    resetActivityForm();

    if (existingIndex !== -1) {
        showToast("تم تعديل النشاط بنجاح.");
    } else {
        showToast("تم حفظ النشاط بنجاح.");
    }
});


// ========================================
// تفريغ النموذج
// ========================================

function resetActivityForm() {
    activityForm.reset();

    activityIdInput.value = "";

    activityDateInput.value = getTodayDate();

    activityTypeInput.value = "game";

    activityClassInput.value = "all";

    activityStatusInput.value = "planned";

    formHeading.textContent = "إضافة نشاط جديد";

    saveActivityBtn.textContent = "💾 حفظ النشاط";
}


// ========================================
// بدء نشاط جديد
// ========================================

resetActivityBtn.addEventListener("click", function () {
    const hasContent =
        activityTitleInput.value.trim() ||
        activityDescriptionInput.value.trim() ||
        activityNotesInput.value.trim();

    if (hasContent) {
        const confirmed = confirm(
            "هل تريدين بدء نشاط جديد؟ لن يتم حفظ التعديلات غير المحفوظة."
        );

        if (!confirmed) {
            return;
        }
    }

    resetActivityForm();

    document.getElementById("activityFormSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


// ========================================
// تعديل نشاط
// ========================================

function editActivity(id) {
    const activity = activities.find(
        function (item) {
            return item.id === id;
        }
    );

    if (!activity) {
        showToast("لم يتم العثور على النشاط.");
        return;
    }

    activityIdInput.value = activity.id;

    activityTitleInput.value = activity.title || "";

    activityTypeInput.value = activity.type || "other";

    activityClassInput.value = activity.classId || "all";

    activityDateInput.value = activity.date || getTodayDate();

    activityDurationInput.value =
        activity.duration || "";

    activityStatusInput.value =
        activity.status || "planned";

    activityDescriptionInput.value =
        activity.description || "";

    activityMaterialsInput.value =
        activity.materials || "";

    activityNotesInput.value =
        activity.notes || "";

    formHeading.textContent = "تعديل النشاط";

    saveActivityBtn.textContent = "💾 حفظ التعديلات";

    document.getElementById("activityFormSection").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    activityTitleInput.focus();
}


// ========================================
// إنشاء عنصر نصي
// ========================================

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    element.textContent = text || "";

    return element;
}


// ========================================
// إنشاء زر
// ========================================

function createActionButton(text, className, callback) {
    const button = document.createElement("button");

    button.type = "button";

    button.className = className;

    button.textContent = text;

    button.addEventListener("click", callback);

    return button;
}


// ========================================
// تنسيق المدة
// ========================================

function formatDuration(duration) {
    if (!duration || duration < 1) {
        return "غير محددة";
    }

    if (duration < 60) {
        return duration + " دقيقة";
    }

    const hours = Math.floor(duration / 60);

    const minutes = duration % 60;

    if (minutes === 0) {
        return hours + " ساعة";
    }

    return hours + " ساعة و" + minutes + " دقيقة";
}


// ========================================
// إنشاء بطاقة النشاط
// ========================================

function createActivityCard(activity) {
    const card = document.createElement("article");

    card.className = "activity-card";


    // الجزء العلوي

    const cardTop = document.createElement("div");

    cardTop.className = "card-top";

    const icon = createTextElement(
        "div",
        "activity-icon",
        activityIcons[activity.type] || "🌟"
    );

    const badges = document.createElement("div");

    badges.className = "badges";

    const typeBadge = createTextElement(
        "span",
        "badge type-badge",
        activityTypes[activity.type] || "أخرى"
    );

    const statusBadge = createTextElement(
        "span",
        "badge status-" + activity.status,
        activityStatuses[activity.status] || "مخطط له"
    );

    badges.appendChild(typeBadge);

    badges.appendChild(statusBadge);

    cardTop.appendChild(icon);

    cardTop.appendChild(badges);

    card.appendChild(cardTop);


    // اسم النشاط

    const title = createTextElement(
        "h3",
        "",
        activity.title
    );

    card.appendChild(title);


    // وصف النشاط

    const description = createTextElement(
        "p",
        "activity-description",
        activity.description || "لا يوجد وصف."
    );

    card.appendChild(description);


    // تفاصيل إضافية

    const meta = document.createElement("div");

    meta.className = "activity-meta";

    const date = createTextElement(
        "p",
        "",
        "📅 التاريخ: " + activity.date
    );

    const className = createTextElement(
        "p",
        "",
        "👥 الفصل: " +
        (
            activityClasses[activity.classId] ||
            "غير محدد"
        )
    );

    const duration = createTextElement(
        "p",
        "",
        "⏱️ المدة: " +
        formatDuration(activity.duration)
    );

    meta.appendChild(date);

    meta.appendChild(className);

    meta.appendChild(duration);

    card.appendChild(meta);


    // الأدوات المطلوبة

    if (activity.materials) {
        const materials = createTextElement(
            "p",
            "activity-description",
            "الأدوات: " + activity.materials
        );

        card.appendChild(materials);
    }


    // الملاحظات

    if (activity.notes) {
        const notes = createTextElement(
            "p",
            "activity-description",
            "ملاحظات: " + activity.notes
        );

        card.appendChild(notes);
    }


    // الخط الفاصل

    const divider = document.createElement("div");

    divider.className = "card-divider";

    card.appendChild(divider);


    // الأزرار

    const actions = document.createElement("div");

    actions.className = "card-actions";

    const editButton = createActionButton(
        "تعديل",
        "card-action",
        function () {
            editActivity(activity.id);
        }
    );

    const deleteButton = createActionButton(
        "حذف",
        "card-action delete-action",
        function () {
            deleteActivity(activity.id);
        }
    );

    actions.appendChild(editButton);

    actions.appendChild(deleteButton);

    card.appendChild(actions);

    return card;
}


// ========================================
// البحث والتصفية
// ========================================

function getFilteredActivities() {
    const searchText = searchInput.value
        .trim()
        .toLowerCase();

    const selectedType = typeFilter.value;

    const selectedStatus = statusFilter.value;

    return activities.filter(function (activity) {
        const matchesType =
            selectedType === "all" ||
            activity.type === selectedType;

        const matchesStatus =
            selectedStatus === "all" ||
            activity.status === selectedStatus;

        const searchableText = [
            activity.title,
            activity.description,
            activity.materials,
            activity.notes,
            activityClasses[activity.classId],
            activityTypes[activity.type]
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            searchableText.includes(searchText);

        return (
            matchesType &&
            matchesStatus &&
            matchesSearch
        );
    });
}


// ========================================
// تحديث الإحصائيات
// ========================================

function updateStatistics() {
    const today = getTodayDate();

    const upcomingCount = activities.filter(
        function (activity) {
            return (
                activity.status === "planned" &&
                activity.date >= today
            );
        }
    ).length;

    const completedCount = activities.filter(
        function (activity) {
            return activity.status === "completed";
        }
    ).length;

    totalActivitiesElement.textContent = activities.length;

    upcomingActivitiesElement.textContent = upcomingCount;

    completedActivitiesElement.textContent = completedCount;
}


// ========================================
// عرض الأنشطة
// ========================================

function renderActivities() {
    const filteredActivities = getFilteredActivities();

    activitiesList.replaceChildren();

    updateStatistics();

    activityCount.textContent =
        filteredActivities.length + " نشاط";

    if (filteredActivities.length === 0) {
        emptyState.hidden = false;
    } else {
        emptyState.hidden = true;
    }

    filteredActivities.forEach(function (activity) {
        activitiesList.appendChild(
            createActivityCard(activity)
        );
    });
}


// ========================================
// حذف نشاط
// ========================================

function deleteActivity(id) {
    const activity = activities.find(
        function (item) {
            return item.id === id;
        }
    );

    if (!activity) {
        showToast("لم يتم العثور على النشاط.");
        return;
    }

    const confirmed = confirm(
        'هل تريدين حذف النشاط "' +
        activity.title +
        '"؟'
    );

    if (!confirmed) {
        return;
    }

    const previousActivities = activities.slice();

    activities = activities.filter(
        function (item) {
            return item.id !== id;
        }
    );

    const saved = saveActivities();

    if (!saved) {
        activities = previousActivities;
        return;
    }

    renderActivities();

    showToast("تم حذف النشاط.");
}


// ========================================
// تشغيل البحث والتصفية
// ========================================

searchInput.addEventListener(
    "input",
    renderActivities
);

typeFilter.addEventListener(
    "change",
    renderActivities
);

statusFilter.addEventListener(
    "change",
    renderActivities
);


// ========================================
// تشغيل الصفحة
// ========================================

activityDateInput.value = getTodayDate();

renderActivities();