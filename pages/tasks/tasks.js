"use strict";

// ========================================
// إعدادات التخزين
// ========================================

const TASKS_STORAGE_KEY = "sundaySchoolTasks_v1";


// ========================================
// عناصر الصفحة
// ========================================

const taskForm = document.getElementById("taskForm");

const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskTypeInput = document.getElementById("taskType");
const taskDateInput = document.getElementById("taskDate");
const taskPriorityInput = document.getElementById("taskPriority");
const taskClassInput = document.getElementById("taskClass");
const taskStatusInput = document.getElementById("taskStatus");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskNotesInput = document.getElementById("taskNotes");

const formHeading = document.getElementById("formHeading");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const resetTaskFormBtn = document.getElementById("resetTaskFormBtn");

const totalTasksElement = document.getElementById("totalTasks");
const upcomingTasksElement = document.getElementById("upcomingTasks");
const inProgressTasksElement = document.getElementById("inProgressTasks");
const completedTasksElement = document.getElementById("completedTasks");

const searchTasksInput = document.getElementById("searchTasks");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

const tasksGrid = document.getElementById("tasksGrid");
const tasksCount = document.getElementById("tasksCount");

const emptyState = document.getElementById("emptyState");
const emptyStateTitle = document.getElementById("emptyStateTitle");
const emptyStateMessage = document.getElementById("emptyStateMessage");

const addFirstTaskBtn = document.getElementById("addFirstTaskBtn");
const taskFormSection = document.getElementById("taskFormSection");

const toast = document.getElementById("toast");


// ========================================
// أسماء أنواع المهام
// ========================================

const taskTypeNames = {
    lesson: "تحضير درس",
    activity: "تجهيز نشاط",
    attendance: "متابعة الحضور",
    meeting: "اجتماع الخدمة",
    general: "مهمة عامة"
};


// ========================================
// رموز أنواع المهام
// ========================================

const taskTypeIcons = {
    lesson: "📖",
    activity: "🎨",
    attendance: "✓",
    meeting: "👥",
    general: "📋"
};


// ========================================
// أسماء الأولويات
// ========================================

const taskPriorityNames = {
    normal: "عادية",
    important: "مهمة",
    urgent: "عاجلة"
};


// ========================================
// أسماء الحالات
// ========================================

const taskStatusNames = {
    pending: "لم تبدأ",
    "in-progress": "قيد التنفيذ",
    completed: "مكتملة"
};


// ========================================
// أسماء الفصول
// ========================================

const taskClassNames = {
    all: "كل الفصول / لا يوجد فصل محدد",
    nursery: "الحضانة",
    first: "الصف الأول الابتدائي",
    second: "الصف الثاني الابتدائي",
    third: "الصف الثالث الابتدائي",
    fourth: "الصف الرابع الابتدائي",
    fifth: "الصف الخامس الابتدائي",
    sixth: "الصف السادس الابتدائي"
};


// ========================================
// تحميل المهام
// ========================================

function loadTasks() {
    try {
        const savedData = localStorage.getItem(
            TASKS_STORAGE_KEY
        );

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        return parsedData.filter(function (task) {
            return (
                task &&
                typeof task === "object" &&
                typeof task.id === "string"
            );
        });

    } catch (error) {
        console.error(
            "تعذر تحميل المهام:",
            error
        );

        return [];
    }
}


let tasks = loadTasks();

let toastTimer = null;


// ========================================
// حفظ المهام
// ========================================

