// ============================================
// منصة مدارس الأحد - صفحة الحضور والغياب
// Attendance Page
// ============================================


// عناصر الصفحة

const classSelect = document.getElementById("classSelect");
const meetingDate = document.getElementById("meetingDate");
const loadChildrenBtn = document.getElementById("loadChildrenBtn");

const childrenTableBody = document.getElementById("childrenTableBody");
const selectedClassText = document.getElementById("selectedClassText");

const searchChild = document.getElementById("searchChild");
const statusFilter = document.getElementById("statusFilter");

const totalChildrenElement = document.getElementById("totalChildren");
const presentCountElement = document.getElementById("presentCount");
const absentCountElement = document.getElementById("absentCount");
const attendancePercentageElement = document.getElementById("attendancePercentage");

const childrenCountText = document.getElementById("childrenCountText");

const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");
const resetAttendanceBtn = document.getElementById("resetAttendanceBtn");

const todayDateElement = document.getElementById("todayDate");
const messageBox = document.getElementById("messageBox");


// ============================================
// البيانات المشتركة مع صفحات الفصول والأطفال
// ============================================

const CLASSES_STORAGE_KEY = "sundaySchoolClasses_v1";
const CHILDREN_STORAGE_KEY = "sundaySchoolChildren_v1";

// بيانات افتراضية مطابقة لصفحة إدارة الفصول
const defaultClassData = [
    {
        id: 1,
        name: "الصف الأول الابتدائي",
        stage: "primary",
        grade: "الأول الابتدائي",
        teacher: "مريم فؤاد",
        children: 15
    },
    {
        id: 2,
        name: "الصف الثاني الابتدائي",
        stage: "primary",
        grade: "الثاني الابتدائي",
        teacher: "سارة محمود",
        children: 18
    },
    {
        id: 3,
        name: "الصف الثالث الابتدائي",
        stage: "primary",
        grade: "الثالث الابتدائي",
        teacher: "مينا عادل",
        children: 12
    }
];

// بيانات افتراضية مطابقة لصفحة إدارة الأطفال
const defaultChildrenData = [
    {
        id: 1,
        name: "أحمد علي",
        gender: "male",
        classId: 1,
        guardian: "ولي أمر تجريبي 1",
        phone: "01000000001"
    },
    {
        id: 2,
        name: "مريم حسن",
        gender: "female",
        classId: 1,
        guardian: "ولي أمر تجريبي 2",
        phone: "01000000002"
    },
    {
        id: 3,
        name: "يوسف محمود",
        gender: "male",
        classId: 2,
        guardian: "ولي أمر تجريبي 3",
        phone: "01000000003"
    },
    {
        id: 4,
        name: "نور محمد",
        gender: "female",
        classId: 2,
        guardian: "ولي أمر تجريبي 4",
        phone: "01000000004"
    },
    {
        id: 5,
        name: "مينا فؤاد",
        gender: "male",
        classId: 3,
        guardian: "ولي أمر تجريبي 5",
        phone: "01000000005"
    }
];

// قراءة مصفوفة من التخزين المحلي
function loadSharedArray(storageKey, defaultData) {
    try {
        const savedData = localStorage.getItem(storageKey);

        if (savedData !== null) {
            const parsedData = JSON.parse(savedData);

            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        }

        const initialData = defaultData.map(item => ({ ...item }));

        localStorage.setItem(
            storageKey,
            JSON.stringify(initialData)
        );

        return initialData;

    } catch (error) {
        console.error("تعذر تحميل البيانات:", storageKey, error);

        return defaultData.map(item => ({ ...item }));
    }
}

// قراءة الفصول والأطفال من المصدر المشترك
const classes = loadSharedArray(
    CLASSES_STORAGE_KEY,
    defaultClassData
);

const children = loadSharedArray(
    CHILDREN_STORAGE_KEY,
    defaultChildrenData
);


