// =========================
// Elements
// =========================

const classesGrid = document.getElementById("classesGrid");

const searchInput = document.getElementById("searchInput");
const stageFilter = document.getElementById("stageFilter");
const resetFiltersButton = document.getElementById("resetFiltersButton");

const addClassButton = document.getElementById("addClassButton");

const classModal = document.getElementById("classModal");
const closeModalButton = document.getElementById("closeModalButton");
const cancelModalButton = document.getElementById("cancelModalButton");

const classForm = document.getElementById("classForm");

const classIdInput = document.getElementById("classId");
const classNameInput = document.getElementById("className");
const classStageInput = document.getElementById("classStage");
const classTeacherInput = document.getElementById("classTeacher");
const classChildrenInput = document.getElementById("classChildren");

const modalTitle = document.getElementById("modalTitle");

const totalClassesElement = document.getElementById("totalClasses");
const totalChildrenElement = document.getElementById("totalChildren");
const resultsCountElement = document.getElementById("resultsCount");

const emptyState = document.getElementById("emptyState");

const toast = document.getElementById("toast");

// ========================================
// عرض رسائل التأكيد
// ========================================

function showToast(message) {
    const toastElement = document.getElementById("toast");

    if (!toastElement) {
        console.log(message);
        return;
    }

    toastElement.textContent = message;

    toastElement.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(function () {
        toastElement.classList.remove("show");
    }, 3000);
}
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

const logoutButton = document.getElementById("logoutButton");


// ========================================
// بيانات الفصول والتخزين المحلي
// ========================================

const CLASSES_STORAGE_KEY = "sundaySchoolClasses_v1";

