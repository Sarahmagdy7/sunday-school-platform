"use strict";

// ========================================
// مكتبة الدروس - منصة مدارس الأحد
// ========================================

const STORAGE_KEY = "sundaySchoolLessons_v1";
const FILE_DB_NAME = "SundaySchoolFilesDB";
const FILE_STORE_NAME = "attachments";

const $ = (id) => document.getElementById(id);

// عناصر الصفحة
const lessonsGrid = $("lessonsGrid");
const emptyState = $("emptyState");

const searchInput = $("searchInput");
const stageFilter = $("stageFilter");
const categoryFilter = $("categoryFilter");

const addLessonBtn = $("addLessonBtn");
const resetFiltersBtn = $("resetFiltersBtn");
const emptyResetBtn = $("emptyResetBtn");

const lessonModal = $("lessonModal");
const lessonForm = $("lessonForm");
const modalTitle = $("modalTitle");

const closeModalBtn = $("closeModalBtn");
const cancelModalBtn = $("cancelModalBtn");

const lessonIdInput = $("lessonId");
const lessonTitleInput = $("lessonTitle");
const lessonCategoryInput = $("lessonCategory");
const lessonStageInput = $("lessonStage");
const lessonReferenceInput = $("lessonReference");
const lessonObjectiveInput = $("lessonObjective");
const lessonSummaryInput = $("lessonSummary");
const lessonDurationInput = $("lessonDuration");

const totalLessonsElement = $("totalLessons");
const oldTestamentCountElement = $("oldTestamentCount");
const newTestamentCountElement = $("newTestamentCount");
const otherLessonsCountElement = $("otherLessonsCount");
const resultsCountElement = $("resultsCount");

const detailsModal = $("detailsModal");
const detailsTitle = $("detailsTitle");
const lessonDetailsBody = $("lessonDetailsBody");

const closeDetailsBtn = $("closeDetailsBtn");
const closeDetailsFooterBtn = $("closeDetailsFooterBtn");
const editFromDetailsBtn = $("editFromDetailsBtn");

const toast = $("toast");

let currentDetailsLessonId = null;
let toastTimer = null;
let currentAttachmentUrls = [];

// ========================================
// الدروس الافتراضية
// ========================================