// ============================================
// الحالة الحالية للحضور
// ============================================

// سيحتوي كل عنصر على:
// childId: رقم الطفل
// status: present أو absent

let attendanceRecords = {};

let currentChildren = [];

let currentClassId = "";

let currentDate = "";


// ============================================
// الحصول على تاريخ اليوم
// ============================================

function getTodayDate() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ============================================
// عرض التاريخ بالعربية
// ============================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const parts = dateString.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


// ============================================
// إظهار رسالة للمستخدم
// ============================================

function showMessage(message, type = "info") {

    messageBox.textContent = message;

    messageBox.className = `message-box ${type}`;

}


// ============================================
// إخفاء الرسالة
// ============================================

function hideMessage() {

    messageBox.textContent = "";

    messageBox.className = "message-box";

}


// ============================================
// تحميل الفصول داخل القائمة
// ============================================

function loadClasses() {

    classes.forEach(function (classItem) {

        const option = document.createElement("option");

        option.value = classItem.id;

        option.textContent = classItem.name;

        classSelect.appendChild(option);

    });

}


// ============================================
// مفتاح حفظ الحضور في المتصفح
// ============================================

function getStorageKey(classId, date) {

    return `sundaySchoolAttendance_${classId}_${date}`;

}


// ============================================
// تحميل الحضور المحفوظ
// ============================================

function loadSavedAttendance(classId, date) {

    const storageKey = getStorageKey(classId, date);

    try {

        const savedData = localStorage.getItem(storageKey);

        if (!savedData) {
            return {};
        }

        const parsedData = JSON.parse(savedData);

        if (
            !parsedData ||
            typeof parsedData !== "object" ||
            Array.isArray(parsedData)
        ) {
            return {};
        }

        return parsedData;

    } catch (error) {

        console.error("حدث خطأ أثناء قراءة الحضور:", error);

        showMessage(
            "تعذر قراءة البيانات المحفوظة. يمكنك إعادة تسجيل الحضور.",
            "error"
        );

        return {};

    }

}


// ============================================
// عرض الأطفال
// ============================================

function loadChildrenForAttendance() {

    hideMessage();

    const selectedClassId = classSelect.value;

    const selectedDate = meetingDate.value;

    if (!selectedClassId) {

        showMessage("من فضلك اختاري الفصل أولًا.", "error");

        return;

    }

    if (!selectedDate) {

        showMessage("من فضلك اختاري تاريخ الاجتماع.", "error");

        return;

    }

    currentClassId = selectedClassId;

    currentDate = selectedDate;

    currentChildren = children.filter(function (child) {
    return String(child.classId) === String(selectedClassId);
});

    attendanceRecords = loadSavedAttendance(
        currentClassId,
        currentDate
    );

    const selectedClass = classes.find(function (classItem) {
    return String(classItem.id) === String(selectedClassId);
});

if (!selectedClass) {
    showMessage("الفصل المختار غير موجود في بيانات المنصة.", "error");
    return;
}

    selectedClassText.textContent =
        `${selectedClass.name} - اجتماع يوم ${formatDate(selectedDate)}`;

    searchChild.value = "";

    statusFilter.value = "all";

    saveAttendanceBtn.disabled = currentChildren.length === 0;

    resetAttendanceBtn.disabled = currentChildren.length === 0;

    renderChildren();

    updateStatistics();

    if (currentChildren.length === 0) {

        showMessage(
            "لا يوجد أطفال مسجلون في هذا الفصل حتى الآن.",
            "info"
        );

    }

}


// ============================================
// الحصول على حالة الطفل
// ============================================

function getChildStatus(childId) {

    const record = attendanceRecords[childId];

    if (!record || !record.status) {

        return "unmarked";

    }

    return record.status;

}


// ============================================
// اسم حالة الحضور
// ============================================

function getStatusLabel(status) {

    if (status === "present") {

        return "حاضر";

    }

    if (status === "absent") {

        return "غائب";

    }

    return "لم يتم التسجيل";

}


