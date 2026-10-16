// =========================
// Elements
// =========================

const childrenTableBody = document.getElementById("childrenTableBody");

const searchInput = document.getElementById("searchInput");

const classFilter = document.getElementById("classFilter");

const genderFilter = document.getElementById("genderFilter");

const resetFiltersButton = document.getElementById("resetFiltersButton");

const addChildButton = document.getElementById("addChildButton");

const childModal = document.getElementById("childModal");

const closeModalButton = document.getElementById("closeModalButton");

const cancelModalButton = document.getElementById("cancelModalButton");

const childForm = document.getElementById("childForm");

const childIdInput = document.getElementById("childId");

const childNameInput = document.getElementById("childName");

const childGenderInput = document.getElementById("childGender");

const childClassInput = document.getElementById("childClass");

const guardianNameInput = document.getElementById("guardianName");

const guardianPhoneInput = document.getElementById("guardianPhone");

const modalTitle = document.getElementById("modalTitle");

const totalChildrenElement = document.getElementById("totalChildren");

const totalClassesElement = document.getElementById("totalClasses");

const registeredChildrenElement = document.getElementById("registeredChildren");

const resultsCountElement = document.getElementById("resultsCount");

const emptyState = document.getElementById("emptyState");

const toast = document.getElementById("toast");

const menuToggle = document.getElementById("menuToggle");

const sidebar = document.getElementById("sidebar");

const logoutButton = document.getElementById("logoutButton");


// ========================================
// بيانات الأطفال والفصول المشتركة
// ========================================

const CLASSES_STORAGE_KEY = "sundaySchoolClasses_v1";
const CHILDREN_STORAGE_KEY = "sundaySchoolChildren_v1";

// بيانات افتراضية للفصول، تُستخدم عند التشغيل لأول مرة
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

// بيانات افتراضية للأطفال
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

// تحميل البيانات من المتصفح أو إنشاء البيانات الافتراضية
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

// الفصول من نفس مصدر بيانات صفحة إدارة الفصول
let classes = loadSharedArray(
    CLASSES_STORAGE_KEY,
    defaultClassData
);

// الأطفال من مصدر بيانات مشترك
let children = loadSharedArray(
    CHILDREN_STORAGE_KEY,
    defaultChildrenData
);

// تحديد رقم الطفل التالي
let nextChildId = children.reduce(function (maximum, child) {
    return Math.max(maximum, Number(child.id) || 0);
}, 0) + 1;

let toastTimer;

// حفظ بيانات الأطفال
function saveChildren() {
    try {
        localStorage.setItem(
            CHILDREN_STORAGE_KEY,
            JSON.stringify(children)
        );

        return true;

    } catch (error) {
        console.error("تعذر حفظ بيانات الأطفال:", error);

        showToast("تعذر حفظ بيانات الأطفال في المتصفح.");

        return false;
    }
}
// =========================
// Helper Functions
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


function getClassName(classId) {
    const classItem = classes.find(function (item) {
        return item.id === Number(classId);
    });

    return classItem ? classItem.name : "غير محدد";
}


function getGenderName(gender) {
    return gender === "male" ? "ولد" : "بنت";
}


// =========================
// Notifications
// =========================

function showToast(message) {
    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);
}


// =========================
// Fill Class Selects
// =========================

function populateClassSelects() {
    classFilter.innerHTML = `
        <option value="all">كل الفصول</option>
    `;

    childClassInput.innerHTML = `
        <option value="">اختاري الفصل</option>
    `;

    classes.forEach(function (classItem) {
        const filterOption = document.createElement("option");

        filterOption.value = classItem.id;

        filterOption.textContent = classItem.name;

        classFilter.appendChild(filterOption);

        const formOption = document.createElement("option");

        formOption.value = classItem.id;

        formOption.textContent = classItem.name;

        childClassInput.appendChild(formOption);
    });
}


// =========================
// Render Children
// =========================

