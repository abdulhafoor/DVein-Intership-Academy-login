let currentPrograms = [];

function renderProgramsTable(programs) {
  const tbody = document.querySelector("#programs-table tbody");
  const emptyState = document.getElementById("programs-empty");

  if (!programs.length) {
    tbody.innerHTML = "";
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  tbody.innerHTML = programs.map((p, i) => `
    <tr data-id="${p.id}">
      <td class="idx">${String(i + 1).padStart(2, "0")}</td>
      <td class="primary-cell">${p.name}<span class="sub-cell">${p.description ? p.description.slice(0, 60) + (p.description.length > 60 ? "…" : "") : ""}</span></td>
      <td>${p.track}</td>
      <td>${p.mentor || "—"}</td>
      <td class="mono">${formatDate(p.start_date)} → ${formatDate(p.end_date)}</td>
      <td class="mono">${p.enrolled}/${p.capacity}</td>
      <td>${stampFor(p.status)}</td>
      <td>
        <div class="row-actions">
          <button class="btn-text edit" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn-text" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function loadPrograms() {
  const search = document.getElementById("search-input").value.trim();
  const status = document.getElementById("status-filter").value;

  try {
    const { data } = await Api.getPrograms({ search, status });
    currentPrograms = data;
    renderProgramsTable(data);
  } catch (err) {
    showToast(`Could not load programs: ${err.message}`);
  }
}

function openModal(program = null) {
  const form = document.getElementById("program-form");
  form.reset();
  document.getElementById("form-error").hidden = true;

  if (program) {
    document.getElementById("modal-title").textContent = "Edit Program";
    document.getElementById("program-id").value = program.id;
    document.getElementById("f-name").value = program.name;
    document.getElementById("f-track").value = program.track;
    document.getElementById("f-mentor").value = program.mentor || "";
    document.getElementById("f-description").value = program.description || "";
    document.getElementById("f-start").value = program.start_date;
    document.getElementById("f-end").value = program.end_date;
    document.getElementById("f-duration").value = program.duration_weeks;
    document.getElementById("f-capacity").value = program.capacity;
    document.getElementById("f-enrolled").value = program.enrolled;
    document.getElementById("f-status").value = program.status;
  } else {
    document.getElementById("modal-title").textContent = "New Program";
    document.getElementById("program-id").value = "";
    document.getElementById("f-enrolled").value = 0;
    document.getElementById("f-status").value = "upcoming";
  }

  document.getElementById("modal-backdrop").hidden = false;
}

function closeModal() {
  document.getElementById("modal-backdrop").hidden = true;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("program-id").value;
  const errorBox = document.getElementById("form-error");
  errorBox.hidden = true;

  const payload = {
    name: document.getElementById("f-name").value.trim(),
    track: document.getElementById("f-track").value.trim(),
    mentor: document.getElementById("f-mentor").value.trim(),
    description: document.getElementById("f-description").value.trim(),
    start_date: document.getElementById("f-start").value,
    end_date: document.getElementById("f-end").value,
    duration_weeks: Number(document.getElementById("f-duration").value),
    capacity: Number(document.getElementById("f-capacity").value),
    enrolled: Number(document.getElementById("f-enrolled").value),
    status: document.getElementById("f-status").value,
  };

  try {
    if (id) {
      await Api.updateProgram(id, payload);
      showToast("Program updated.");
    } else {
      await Api.createProgram(payload);
      showToast("Program created.");
    }
    closeModal();
    await loadPrograms();
    await loadDashboard();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
  }
}

async function handleTableClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === "edit") {
    const program = currentPrograms.find(p => String(p.id) === id);
    if (program) openModal(program);
  }

  if (btn.dataset.action === "delete") {
    const program = currentPrograms.find(p => String(p.id) === id);
    if (!program) return;
    const confirmed = confirm(`Delete "${program.name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await Api.deleteProgram(id);
      showToast("Program deleted.");
      await loadPrograms();
      await loadDashboard();
    } catch (err) {
      showToast(`Could not delete: ${err.message}`);
    }
  }
}

function initProgramsView() {
  document.getElementById("open-create-modal").addEventListener("click", () => openModal());
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });
  document.getElementById("program-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("programs-table").addEventListener("click", handleTableClick);

  let debounceTimer;
  document.getElementById("search-input").addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadPrograms, 250);
  });
  document.getElementById("status-filter").addEventListener("change", loadPrograms);
}