// ============================================
// إنشاء صف طفل في الجدول
// ============================================

function createChildRow(child, index) {

    const row = document.createElement("tr");

    const classItem = classes.find(function (item) {

        return item.id === child.classId;

    });

    const status = getChildStatus(child.id);

    let statusClass = "status-unmarked";

    if (status === "present") {

        statusClass = "status-present";

    } else if (status === "absent") {

        statusClass = "status-absent";

    }

    row.innerHTML = `
        <td>
            <span class="child-number">${index + 1}</span>
        </td>

        <td>
            <span class="child-name">${escapeHTML(child.name)}</span>
        </td>

        <td>
            <span class="class-label">
                ${escapeHTML(classItem ? classItem.name : "")}
            </span>
        </td>

        <td>
            <span class="attendance-status ${statusClass}">
                ${getStatusLabel(status)}
            </span>
        </td>

        <td>
            <div class="attendance-actions">

                <button
                    type="button"
                    class="attendance-action present-button ${
                        status === "present" ? "selected" : ""
                    }"
                    data-child-id="${child.id}"
                    data-status="present"
                    aria-pressed="${status === "present"}"
                >
                    ✓ حاضر
                </button>

                <button
                    type="button"
                    class="attendance-action absent-button ${
                        status === "absent" ? "selected" : ""
                    }"
                    data-child-id="${child.id}"
                    data-status="absent"
                    aria-pressed="${status === "absent"}"
                >
                    × غائب
                </button>

            </div>
        </td>
    `;

    return row;

}


// ============================================
// حماية النصوص المعروضة في HTML
// ============================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================
// عرض الأطفال داخل الجدول
// ============================================

function renderChildren() {

    childrenTableBody.innerHTML = "";

    if (!currentClassId || !currentDate) {

        childrenTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    اختاري الفصل والتاريخ ثم اضغطي على عرض الأطفال.
                </td>
            </tr>
        `;

        childrenCountText.textContent = "عدد الأطفال: 0";

        return;

    }

    const searchValue = searchChild.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilter.value;

    const filteredChildren = currentChildren.filter(function (child) {

        const nameMatches = child.name
            .toLowerCase()
            .includes(searchValue);

        const status = getChildStatus(child.id);

        let statusMatches = true;

        if (selectedStatus !== "all") {

            statusMatches = status === selectedStatus;

        }

        return nameMatches && statusMatches;

    });

    if (filteredChildren.length === 0) {

        childrenTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    لا توجد نتائج مطابقة للبحث أو الفلتر.
                </td>
            </tr>
        `;

        childrenCountText.textContent = "عدد الأطفال الظاهرين: 0";

        return;

    }

    filteredChildren.forEach(function (child, index) {

        const row = createChildRow(child, index);

        childrenTableBody.appendChild(row);

    });

    childrenCountText.textContent =
        `عدد الأطفال الظاهرين: ${filteredChildren.length}`;

}


// ============================================
// تسجيل حضور أو غياب طفل
// ============================================

function markAttendance(childId, status) {

    hideMessage();

    const childExists = currentChildren.some(function (child) {

        return child.id === childId;

    });

    if (!childExists) {

        showMessage("الطفل غير موجود في الفصل المختار.", "error");

        return;

    }

    if (status !== "present" && status !== "absent") {

        showMessage("حالة الحضور غير صحيحة.", "error");

        return;

    }

    attendanceRecords[childId] = {
        status: status
    };

    renderChildren();

    updateStatistics();

}


// ============================================
// تحديث إحصائيات الحضور
// ============================================