const defaultLessons = [
    {
        id: 1,
        title: "الله الخالق",
        category: "old",
        stage: "primary",
        reference: "سفر التكوين 1",
        objective: "أن يعرف الطفل أن الله خلق العالم وكل ما فيه.",
        summary: "نتعلم من قصة الخليقة أن الله خلق السماء والأرض والنور والمياه والنباتات والحيوانات والإنسان.",
        duration: 30
    },
    {
        id: 2,
        title: "نوح والفلك",
        category: "old",
        stage: "primary",
        reference: "سفر التكوين 6–9",
        objective: "أن يفهم الطفل أهمية الطاعة والثقة بالله.",
        summary: "نتعرف على قصة نوح والفلك، وكيف أطاع نوح الله ونفذ وصيته.",
        duration: 35
    },
    {
        id: 3,
        title: "يوسف وإخوته",
        category: "old",
        stage: "primary",
        reference: "سفر التكوين 37–45",
        objective: "أن يتعلم الطفل التسامح وعدم الانتقام.",
        summary: "نتعلم من قصة يوسف قيمة التسامح والمحبة ومسامحة الآخرين.",
        duration: 35
    },
    {
        id: 4,
        title: "داود وجليات",
        category: "old",
        stage: "primary",
        reference: "سفر صموئيل الأول 17",
        objective: "أن يتعلم الطفل الشجاعة والثقة بالله.",
        summary: "نتعرف على مواجهة داود لجليات، وكيف واجه داود الموقف بشجاعة وثقة بالله.",
        duration: 30
    },
    {
        id: 5,
        title: "ميلاد السيد المسيح",
        category: "new",
        stage: "primary",
        reference: "إنجيل لوقا 2",
        objective: "أن يتعرف الطفل على قصة الميلاد ومعنى المحبة.",
        summary: "نتعرف على قصة ميلاد السيد المسيح، ونتعلم الفرح والمحبة والعطاء.",
        duration: 35
    },
    {
        id: 6,
        title: "السامري الصالح",
        category: "new",
        stage: "primary",
        reference: "إنجيل لوقا 10: 25–37",
        objective: "أن يتعلم الطفل مساعدة الآخرين دون تمييز.",
        summary: "نتعلم أن المحبة الحقيقية تظهر في الأفعال ومساعدة المحتاج.",
        duration: 30
    },
    {
        id: 7,
        title: "تهدئة العاصفة",
        category: "new",
        stage: "primary",
        reference: "إنجيل مرقس 4: 35–41",
        objective: "أن يتعلم الطفل الثقة بالله وقت الخوف.",
        summary: "نتعرف على قصة التلاميذ في البحر وقت العاصفة وكيف هدأ السيد المسيح الرياح.",
        duration: 30
    },
    {
        id: 8,
        title: "زكا العشار",
        category: "new",
        stage: "primary",
        reference: "إنجيل لوقا 19: 1–10",
        objective: "أن يفهم الطفل معنى التوبة وتصحيح الأخطاء.",
        summary: "نتعلم من قصة زكا أنه يمكن للإنسان أن يغير سلوكه ويصحح أخطاءه.",
        duration: 30
    },
    {
        id: 9,
        title: "المحبة ومساعدة الآخرين",
        category: "other",
        stage: "all-stages",
        reference: "موضوع تربوي",
        objective: "أن يطبق الطفل المحبة من خلال مواقف يومية.",
        summary: "نتحدث عن صور المحبة في البيت والمدرسة والكنيسة.",
        duration: 25
    },
    {
        id: 10,
        title: "الصلاة والشكر",
        category: "other",
        stage: "nursery",
        reference: "موضوع تربوي",
        objective: "أن يتعلم الطفل التعبير عن الشكر بكلمات بسيطة.",
        summary: "نستخدم صورًا وقصصًا قصيرة لمساعدة الأطفال على التعبير عن الشكر.",
        duration: 20
    },
    {
        id: 11,
        title: "قصة السامري الصالح للصغار",
        category: "new",
        stage: "nursery",
        reference: "إنجيل لوقا 10",
        objective: "أن يتعلم الطفل مساعدة من يحتاج إليه.",
        summary: "نعرض القصة باستخدام صور وتمثيل بسيط للأطفال.",
        duration: 20
    },
    {
        id: 12,
        title: "الأمانة في حياتنا",
        category: "other",
        stage: "middle",
        reference: "موضوع تربوي",
        objective: "أن يميز الطالب بين التصرف الأمين وغير الأمين.",
        summary: "نتعلم الأمانة في الكلام والدراسة والتعامل مع الآخرين.",
        duration: 40
    }
];

// ========================================
// تحميل وحفظ الدروس
// ========================================

function loadLessons() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === null) {
            return defaultLessons.map(lesson => ({ ...lesson }));
        }

        const data = JSON.parse(saved);

        if (!Array.isArray(data)) {
            return defaultLessons.map(lesson => ({ ...lesson }));
        }

        return data;
    } catch (error) {
        console.error("خطأ في تحميل الدروس:", error);
        return defaultLessons.map(lesson => ({ ...lesson }));
    }
}

let lessons = loadLessons();

function saveLessons() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
        return true;
    } catch (error) {
        console.error("خطأ في حفظ الدروس:", error);
        showToast("تعذر حفظ الدروس في المتصفح.", "error");
        return false;
    }
}

// ========================================
// رسائل التنبيه
// ========================================

function showToast(message, type = "success") {
    if (!toast) {
        console.log(message);
        return;
    }

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.className = "toast show";

    toast.style.background =
        type === "error" ? "#a93f3f" : "#1d4536";

    toastTimer = setTimeout(() => {
        toast.className = "toast";
    }, 3500);
}

// ========================================
// تحويل النصوص إلى نص آمن
// ========================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ========================================
// أسماء التصنيفات والمراحل
// ========================================

function getCategoryLabel(category) {
    const labels = {
        old: "العهد القديم",
        new: "العهد الجديد",
        other: "موضوعات أخرى"
    };

    return labels[category] || "غير محدد";
}

