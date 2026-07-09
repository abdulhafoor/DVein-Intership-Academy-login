// resources.js — Resource Library module (DVein Innovations)

let allResources = [];

document.addEventListener("DOMContentLoaded", async () => {
  renderSidebar("resources");

  await loadBatchOptions();
  await loadCategoryOptions();
  await loadResources();

  document.getElementById("searchInput").addEventListener("input", debounce(loadResources, 300));
  document.getElementById("categoryFilter").addEventListener("change", loadResources);
  document.getElementById("typeFilter").addEventListener("change", loadResources);
  document.getElementById("batchFilter").addEventListener("change", loadResources);

  document.getElementById("openCreateResource").addEventListener("click", () => openResourceModal());
  document.getElementById("closeResourceModal").addEventListener("click", closeResourceModal);
  document.getElementById("resourceModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "resourceModalOverlay") closeResourceModal();
  });
  document.getElementById("resourceForm").addEventListener("submit", saveResource);
});

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

async function loadBatchOptions() {
  try {
    const { batches } = await apiRequest("/batches");
    const filterSelect = document.getElementById("batchFilter");
    const formSelect = document.getElementById("resourceBatch");
    const optionsHtml = batches.map((b) => `<option value="${b.id}">${b.code} — ${b.name}</option>`).join("");
    filterSelect.insertAdjacentHTML("beforeend", optionsHtml);
    formSelect.insertAdjacentHTML("beforeend", optionsHtml);
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function loadCategoryOptions() {
  try {
    const { categories } = await apiRequest("/resources/meta/categories");
    const filterSelect = document.getElementById("categoryFilter");
    const datalist = document.getElementById("categoryOptions");
    categories.forEach((c) => {
      filterSelect.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`);
      datalist.insertAdjacentHTML("beforeend", `<option value="${c}"></option>`);
    });
  } catch (err) {
    console.warn(err.message);
  }
}

async function loadResources() {
  const search = document.getElementById("searchInput").value.trim();
  const category = document.getElementById("categoryFilter").value;
  const type = document.getElementById("typeFilter").value;
  const batch_id = document.getElementById("batchFilter").value;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (type) params.set("type", type);
  if (batch_id) params.set("batch_id", batch_id);

  try {
    const { resources } = await apiRequest(`/resources?${params.toString()}`);
    allResources = resources;
    renderResourceGrid(resources);
  } catch (err) {
    showToast(err.message, "error");
  }
}

function renderResourceGrid(resources) {
  const grid = document.getElementById("resourceGrid");
  const emptyState = document.getElementById("resourceEmptyState");

  if (resources.length === 0) {
    grid.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  grid.innerHTML = resources.map((r) => `
    <div class="resource-card">
      <div class="meta-row">
        <span class="tag tag-${r.category}">${r.category}</span>
        <span class="resource-type">${r.type}</span>
      </div>
      <h4>${r.title}</h4>
      <p>${r.description || "No description added."}</p>
      <div class="batch-pill">${r.batch_code ? `Linked to ${r.batch_code}` : "Not linked to a batch"}</div>
      <div class="card-actions">
        <a href="${r.url}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Open</a>
        <button class="btn btn-ghost btn-sm" onclick="editResource(${r.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteResource(${r.id})">Delete</button>
      </div>
    </div>
  `).join("");
}

function openResourceModal(resource = null) {
  document.getElementById("resourceModalTitle").textContent = resource ? "Edit Resource" : "Add Resource";
  document.getElementById("resourceId").value = resource?.id || "";
  document.getElementById("resourceTitle").value = resource?.title || "";
  document.getElementById("resourceDescription").value = resource?.description || "";
  document.getElementById("resourceCategory").value = resource?.category || "";
  document.getElementById("resourceType").value = resource?.type || "link";
  document.getElementById("resourceUrl").value = resource?.url || "";
  document.getElementById("resourceBatch").value = resource?.batch_id || "";
  document.getElementById("resourceModalOverlay").classList.add("open");
}

function closeResourceModal() {
  document.getElementById("resourceModalOverlay").classList.remove("open");
  document.getElementById("resourceForm").reset();
}

function editResource(id) {
  const resource = allResources.find((r) => r.id === id);
  if (resource) openResourceModal(resource);
}

async function saveResource(e) {
  e.preventDefault();
  const id = document.getElementById("resourceId").value;
  const payload = {
    title: document.getElementById("resourceTitle").value.trim(),
    description: document.getElementById("resourceDescription").value.trim(),
    category: document.getElementById("resourceCategory").value.trim() || "General",
    type: document.getElementById("resourceType").value,
    url: document.getElementById("resourceUrl").value.trim(),
    batch_id: document.getElementById("resourceBatch").value || null,
  };

  const submitBtn = document.getElementById("resourceSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    if (id) {
      await apiRequest(`/resources/${id}`, { method: "PUT", body: payload });
      showToast("Resource updated successfully.");
    } else {
      await apiRequest("/resources", { method: "POST", body: payload });
      showToast("Resource added successfully.");
    }
    closeResourceModal();
    loadResources();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Resource";
  }
}

async function deleteResource(id) {
  if (!confirm("Delete this resource?")) return;
  try {
    await apiRequest(`/resources/${id}`, { method: "DELETE" });
    showToast("Resource deleted.");
    loadResources();
  } catch (err) {
    showToast(err.message, "error");
  }
}
