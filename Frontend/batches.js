// batches.js — Batch Management module (DVein Innovations)

let allBatches = [];

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar("batches");
  loadBatches();

  document.getElementById("searchInput").addEventListener("input", debounce(loadBatches, 300));
  document.getElementById("statusFilter").addEventListener("change", loadBatches);

  document.getElementById("openCreateBatch").addEventListener("click", () => openBatchModal());
  document.getElementById("closeBatchModal").addEventListener("click", closeBatchModal);
  document.getElementById("batchModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "batchModalOverlay") closeBatchModal();
  });
  document.getElementById("batchForm").addEventListener("submit", saveBatch);
});

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

async function loadBatches() {
  const search = document.getElementById("searchInput").value.trim();
  const status = document.getElementById("statusFilter").value;
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  try {
    const { batches } = await apiRequest(`/batches?${params.toString()}`);
    allBatches = batches;
    renderStats(batches);
    renderBatchTable(batches);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function renderStats(batches) {
  const ongoing = batches.filter((b) => b.status === "ongoing").length;
  const upcoming = batches.filter((b) => b.status === "upcoming").length;
  const enrolled = batches.reduce((sum, b) => sum + (b.enrolled || 0), 0);

  document.getElementById("statBatches").textContent = batches.length;
  document.getElementById("statOngoing").textContent = ongoing;
  document.getElementById("statUpcoming").textContent = upcoming;
  document.getElementById("statEnrolled").textContent = enrolled;
}

function renderBatchTable(batches) {
  const tbody = document.getElementById("batchTableBody");
  const emptyState = document.getElementById("batchEmptyState");

  if (batches.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  tbody.innerHTML = batches.map((b) => `
    <tr>
      <td class="code-cell">${b.code}</td>
      <td>${b.name}</td>
      <td>${b.track || "—"}</td>
      <td>${b.mentor || "—"}</td>
      <td>${formatDate(b.start_date)} → ${formatDate(b.end_date)}</td>
      <td>${b.enrolled} / ${b.capacity}</td>
      <td><span class="badge badge-${b.status}">${b.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="editBatch(${b.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteBatch(${b.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openBatchModal(batch = null) {
  document.getElementById("batchModalTitle").textContent = batch ? "Edit Batch" : "New Batch";
  document.getElementById("batchId").value = batch?.id || "";
  document.getElementById("batchCode").value = batch?.code || "";
  document.getElementById("batchName").value = batch?.name || "";
  document.getElementById("batchTrack").value = batch?.track || "";
  document.getElementById("batchMentor").value = batch?.mentor || "";
  document.getElementById("batchStart").value = batch?.start_date || "";
  document.getElementById("batchEnd").value = batch?.end_date || "";
  document.getElementById("batchCapacity").value = batch?.capacity ?? 25;
  document.getElementById("batchEnrolled").value = batch?.enrolled ?? 0;
  document.getElementById("batchStatus").value = batch?.status || "upcoming";
  document.getElementById("batchModalOverlay").classList.add("open");
}

function closeBatchModal() {
  document.getElementById("batchModalOverlay").classList.remove("open");
  document.getElementById("batchForm").reset();
}

function editBatch(id) {
  const batch = allBatches.find((b) => b.id === id);
  if (batch) openBatchModal(batch);
}

async function saveBatch(e) {
  e.preventDefault();
  const id = document.getElementById("batchId").value;
  const payload = {
    code: document.getElementById("batchCode").value.trim(),
    name: document.getElementById("batchName").value.trim(),
    track: document.getElementById("batchTrack").value.trim(),
    mentor: document.getElementById("batchMentor").value.trim(),
    start_date: document.getElementById("batchStart").value,
    end_date: document.getElementById("batchEnd").value,
    capacity: document.getElementById("batchCapacity").value,
    enrolled: document.getElementById("batchEnrolled").value,
    status: document.getElementById("batchStatus").value,
  };

  const submitBtn = document.getElementById("batchSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    if (id) {
      await apiRequest(`/batches/${id}`, { method: "PUT", body: payload });
      showToast("Batch updated successfully.");
    } else {
      await apiRequest("/batches", { method: "POST", body: payload });
      showToast("Batch created successfully.");
    }
    closeBatchModal();
    loadBatches();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Batch";
  }
}

async function deleteBatch(id) {
  if (!confirm("Delete this batch? Linked resources will be unassigned, not deleted.")) return;
  try {
    await apiRequest(`/batches/${id}`, { method: "DELETE" });
    showToast("Batch deleted.");
    loadBatches();
  } catch (err) {
    showToast(err.message, "error");
  }
}
