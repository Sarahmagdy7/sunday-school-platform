"use strict";

// ========================================
// بيانات تجريبية للفصول
// ========================================

// هذه البيانات للعرض والتجربة فقط.
// سنربطها ببيانات صفحة الفصول وقاعدة البيانات لاحقًا.

const demoClasses = {
    first: {
        id: "first",
        name: "الصف الأول الابتدائي",
        stage: "الابتدائي",
        description: "فصل الصف الأول الابتدائي في خدمة مدارس الأحد.",
        meetingTime: "الأحد - الساعة 10 صباحًا",
        location: "قاعة الأطفال",
        mainTeacher: "مريم سمير",
        teachers: [
            {
                name: "مريم سمير",
                role: "مدرس أساسي"
            },
            {
                name: "يوسف عادل",
                role: "مدرس مساعد"
            }
        ],
        students: [
            {
                id: 1,
                name: "طفل تجريبي 1"
            },
            {
                id: 2,
                name: "طفل تجريبي 2"
            },
            {
                id: 3,
                name: "طفل تجريبي 3"
            }
        ]
    },

    second: {
        id: "second",
        name: "الصف الثاني الابتدائي",
        stage: "الابتدائي",
        description: "فصل الصف الثاني الابتدائي في خدمة مدارس الأحد.",
        meetingTime: "الأحد - الساعة 10 صباحًا",
        location: "قاعة الأطفال",
        mainTeacher: "مارينا فادي",
        teachers: [
            {
                name: "مارينا فادي",
                role: "مدرس أساسي"
            }
        ],
        students: [
            {
                id: 4,
                name: "طفل تجريبي 4"
            },
            {
                id: 5,
                name: "طفل تجريبي 5"
            },
            {
                id: 6,
                name: "طفل تجريبي 6"
            }
        ]
    },

    third: {
        id: "third",
        name: "الصف الثالث الابتدائي",
        stage: "الابتدائي",
        description: "فصل الصف الثالث الابتدائي في خدمة مدارس الأحد.",
        meetingTime: "الأحد - الساعة 11 صباحًا",
        location: "قاعة الأطفال",
        mainTeacher: "مينا رامي",
        teachers: [
            {
                name: "مينا رامي",
                role: "مدرس أساسي"
            }
        ],
        students: [
            {
                id: 7,
                name: "طفل تجريبي 7"
            },
            {
                id: 8,
                name: "طفل تجريبي 8"
            },
            {
                id: 9,
                name: "طفل تجريبي 9"
            }
        ]
    },

    fourth: {
        id: "fourth",
        name: "الصف الرابع الابتدائي",
        stage: "الابتدائي",
        description: "فصل الصف الرابع الابتدائي في خدمة مدارس الأحد.",
        meetingTime: "الأحد - الساعة 11 صباحًا",
        location: "قاعة الأطفال",
        mainTeacher: "مينا رامي",
        teachers: [
            {
                name: "مينا رامي",
                role: "مدرس أساسي"
            },
            {
                name: "مساعد تجريبي",
                role: "مدرس مساعد"
            }
        ],
        students: [
            {
                id: 10,
                name: "طفل تجريبي 10"
            },
            {
                id: 11,
                name: "طفل تجريبي 11"
            },
            {
                id: 12,
                name: "طفل تجريبي 12"
            }
        ]
    }
};


// ========================================
// عناصر الصفحة
// ========================================

const classNameElement = document.getElementById("className");
const classStageBadge = document.getElementById("classStageBadge");
const classDescription = document.getElementById("classDescription");

const detailClassName = document.getElementById("detailClassName");
const detailStage = document.getElementById("detailStage");
const detailMeetingTime = document.getElementById("detailMeetingTime");
const detailLocation = document.getElementById("detailLocation");
const detailMainTeacher = document.getElementById("detailMainTeacher");

const studentsCount = document.getElementById("studentsCount");
const teachersCount = document.getElementById("teachersCount");
const presentCount = document.getElementById("presentCount");
const absentCount = document.getElementById("absentCount");

const teachersList = document.getElementById("teachersList");
const emptyTeachers = document.getElementById("emptyTeachers");

const studentSearch = document.getElementById("studentSearch");
const studentsTableBody = document.getElementById("studentsTableBody");
const emptyStudents = document.getElementById("emptyStudents");

const editClassBtn = document.getElementById("editClassBtn");
const toast = document.getElementById("toast");


// ========================================
// إعدادات التخزين
// ========================================

const DETAILS_STORAGE_KEY = "sundaySchoolClassDetails_v1";
const ATTENDANCE_STORAGE_KEY = "sundaySchoolAttendance_v1";


// ========================================
// الحصول على رقم الفصل من الرابط
// ========================================

const urlParams = new URLSearchParams(window.location.search);

const classId = urlParams.get("id") || "1";

