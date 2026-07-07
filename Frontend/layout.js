// layout.js — renders the shared sidebar on both module pages.
// `activePage` should be one of: "batches", "resources".

function renderSidebar(activePage) {
  const links = [
    { key: "batches", href: "batches.html", icon: "&#128193;", label: "Batch Management" },
    { key: "resources", href: "resources.html", icon: "&#128218;", label: "Resource Library" },
  ];

  const navHtml = links.map((l) => `
    <a class="nav-link ${l.key === activePage ? "active" : ""}" href="${l.href}">
      <span class="nav-icon">${l.icon}</span> ${l.label}
    </a>`).join("");

  const sidebarHtml = `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">DV</div>
        <div class="brand-text">DVein Innovations<small>Internship Academy</small></div>
      </div>
      <div class="nav-group">
        <div class="nav-label">Modules</div>
        ${navHtml}
      </div>
    </aside>
  `;

  const mount = document.getElementById("sidebarMount");
  if (mount) mount.outerHTML = sidebarHtml;
}