function saveTasks() {
    try {
        localStorage.setItem(
            TASKS_STORAGE_KEY,
            JSON.stringify(tasks)
        );

        return true;

    } catch (error) {
        console.error(
            "تعذر حفظ المهام:",
            error
        );

        showToast(
            "تعذر حفظ المهمة. تحققي من مساحة التخزين في المتصفح."
        );

        return false;
    }
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
// رسائل التأكيد
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
// إنشاء عنصر نصي بأمان
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
// قراءة بيانات النموذج
// ========================================

function getTaskFormData() {
    const selectedOption =
        taskTypeInput.options[taskTypeInput.selectedIndex];

    return {
        id: taskIdInput.value ||
            "task-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2, 8),

        title: taskTitleInput.value.trim(),

        type: taskTypeInput.value,

        typeName: selectedOption
            ? selectedOption.textContent.trim()
            : "مهمة عامة",

        date: taskDateInput.value,

        priority: taskPriorityInput.value,

        classId: taskClassInput.value,

        status: taskStatusInput.value,

        description: taskDescriptionInput.value.trim(),

        notes: taskNotesInput.value.trim(),

        updatedAt: new Date().toISOString()
    };
}


// ========================================
// إضافة مهمة أو تعديل مهمة
// ========================================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!taskForm.checkValidity()) {
        taskForm.reportValidity();
        return;
    }

    const task = getTaskFormData();

    if (
        !task.title ||
        !task.date ||
        !task.description
    ) {
        showToast(
            "من فضلك املئي عنوان المهمة وموعدها ووصفها."
        );

        return;
    }

    const existingIndex = tasks.findIndex(
        function (item) {
            return item.id === task.id;
        }
    );

    const previousTasks = tasks;

    if (existingIndex >= 0) {
        tasks = tasks.map(function (item) {
            return item.id === task.id
                ? task
                : item;
        });
    } else {
        tasks = [task, ...tasks];
    }

    if (!saveTasks()) {
        tasks = previousTasks;
        return;
    }

    renderTasks();

    resetTaskForm();

    showToast(
        existingIndex >= 0
            ? "تم تعديل المهمة وحفظها بنجاح."
            : "تمت إضافة المهمة وحفظها بنجاح."
    );

    window.dispatchEvent(
        new Event("sundaySchoolTasksUpdated")
    );
});


// ========================================
// إعادة ضبط النموذج
// ========================================

function resetTaskForm() {
    taskForm.reset();

    taskIdInput.value = "";

    taskDateInput.value = getTodayDate();

    taskTypeInput.value = "lesson";

    taskPriorityInput.value = "normal";

    taskClassInput.value = "all";

    taskStatusInput.value = "pending";

    formHeading.textContent = "إضافة مهمة جديدة";

    saveTaskBtn.textContent = "💾 حفظ المهمة";
}


// ========================================
// زر مهمة جديدة
// ========================================

resetTaskFormBtn.addEventListener("click", function () {
    const hasContent =
        taskTitleInput.value.trim() ||
        taskDescriptionInput.value.trim() ||
        taskNotesInput.value.trim();

    if (hasContent) {
        const confirmed = confirm(
            "هل تريدين بدء مهمة جديدة؟ لن يتم حفظ التعديلات غير المحفوظة."
        );

        if (!confirmed) {
            return;
        }
    }

    resetTaskForm();
});


// ========================================
// الانتقال إلى نموذج إضافة مهمة
// ========================================

addFirstTaskBtn.addEventListener("click", function () {
    taskFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    taskTitleInput.focus();
});


// ========================================
// تعديل مهمة
// ========================================

function editTask(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        showToast("لم يتم العثور على المهمة.");
        return;
    }

    taskIdInput.value = task.id;

    taskTitleInput.value = task.title || "";

    taskTypeInput.value = task.type || "general";

    taskDateInput.value = task.date || getTodayDate();

    taskPriorityInput.value = task.priority || "normal";

    taskClassInput.value = task.classId || "all";

    taskStatusInput.value = task.status || "pending";

    taskDescriptionInput.value = task.description || "";

    taskNotesInput.value = task.notes || "";

    formHeading.textContent = "تعديل المهمة";

    saveTaskBtn.textContent = "💾 حفظ التعديلات";

    taskFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    taskTitleInput.focus();
}


// ========================================
// حذف مهمة
// ========================================

