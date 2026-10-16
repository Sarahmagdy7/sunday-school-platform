"use strict";

// ========================================
// إعدادات التخزين
// ========================================

const STORAGE_KEY = "sundaySchoolTeachers_v1";


// ========================================
// عناصر الصفحة
// ========================================

const totalTeachers = document.getElementById("totalTeachers");
const activeTeachers = document.getElementById("activeTeachers");
const pendingTeachers = document.getElementById("pendingTeachers");
const inactiveTeachers = document.getElementById("inactiveTeachers");

const pendingRequests = document.getElementById("pendingRequests");
const pendingCount = document.getElementById("pendingCount");
const emptyRequests = document.getElementById("emptyRequests");

const searchTeachers = document.getElementById("searchTeachers");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");

const teachersTableBody = document.getElementById("teachersTableBody");
const emptyTeachers = document.getElementById("emptyTeachers");
const teachersCount = document.getElementById("teachersCount");

const addTeacherBtn = document.getElementById("addTeacherBtn");

const teacherModal = document.getElementById("teacherModal");
const teacherForm = document.getElementById("teacherForm");

const modalTitle = document.getElementById("modalTitle");
const teacherIdInput = document.getElementById("teacherId");

const teacherNameInput = document.getElementById("teacherName");
const teacherEmailInput = document.getElementById("teacherEmail");
const teacherPhoneInput = document.getElementById("teacherPhone");
const teacherRoleInput = document.getElementById("teacherRole");
const teacherClassInput = document.getElementById("teacherClass");

const saveTeacherBtn = document.getElementById("saveTeacherBtn");

const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const toast = document.getElementById("toast");


// ========================================
// أسماء أنواع الحسابات
// ========================================

const roleNames = {
    teacher: "مدرس",
    assistant: "مساعد مدرس",
    admin: "مسؤول الخدمة"
};


// ========================================
// أسماء الفصول
// ========================================

const teacherClassNames = {
    unassigned: "لم يُحدد بعد",
    first: "الصف الأول الابتدائي",
    second: "الصف الثاني الابتدائي",
    third: "الصف الثالث الابتدائي",
    fourth: "الصف الرابع الابتدائي",
    fifth: "الصف الخامس الابتدائي",
    sixth: "الصف السادس الابتدائي",
    nursery: "الحضانة"
};


// ========================================
// أسماء حالات الحساب
// ========================================

const statusNames = {
    active: "نشط",
    pending: "في انتظار الموافقة",
    suspended: "موقوف",
    rejected: "مرفوض"
};


// ========================================
// بيانات تجريبية
// ========================================

// البيانات التالية وهمية لاختبار التصميم فقط.
// لا توجد كلمات مرور أو بيانات دخول حقيقية.

const demoTeachers = [
    {
        id: "demo-1",
        name: "مريم سمير",
        email: "mariam@example.com",
        phone: "",
        role: "teacher",
        classId: "first",
        status: "active",
        createdAt: "2026-10-01"
    },
    {
        id: "demo-2",
        name: "يوسف عادل",
        email: "youssef@example.com",
        phone: "",
        role: "assistant",
        classId: "second",
        status: "pending",
        createdAt: "2026-10-03"
    },
    {
        id: "demo-3",
        name: "مارينا فادي",
        email: "marina@example.com",
        phone: "",
        role: "teacher",
        classId: "third",
        status: "pending",
        createdAt: "2026-10-04"
    },
    {
        id: "demo-4",
        name: "مينا رامي",
        email: "mina@example.com",
        phone: "",
        role: "teacher",
        classId: "fourth",
        status: "active",
        createdAt: "2026-10-05"
    },
    {
        id: "demo-5",
        name: "مسؤول تجريبي",
        email: "admin@example.com",
        phone: "",
        role: "admin",
        classId: "unassigned",
        status: "active",
        createdAt: "2026-09-25"
    }
];


// ========================================
// تحميل الحسابات
// ========================================

function loadTeachers() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (storedData === null) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(demoTeachers)
            );

            return demoTeachers.map(function (teacher) {
                return { ...teacher };
            });
        }

        const parsedData = JSON.parse(storedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        return parsedData.filter(function (teacher) {
            return (
                teacher &&
                typeof teacher === "object" &&
                typeof teacher.id === "string"
            );
        });

    } catch (error) {
        console.error(
            "تعذر تحميل الحسابات:",
            error
        );

        return [];
    }
}