// ========================================
// قراءة البيانات المحفوظة بأمان
// ========================================

function readLocalStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch (error) {
        console.error("تعذر قراءة البيانات:", error);

        return fallback;
    }
}




    // ========================================
// تحميل بيانات الفصل المختار
// ========================================

const savedDetails = readLocalStorage(
    DETAILS_STORAGE_KEY,
    {}
);

const savedClasses = readLocalStorage(
    "sundaySchoolClasses_v1",
    []
);

const selectedClass = Array.isArray(savedClasses)
    ? savedClasses.find(function (item) {
        return String(item.id) === String(classId);
    })
    : null;


// بيانات تجريبية مساعدة للأطفال والمدرسين

const demoKeyById = {
    "1": "first",
    "2": "second",
    "3": "third"
};

const demoKey = demoKeyById[String(classId)];

const demoClass = demoKey
    ? demoClasses[demoKey]
    : null;


// أسماء المراحل

const stageNames = {
    nursery: "الحضانة",
    primary: "المرحلة الابتدائية",
    middle: "المرحلة الإعدادية",
    secondary: "المرحلة الثانوية"
};


// بيانات الفصل

let currentClass = {
    id: String(classId),

    name: selectedClass
        ? selectedClass.name
        : (demoClass ? demoClass.name : "تفاصيل الفصل"),

    stage: selectedClass
        ? (stageNames[selectedClass.stage] || selectedClass.stage)
        : (demoClass ? demoClass.stage : "غير محدد"),

    description: selectedClass
        ? "فصل " + (selectedClass.grade || selectedClass.name) +
          " بمدارس الأحد."
        : (demoClass
            ? demoClass.description
            : "لم تتم إضافة وصف للفصل بعد."),

    meetingTime: demoClass
        ? demoClass.meetingTime
        : "لم يُحدد بعد",

    location: demoClass
        ? demoClass.location
        : "لم يُحدد بعد",

    mainTeacher: selectedClass
        ? selectedClass.teacher
        : (demoClass ? demoClass.mainTeacher : ""),

    teachers: demoClass
        ? demoClass.teachers
        : [],

    students: demoClass
        ? demoClass.students
        : [],

    children: selectedClass
        ? Number(selectedClass.children) || 0
        : (demoClass ? demoClass.students.length : 0),

    ...(savedDetails[String(classId)] || {})
};


// تحديث المدرس الأساسي بناءً على بيانات صفحة الفصول

if (selectedClass) {
    const assistantTeachers = demoClass
        ? demoClass.teachers.filter(function (teacher) {
            return teacher.role !== "مدرس أساسي";
        })
        : [];

    currentClass.teachers = [
        {
            name: selectedClass.teacher || "لم يُحدد بعد",
            role: "مدرس أساسي"
        },
        ...assistantTeachers
    ];

    // إنشاء أسماء تجريبية إضافية ليتطابق عدد الصفوف
    // مع عدد الأطفال المسجل في بيانات الفصل.

    const students = Array.isArray(currentClass.students)
        ? currentClass.students.slice()
        : [];

    const expectedCount = Math.min(
        Number(selectedClass.children) || 0,
        100
    );

    while (students.length < expectedCount) {
        const studentNumber = students.length + 1;

        students.push({
            id: Number(classId) * 1000 + studentNumber,
            name: "طفل تجريبي " + studentNumber
        });
    }

    currentClass.students = students.slice(0, expectedCount);
}

// ========================================
// حالة الحضور المسجلة
// ========================================

