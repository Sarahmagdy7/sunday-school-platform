"use strict";

(function () {

    // ========================================
    // إعدادات التخزين
    // ========================================

    const BIRTHDAYS_KEY = "sundaySchoolBirthdays_v1";

    let toastTimer = null;


    // ========================================
    // عناصر الصفحة
    // ========================================

    const birthdayFormCard = document.getElementById("birthdayFormCard");

    const birthdayForm = document.getElementById("birthdayForm");

    const birthdayFormTitle = document.getElementById("birthdayFormTitle");

    const birthdayId = document.getElementById("birthdayId");

    const personName = document.getElementById("personName");

    const personType = document.getElementById("personType");

    const personGroup = document.getElementById("personGroup");

    const birthDate = document.getElementById("birthDate");

    const birthdayNotes = document.getElementById("birthdayNotes");

    const addBirthdayBtn = document.getElementById("addBirthdayBtn");

    const emptyAddBirthdayBtn = document.getElementById("emptyAddBirthdayBtn");

    const cancelBirthdayBtn = document.getElementById("cancelBirthdayBtn");

    const enableNotificationsBtn = document.getElementById(
        "enableNotificationsBtn"
    );

    const birthdaySearch = document.getElementById("birthdaySearch");

    const personTypeFilter = document.getElementById("personTypeFilter");

    const birthdaysList = document.getElementById("birthdaysList");

    const birthdaysEmpty = document.getElementById("birthdaysEmpty");

    const totalBirthdays = document.getElementById("totalBirthdays");

    const tomorrowCount = document.getElementById("tomorrowCount");

    const weekCount = document.getElementById("weekCount");

    const tomorrowReminderText = document.getElementById(
        "tomorrowReminderText"
    );

    const toast = document.getElementById("toast");


    // ========================================
    // أسماء الأنواع
    // ========================================

    const typeNames = {
        child: "طفل / طفلة",
        teacher: "مدرس / مدرسة"
    };


    // ========================================
    // التاريخ المحلي
    // ========================================

    function getToday() {
        const now = new Date();

        return new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
    }


    function formatDateForInput(date) {
        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }


    function formatDateArabic(date) {
        return date.toLocaleDateString("ar-EG", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }


    function parseBirthDate(value) {
        if (typeof value !== "string") {
            return null;
        }

        const parts = value.split("-");

        if (parts.length !== 3) {
            return null;
        }

        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(month) ||
            !Number.isInteger(day)
        ) {
            return null;
        }

        const date = new Date(year, month - 1, day);

        // رفض التواريخ غير الصحيحة.

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }


    // ========================================
    // حساب عيد الميلاد القادم
    // ========================================

    function getNextBirthday(record) {
        const originalDate = parseBirthDate(record.birthDate);

        if (!originalDate) {
            return null;
        }

        const today = getToday();

        let next = new Date(
            today.getFullYear(),
            originalDate.getMonth(),
            originalDate.getDate()
        );

        // إذا كان عيد الميلاد قد مر هذا العام،
        // نستخدم موعد السنة القادمة.

        if (next < today) {
            next = new Date(
                today.getFullYear() + 1,
                originalDate.getMonth(),
                originalDate.getDate()
            );
        }

        const daysUntil = Math.round(
            (next.getTime() - today.getTime()) / 86400000
        );

        const ageTurning =
            next.getFullYear() - originalDate.getFullYear();

        return {
            date: next,
            dateString: formatDateForInput(next),
            daysUntil: daysUntil,
            ageTurning: ageTurning
        };
    }


    // ========================================
    // قراءة البيانات
    // ========================================

    function loadBirthdays() {
        try {
            const saved = localStorage.getItem(BIRTHDAYS_KEY);

            if (!saved) {
                return [];
            }

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {
            console.error(
                "تعذر تحميل أعياد الميلاد:",
                error
            );

            return [];
        }
    }


    // ========================================
    // حفظ البيانات
    // ========================================

    function saveBirthdays(records) {
        try {
            localStorage.setItem(
                BIRTHDAYS_KEY,
                JSON.stringify(records)
            );

            return true;

        } catch (error) {
            console.error(
                "تعذر حفظ أعياد الميلاد:",
                error
            );

            showToast(
                "تعذر الحفظ. تحققي من مساحة التخزين في المتصفح."
            );

            return false;
        }
    }


    // ========================================
    // إنشاء رقم تعريفي
    // ========================================

    function createId() {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {
            return window.crypto.randomUUID();
        }

        return String(Date.now()) +
            "-" +
            Math.random().toString(16).slice(2);
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
        }, 3200);
    }


    // ========================================
    // فتح النموذج
    // ========================================

    function openBirthdayForm() {
        birthdayFormCard.hidden = false;

        birthdayFormCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        personName.focus();
    }


    // ========================================
    // إغلاق النموذج
    // ========================================

    function closeBirthdayForm() {
        birthdayForm.reset();

        birthdayId.value = "";

        birthdayFormTitle.textContent =
            "إضافة عيد ميلاد جديد";

        birthdayFormCard.hidden = true;
    }


    // ========================================
    // تجهيز النموذج للإضافة
    // ========================================

    function prepareNewBirthday() {
        birthdayForm.reset();

        birthdayId.value = "";

        birthdayFormTitle.textContent =
            "إضافة عيد ميلاد جديد";

        personType.value = "child";

        openBirthdayForm();
    }


    // ========================================
    // تحديث إحصائيات الصفحة
    // ========================================

    function updateStatistics(records) {
        const validRecords = records.filter(function (record) {
            return getNextBirthday(record) !== null;
        });

        const tomorrowRecords = validRecords.filter(function (record) {
            return getNextBirthday(record).daysUntil === 1;
        });

        const weekRecords = validRecords.filter(function (record) {
            const info = getNextBirthday(record);

            return info.daysUntil >= 0 && info.daysUntil <= 7;
        });

        totalBirthdays.textContent = validRecords.length;

        tomorrowCount.textContent = tomorrowRecords.length;

        weekCount.textContent = weekRecords.length;


        // تحديث رسالة تذكيرات الغد.

        if (tomorrowRecords.length === 0) {
            tomorrowReminderText.textContent =
                "مفيش أعياد ميلاد مسجلة لبكرة. هتظهر هنا تلقائيًا لما يكون فيه عيد ميلاد بكرة.";
        } else {
            const names = tomorrowRecords.map(function (record) {
                return record.name;
            });

            tomorrowReminderText.textContent =
                "بكرة عيد ميلاد: " +
                names.join("، ") +
                ". متنسيش تهنئتهم! 🎂";
        }
    }


    // ========================================
    // إنشاء عنصر نصي
    // ========================================

    function createTextElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        element.textContent = text || "";

        return element;
    }


    // ========================================
    // إنشاء بطاقة عيد ميلاد
    // ========================================

    function createBirthdayCard(record) {
        const info = getNextBirthday(record);

        if (!info) {
            return null;
        }

        const card = document.createElement("article");

        card.className = "birthday-card";


        // رأس البطاقة.

        const header = document.createElement("div");

        header.className = "birthday-card-header";


        const avatar = createTextElement(
            "div",
            "birthday-avatar",
            record.type === "teacher" ? "👩‍🏫" : "🎂"
        );

        const personInfo = document.createElement("div");

        personInfo.className = "birthday-person-info";


        const name = createTextElement(
            "h3",
            "",
            record.name
        );

        const group = createTextElement(
            "p",
            "",
            record.group || "لم يتم تحديد الفصل أو المرحلة"
        );

        personInfo.appendChild(name);

        personInfo.appendChild(group);


        const badge = createTextElement(
            "span",
            "person-badge",
            typeNames[record.type] || "غير محدد"
        );

        header.appendChild(avatar);

        header.appendChild(personInfo);

        header.appendChild(badge);


        // تفاصيل عيد الميلاد.

        const details = document.createElement("div");

        details.className = "birthday-details";


        const dateLine = document.createElement("p");

        const dateLabel = createTextElement(
            "strong",
            "",
            "عيد الميلاد القادم: "
        );

        dateLine.appendChild(dateLabel);

        dateLine.appendChild(
            document.createTextNode(
                formatDateArabic(info.date)
            )
        );


        const ageLine = createTextElement(
            "p",
            "",
            "العمر في عيد الميلاد القادم: " +
                info.ageTurning +
                " سنة"
        );


        let countdownText = "";

        let countdownClass = "birthday-countdown";

        if (info.daysUntil === 0) {
            countdownText = "🎉 عيد ميلاده اليوم!";
            countdownClass += " today";

        } else if (info.daysUntil === 1) {
            countdownText = "🔔 بكرة عيد ميلاده";
            countdownClass += " tomorrow";

        } else {
            countdownText =
                "باقي " + info.daysUntil + " يوم";
        }

        const countdown = createTextElement(
            "span",
            countdownClass,
            countdownText
        );


        details.appendChild(dateLine);

        details.appendChild(ageLine);

        details.appendChild(countdown);


        // الملاحظات، إذا وُجدت.

        if (record.notes) {
            details.appendChild(
                createTextElement(
                    "p",
                    "",
                    "ملاحظات: " + record.notes
                )
            );
        }


        // أزرار التعديل والحذف.

        const actions = document.createElement("div");

        actions.className = "birthday-actions";


        const editButton = createTextElement(
            "button",
            "small-button",
            "✏️ تعديل"
        );

        editButton.type = "button";

        editButton.dataset.action = "edit";

        editButton.dataset.id = record.id;


        const deleteButton = createTextElement(
            "button",
            "small-button delete",
            "🗑️ حذف"
        );

        deleteButton.type = "button";

        deleteButton.dataset.action = "delete";

        deleteButton.dataset.id = record.id;


        actions.appendChild(editButton);

        actions.appendChild(deleteButton);


        // تجميع البطاقة.

        card.appendChild(header);

        card.appendChild(details);

        card.appendChild(actions);

        return card;
    }


    // ========================================
    // عرض أعياد الميلاد
    // ========================================

    function renderBirthdays() {
        const records = loadBirthdays();

        updateStatistics(records);

        const searchTerm =
            birthdaySearch.value.trim().toLowerCase();

        const selectedType = personTypeFilter.value;

        const filtered = records
            .filter(function (record) {
                const matchesSearch =
                    String(record.name || "")
                        .toLowerCase()
                        .includes(searchTerm);

                const matchesType =
                    selectedType === "all" ||
                    record.type === selectedType;

                return matchesSearch && matchesType;
            })
            .filter(function (record) {
                return getNextBirthday(record) !== null;
            })
            .sort(function (a, b) {
                const infoA = getNextBirthday(a);

                const infoB = getNextBirthday(b);

                if (infoA.daysUntil !== infoB.daysUntil) {
                    return infoA.daysUntil - infoB.daysUntil;
                }

                return String(a.name).localeCompare(
                    String(b.name),
                    "ar"
                );
            });

        birthdaysList.replaceChildren();

        if (filtered.length === 0) {
            birthdaysEmpty.hidden = false;
            return;
        }

        birthdaysEmpty.hidden = true;

        filtered.forEach(function (record) {
            const card = createBirthdayCard(record);

            if (card) {
                birthdaysList.appendChild(card);
            }
        });
    }


    // ========================================
    // إضافة أو تعديل عيد ميلاد
    // ========================================

    birthdayForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const name = personName.value.trim();

            const date = birthDate.value;

            if (!name || !date) {
                showToast(
                    "من فضلك اكتبي الاسم وتاريخ الميلاد."
                );

                return;
            }

            const parsedDate = parseBirthDate(date);

            if (!parsedDate) {
                showToast("تاريخ الميلاد غير صحيح.");
                return;
            }

            if (parsedDate > getToday()) {
                showToast(
                    "تاريخ الميلاد لا يمكن أن يكون في المستقبل."
                );

                return;
            }

            const records = loadBirthdays();

            const existingId = birthdayId.value;

            const record = {
                id: existingId || createId(),

                name: name,

                type: personType.value,

                group: personGroup.value.trim(),

                birthDate: date,

                notes: birthdayNotes.value.trim(),

                updatedAt: new Date().toISOString()
            };

            let updatedRecords;

            if (existingId) {
                updatedRecords = records.map(function (item) {
                    return item.id === existingId
                        ? {
                            ...item,
                            ...record
                        }
                        : item;
                });

            } else {
                updatedRecords = records.concat(record);
            }

            const saved = saveBirthdays(updatedRecords);

            if (!saved) {
                return;
            }

            closeBirthdayForm();

            renderBirthdays();

            showToast(
                existingId
                    ? "✅ تم تعديل عيد الميلاد."
                    : "✅ تمت إضافة عيد الميلاد."
            );

            // إعادة فحص التذكيرات بعد حفظ البيانات.

            if (typeof window.checkBirthdayReminders === "function") {
                window.checkBirthdayReminders();
            }
        }
    );


    // ========================================
    // تعديل أو حذف
    // ========================================

    birthdaysList.addEventListener(
        "click",
        function (event) {
            const button = event.target.closest(
                "button[data-action]"
            );

            if (!button) {
                return;
            }

            const id = button.dataset.id;

            const action = button.dataset.action;

            const records = loadBirthdays();

            const record = records.find(function (item) {
                return item.id === id;
            });

            if (!record) {
                showToast("لم يتم العثور على بيانات عيد الميلاد.");
                return;
            }


            // التعديل.

            if (action === "edit") {
                birthdayId.value = record.id;

                personName.value = record.name || "";

                personType.value = record.type || "child";

                personGroup.value = record.group || "";

                birthDate.value = record.birthDate || "";

                birthdayNotes.value = record.notes || "";

                birthdayFormTitle.textContent =
                    "تعديل بيانات عيد الميلاد";

                openBirthdayForm();

                return;
            }


            // الحذف.

            if (action === "delete") {
                const confirmed = confirm(
                    "هل تريدين حذف عيد ميلاد " +
                    record.name +
                    "؟"
                );

                if (!confirmed) {
                    return;
                }

                const updatedRecords = records.filter(
                    function (item) {
                        return item.id !== id;
                    }
                );

                if (!saveBirthdays(updatedRecords)) {
                    return;
                }

                renderBirthdays();

                showToast("تم حذف عيد الميلاد.");
            }
        }
    );


    // ========================================
    // فتح وإغلاق النموذج
    // ========================================

    addBirthdayBtn.addEventListener(
        "click",
        prepareNewBirthday
    );

    emptyAddBirthdayBtn.addEventListener(
        "click",
        prepareNewBirthday
    );

    cancelBirthdayBtn.addEventListener(
        "click",
        closeBirthdayForm
    );


    // ========================================
    // البحث والتصفية
    // ========================================

    birthdaySearch.addEventListener(
        "input",
        renderBirthdays
    );

    personTypeFilter.addEventListener(
        "change",
        renderBirthdays
    );


    // ========================================
    // تفعيل إشعارات المتصفح
    // ========================================

    enableNotificationsBtn.addEventListener(
        "click",
        async function () {
            if (!("Notification" in window)) {
                showToast(
                    "المتصفح لا يدعم إشعارات سطح المكتب."
                );

                return;
            }

            if (!window.isSecureContext) {
                showToast(
                    "افتحي المنصة باستخدام Live Server لتفعيل الإشعارات."
                );

                return;
            }

            try {
                const permission =
                    await Notification.requestPermission();

                if (permission === "granted") {
                    showToast(
                        "✅ تم تفعيل إشعارات المتصفح."
                    );

                    if (
                        typeof window.checkBirthdayReminders === "function"
                    ) {
                        window.checkBirthdayReminders();
                    }

                } else if (permission === "denied") {
                    showToast(
                        "الإشعارات مرفوضة. غيّري إذن الإشعارات من إعدادات المتصفح."
                    );

                } else {
                    showToast(
                        "لم يتم تفعيل الإشعارات بعد."
                    );
                }

            } catch (error) {
                console.error(
                    "تعذر تفعيل الإشعارات:",
                    error
                );

                showToast(
                    "تعذر تفعيل الإشعارات."
                );
            }
        }
    );


    // ========================================
    // تشغيل الصفحة
    // ========================================

    const todayString = formatDateForInput(getToday());

    birthDate.max = todayString;

    renderBirthdays();

})();