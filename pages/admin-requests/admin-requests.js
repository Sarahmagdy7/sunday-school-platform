"use strict";

// نفس المفتاح المستخدم في صفحة إنشاء الحساب
const REQUESTS_KEY = "sundaySchoolRegistrationRequests_v1";

// عناصر الصفحة
const totalRequests = document.getElementById("totalRequests");
const pendingRequests = document.getElementById("pendingRequests");
const approvedRequests = document.getElementById("approvedRequests");
const rejectedRequests = document.getElementById("rejectedRequests");

const requestsTableBody = document.getElementById("requestsTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const messageBox = document.getElementById("messageBox");

// تحميل الطلبات من المتصفح
function loadRequests() {
    try {
        const savedRequests = localStorage.getItem(REQUESTS_KEY);

        if (!savedRequests) {
            return [];
        }

        const parsedRequests = JSON.parse(savedRequests);

        if (!Array.isArray(parsedRequests)) {
            return [];
        }

        return parsedRequests;
    } catch (error) {
        console.error("تعذر تحميل طلبات التسجيل:", error);

        showMessage(
            "تعذر قراءة طلبات التسجيل المحفوظة في المتصفح.",
            "error"
        );

        return [];
    }
}

let requests = loadRequests();

// تحويل حالة الطلب إلى نص عربي
function getStatusLabel(status) {
    const labels = {
        pending: "قيد المراجعة",
        approved: "مقبول",
        rejected: "مرفوض"
    };

    return labels[status] || "غير معروف";
}

// تنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) {
        return "غير متوفر";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "غير متوفر";
    }

    return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// رسائل الصفحة
function showMessage(message, type = "success") {
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`;
}

function hideMessage() {
    messageBox.textContent = "";
    messageBox.className = "message-box";
}

// حفظ التغييرات
function saveRequests() {
    try {
        localStorage.setItem(
            REQUESTS_KEY,
            JSON.stringify(requests)
        );

        return true;
    } catch (error) {
        console.error("تعذر حفظ حالة الطلب:", error);

        showMessage(
            "تعذر حفظ التغييرات في المتصفح.",
            "error"
        );

        return false;
    }
}

// تحديث بطاقات الإحصائيات
function updateStatistics() {
    totalRequests.textContent = requests.length;

    pendingRequests.textContent = requests.filter(
        request => request.status === "pending"
    ).length;

    approvedRequests.textContent = requests.filter(
        request => request.status === "approved"
    ).length;

    rejectedRequests.textContent = requests.filter(
        request => request.status === "rejected"
    ).length;
}

// إنشاء خلية نصية آمنة
function createCell(value, className = "") {
    const cell = document.createElement("td");

    cell.textContent = value || "غير مسجل";

    if (className) {
        cell.className = className;
    }

    return cell;
}

// إنشاء شارة حالة الطلب
function createStatusBadge(status) {
    const badge = document.createElement("span");

    badge.className = `status-badge status-${status}`;
    badge.textContent = getStatusLabel(status);

    return badge;
}

// إنشاء أزرار الإجراءات
function createActionButtons(request) {
    const cell = document.createElement("td");
    const container = document.createElement("div");

    container.className = "action-buttons";

    const approveButton = document.createElement("button");

    approveButton.type = "button";
    approveButton.className = "action-button approve-button";
    approveButton.dataset.action = "approve";
    approveButton.dataset.id = String(request.id);
    approveButton.textContent = "موافقة";
    approveButton.disabled = request.status !== "pending";

    const rejectButton = document.createElement("button");

    rejectButton.type = "button";
    rejectButton.className = "action-button reject-button";
    rejectButton.dataset.action = "reject";
    rejectButton.dataset.id = String(request.id);
    rejectButton.textContent = "رفض";
    rejectButton.disabled = request.status !== "pending";

    container.append(approveButton, rejectButton);
    cell.appendChild(container);

    return cell;
}

// إنشاء صف واحد
function createRequestRow(request, index) {
    const row = document.createElement("tr");

    row.appendChild(createCell(String(index + 1)));
    row.appendChild(createCell(request.name));
    row.appendChild(createCell(request.email, "email-cell"));
    row.appendChild(createCell(request.phone));

    row.appendChild(
        createCell(formatDate(request.createdAt))
    );

    const statusCell = document.createElement("td");

    statusCell.appendChild(
        createStatusBadge(request.status)
    );

    row.appendChild(statusCell);
    row.appendChild(createActionButtons(request));

    return row;
}

// البحث والتصفية
function getFilteredRequests() {
    const searchText = searchInput.value
        .trim()
        .toLowerCase();

    const selectedStatus = statusFilter.value;

    return requests.filter(request => {
        const name = String(request.name || "").toLowerCase();
        const email = String(request.email || "").toLowerCase();

        const matchesSearch =
            name.includes(searchText) ||
            email.includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            request.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
}

// عرض الطلبات
function renderRequests() {
    requestsTableBody.replaceChildren();

    const filteredRequests = getFilteredRequests();

    updateStatistics();

    resultsCount.textContent =
        `عدد الطلبات المعروضة: ${filteredRequests.length}`;

    emptyState.hidden = filteredRequests.length !== 0;

    filteredRequests.forEach((request, index) => {
        requestsTableBody.appendChild(
            createRequestRow(request, index)
        );
    });
}

// تغيير حالة طلب
function updateRequestStatus(requestId, newStatus) {
    hideMessage();

    if (!["approved", "rejected"].includes(newStatus)) {
        showMessage("حالة الطلب غير صحيحة.", "error");
        return;
    }

    const requestIndex = requests.findIndex(
        request => String(request.id) === String(requestId)
    );

    if (requestIndex === -1) {
        showMessage("لم يتم العثور على الطلب.", "error");
        return;
    }

    const request = requests[requestIndex];

    if (request.status !== "pending") {
        showMessage("تم اتخاذ قرار بشأن هذا الطلب من قبل.", "error");
        return;
    }

    const actionText =
        newStatus === "approved" ? "الموافقة على" : "رفض";

    const confirmed = window.confirm(
        `هل تريدين ${actionText} طلب ${request.name}؟`
    );

    if (!confirmed) {
        return;
    }

    const previousStatus = request.status;

    request.status = newStatus;

    if (!saveRequests()) {
        request.status = previousStatus;
        return;
    }

    renderRequests();

    showMessage(
        newStatus === "approved"
            ? "تم تسجيل الموافقة التجريبية على الطلب."
            : "تم تسجيل رفض الطلب.",
        "success"
    );
}

// أحداث أزرار الموافقة والرفض
requestsTableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const requestId = button.dataset.id;
    const action = button.dataset.action;

    if (action === "approve") {
        updateRequestStatus(requestId, "approved");
    } else if (action === "reject") {
        updateRequestStatus(requestId, "rejected");
    }
});

// البحث والتصفية
searchInput.addEventListener("input", renderRequests);
statusFilter.addEventListener("change", renderRequests);

resetFiltersBtn.addEventListener("click", function () {
    searchInput.value = "";
    statusFilter.value = "all";

    renderRequests();

    showMessage("تمت إعادة ضبط البحث والتصفية.", "success");
});

// تحديث البيانات لو تغيرت في تبويب آخر
window.addEventListener("storage", function (event) {
    if (event.key === REQUESTS_KEY) {
        requests = loadRequests();
        renderRequests();
    }
});

// تشغيل الصفحة
renderRequests();