function getAttendanceForToday() {
    const today = getTodayDate();

    const attendance = readLocalStorage(
        ATTENDANCE_STORAGE_KEY,
        {}
    );

    return attendance[today] || {};
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
// عرض رسالة قصيرة
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
// عرض البيانات الأساسية للفصل
// ========================================

function renderClassInformation() {
    classNameElement.textContent = currentClass.name;

    classStageBadge.textContent = currentClass.stage || "غير محدد";

    classDescription.textContent =
        currentClass.description || "لا يوجد وصف للفصل.";

    detailClassName.textContent = currentClass.name;

    detailStage.textContent = currentClass.stage || "غير محدد";

    detailMeetingTime.textContent =
        currentClass.meetingTime || "لم يُحدد بعد";

    detailLocation.textContent =
        currentClass.location || "لم يُحدد بعد";

    detailMainTeacher.textContent =
        currentClass.mainTeacher || "لم يُحدد بعد";

    document.title =
        currentClass.name + " | تفاصيل الفصل";
}


// ========================================
// عرض المدرسين
// ========================================

function renderTeachers() {
    teachersList.replaceChildren();

    const teachers = Array.isArray(currentClass.teachers)
        ? currentClass.teachers
        : [];

    teachersCount.textContent = teachers.length;

    emptyTeachers.hidden = teachers.length !== 0;

    teachers.forEach(function (teacher) {
        const card = document.createElement("article");

        card.className = "teacher-card";

        const avatar = createTextElement(
            "div",
            "teacher-avatar",
            String(teacher.name || "?").trim().charAt(0) || "؟"
        );

        const info = document.createElement("div");

        const name = createTextElement(
            "strong",
            "",
            teacher.name || "مدرس غير محدد"
        );

        const role = createTextElement(
            "span",
            "",
            teacher.role || "مدرس"
        );

        info.appendChild(name);

        info.appendChild(role);

        card.appendChild(avatar);

        card.appendChild(info);

        teachersList.appendChild(card);
    });
}


// ========================================
// حالة حضور الطفل
// ========================================

function getStudentAttendanceStatus(studentId) {
    const attendance = getAttendanceForToday();

    const status = attendance[studentId];

    if (status === "present") {
        return {
            label: "حاضر",
            className: "attendance-present"
        };
    }

    if (status === "absent") {
        return {
            label: "غائب",
            className: "attendance-absent"
        };
    }

    if (status === "late") {
        return {
            label: "متأخر",
            className: "attendance-late"
        };
    }

    return {
        label: "لم يسجل",
        className: "attendance-unmarked"
    };
}


// ========================================
// عرض الأطفال
// ========================================

function renderStudents() {
    studentsTableBody.replaceChildren();

    const allStudents = Array.isArray(currentClass.students)
        ? currentClass.students
        : [];

    const searchText = studentSearch.value
        .trim()
        .toLowerCase();

    const filteredStudents = allStudents.filter(function (student) {
        return String(student.name || "")
            .toLowerCase()
            .includes(searchText);
    });

    emptyStudents.hidden = filteredStudents.length !== 0;

    studentsCount.textContent = allStudents.length;

    let present = 0;
    let absent = 0;

    filteredStudents.forEach(function (student, index) {
        const row = document.createElement("tr");

        const numberCell = createTextElement(
            "td",
            "",
            index + 1
        );

        const nameCell = createTextElement(
            "td",
            "student-name",
            student.name
        );

        const classCell = createTextElement(
            "td",
            "",
            currentClass.name
        );

        const statusCell = document.createElement("td");

        const statusInfo = getStudentAttendanceStatus(student.id);

        if (statusInfo.label === "حاضر") {
            present++;
        }

        if (statusInfo.label === "غائب") {
            absent++;
        }

        const badge = createTextElement(
            "span",
            "attendance-badge " + statusInfo.className,
            statusInfo.label
        );

        statusCell.appendChild(badge);

        row.appendChild(numberCell);
        row.appendChild(nameCell);
        row.appendChild(classCell);
        row.appendChild(statusCell);

        studentsTableBody.appendChild(row);
    });

    // أرقام الحضور المعروضة تعتمد على الأطفال الظاهرين في البحث.
    presentCount.textContent = present;
    absentCount.textContent = absent;
}


// ========================================
// تعديل بيانات الفصل
// ========================================

function editClassInformation() {
    const newName = prompt(
        "اكتبي اسم الفصل:",
        currentClass.name
    );

    if (newName === null) {
        return;
    }

    const trimmedName = newName.trim();

    if (!trimmedName) {
        showToast("اسم الفصل لا يمكن أن يكون فارغًا.");
        return;
    }

    const newDescription = prompt(
        "اكتبي وصف الفصل:",
        currentClass.description || ""
    );

    if (newDescription === null) {
        return;
    }

    const newMeetingTime = prompt(
        "اكتبي موعد الاجتماع:",
        currentClass.meetingTime || ""
    );

    if (newMeetingTime === null) {
        return;
    }

    const newLocation = prompt(
        "اكتبي مكان الاجتماع:",
        currentClass.location || ""
    );

    if (newLocation === null) {
        return;
    }

    const updatedClass = {
        ...currentClass,
        name: trimmedName,
        description: newDescription.trim(),
        meetingTime: newMeetingTime.trim(),
        location: newLocation.trim()
    };

    const allSavedDetails = readLocalStorage(
        DETAILS_STORAGE_KEY,
        {}
    );

    allSavedDetails[classId] = updatedClass;

    try {
        localStorage.setItem(
            DETAILS_STORAGE_KEY,
            JSON.stringify(allSavedDetails)
        );

        currentClass = updatedClass;

        renderClassInformation();

        renderStudents();

        showToast("تم حفظ التعديلات على هذا المتصفح.");

    } catch (error) {
        console.error("تعذر حفظ تفاصيل الفصل:", error);

        showToast("تعذر حفظ التعديلات.");
    }
}


// ========================================
// أحداث الصفحة
// ========================================

studentSearch.addEventListener("input", renderStudents);

editClassBtn.addEventListener("click", editClassInformation);


// ========================================
// بدء تشغيل الصفحة
// ========================================

renderClassInformation();

renderTeachers();

renderStudents();