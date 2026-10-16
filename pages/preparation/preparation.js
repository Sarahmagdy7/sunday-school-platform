"use strict";

// ========================================
// عناصر الصفحة
// ========================================

const preparationForm = document.getElementById("preparationForm");

const preparationIdInput = document.getElementById("preparationId");
const lessonSelect = document.getElementById("lessonSelect");
const lessonTitleInput = document.getElementById("lessonTitle");
const lessonStageSelect = document.getElementById("lessonStage");
const lessonClassSelect = document.getElementById("lessonClass");
const lessonDateInput = document.getElementById("lessonDate");
const lessonReferenceInput = document.getElementById("lessonReference");

const lessonObjectiveInput = document.getElementById("lessonObjective");
const lessonIntroductionInput = document.getElementById("lessonIntroduction");
const lessonToolsInput = document.getElementById("lessonTools");
const lessonStepsInput = document.getElementById("lessonSteps");
const lessonQuestionsInput = document.getElementById("lessonQuestions");
const lessonActivityInput = document.getElementById("lessonActivity");
const lessonReflectionInput = document.getElementById("lessonReflection");
const lessonConclusionInput = document.getElementById("lessonConclusion");

const formHeading = document.getElementById("formHeading");
const savePreparationBtn = document.getElementById("savePreparationBtn");
const resetFormBtn = document.getElementById("resetFormBtn");

const totalPreparations = document.getElementById("totalPreparations");
const primaryPreparations = document.getElementById("primaryPreparations");
const monthlyPreparations = document.getElementById("monthlyPreparations");

const searchPreparations = document.getElementById("searchPreparations");
const filterStage = document.getElementById("filterStage");

const preparationsList = document.getElementById("preparationsList");
const savedCount = document.getElementById("savedCount");
const emptyPreparations = document.getElementById("emptyPreparations");

const detailsModal = document.getElementById("detailsModal");
const detailsTitle = document.getElementById("detailsTitle");
const detailsContent = document.getElementById("detailsContent");

const closeDetailsBtn = document.getElementById("closeDetailsBtn");
const closeDetailsFooterBtn = document.getElementById("closeDetailsFooterBtn");
const printPreparationBtn = document.getElementById("printPreparationBtn");

const toast = document.getElementById("toast");


// ========================================
// إعدادات التخزين
// ========================================

const STORAGE_KEY = "sundaySchoolPreparations_v1";

let preparations = loadPreparations();
let toastTimer = null;
let preparationToPrint = null;


// ========================================
// أسماء المراحل
// ========================================

const stageNames = {
    nursery: "الحضانة",
    primary: "الابتدائي",
    middle: "الإعدادي",
    secondary: "الثانوي"
};


// ========================================
// أسماء الفصول
// ========================================

const classNames = {
    first: "الصف الأول الابتدائي",
    second: "الصف الثاني الابتدائي",
    third: "الصف الثالث الابتدائي",
    fourth: "الصف الرابع الابتدائي",
    fifth: "الصف الخامس الابتدائي",
    sixth: "الصف السادس الابتدائي",
    nursery: "الحضانة",
    general: "كل الفصول"
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
// تحميل التحضيرات المحفوظة
// ========================================

function loadPreparations() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData)) {
            return parsedData.filter(function (item) {
                return (
                    item &&
                    typeof item === "object" &&
                    typeof item.id === "string"
                );
            });
        }

        return [];

    } catch (error) {
        console.error(
            "تعذر تحميل التحضيرات:",
            error
        );

        return [];
    }
}


// ========================================
// حفظ التحضيرات في المتصفح
// ========================================

function savePreparations() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(preparations)
        );

        return true;

    } catch (error) {
        console.error(
            "تعذر حفظ التحضيرات:",
            error
        );

        showToast(
            "لم يتم الحفظ. تحققي من مساحة التخزين في المتصفح."
        );

        return false;
    }
}


// ========================================
// الرسائل القصيرة
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
// ملء بيانات الدرس المختار
// ========================================

lessonSelect.addEventListener("change", function () {
    const selectedOption =
        lessonSelect.options[lessonSelect.selectedIndex];

    if (
        !selectedOption ||
        !selectedOption.dataset.title
    ) {
        return;
    }

    lessonTitleInput.value = selectedOption.dataset.title;

    lessonReferenceInput.value =
        selectedOption.dataset.reference || "";
});