function deleteTask(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        showToast("لم يتم العثور على المهمة.");
        return;
    }

    const confirmed = confirm(
        'هل تريدين حذف المهمة "' +
        task.title +
        '"؟'
    );

    if (!confirmed) {
        return;
    }

    const previousTasks = tasks;

    tasks = tasks.filter(function (item) {
        return item.id !== id;
    });

    if (!saveTasks()) {
        tasks = previousTasks;
        return;
    }

    if (taskIdInput.value === id) {
        resetTaskForm();
    }

    renderTasks();

    showToast("تم حذف المهمة.");

    window.dispatchEvent(
        new Event("sundaySchoolTasksUpdated")
    );
}


// ========================================
// تغيير حالة المهمة
// ========================================

function toggleTaskCompletion(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        showToast("لم يتم العثور على المهمة.");
        return;
    }

    const previousTasks = tasks;

    const newStatus = task.status === "completed"
        ? "pending"
        : "completed";

    tasks = tasks.map(function (item) {
        if (item.id !== id) {
            return item;
        }

        return {
            ...item,
            status: newStatus,
            updatedAt: new Date().toISOString()
        };
    });

    if (!saveTasks()) {
        tasks = previousTasks;
        return;
    }

    renderTasks();

    showToast(
        newStatus === "completed"
            ? "تم تسجيل المهمة كمكتملة."
            : "تمت إعادة المهمة إلى قائمة المهام غير المكتملة."
    );

    window.dispatchEvent(
        new Event("sundaySchoolTasksUpdated")
    );
}


// ========================================
// تحديد المهام المتأخرة
// ========================================

function isTaskOverdue(task) {
    return (
        task.date < getTodayDate() &&
        task.status !== "completed"
    );
}


// ========================================
// البحث والتصفية
// ========================================