let teachers = loadTeachers();


// ========================================
// حفظ الحسابات
// ========================================

function saveTeachers() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(teachers)
        );

        return true;

    } catch (error) {
        console.error(
            "تعذر حفظ الحسابات:",
            error
        );

        showToast(
            "تعذر حفظ البيانات. تحققي من مساحة التخزين في المتصفح."
        );

        return false;
    }
}


// ========================================
// الرسائل
// ========================================

let toastTimer = null;

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

function createButton(text, className, callback) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = className;
    button.textContent = text;

    button.addEventListener("click", callback);

    return button;
}


// ========================================
// أسماء مختصرة
// ========================================

function getInitial(name) {
    const cleanName = String(name || "").trim();

    return cleanName ? cleanName.charAt(0) : "؟";
}


// ========================================
// التحقق من وجود مسؤول نشط
// ========================================

// لا نسمح في الواجهة التجريبية بحذف أو تعطيل
// آخر حساب مسؤول نشط.

function isLastActiveAdmin(teacher) {
    if (
        !teacher ||
        teacher.role !== "admin" ||
        teacher.status !== "active"
    ) {
        return false;
    }

    const activeAdmins = teachers.filter(function (item) {
        return (
            item.role === "admin" &&
            item.status === "active"
        );
    });

    return activeAdmins.length <= 1;
}


// ========================================
// تحديث الإحصائيات
// ========================================

function updateStatistics() {
    const activeCount = teachers.filter(function (teacher) {
        return teacher.status === "active";
    }).length;

    const pendingCountValue = teachers.filter(function (teacher) {
        return teacher.status === "pending";
    }).length;

    const inactiveCount = teachers.filter(function (teacher) {
        return (
            teacher.status === "suspended" ||
            teacher.status === "rejected"
        );
    }).length;

    totalTeachers.textContent = teachers.length;

    activeTeachers.textContent = activeCount;

    pendingTeachers.textContent = pendingCountValue;

    inactiveTeachers.textContent = inactiveCount;

    pendingCount.textContent =
        pendingCountValue + " طلب";
}


// ========================================
// تصفية الحسابات
// ========================================