function renderChildren() {
    const searchText = searchInput.value.trim().toLowerCase();

    const selectedClass = classFilter.value;

    const selectedGender = genderFilter.value;

    const filteredChildren = children.filter(function (child) {
        const matchesName = child.name
            .toLowerCase()
            .includes(searchText);

        const matchesClass =
            selectedClass === "all" ||
            String(child.classId) === selectedClass;

        const matchesGender =
            selectedGender === "all" ||
            child.gender === selectedGender;

        return matchesName && matchesClass && matchesGender;
    });

    childrenTableBody.innerHTML = "";

    filteredChildren.forEach(function (child) {
        const row = document.createElement("tr");

        const childName = escapeHTML(child.name);

        const guardianName = escapeHTML(child.guardian);

        const phone = escapeHTML(child.phone || "غير مسجل");

        const className = escapeHTML(getClassName(child.classId));

        const genderClass =
            child.gender === "male"
                ? "gender-male"
                : "gender-female";

        row.innerHTML = `
            <td>
                <div class="child-info">

                    <div class="child-avatar">
                        ${escapeHTML(child.name.charAt(0))}
                    </div>

                    <div>
                        <h4>${childName}</h4>
                        <p>رقم الطفل: ${child.id}</p>
                    </div>

                </div>
            </td>

            <td>
                <span class="gender-badge ${genderClass}">
                    ${getGenderName(child.gender)}
                </span>
            </td>

            <td>
                <span class="class-badge">
                    ${className}
                </span>
            </td>

            <td>
                <span class="guardian-name">
                    ${guardianName}
                </span>
            </td>

            <td>
                <span class="phone-number">
                    ${phone}
                </span>
            </td>

            <td>
                <div class="action-buttons">

                    <button
                        type="button"
                        class="action-button edit-button"
                        data-action="edit"
                        data-id="${child.id}">
                        تعديل
                    </button>

                    <button
                        type="button"
                        class="action-button delete-button"
                        data-action="delete"
                        data-id="${child.id}">
                        حذف
                    </button>

                </div>
            </td>
        `;

        childrenTableBody.appendChild(row);
    });

    const noResults = filteredChildren.length === 0;

    emptyState.hidden = !noResults;

    childrenTableBody.parentElement.hidden = false;

    childrenTableBody.parentElement.style.display = noResults
        ? "none"
        : "table";

    updateStatistics(filteredChildren.length);
}


// =========================
// Update Statistics
// =========================

function updateStatistics(visibleCount) {
    totalChildrenElement.textContent = children.length;

    totalClassesElement.textContent = classes.length;

    registeredChildrenElement.textContent = children.length;

    resultsCountElement.textContent = visibleCount + " أطفال";
}


// =========================
// Modal
// =========================

function openModal(child = null) {
    childForm.reset();

    childIdInput.value = "";

    if (child) {
        modalTitle.textContent = "تعديل بيانات الطفل";

        childIdInput.value = child.id;

        childNameInput.value = child.name;

        childGenderInput.value = child.gender;

        childClassInput.value = String(child.classId);

        guardianNameInput.value = child.guardian;

        guardianPhoneInput.value = child.phone;
    } else {
        modalTitle.textContent = "إضافة طفل جديد";
    }

    childModal.hidden = false;

    document.body.style.overflow = "hidden";

    childNameInput.focus();
}


function closeModal() {
    childModal.hidden = true;

    document.body.style.overflow = "";
}


// =========================
// Add Child
// =========================

addChildButton.addEventListener("click", function () {
    openModal();
});

// ========================================
// إضافة طفل جديد أو تعديل بيانات طفل
// ========================================

childForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = childIdInput.value;
    const name = childNameInput.value.trim();
    const gender = childGenderInput.value;
    const classId = Number(childClassInput.value);
    const guardian = guardianNameInput.value.trim();
    const phone = guardianPhoneInput.value.trim();

    // التحقق من البيانات المطلوبة
    if (!name || !gender || !classId || !guardian) {
        showToast("من فضلك املئي الحقول المطلوبة.");
        return;
    }

    // التأكد من وجود الفصل المختار
    const classExists = classes.some(function (classItem) {
        return Number(classItem.id) === classId;
    });

    if (!classExists) {
        showToast("اختاري فصلًا موجودًا في القائمة.");
        return;
    }

    // التحقق من رقم الهاتف
    const phonePattern = /^[0-9+\s()-]*$/;

    if (phone && !phonePattern.test(phone)) {
        showToast("رقم التواصل يحتوي على رموز غير مسموح بها.");
        return;
    }

    // الاحتفاظ بنسخة احتياطية قبل التعديل
    const previousChildren = children.map(function (child) {
        return { ...child };
    });

    // تعديل طفل موجود
    if (id) {
        const childIndex = children.findIndex(function (child) {
            return String(child.id) === String(id);
        });

        if (childIndex === -1) {
            showToast("لم يتم العثور على بيانات الطفل.");
            return;
        }

        children[childIndex] = {
            ...children[childIndex],
            name: name,
            gender: gender,
            classId: classId,
            guardian: guardian,
            phone: phone
        };

    } else {
        // إضافة طفل جديد
        const newChild = {
            id: nextChildId,
            name: name,
            gender: gender,
            classId: classId,
            guardian: guardian,
            phone: phone
        };

        children.push(newChild);
    }

    // حفظ البيانات
    if (!saveChildren()) {
        children = previousChildren;
        renderChildren();
        return;
    }

    // تحديث رقم الطفل التالي بعد الإضافة
    if (!id) {
        nextChildId++;
    }

    // تحديث الصفحة
    closeModal();
    renderChildren();

    showToast(
        id
            ? "تم تعديل بيانات الطفل وحفظها بنجاح."
            : "تمت إضافة الطفل وحفظ بياناته بنجاح."
    );
});

// =========================
// Close Modal
// =========================

closeModalButton.addEventListener("click", closeModal);

cancelModalButton.addEventListener("click", closeModal);


childModal.addEventListener("click", function (event) {
    if (event.target === childModal) {
        closeModal();
    }
});


document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !childModal.hidden) {
        closeModal();
    }
});

// =========================
// Edit and Delete
// =========================

childrenTableBody.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const childId = Number(button.dataset.id);
    const action = button.dataset.action;

    const child = children.find(function (item) {
        return Number(item.id) === childId;
    });

    if (!child) {
        showToast("لم يتم العثور على بيانات الطفل.");
        return;
    }

    // تعديل بيانات الطفل
    if (action === "edit") {
        openModal(child);
        return;
    }

    // حذف الطفل
    if (action === "delete") {
        const confirmed = window.confirm(
            "هل أنتِ متأكدة من حذف بيانات الطفل " +
            child.name +
            "؟"
        );

        if (!confirmed) {
            return;
        }

        const previousChildren = children.map(function (item) {
            return { ...item };
        });

        children = children.filter(function (item) {
            return Number(item.id) !== childId;
        });

        // حفظ التغييرات
        if (!saveChildren()) {
            children = previousChildren;
            renderChildren();
            return;
        }

        showToast("تم حذف الطفل وحفظ التغييرات.");
        renderChildren();
    }
});


// =========================
// Search and Filters
// =========================

searchInput.addEventListener("input", renderChildren);

classFilter.addEventListener("change", renderChildren);

genderFilter.addEventListener("change", renderChildren);


resetFiltersButton.addEventListener("click", function () {
    searchInput.value = "";

    classFilter.value = "all";

    genderFilter.value = "all";

    renderChildren();

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

logoutButton.addEventListener("click", function () {
    const confirmed = window.confirm(
        "هل تريدين تسجيل الخروج والعودة إلى صفحة الدخول؟"
    );

    if (confirmed) {
        window.location.href = "../../index.html";
    }
});


// =========================
// Start Application
// =========================

populateClassSelects();

renderChildren();