function getStageLabel(stage) {
    const labels = {
        nursery: "الحضانة",
        primary: "الابتدائي",
        middle: "الإعدادي",
        secondary: "الثانوي",
        "all-stages": "كل المراحل"
    };

    return labels[stage] || "غير محدد";
}

function getCategoryClass(category) {
    if (category === "old") return "tag-old";
    if (category === "new") return "tag-new";
    return "tag-other";
}

function getCoverClass(category) {
    if (category === "old") return "old-cover";
    if (category === "new") return "new-cover";
    return "other-cover";
}

function getCoverSymbol(category) {
    if (category === "old") return "📜";
    if (category === "new") return "✝";
    return "♡";
}

// ========================================
// إضافة اختيار PDF والصور إلى نموذج الدرس
// ========================================

let attachmentInput = null;
let selectedAttachments = null;

function setupAttachmentInput() {
    if (!lessonForm) {
        console.error("لم يتم العثور على نموذج الدرس.");
        return;
    }

    attachmentInput = $("lessonAttachments");
    selectedAttachments = $("selectedAttachments");

    if (!attachmentInput) {
        console.error("لم يتم العثور على حقل رفع الملفات.");
        return;
    }

    if (!selectedAttachments) {
        console.error("لم يتم العثور على مكان عرض الملفات المختارة.");
        return;
    }

    attachmentInput.addEventListener(
        "change",
        renderSelectedAttachments
    );
}

    const wrapper = document.createElement("div");
    wrapper.className = "lesson-attachments-field";

    wrapper.style.cssText = `
        margin: 20px 0;
        padding: 16px;
        border: 1px dashed #9aaf9f;
        border-radius: 12px;
        background: #f8fbf8;
    `;

    const label = document.createElement("label");
    label.htmlFor = "lessonAttachments";
    label.textContent = "إرفاق كتاب PDF أو صور للدرس";
    label.style.cssText = `
        display: block;
        margin-bottom: 10px;
        font-weight: bold;
        color: #234c38;
    `;

    attachmentInput = document.createElement("input");
    attachmentInput.type = "file";
    attachmentInput.id = "lessonAttachments";
    attachmentInput.accept = ".pdf,application/pdf,image/*";
    attachmentInput.multiple = true;
    attachmentInput.style.cssText = `
        display: block;
        width: 100%;
        margin-bottom: 10px;
    `;

    const note = document.createElement("small");
    note.textContent =
        "يمكن اختيار أكثر من ملف PDF أو صورة. الملفات تُحفظ في هذا المتصفح.";
    note.style.cssText = `
        display: block;
        color: #5e6d62;
        line-height: 1.8;
    `;

    selectedAttachments = document.createElement("div");
    selectedAttachments.id = "selectedAttachments";
    selectedAttachments.style.cssText = `
        margin-top: 10px;
        overflow-wrap: anywhere;
    `;

    wrapper.append(label, attachmentInput, note, selectedAttachments);

    // إدراج حقل الملفات قبل مجموعة أزرار النموذج، إن وُجدت
    let anchor = lessonForm.querySelector('[type="submit"]');

    while (anchor && anchor.parentElement !== lessonForm) {
        anchor = anchor.parentElement;
    }

    if (anchor) {
        lessonForm.insertBefore(wrapper, anchor);
    } else {
        lessonForm.appendChild(wrapper);
    }

    attachmentInput.addEventListener("change", renderSelectedAttachments);


function renderSelectedAttachments() {
    if (!selectedAttachments || !attachmentInput) return;

    selectedAttachments.replaceChildren();

    const files = Array.from(attachmentInput.files || []);

    if (files.length === 0) return;

    const heading = document.createElement("p");
    heading.textContent = "الملفات المختارة:";
    heading.style.fontWeight = "bold";
    selectedAttachments.appendChild(heading);

    files.forEach(file => {
        const item = document.createElement("p");

        const sizeKB = Math.max(1, Math.round(file.size / 1024));

        item.textContent = `📎 ${file.name} — ${sizeKB} KB`;
        item.style.cssText = `
            margin: 6px 0;
            font-size: 14px;
        `;

        selectedAttachments.appendChild(item);
    });
}