function getFilteredTeachers() {
    const searchText = searchTeachers.value
        .trim()
        .toLowerCase();

    const selectedRole = roleFilter.value;
    const selectedStatus = statusFilter.value;

    return teachers.filter(function (teacher) {
        const matchesRole =
            selectedRole === "all" ||
            teacher.role === selectedRole;

        const matchesStatus =
            selectedStatus === "all" ||
            teacher.status === selectedStatus;

        const searchableText = [
            teacher.name,
            teacher.email,
            teacher.phone,
            roleNames[teacher.role],
            teacherClassNames[teacher.classId]
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            searchableText.includes(searchText);

        return (
            matchesRole &&
            matchesStatus &&
            matchesSearch
        );
    });
}


// ========================================
// إنشاء بطاقة طلب انضمام
// ========================================

function createRequestCard(teacher) {
    const card = document.createElement("article");

    card.className = "request-card";

    const header = document.createElement("div");

    header.className = "request-header";

    const avatar = createTextElement(
        "div",
        "avatar",
        getInitial(teacher.name)
    );

    const identity = document.createElement("div");

    const name = createTextElement(
        "h3",
        "",
        teacher.name
    );

    const email = createTextElement(
        "p",
        "",
        teacher.email
    );

    identity.appendChild(name);
    identity.appendChild(email);

    header.appendChild(avatar);
    header.appendChild(identity);

    card.appendChild(header);


    const details = document.createElement("div");

    details.className = "request-details";

    const role = createTextElement(
        "p",
        "",
        "نوع الحساب: " +
        (roleNames[teacher.role] || "غير محدد")
    );

    const classroom = createTextElement(
        "p",
        "",
        "الفصل: " +
        (
            teacherClassNames[teacher.classId] ||
            "لم يُحدد بعد"
        )
    );

    const requestDate = createTextElement(
        "p",
        "",
        "تاريخ التسجيل: " +
        (teacher.createdAt || "غير محدد")
    );

    details.appendChild(role);
    details.appendChild(classroom);
    details.appendChild(requestDate);

    card.appendChild(details);


    const actions = document.createElement("div");

    actions.className = "request-actions";

    const approveButton = createButton(
        "✓ قبول الطلب",
        "primary-button approve-button",
        function () {
            updateTeacherStatus(teacher.id, "active");
        }
    );

    const rejectButton = createButton(
        "✕ رفض الطلب",
        "primary-button reject-button",
        function () {
            updateTeacherStatus(teacher.id, "rejected");
        }
    );

    actions.appendChild(approveButton);
    actions.appendChild(rejectButton);

    card.appendChild(actions);

    return card;
}


// ========================================
// عرض طلبات الانضمام
// ========================================

function renderPendingRequests() {
    pendingRequests.replaceChildren();

    const requests = teachers.filter(function (teacher) {
        return teacher.status === "pending";
    });

    emptyRequests.hidden = requests.length !== 0;

    requests.forEach(function (teacher) {
        pendingRequests.appendChild(
            createRequestCard(teacher)
        );
    });
}


// ========================================
// إنشاء شارة الحالة
// ========================================

function createStatusBadge(status) {
    const badge = document.createElement("span");

    badge.className =
        "status-badge status-" + status;

    badge.textContent =
        statusNames[status] || "غير محدد";

    return badge;
}


// ========================================
// إنشاء صف في الجدول
// ========================================

function createTeacherRow(teacher) {
    const row = document.createElement("tr");


    // الاسم

    const nameCell = document.createElement("td");

    nameCell.appendChild(
        createTextElement(
            "span",
            "teacher-name",
            teacher.name
        )
    );

    row.appendChild(nameCell);


    // البريد الإلكتروني

    const emailCell = createTextElement(
        "td",
        "email-cell",
        teacher.email
    );

    row.appendChild(emailCell);


    // نوع الحساب

    const roleCell = createTextElement(
        "td",
        "role-label",
        roleNames[teacher.role] || "غير محدد"
    );

    row.appendChild(roleCell);


    // الفصل

    const classCell = createTextElement(
        "td",
        "",
        teacherClassNames[teacher.classId] ||
        "لم يُحدد بعد"
    );

    row.appendChild(classCell);


    // حالة الحساب

    const statusCell = document.createElement("td");

    statusCell.appendChild(
        createStatusBadge(teacher.status)
    );

    row.appendChild(statusCell);


    // الإجراءات

    const actionsCell = document.createElement("td");

    const actions = document.createElement("div");

    actions.className = "row-actions";

    const editButton = createButton(
        "تعديل",
        "small-action",
        function () {
            openEditModal(teacher.id);
        }
    );

    actions.appendChild(editButton);


    // إجراءات قبول الطلب المعلق

    if (teacher.status === "pending") {
        actions.appendChild(
            createButton(
                "قبول",
                "small-action",
                function () {
                    updateTeacherStatus(
                        teacher.id,
                        "active"
                    );
                }
            )
        );

        actions.appendChild(
            createButton(
                "رفض",
                "small-action danger-action",
                function () {
                    updateTeacherStatus(
                        teacher.id,
                        "rejected"
                    );
                }
            )
        );
    }


    // تفعيل الحساب أو إيقافه

    if (teacher.status === "active") {
        if (!isLastActiveAdmin(teacher)) {
            actions.appendChild(
                createButton(
                    "إيقاف",
                    "small-action danger-action",
                    function () {
                        updateTeacherStatus(
                            teacher.id,
                            "suspended"
                        );
                    }
                )
            );
        }
    } else if (teacher.status === "suspended") {
        actions.appendChild(
            createButton(
                "إعادة التفعيل",
                "small-action",
                function () {
                    updateTeacherStatus(
                        teacher.id,
                        "active"
                    );
                }
            )
        );
    }


    // حذف الحساب

    if (!isLastActiveAdmin(teacher)) {
        actions.appendChild(
            createButton(
                "حذف",
                "small-action danger-action",
                function () {
                    deleteTeacher(teacher.id);
                }
            )
        );
    }


    actionsCell.appendChild(actions);

    row.appendChild(actionsCell);

    return row;
}


// ========================================
// عرض جميع الحسابات
// ========================================

function renderTeachersTable() {
    teachersTableBody.replaceChildren();

    const filteredTeachers = getFilteredTeachers();

    emptyTeachers.hidden =
        filteredTeachers.length !== 0;

    filteredTeachers.forEach(function (teacher) {
        teachersTableBody.appendChild(
            createTeacherRow(teacher)
        );
    });

    teachersCount.textContent =
        "عدد الحسابات: " + filteredTeachers.length;
}


// ========================================
// تحديث جميع أجزاء الصفحة
// ========================================

function renderPage() {
    updateStatistics();

    renderPendingRequests();

    renderTeachersTable();
}


// ========================================
// تغيير حالة الحساب
// ========================================

function updateTeacherStatus(id, newStatus) {
    const teacher = teachers.find(function (item) {
        return item.id === id;
    });

    if (!teacher) {
        showToast("لم يتم العثور على الحساب.");
        return;
    }

    if (
        !["active", "pending", "suspended", "rejected"]
            .includes(newStatus)
    ) {
        showToast("حالة الحساب غير صحيحة.");
        return;
    }

    if (
        teacher.role === "admin" &&
        teacher.status === "active" &&
        newStatus !== "active" &&
        isLastActiveAdmin(teacher)
    ) {
        showToast(
            "لا يمكن إيقاف آخر حساب مسؤول نشط."
        );

        return;
    }

    const actionNames = {
        active: "تفعيل",
        pending: "إرجاع إلى قائمة الانتظار",
        suspended: "إيقاف",
        rejected: "رفض"
    };

    const confirmed = confirm(
        "هل تريدين " +
        actionNames[newStatus] +
        ' حساب "' +
        teacher.name +
        '"؟'
    );

    if (!confirmed) {
        return;
    }

    const previousStatus = teacher.status;

    teacher.status = newStatus;

    const saved = saveTeachers();

    if (!saved) {
        teacher.status = previousStatus;
        return;
    }

    renderPage();

    showToast(
        "تم تحديث حالة الحساب إلى: " +
        statusNames[newStatus]
    );
}


// ========================================
// فتح نموذج إضافة مدرس
// ========================================

function openAddModal() {
    teacherForm.reset();

    teacherIdInput.value = "";

    teacherRoleInput.value = "teacher";

    teacherClassInput.value = "unassigned";

    modalTitle.textContent = "إضافة مدرس جديد";

    saveTeacherBtn.textContent = "حفظ البيانات";

    teacherModal.hidden = false;

    document.body.style.overflow = "hidden";

    teacherNameInput.focus();
}


// ========================================
// فتح نموذج تعديل مدرس
// ========================================

function openEditModal(id) {
    const teacher = teachers.find(function (item) {
        return item.id === id;
    });

    if (!teacher) {
        showToast("لم يتم العثور على الحساب.");
        return;
    }

    if (teacher.role === "admin") {
        showToast(
            "تعديل حساب المسؤول يحتاج إلى صفحة إدارية مخصصة."
        );

        return;
    }

    teacherIdInput.value = teacher.id;

    teacherNameInput.value = teacher.name || "";

    teacherEmailInput.value = teacher.email || "";

    teacherPhoneInput.value = teacher.phone || "";

    teacherRoleInput.value = teacher.role || "teacher";

    teacherClassInput.value =
        teacher.classId || "unassigned";

    modalTitle.textContent = "تعديل بيانات المدرس";

    saveTeacherBtn.textContent = "حفظ التعديلات";

    teacherModal.hidden = false;

    document.body.style.overflow = "hidden";

    teacherNameInput.focus();
}


// ========================================
// إغلاق النموذج
// ========================================

function closeTeacherModal() {
    teacherModal.hidden = true;

    document.body.style.overflow = "";

    teacherForm.reset();

    teacherIdInput.value = "";
}

addTeacherBtn.addEventListener(
    "click",
    openAddModal
);

closeModalBtn.addEventListener(
    "click",
    closeTeacherModal
);

cancelModalBtn.addEventListener(
    "click",
    closeTeacherModal
);

teacherModal.addEventListener("click", function (event) {
    if (event.target === teacherModal) {
        closeTeacherModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        !teacherModal.hidden
    ) {
        closeTeacherModal();
    }
});


// ========================================
// حفظ مدرس جديد أو تعديل البيانات
// ========================================

teacherForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!teacherForm.checkValidity()) {
        teacherForm.reportValidity();
        return;
    }

    const id = teacherIdInput.value;

    const email = teacherEmailInput.value
        .trim()
        .toLowerCase();

    const name = teacherNameInput.value.trim();

    const phone = teacherPhoneInput.value.trim();

    const role = teacherRoleInput.value;

    const classId = teacherClassInput.value;


    if (!name || !email) {
        showToast(
            "من فضلك أدخلي اسم المدرس والبريد الإلكتروني."
        );

        return;
    }


    // منع تكرار البريد الإلكتروني

    const emailExists = teachers.some(function (teacher) {
        return (
            teacher.email.toLowerCase() === email &&
            teacher.id !== id
        );
    });

    if (emailExists) {
        showToast(
            "هذا البريد الإلكتروني مسجل بالفعل."
        );

        return;
    }


    if (id) {
        // تعديل حساب موجود

        const teacher = teachers.find(function (item) {
            return item.id === id;
        });

        if (!teacher) {
            showToast("لم يتم العثور على الحساب.");
            return;
        }

        if (teacher.role === "admin") {
            showToast(
                "تعديل حساب المسؤول يحتاج إلى إدارة مخصصة."
            );

            return;
        }

        const oldTeacher = { ...teacher };

        teacher.name = name;

        teacher.email = email;

        teacher.phone = phone;

        teacher.role = role;

        teacher.classId = classId;


        if (teacher.status === "pending") {
            teacher.status = "pending";
        }

        const saved = saveTeachers();

        if (!saved) {
            Object.assign(teacher, oldTeacher);
            return;
        }

        closeTeacherModal();

        renderPage();

        showToast("تم تعديل بيانات المدرس.");

        return;
    }


    // إضافة مدرس جديد من خلال المسؤول
    // يتم إنشاء سجل في الحالة المعلقة.
    // لا يتم إنشاء بيانات تسجيل دخول حقيقية.

    const newTeacher = {
        id:
            "teacher-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2, 8),

        name: name,

        email: email,

        phone: phone,

        role: role,

        classId: classId,

        status: "pending",

        createdAt: getTodayDate()
    };

    teachers.unshift(newTeacher);

    const saved = saveTeachers();

    if (!saved) {
        teachers = teachers.filter(function (item) {
            return item.id !== newTeacher.id;
        });

        return;
    }

    closeTeacherModal();

    renderPage();

    showToast(
        "تم تسجيل بيانات المدرس في قائمة الطلبات المعلقة."
    );
});