function getFilteredTasks() {
    const searchText = searchTasksInput.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilter.value;

    const selectedPriority = priorityFilter.value;

    return tasks
        .filter(function (task) {
            const matchesStatus =
                selectedStatus === "all" ||
                task.status === selectedStatus;

            const matchesPriority =
                selectedPriority === "all" ||
                task.priority === selectedPriority;

            const searchableText = [
                task.title,
                task.description,
                task.notes,
                taskTypeNames[task.type],
                taskClassNames[task.classId]
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                searchableText.includes(searchText);

            return (
                matchesStatus &&
                matchesPriority &&
                matchesSearch
            );
        })
        .sort(function (a, b) {
            if (
                a.status === "completed" &&
                b.status !== "completed"
            ) {
                return 1;
            }

            if (
                a.status !== "completed" &&
                b.status === "completed"
            ) {
                return -1;
            }

            return String(a.date).localeCompare(
                String(b.date)
            );
        });
}


// ========================================
// إنشاء بطاقة المهمة
// ========================================

function createTaskCard(task) {
    const card = document.createElement("article");

    card.className = "task-card";

    if (isTaskOverdue(task)) {
        card.classList.add("task-overdue");
    }

    if (task.status === "completed") {
        card.classList.add("task-completed");
    }


    // الجزء العلوي

    const cardTop = document.createElement("div");

    cardTop.className = "task-card-top";

    const icon = createTextElement(
        "div",
        "task-icon",
        taskTypeIcons[task.type] || "📋"
    );

    const badges = document.createElement("div");

    badges.className = "task-badges";

    const priorityBadge = createTextElement(
        "span",
        "badge priority-" + task.priority,
        taskPriorityNames[task.priority] || "عادية"
    );

    const statusBadge = createTextElement(
        "span",
        "badge status-" + task.status,
        taskStatusNames[task.status] || "لم تبدأ"
    );

    badges.appendChild(priorityBadge);

    badges.appendChild(statusBadge);

    cardTop.appendChild(icon);

    cardTop.appendChild(badges);

    card.appendChild(cardTop);


    // عنوان المهمة

    const title = createTextElement(
        "h3",
        "",
        task.title
    );

    card.appendChild(title);


    // وصف المهمة

    const description = createTextElement(
        "p",
        "task-description",
        task.description
    );

    card.appendChild(description);


    // بيانات الموعد والنوع والفصل

    const meta = document.createElement("div");

    meta.className = "task-meta";

    const dateText = isTaskOverdue(task)
        ? "⚠️ موعد المهمة: " + task.date + " — متأخرة"
        : "📅 الموعد: " + task.date;

    const dateElement = createTextElement(
        "p",
        isTaskOverdue(task) ? "overdue-label" : "",
        dateText
    );

    const typeElement = createTextElement(
        "p",
        "",
        "📌 النوع: " +
        (taskTypeNames[task.type] || "مهمة عامة")
    );

    const classElement = createTextElement(
        "p",
        "",
        "🏫 الفصل: " +
        (taskClassNames[task.classId] || "غير محدد")
    );

    meta.appendChild(dateElement);

    meta.appendChild(typeElement);

    meta.appendChild(classElement);

    card.appendChild(meta);


    // الملاحظات الإضافية

    if (task.notes) {
        const notes = createTextElement(
            "p",
            "task-notes",
            "ملاحظات: " + task.notes
        );

        card.appendChild(notes);
    }


    // الأزرار

    const actions = document.createElement("div");

    actions.className = "task-actions";

    const editButton = createActionButton(
        "تعديل",
        "task-action",
        function () {
            editTask(task.id);
        }
    );

    const completionButton = createActionButton(
        task.status === "completed"
            ? "إلغاء الإكمال"
            : "إكمال المهمة",
        "task-action complete-action",
        function () {
            toggleTaskCompletion(task.id);
        }
    );

    const deleteButton = createActionButton(
        "حذف",
        "task-action delete-action",
        function () {
            deleteTask(task.id);
        }
    );

    actions.appendChild(editButton);

    actions.appendChild(completionButton);

    actions.appendChild(deleteButton);

    card.appendChild(actions);

    return card;
}


// ========================================
// إنشاء زر آمن
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
// تحديث الإحصائيات
// ========================================

function updateStatistics() {
    const today = getTodayDate();

    const upcomingCount = tasks.filter(function (task) {
        return (
            task.date >= today &&
            task.status !== "completed"
        );
    }).length;

    const inProgressCount = tasks.filter(function (task) {
        return task.status === "in-progress";
    }).length;

    const completedCount = tasks.filter(function (task) {
        return task.status === "completed";
    }).length;

    totalTasksElement.textContent = tasks.length;

    upcomingTasksElement.textContent = upcomingCount;

    inProgressTasksElement.textContent = inProgressCount;

    completedTasksElement.textContent = completedCount;
}


// ========================================
// عرض المهام
// ========================================

function renderTasks() {
    const filteredTasks = getFilteredTasks();

    tasksGrid.replaceChildren();

    updateStatistics();

    tasksCount.textContent =
        filteredTasks.length + " مهمة";

    if (filteredTasks.length === 0) {
        emptyState.hidden = false;

        if (tasks.length === 0) {
            emptyStateTitle.textContent =
                "لا توجد مهام حتى الآن";

            emptyStateMessage.textContent =
                "أضيفي أول مهمة للخدمة وستظهر هنا.";

            addFirstTaskBtn.hidden = false;

        } else {
            emptyStateTitle.textContent =
                "لا توجد نتائج مطابقة";

            emptyStateMessage.textContent =
                "جرّبي تغيير كلمات البحث أو خيارات التصفية.";

            addFirstTaskBtn.hidden = true;
        }

        return;
    }

    emptyState.hidden = true;

    filteredTasks.forEach(function (task) {
        tasksGrid.appendChild(
            createTaskCard(task)
        );
    });
}


// ========================================
// تشغيل البحث والتصفية
// ========================================

searchTasksInput.addEventListener(
    "input",
    renderTasks
);

statusFilter.addEventListener(
    "change",
    renderTasks
);

priorityFilter.addEventListener(
    "change",
    renderTasks
);


// ========================================
// بدء تشغيل الصفحة
// ========================================

taskDateInput.value = getTodayDate();

resetTaskForm();

renderTasks();