// ========================================
// جمع البيانات من النموذج
// ========================================

function getFormData() {
    const selectedOption =
        lessonSelect.options[lessonSelect.selectedIndex];

    const lessonOptionValue = lessonSelect.value;

    return {
        id: preparationIdInput.value ||
            "prep-" + Date.now() + "-" +
            Math.random().toString(36).slice(2, 8),

        lessonOptionValue: lessonOptionValue,

        lessonType: selectedOption
            ? selectedOption.textContent.trim()
            : "درس آخر",

        title: lessonTitleInput.value.trim(),

        stage: lessonStageSelect.value,

        classId: lessonClassSelect.value,

        date: lessonDateInput.value,

        reference: lessonReferenceInput.value.trim(),

        objective: lessonObjectiveInput.value.trim(),

        introduction: lessonIntroductionInput.value.trim(),

        tools: lessonToolsInput.value.trim(),

        steps: lessonStepsInput.value.trim(),

        questions: lessonQuestionsInput.value.trim(),

        activity: lessonActivityInput.value.trim(),

        reflection: lessonReflectionInput.value.trim(),

        conclusion: lessonConclusionInput.value.trim(),

        updatedAt: new Date().toISOString()
    };
}


// ========================================
// حفظ تحضير جديد أو تعديل تحضير موجود
// ========================================

preparationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!preparationForm.checkValidity()) {
        preparationForm.reportValidity();
        return;
    }

    const preparation = getFormData();

    if (
        !preparation.title ||
        !preparation.objective ||
        !preparation.steps
    ) {
        showToast(
            "من فضلك اكتبي عنوان الدرس والهدف وخطوات الشرح."
        );

        return;
    }

    const existingIndex = preparations.findIndex(
        function (item) {
            return item.id === preparation.id;
        }
    );

    if (existingIndex !== -1) {
        preparations[existingIndex] = preparation;
    } else {
        preparations.unshift(preparation);
    }

    const saved = savePreparations();

    if (!saved) {
        return;
    }

    renderPreparations();
    resetPreparationForm();

    if (existingIndex !== -1) {
        showToast("تم تعديل التحضير بنجاح.");
    } else {
        showToast("تم حفظ التحضير بنجاح.");
    }
});


// ========================================
// تفريغ النموذج لبدء تحضير جديد
// ========================================