function updateStatistics() {

    const total = currentChildren.length;

    let present = 0;

    let absent = 0;

    currentChildren.forEach(function (child) {

        const status = getChildStatus(child.id);

        if (status === "present") {

            present++;

        } else if (status === "absent") {

            absent++;

        }

    });

    let percentage = 0;

    if (total > 0) {

        percentage = Math.round((present / total) * 100);

    }

    totalChildrenElement.textContent = total;

    presentCountElement.textContent = present;

    absentCountElement.textContent = absent;

    attendancePercentageElement.textContent = `${percentage}%`;

}


// ============================================
// حفظ الحضور في المتصفح
// ============================================

function saveAttendance() {

    hideMessage();

    if (!currentClassId || !currentDate) {

        showMessage(
            "اختاري الفصل والتاريخ واعرضي الأطفال أولًا.",
            "error"
        );

        return;

    }

    const unmarkedChildren = currentChildren.filter(function (child) {

        return getChildStatus(child.id) === "unmarked";

    });

    if (unmarkedChildren.length > 0) {

        const shouldContinue = confirm(
            `يوجد ${unmarkedChildren.length} طفل لم يتم تسجيل حالتهم. هل تريدين حفظ التسجيل الحالي؟`
        );

        if (!shouldContinue) {

            return;

        }

    }

    const storageKey = getStorageKey(
        currentClassId,
        currentDate
    );

    const dataToSave = {};

    currentChildren.forEach(function (child) {

        const status = getChildStatus(child.id);

        if (status === "present" || status === "absent") {

            dataToSave[child.id] = {
                status: status
            };

        }

    });

    try {

        localStorage.setItem(
            storageKey,
            JSON.stringify(dataToSave)
        );

        showMessage(
            "تم حفظ الحضور في هذا المتصفح بنجاح. هذه نسخة تجريبية وليست قاعدة بيانات مشتركة.",
            "success"
        );

    } catch (error) {

        console.error("حدث خطأ أثناء حفظ الحضور:", error);

        showMessage(
            "تعذر حفظ البيانات. تأكدي من أن المتصفح يسمح بالتخزين المحلي.",
            "error"
        );

    }

}


// ============================================
// إعادة تعيين حالات الحضور
// ============================================

function resetAttendance() {

    hideMessage();

    if (!currentClassId || !currentDate) {

        showMessage(
            "اختاري الفصل والتاريخ أولًا.",
            "error"
        );

        return;

    }

    const shouldReset = confirm(
        "هل تريدين مسح حالات الحضور لهذا الفصل في التاريخ المختار؟"
    );

    if (!shouldReset) {

        return;

    }

    attendanceRecords = {};

    renderChildren();

    updateStatistics();

    const storageKey = getStorageKey(
        currentClassId,
        currentDate
    );

    try {

        localStorage.removeItem(storageKey);

        showMessage(
            "تمت إعادة تعيين الحضور لهذا الفصل والتاريخ.",
            "success"
        );

    } catch (error) {

        console.error("تعذر حذف البيانات المحفوظة:", error);

        showMessage(
            "تمت إعادة تعيين الحالات المعروضة، لكن تعذر حذف النسخة المحفوظة.",
            "error"
        );

    }

}


// ============================================
// أحداث الأزرار والحقول
// ============================================

loadChildrenBtn.addEventListener(
    "click",
    loadChildrenForAttendance
);


saveAttendanceBtn.addEventListener(
    "click",
    saveAttendance
);


resetAttendanceBtn.addEventListener(
    "click",
    resetAttendance
);


searchChild.addEventListener(
    "input",
    renderChildren
);


statusFilter.addEventListener(
    "change",
    renderChildren
);


childrenTableBody.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-child-id]");

    if (!button) {
        return;
    }

    const childId = Number(button.dataset.childId);

    const status = button.dataset.status;

    markAttendance(childId, status);

});





// ============================================
// بدء تشغيل الصفحة
// ============================================

function initializePage() {

    const today = getTodayDate();

    meetingDate.value = today;

    meetingDate.max = today;

    todayDateElement.textContent = formatDate(today);

    loadClasses();

    updateStatistics();

}

initializePage();