function clearSelectedAttachments() {
    if (attachmentInput) {
        attachmentInput.value = "";
    }

    if (selectedAttachments) {
        selectedAttachments.replaceChildren();
    }
}

// ========================================
// تخزين ملفات PDF والصور في IndexedDB
// ========================================

function openFilesDatabase() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(new Error("المتصفح لا يدعم تخزين الملفات."));
            return;
        }

        const request = indexedDB.open(FILE_DB_NAME, 1);

        request.onupgradeneeded = function () {
            const db = request.result;

            if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
                db.createObjectStore(FILE_STORE_NAME, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error || new Error("تعذر فتح مخزن الملفات."));
        };
    });
}

async function saveLessonAttachments(lessonId, files) {
    if (!files || files.length === 0) return;

    const db = await openFilesDatabase();

    try {
        await new Promise((resolve, reject) => {
            const transaction = db.transaction(
                FILE_STORE_NAME,
                "readwrite"
            );

            const store = transaction.objectStore(FILE_STORE_NAME);

            files.forEach(file => {
                const uniqueId =
                    `${lessonId}_${Date.now()}_${Math.random()
                    .toString(36).slice(2)}`;

                store.put({
                    id: uniqueId,
                    lessonId: Number(lessonId),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    blob: file,
                    addedAt: new Date().toISOString()
                });
            });

            transaction.oncomplete = () => resolve();

            transaction.onerror = () => {
                reject(transaction.error || new Error("تعذر حفظ الملفات."));
            };

            transaction.onabort = () => {
                reject(transaction.error || new Error("تم إلغاء حفظ الملفات."));
            };
        });
    } finally {
        db.close();
    }
}

async function getLessonAttachments(lessonId) {
    const db = await openFilesDatabase();

    try {
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(
                FILE_STORE_NAME,
                "readonly"
            );

            const request = transaction
                .objectStore(FILE_STORE_NAME)
                .getAll();

            request.onsuccess = function () {
                const files = request.result.filter(file =>
                    Number(file.lessonId) === Number(lessonId)
                );

                resolve(files);
            };

            request.onerror = function () {
                reject(request.error || new Error("تعذر قراءة الملفات."));
            };
        });
    } finally {
        db.close();
    }
}