const defaultClasses = [
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


// تحميل البيانات المحفوظة

function loadClasses() {
    try {
        const savedData = localStorage.getItem(
            CLASSES_STORAGE_KEY
        );

        if (savedData !== null) {
            const parsedData = JSON.parse(savedData);

            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        }

        localStorage.setItem(
            CLASSES_STORAGE_KEY,
            JSON.stringify(defaultClasses)
        );

    } catch (error) {
        console.error(
            "تعذر تحميل بيانات الفصول:",
            error
        );
    }

    return defaultClasses.map(function (classItem) {
        return { ...classItem };
    });
}


// حفظ البيانات

function saveClasses() {
    try {
        localStorage.setItem(
            CLASSES_STORAGE_KEY,
            JSON.stringify(classes)
        );

        return true;

    } catch (error) {
        console.error(
            "تعذر حفظ بيانات الفصول:",
            error
        );

        showToast("تعذر حفظ البيانات في المتصفح.");

        return false;
    }
}


// بدء بيانات الفصول

let classes = loadClasses();

let nextClassId = classes.reduce(function (maximum, classItem) {
    return Math.max(
        maximum,
        Number(classItem.id) || 0
    );
}, 0) + 1;


// =========================
// Helpers
// =========================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}


function getStageName(stage) {
    if (stage === "primary") {
        return "المرحلة الابتدائية";
    }

    return "مرحلة غير محددة";
}


function getGradeName(className) {
    const grades = [
        "الأول الابتدائي",
        "الثاني الابتدائي",
        "الثالث الابتدائي",
        "الرابع الابتدائي",
        "الخامس الابتدائي",
        "السادس الابتدائي"
    ];

    for (const grade of grades) {
        if (className.includes(grade)) {
            return grade;
        }
    }

    return className;
}


// =========================
// Render Classes
// =========================

function renderClasses() {
    const searchText = searchInput.value.trim().toLowerCase();

    const selectedStage = stageFilter.value;

    const filteredClasses = classes.filter(function (classItem) {
        const matchesName = classItem.name
            .toLowerCase()
            .includes(searchText);

        const matchesStage =
            selectedStage === "all" ||
            classItem.stage === selectedStage;

        return matchesName && matchesStage;
    });

    classesGrid.innerHTML = "";

    filteredClasses.forEach(function (classItem) {
        const card = document.createElement("article");

        card.className = "class-card";

        card.dataset.id = classItem.id;

        const escapedName = escapeHTML(classItem.name);
        const escapedTeacher = escapeHTML(classItem.teacher);
        const escapedGrade = escapeHTML(classItem.grade);

        card.innerHTML = `
            <div class="class-card-top">

                <div class="class-icon">
                    📚
                </div>

                <button
                    class="more-button"
                    type="button"
                    aria-label="خيارات الفصل">
                    ⋮
                </button>

                <div class="card-menu">

                    <button
                        type="button"
                        class="edit-class">
                        تعديل الفصل
                    </button>

                    <button
                        type="button"
                        class="delete-class">
                        حذف الفصل
                    </button>

                </div>

            </div>

            <span class="stage-badge">
                ${getStageName(classItem.stage)}
            </span>

            <h3>${escapedName}</h3>

            <p class="class-description">
                فصل ${escapedGrade} بمدارس الأحد.
            </p>

            <div class="card-divider"></div>

            <div class="class-details">

                <div class="detail-row">

                    <span class="detail-label">
                        المدرس الأساسي
                    </span>

                    <strong class="teacher-name">
                        ${escapedTeacher}
                    </strong>

                </div>

                <div class="detail-row">

                    <span class="detail-label">
                        عدد الأطفال
                    </span>

                    <strong class="children-count">
                        ${classItem.children} طفلًا
                    </strong>

                </div>

            </div>

            <button
                class="view-class-button"
                type="button">

                عرض تفاصيل الفصل

                <span>←</span>

            </button>
        `;

        classesGrid.appendChild(card);
    });

    updateStatistics(filteredClasses.length);

    resultsCountElement.textContent =
        filteredClasses.length + " فصول";

    emptyState.hidden = filteredClasses.length !== 0;

    classesGrid.hidden = filteredClasses.length === 0;
}


// =========================
// Update Statistics
// =========================

function updateStatistics(visibleCount) {
    const totalChildren = classes.reduce(function (total, classItem) {
        return total + Number(classItem.children);
    }, 0);

    totalClassesElement.textContent = classes.length;

    totalChildrenElement.textContent = totalChildren;

    resultsCountElement.textContent = visibleCount + " فصول";
}


// =========================
// Modal Functions
// =========================

function openModal(classItem = null) {
    classForm.reset();

    classIdInput.value = "";

    classChildrenInput.value = "0";

    if (classItem) {
        modalTitle.textContent = "تعديل بيانات الفصل";

        classIdInput.value = classItem.id;

        classNameInput.value = classItem.name;

        classStageInput.value = classItem.stage;

        classTeacherInput.value = classItem.teacher;

        classChildrenInput.value = classItem.children;
    } else {
        modalTitle.textContent = "إضافة فصل جديد";
    }

    classModal.hidden = false;

    document.body.style.overflow = "hidden";

    classNameInput.focus();
}


function closeModal() {
    classModal.hidden = true;

    document.body.style.overflow = "";
}


// =========================
// Add New Class
// =========================

addClassButton.addEventListener("click", function () {
    openModal();
});

// ========================================
// حفظ فصل جديد أو تعديل فصل موجود
// ========================================

classForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = classIdInput.value;
    const name = classNameInput.value.trim();
    const stage = classStageInput.value;
    const teacher = classTeacherInput.value.trim();
    const children = Number(classChildrenInput.value);

    // التحقق من البيانات المطلوبة

    if (!name || !stage || !teacher) {
        showToast("من فضلك املئي جميع الحقول المطلوبة.");
        return;
    }

    if (!Number.isInteger(children) || children < 0) {
        showToast("عدد الأطفال يجب أن يكون رقمًا صحيحًا غير سالب.");
        return;
    }

    // منع تكرار اسم الفصل

    const duplicateClass = classes.some(function (classItem) {
        return (
            classItem.name.toLowerCase() === name.toLowerCase() &&
            String(classItem.id) !== id
        );
    });

    if (duplicateClass) {
        showToast("يوجد فصل مسجل بنفس الاسم بالفعل.");
        return;
    }

    // الاحتفاظ بنسخة من البيانات قبل التعديل

    const previousClasses = classes.map(function (classItem) {
        return { ...classItem };
    });

    const isEditing = id !== "";

    // تعديل فصل موجود

    if (isEditing) {
        const classIndex = classes.findIndex(function (classItem) {
            return String(classItem.id) === id;
        });

        if (classIndex === -1) {
            showToast("لم يتم العثور على الفصل المطلوب.");
            return;
        }

        classes[classIndex] = {
            ...classes[classIndex],
            name: name,
            stage: stage,
            grade: getGradeName(name),
            teacher: teacher,
            children: children
        };

    } else {
        // إضافة فصل جديد

        classes.push({
            id: nextClassId,
            name: name,
            stage: stage,
            grade: getGradeName(name),
            teacher: teacher,
            children: children
        });
    }

    // حفظ البيانات في المتصفح

    if (!saveClasses()) {
        classes = previousClasses;
        renderClasses();
        return;
    }

    // زيادة الرقم بعد نجاح الحفظ

    if (!isEditing) {
        nextClassId++;
    }

    // تحديث الواجهة

    closeModal();
    renderClasses();

    showToast(
        isEditing
            ? "تم تعديل الفصل وحفظه بنجاح."
            : "تمت إضافة الفصل وحفظه بنجاح."
    );
});