// ========================================
// حذف حساب
// ========================================

function deleteTeacher(id) {
    const teacher = teachers.find(function (item) {
        return item.id === id;
    });

    if (!teacher) {
        showToast("لم يتم العثور على الحساب.");
        return;
    }

    if (isLastActiveAdmin(teacher)) {
        showToast(
            "لا يمكن حذف آخر حساب مسؤول نشط."
        );

        return;
    }

    const confirmed = confirm(
        'هل تريدين حذف سجل "' +
        teacher.name +
        '" نهائيًا من القائمة التجريبية؟'
    );

    if (!confirmed) {
        return;
    }

    const oldTeachers = teachers.slice();

    teachers = teachers.filter(function (item) {
        return item.id !== id;
    });

    const saved = saveTeachers();

    if (!saved) {
        teachers = oldTeachers;
        return;
    }

    renderPage();

    showToast("تم حذف السجل التجريبي.");
}


// ========================================
// البحث والتصفية
// ========================================

searchTeachers.addEventListener(
    "input",
    renderTeachersTable
);

roleFilter.addEventListener(
    "change",
    renderTeachersTable
);

statusFilter.addEventListener(
    "change",
    renderTeachersTable
);


// ========================================
// تاريخ اليوم
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
// تشغيل الصفحة
// ========================================

renderPage();