async function deleteLessonAttachments(lessonId) {
    const db = await openFilesDatabase();

    try {
        await new Promise((resolve, reject) => {
            const transaction = db.transaction(
                FILE_STORE_NAME,
                "readwrite"
            );

            const store = transaction.objectStore(FILE_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = function () {
                request.result
                    .filter(file =>
                        Number(file.lessonId) === Number(lessonId)
                    )
                    .forEach(file => store.delete(file.id));
            };

            request.onerror = function () {
                reject(request.error || new Error("تعذر حذف الملفات."));
            };

            transaction.oncomplete = () => resolve();

            transaction.onerror = () => {
                reject(transaction.error || new Error("تعذر حذف الملفات."));
            };

            transaction.onabort = () => {
                reject(transaction.error || new Error("تم إلغاء حذف الملفات."));
            };
        });
    } finally {
        db.close();
    }
}

// ========================================
// الإحصائيات
// ========================================

function updateStatistics() {
    if (totalLessonsElement) {
        totalLessonsElement.textContent = lessons.length;
    }

    if (oldTestamentCountElement) {
        oldTestamentCountElement.textContent =
            lessons.filter(lesson => lesson.category === "old").length;
    }

    if (newTestamentCountElement) {
        newTestamentCountElement.textContent =
            lessons.filter(lesson => lesson.category === "new").length;
    }

    if (otherLessonsCountElement) {
        otherLessonsCountElement.textContent =
            lessons.filter(lesson => lesson.category === "other").length;
    }
}

// ========================================
// البحث والتصفية
// ========================================

function getFilteredLessons() {
    const searchValue = String(searchInput?.value || "")
        .trim()
        .toLowerCase();

    const selectedStage = stageFilter?.value || "all";
    const selectedCategory = categoryFilter?.value || "all";

    return lessons.filter(lesson => {
        const searchableText = [
            lesson.title,
            lesson.reference,
            lesson.objective,
            lesson.summary
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchValue);

        const matchesStage =
            selectedStage === "all" ||
            lesson.stage === selectedStage ||
            lesson.stage === "all-stages";

        const matchesCategory =
            selectedCategory === "all" ||
            lesson.category === selectedCategory;

        return matchesSearch && matchesStage && matchesCategory;
    });
}

// ========================================
// إنشاء بطاقة الدرس
// ========================================

function createLessonCard(lesson, index) {
    const card = document.createElement("article");

    card.className = "lesson-card";

    const categoryClass = getCategoryClass(lesson.category);
    const coverClass = getCoverClass(lesson.category);
    const coverSymbol = getCoverSymbol(lesson.category);

    card.innerHTML = `
        <div class="lesson-cover ${coverClass}">
            <span class="cover-symbol">${coverSymbol}</span>
            <span class="cover-number">${index + 1}</span>
        </div>

        <div class="lesson-content">
            <div class="lesson-tags">
                <span class="lesson-tag ${categoryClass}">
                    ${escapeHTML(getCategoryLabel(lesson.category))}
                </span>

                <span class="lesson-tag tag-stage">
                    ${escapeHTML(getStageLabel(lesson.stage))}
                </span>
            </div>

            <h3>${escapeHTML(lesson.title)}</h3>

            <p class="lesson-reference">
                ${escapeHTML(lesson.reference || "لا يوجد مرجع محدد")}
            </p>

            <p class="lesson-objective">
                ${escapeHTML(lesson.objective)}
            </p>

            <div class="lesson-meta">
                <span>◷ ${Number(lesson.duration) || 30} دقيقة</span>
                <span>📖 ${escapeHTML(getCategoryLabel(lesson.category))}</span>
            </div>

            <div class="lesson-actions">
                <button type="button" data-action="details" data-id="${Number(lesson.id)}">
                    عرض التفاصيل
                </button>

                <button type="button" data-action="edit" data-id="${Number(lesson.id)}">
                    تعديل
                </button>

                <button
                    type="button"
                    class="delete-lesson-button"
                    data-action="delete"
                    data-id="${Number(lesson.id)}"
                    aria-label="حذف الدرس"
                >
                    حذف
                </button>
            </div>
        </div>
    `;

    return card;
}

// ========================================
// عرض الدروس
// ========================================

function renderLessons() {
    if (!lessonsGrid) {
        console.error("لم يتم العثور على العنصر lessonsGrid في HTML.");
        return;
    }

    const filteredLessons = getFilteredLessons();

    lessonsGrid.replaceChildren();

    updateStatistics();

    if (resultsCountElement) {
        resultsCountElement.textContent =
            `عدد الدروس المعروضة: ${filteredLessons.length} من ${lessons.length}`;
    }

    if (filteredLessons.length === 0) {
        lessonsGrid.hidden = true;

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }

    lessonsGrid.hidden = false;

    if (emptyState) {
        emptyState.hidden = true;
    }

    filteredLessons.forEach((lesson, index) => {
        lessonsGrid.appendChild(createLessonCard(lesson, index));
    });
}

// ========================================
// نافذة إضافة درس
// ========================================

function openAddModal() {
    if (!lessonModal || !lessonForm) {
        showToast("تعذر فتح نموذج الدرس. راجعي ملف HTML.", "error");
        return;
    }

    lessonForm.reset();
    clearSelectedAttachments();

    lessonIdInput.value = "";
    modalTitle.textContent = "إضافة درس جديد";

    const submitButton = lessonForm.querySelector('[type="submit"]');

    if (submitButton) {
        submitButton.textContent = "حفظ الدرس";
    }

    lessonDurationInput.value = "30";

    lessonModal.hidden = false;
    document.body.style.overflow = "hidden";

    if (lessonTitleInput) {
        lessonTitleInput.focus();
    }
}

function closeLessonModal() {
    if (!lessonModal || !lessonForm) return;

    lessonModal.hidden = true;
    document.body.style.overflow = "";

    lessonForm.reset();
    clearSelectedAttachments();
}

// ========================================
// تعديل درس
// ========================================

function openEditModal(lessonId) {
    const lesson = lessons.find(
        item => Number(item.id) === Number(lessonId)
    );

    if (!lesson) {
        showToast("لم يتم العثور على الدرس.", "error");
        return;
    }

    lessonForm.reset();
    clearSelectedAttachments();

    lessonIdInput.value = lesson.id;
    lessonTitleInput.value = lesson.title;
    lessonCategoryInput.value = lesson.category;
    lessonStageInput.value = lesson.stage;
    lessonReferenceInput.value = lesson.reference || "";
    lessonObjectiveInput.value = lesson.objective;
    lessonSummaryInput.value = lesson.summary;
    lessonDurationInput.value = lesson.duration || 30;

    modalTitle.textContent = "تعديل الدرس";

    const submitButton = lessonForm.querySelector('[type="submit"]');

    if (submitButton) {
        submitButton.textContent = "حفظ التعديلات";
    }

    lessonModal.hidden = false;
    document.body.style.overflow = "hidden";

    lessonTitleInput.focus();
}

// ========================================
// التحقق من بيانات الدرس
// ========================================

function validateLessonData(data) {
    if (!data.title) {
        showToast("اكتبي عنوان الدرس.", "error");
        lessonTitleInput.focus();
        return false;
    }

    if (!["old", "new", "other"].includes(data.category)) {
        showToast("اختاري تصنيف الدرس.", "error");
        return false;
    }

    if (![
        "nursery",
        "primary",
        "middle",
        "secondary",
        "all-stages"
    ].includes(data.stage)) {
        showToast("اختاري المرحلة الدراسية.", "error");
        return false;
    }

    if (!data.objective) {
        showToast("اكتبي هدف الدرس.", "error");
        lessonObjectiveInput.focus();
        return false;
    }

    if (!data.summary) {
        showToast("اكتبي ملخص الدرس.", "error");
        lessonSummaryInput.focus();
        return false;
    }

    if (
        !Number.isFinite(data.duration) ||
        data.duration < 5 ||
        data.duration > 180
    ) {
        showToast("يجب أن تكون المدة من 5 إلى 180 دقيقة.", "error");
        lessonDurationInput.focus();
        return false;
    }

    return true;
}

// ========================================
// إضافة درس أو حفظ تعديله
// ========================================

async function handleLessonSubmit(event) {
    event.preventDefault();

    const editingId = lessonIdInput.value;
    const files = Array.from(attachmentInput?.files || []);

    const lessonData = {
        title: lessonTitleInput.value.trim(),
        category: lessonCategoryInput.value,
        stage: lessonStageInput.value,
        reference: lessonReferenceInput.value.trim(),
        objective: lessonObjectiveInput.value.trim(),
        summary: lessonSummaryInput.value.trim(),
        duration: Number(lessonDurationInput.value)
    };

    if (!validateLessonData(lessonData)) return;

    let savedLessonId;

    if (editingId) {
        const index = lessons.findIndex(
            lesson => Number(lesson.id) === Number(editingId)
        );

        if (index === -1) {
            showToast("لم يتم العثور على الدرس المطلوب تعديله.", "error");
            return;
        }

        const previousLesson = { ...lessons[index] };

        lessons[index] = {
            ...previousLesson,
            ...lessonData
        };

        if (!saveLessons()) {
            lessons[index] = previousLesson;
            return;
        }

        savedLessonId = Number(editingId);
    } else {
        const newLesson = {
            id: Date.now(),
            ...lessonData
        };

        lessons.unshift(newLesson);

        if (!saveLessons()) {
            lessons = lessons.filter(
                lesson => lesson.id !== newLesson.id
            );
            return;
        }

        savedLessonId = newLesson.id;
    }

    let attachmentSaveFailed = false;

    if (files.length > 0) {
        try {
            await saveLessonAttachments(savedLessonId, files);
        } catch (error) {
            console.error("خطأ في حفظ المرفقات:", error);
            attachmentSaveFailed = true;
        }
    }

    closeLessonModal();

    if (!editingId) {
        if (searchInput) searchInput.value = "";
        if (stageFilter) stageFilter.value = "all";
        if (categoryFilter) categoryFilter.value = "all";
    }

    renderLessons();

    if (attachmentSaveFailed) {
        showToast(
            "تم حفظ بيانات الدرس، لكن تعذر حفظ بعض الملفات. راجعي مساحة التخزين.",
            "error"
        );
    } else {
        showToast(
            editingId
                ? "تم تعديل الدرس بنجاح."
                : "تمت إضافة الدرس بنجاح."
        );
    }
}

// ========================================
// عرض تفاصيل الدرس ومرفقاته
// ========================================

function clearAttachmentUrls() {
    currentAttachmentUrls.forEach(url => URL.revokeObjectURL(url));
    currentAttachmentUrls = [];
}

async function openDetailsModal(lessonId) {
    const lesson = lessons.find(
        item => Number(item.id) === Number(lessonId)
    );

    if (!lesson) {
        showToast("لم يتم العثور على الدرس.", "error");
        return;
    }

    clearAttachmentUrls();

    currentDetailsLessonId = Number(lessonId);

    detailsTitle.textContent = lesson.title;

    lessonDetailsBody.innerHTML = `
        <div class="details-info">
            <p>
                <strong>تصنيف الدرس:</strong>
                ${escapeHTML(getCategoryLabel(lesson.category))}
            </p>

            <p>
                <strong>المرحلة الدراسية:</strong>
                ${escapeHTML(getStageLabel(lesson.stage))}
            </p>

            <p>
                <strong>المرجع:</strong>
                ${escapeHTML(lesson.reference || "لا يوجد مرجع محدد")}
            </p>

            <p>
                <strong>هدف الدرس:</strong>
                ${escapeHTML(lesson.objective)}
            </p>

            <p>
                <strong>ملخص الدرس:</strong>
                ${escapeHTML(lesson.summary)}
            </p>

            <p>
                <strong>مدة الدرس:</strong>
                ${Number(lesson.duration) || 30} دقيقة
            </p>
        </div>
    `;

    detailsModal.hidden = false;
    document.body.style.overflow = "hidden";

    try {
        const files = await getLessonAttachments(lesson.id);

        // قد تكون نافذة التفاصيل أُغلقت أثناء تحميل الملفات
        if (
            detailsModal.hidden ||
            currentDetailsLessonId !== Number(lessonId)
        ) {
            return;
        }

        const heading = document.createElement("h3");
        heading.textContent = "الكتب والصور المرفقة";
        heading.style.marginTop = "24px";

        lessonDetailsBody.appendChild(heading);

        if (files.length === 0) {
            const message = document.createElement("p");
            message.textContent = "لا توجد ملفات مرفقة بهذا الدرس.";
            lessonDetailsBody.appendChild(message);
            return;
        }

        const list = document.createElement("div");
        list.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
            margin-top: 12px;
        `;

        files.forEach(file => {
            const card = document.createElement("div");
            card.style.cssText = `
                border: 1px solid #ddd;
                border-radius: 10px;
                padding: 12px;
                overflow-wrap: anywhere;
            `;

            const url = URL.createObjectURL(file.blob);
            currentAttachmentUrls.push(url);

            const link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = file.name;
            link.style.cssText = `
                display: block;
                margin-top: 8px;
                color: #236346;
                font-weight: bold;
            `;

            const isImage =
                (file.type || "").startsWith("image/");

            if (isImage) {
                const image = document.createElement("img");
                image.src = url;
                image.alt = file.name;
                image.style.cssText = `
                    width: 100%;
                    max-height: 160px;
                    object-fit: contain;
                `;

                card.appendChild(image);
            } else {
                const icon = document.createElement("div");
                icon.textContent = "📄 PDF";
                icon.style.fontSize = "28px";
                card.appendChild(icon);
            }

            card.appendChild(link);
            list.appendChild(card);
        });

        lessonDetailsBody.appendChild(list);
    } catch (error) {
        console.error("تعذر تحميل المرفقات:", error);
        showToast("تعذر تحميل ملفات الدرس.", "error");
    }
}

function closeDetailsModal() {
    if (!detailsModal) return;

    detailsModal.hidden = true;
    currentDetailsLessonId = null;

    clearAttachmentUrls();

    document.body.style.overflow = "";
}

function editFromDetails() {
    if (currentDetailsLessonId === null) return;

    const lessonId = currentDetailsLessonId;

    closeDetailsModal();
    openEditModal(lessonId);
}

// ========================================
// حذف درس ومرفقاته
// ========================================

async function deleteLesson(lessonId) {
    const lesson = lessons.find(
        item => Number(item.id) === Number(lessonId)
    );

    if (!lesson) {
        showToast("لم يتم العثور على الدرس.", "error");
        return;
    }

    const confirmed = window.confirm(
        `هل أنتِ متأكدة من حذف درس "${lesson.title}"؟`
    );

    if (!confirmed) return;

    const oldLessons = [...lessons];

    lessons = lessons.filter(
        item => Number(item.id) !== Number(lessonId)
    );

    if (!saveLessons()) {
        lessons = oldLessons;
        return;
    }

    if (Number(currentDetailsLessonId) === Number(lessonId)) {
        closeDetailsModal();
    }

    let filesDeleted = true;

    try {
        await deleteLessonAttachments(lessonId);
    } catch (error) {
        console.error("تعذر حذف مرفقات الدرس:", error);
        filesDeleted = false;
    }

    renderLessons();

    showToast(
        filesDeleted
            ? "تم حذف الدرس ومرفقاته."
            : "تم حذف الدرس، لكن تعذر حذف بعض المرفقات.",
        filesDeleted ? "success" : "error"
    );
}

// ========================================
// إعادة ضبط البحث والفلاتر
// ========================================

function resetFilters() {
    if (searchInput) searchInput.value = "";
    if (stageFilter) stageFilter.value = "all";
    if (categoryFilter) categoryFilter.value = "all";

    renderLessons();

    showToast("تمت إعادة ضبط البحث والفلاتر.");
}

// ========================================
// تشغيل الصفحة وربط الأزرار
// ========================================

function initializeLessonsPage() {
    if (!lessonsGrid || !lessonForm) {
        console.error(
            "تعذر تشغيل مكتبة الدروس. تأكدي من وجود lessonsGrid و lessonForm في HTML."
        );
        return;
    }

    setupAttachmentInput();

    if (searchInput) {
        searchInput.addEventListener("input", renderLessons);
    }
    if (addLessonBtn) {
    addLessonBtn.addEventListener("click", openAddModal);
}

    if (stageFilter) {
        stageFilter.addEventListener("change", renderLessons);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", renderLessons);
    }

    if (addLessonBtn) {
        addLessonBtn.addEventListener("click", openAddModal);
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", resetFilters);
    }

    if (emptyResetBtn) {
        emptyResetBtn.addEventListener("click", resetFilters);
    }

    lessonForm.addEventListener("submit", handleLessonSubmit);

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeLessonModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener("click", closeLessonModal);
    }

    if (lessonModal) {
        lessonModal.querySelectorAll("[data-close-modal]").forEach(element => {
            element.addEventListener("click", closeLessonModal);
        });
    }

    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener("click", closeDetailsModal);
    }

    if (closeDetailsFooterBtn) {
        closeDetailsFooterBtn.addEventListener("click", closeDetailsModal);
    }

    if (detailsModal) {
        detailsModal.querySelectorAll("[data-close-details]").forEach(element => {
            element.addEventListener("click", closeDetailsModal);
        });
    }

    if (editFromDetailsBtn) {
        editFromDetailsBtn.addEventListener("click", editFromDetails);
    }

    lessonsGrid.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const lessonId = Number(button.dataset.id);

        if (!Number.isSafeInteger(lessonId)) {
            showToast("معرّف الدرس غير صحيح.", "error");
            return;
        }

        if (action === "details") {
            openDetailsModal(lessonId);
        } else if (action === "edit") {
            openEditModal(lessonId);
        } else if (action === "delete") {
            deleteLesson(lessonId);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;

        if (lessonModal && !lessonModal.hidden) {
            closeLessonModal();
        } else if (detailsModal && !detailsModal.hidden) {
            closeDetailsModal();
        }
    });

    renderLessons();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLessonsPage);
} else {
    initializeLessonsPage();
}