function resetPreparationForm() {
    preparationForm.reset();

    preparationIdInput.value = "";

    lessonDateInput.value = getTodayDate();

    lessonSelect.value = "custom";

    formHeading.textContent = "تحضير درس جديد";

    savePreparationBtn.textContent = "💾 حفظ التحضير";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// زر التحضير الجديد
// ========================================

resetFormBtn.addEventListener("click", function () {
    const hasExistingContent =
        lessonTitleInput.value.trim() ||
        lessonObjectiveInput.value.trim() ||
        lessonStepsInput.value.trim();

    if (hasExistingContent) {
        const confirmed = confirm(
            "هل تريدين بدء تحضير جديد؟ لن يتم حفظ التعديلات غير المحفوظة."
        );

        if (!confirmed) {
            return;
        }
    }

    resetPreparationForm();
});


// ========================================
// تعديل تحضير محفوظ
// ========================================

function editPreparation(id) {
    const preparation = preparations.find(
        function (item) {
            return item.id === id;
        }
    );

    if (!preparation) {
        showToast("لم يتم العثور على التحضير.");
        return;
    }

    preparationIdInput.value = preparation.id;

    lessonSelect.value =
        preparation.lessonOptionValue || "custom";

    lessonTitleInput.value = preparation.title || "";

    lessonStageSelect.value = preparation.stage || "primary";

    lessonClassSelect.value = preparation.classId || "first";

    lessonDateInput.value =
        preparation.date || getTodayDate();

    lessonReferenceInput.value = preparation.reference || "";

    lessonObjectiveInput.value = preparation.objective || "";

    lessonIntroductionInput.value =
        preparation.introduction || "";

    lessonToolsInput.value = preparation.tools || "";

    lessonStepsInput.value = preparation.steps || "";

    lessonQuestionsInput.value = preparation.questions || "";

    lessonActivityInput.value = preparation.activity || "";

    lessonReflectionInput.value = preparation.reflection || "";

    lessonConclusionInput.value = preparation.conclusion || "";

    formHeading.textContent = "تعديل التحضير";

    savePreparationBtn.textContent = "💾 حفظ التعديلات";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    lessonTitleInput.focus();
}


// ========================================
// إنشاء عنصر نصي بأمان
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
// إنشاء بطاقة التحضير
// ========================================

function createPreparationCard(preparation) {
    const card = document.createElement("article");

    card.className = "preparation-item";

    const title = createTextElement(
        "h3",
        "",
        preparation.title || "درس بدون عنوان"
    );

    card.appendChild(title);


    // المرحلة والفصل

    const badges = document.createElement("div");

    badges.className = "item-badges";

    const stageBadge = createTextElement(
        "span",
        "item-badge",
        stageNames[preparation.stage] || "غير محدد"
    );

    const classBadge = createTextElement(
        "span",
        "item-badge",
        classNames[preparation.classId] || "غير محدد"
    );

    badges.appendChild(stageBadge);
    badges.appendChild(classBadge);

    card.appendChild(badges);


    // نوع الدرس وتاريخه

    const lessonType = createTextElement(
        "p",
        "",
        "الدرس: " + (preparation.lessonType || "درس آخر")
    );

    const date = createTextElement(
        "p",
        "",
        "التاريخ: " + (preparation.date || "غير محدد")
    );

    card.appendChild(lessonType);
    card.appendChild(date);


    // الهدف

    const objective = createTextElement(
        "p",
        "preparation-objective",
        "الهدف: " +
        (preparation.objective || "لم تتم إضافة هدف.")
    );

    card.appendChild(objective);


    // الأزرار

    const actions = document.createElement("div");

    actions.className = "item-actions";

    const viewButton = createActionButton(
        "عرض",
        "item-action",
        function () {
            viewPreparation(preparation.id);
        }
    );

    const editButton = createActionButton(
        "تعديل",
        "item-action",
        function () {
            editPreparation(preparation.id);
        }
    );

    const deleteButton = createActionButton(
        "حذف",
        "item-action delete-action",
        function () {
            deletePreparation(preparation.id);
        }
    );

    actions.appendChild(viewButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    card.appendChild(actions);

    return card;
}


// ========================================
// البحث والتصفية
// ========================================

function getFilteredPreparations() {
    const searchText = searchPreparations.value
        .trim()
        .toLowerCase();

    const selectedStage = filterStage.value;

    return preparations.filter(function (preparation) {
        const matchesStage =
            selectedStage === "all" ||
            preparation.stage === selectedStage;

        const searchableText = [
            preparation.title,
            preparation.lessonType,
            preparation.reference,
            preparation.objective,
            preparation.classId
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            searchableText.includes(searchText);

        return matchesStage && matchesSearch;
    });
}


// ========================================
// عرض التحضيرات
// ========================================

function renderPreparations() {
    preparationsList.innerHTML = "";

    const filteredPreparations = getFilteredPreparations();

    savedCount.textContent = preparations.length;

    if (filteredPreparations.length === 0) {
        emptyPreparations.hidden = false;
    } else {
        emptyPreparations.hidden = true;
    }

    filteredPreparations.forEach(function (preparation) {
        preparationsList.appendChild(
            createPreparationCard(preparation)
        );
    });

    updateStatistics();
}


// ========================================
// تحديث الإحصائيات
// ========================================

function updateStatistics() {
    const now = new Date();

    const currentMonth = now.getMonth();

    const currentYear = now.getFullYear();

    const primaryCount = preparations.filter(
        function (preparation) {
            return preparation.stage === "primary";
        }
    ).length;

    const monthlyCount = preparations.filter(
        function (preparation) {
            if (!preparation.date) {
                return false;
            }

            const parts = preparation.date.split("-");

            if (parts.length !== 3) {
                return false;
            }

            const year = Number(parts[0]);

            const month = Number(parts[1]) - 1;

            return (
                year === currentYear &&
                month === currentMonth
            );
        }
    ).length;

    totalPreparations.textContent = preparations.length;

    primaryPreparations.textContent = primaryCount;

    monthlyPreparations.textContent = monthlyCount;
}


// ========================================
// حذف تحضير
// ========================================

function deletePreparation(id) {
    const preparation = preparations.find(
        function (item) {
            return item.id === id;
        }
    );

    if (!preparation) {
        showToast("لم يتم العثور على التحضير.");
        return;
    }

    const confirmed = confirm(
        'هل تريدين حذف تحضير "' +
        preparation.title +
        '"؟'
    );

    if (!confirmed) {
        return;
    }

    const previousPreparations = preparations.slice();

    preparations = preparations.filter(
        function (item) {
            return item.id !== id;
        }
    );

    const saved = savePreparations();

    if (!saved) {
        preparations = previousPreparations;
        return;
    }

    if (preparationIdInput.value === id) {
        resetPreparationForm();
    }

    renderPreparations();

    showToast("تم حذف التحضير.");
}


// ========================================
// تفاصيل التحضير
// ========================================

const detailFields = [
    {
        key: "lessonType",
        label: "نوع الدرس"
    },
    {
        key: "date",
        label: "التاريخ"
    },
    {
        key: "stage",
        label: "المرحلة",
        custom: function (value) {
            return stageNames[value] || "غير محدد";
        }
    },
    {
        key: "classId",
        label: "الفصل",
        custom: function (value) {
            return classNames[value] || "غير محدد";
        }
    },
    {
        key: "reference",
        label: "المرجع الكتابي"
    },
    {
        key: "objective",
        label: "الهدف من الدرس"
    },
    {
        key: "introduction",
        label: "التمهيد"
    },
    {
        key: "tools",
        label: "الوسائل التعليمية"
    },
    {
        key: "steps",
        label: "خطوات الشرح"
    },
    {
        key: "questions",
        label: "الأسئلة والمناقشة"
    },
    {
        key: "activity",
        label: "النشاط والتطبيق"
    },
    {
        key: "reflection",
        label: "التأمل الشخصي"
    },
    {
        key: "conclusion",
        label: "الخاتمة والصلاة"
    }
];

function viewPreparation(id) {
    const preparation = preparations.find(
        function (item) {
            return item.id === id;
        }
    );

    if (!preparation) {
        showToast("لم يتم العثور على التحضير.");
        return;
    }

    preparationToPrint = preparation;

    detailsTitle.textContent =
        preparation.title || "تحضير درس";

    detailsContent.replaceChildren();

    detailFields.forEach(function (field) {
        let value = preparation[field.key];

        if (field.custom) {
            value = field.custom(value);
        }

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            value = "لم تتم إضافة بيانات.";
        }

        const row = document.createElement("section");

        row.className = "detail-row";

        const label = createTextElement(
            "h3",
            "",
            field.label
        );

        const content = createTextElement(
            "p",
            "",
            String(value)
        );

        row.appendChild(label);
        row.appendChild(content);

        detailsContent.appendChild(row);
    });

    detailsModal.hidden = false;

    document.body.style.overflow = "hidden";
}


// ========================================
// إغلاق نافذة التفاصيل
// ========================================

function closeDetailsModal() {
    detailsModal.hidden = true;

    document.body.style.overflow = "";

    preparationToPrint = null;
}

closeDetailsBtn.addEventListener(
    "click",
    closeDetailsModal
);

closeDetailsFooterBtn.addEventListener(
    "click",
    closeDetailsModal
);

detailsModal.addEventListener("click", function (event) {
    if (event.target === detailsModal) {
        closeDetailsModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        !detailsModal.hidden
    ) {
        closeDetailsModal();
    }
});


// ========================================
// طباعة التحضير
// ========================================

printPreparationBtn.addEventListener("click", function () {
    if (!preparationToPrint) {
        return;
    }

    window.print();
});


// ========================================
// تشغيل البحث والتصفية
// ========================================

searchPreparations.addEventListener(
    "input",
    renderPreparations
);

filterStage.addEventListener(
    "change",
    renderPreparations
);


// ========================================
// تشغيل الصفحة
// ========================================

lessonDateInput.value = getTodayDate();

renderPreparations();