// =========================
// Close Modal
// =========================

closeModalButton.addEventListener("click", closeModal);

cancelModalButton.addEventListener("click", closeModal);


classModal.addEventListener("click", function (event) {
    if (event.target === classModal) {
        closeModal();
    }
});


document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !classModal.hidden) {
        closeModal();
    }
});


// =========================
// Class Card Actions
// =========================

classesGrid.addEventListener("click", function (event) {
    const card = event.target.closest(".class-card");

    if (!card) {
        return;
    }

    const classId = Number(card.dataset.id);

    const classItem = classes.find(function (item) {
        return item.id === classId;
    });

    if (!classItem) {
        return;
    }

    const moreButton = event.target.closest(".more-button");

    if (moreButton) {
        const currentMenu = card.querySelector(".card-menu");

        document.querySelectorAll(".card-menu.open").forEach(function (menu) {
            if (menu !== currentMenu) {
                menu.classList.remove("open");
            }
        });

        currentMenu.classList.toggle("open");

        return;
    }

    const editButton = event.target.closest(".edit-class");

    if (editButton) {
        card.querySelector(".card-menu").classList.remove("open");

        openModal(classItem);

        return;
    }

    const deleteButton = event.target.closest(".delete-class");

    if (deleteButton) {
        card.querySelector(".card-menu").classList.remove("open");

        const confirmed = window.confirm(
            "هل أنتِ متأكدة من حذف الفصل: " + classItem.name + "؟"
        );

        if (!confirmed) {
            return;
        }

        const previousClasses = classes.slice();

classes = classes.filter(function (item) {
    return item.id !== classId;
});

if (!saveClasses()) {
    classes = previousClasses;
    return;
}

showToast("تم حذف الفصل بنجاح.");

renderClasses();

        return;
    }

    const viewButton = event.target.closest(".view-class-button");

if (viewButton) {
    window.location.href =
        "class-details.html?id=" +
        encodeURIComponent(classItem.id);

    return;
}
});


// =========================
// Search and Filters
// =========================

searchInput.addEventListener("input", renderClasses);

stageFilter.addEventListener("change", renderClasses);


resetFiltersButton.addEventListener("click", function () {
    searchInput.value = "";

    stageFilter.value = "all";

    renderClasses();

    showToast("تمت إعادة ضبط البحث والفلاتر.");
});


// =========================
// Sidebar
// =========================

menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("open");
});


document.addEventListener("click", function (event) {
    const clickedInsideSidebar = sidebar.contains(event.target);

    const clickedMenuToggle = menuToggle.contains(event.target);

    if (
        window.innerWidth <= 850 &&
        !clickedInsideSidebar &&
        !clickedMenuToggle
    ) {
        sidebar.classList.remove("open");
    }
});




// =========================
// Logout
// =========================

if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();

        const confirmed = window.confirm(
            "هل تريدين تسجيل الخروج والعودة إلى صفحة الدخول؟"
        );

        if (confirmed) {
            window.location.href = "../../index.html";
        }
    });
 }


// =========================
// Start Application
// =========================

renderClasses();