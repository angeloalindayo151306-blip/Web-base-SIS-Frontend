let allParents = [];
let currentParentId = null;
let linkModal = null;

document.addEventListener('DOMContentLoaded', () => {

  // ✅ Safe modal initialization
  const modalElement = document.getElementById('parentLinkModal');
  if (modalElement && typeof bootstrap !== 'undefined') {
    linkModal = new bootstrap.Modal(modalElement);
  }

  loadParents();
  initializeSearch();
});

/* ======================
LOAD PARENTS
====================== */
async function loadParents() {
  const parents = await apiRequest('/api/parents');
  if (!parents) return;

  allParents = parents;
  renderParents(parents);
}

/* ======================
RENDER TABLE
====================== */
function renderParents(parents) {

  const table = document.getElementById('parentTable');
  if (!table) return;

  table.innerHTML = '';

  parents.forEach((p) => {

    const students = p.students && p.students.length
      ? p.students
          .map((s) => `<span class="badge bg-info me-1">${s.name}</span>`)
          .join('')
      : '-';

    table.innerHTML += `
      <tr>
        <td>${p.full_name}</td>
        <td>${p.email}</td>
        <td>${students}</td>
        <td>
          <button class="btn btn-sm btn-primary"
            onclick="openLinkModal('${p.id}')">
            Link
          </button>
        </td>
      </tr>
    `;
  });
}

/* ======================
OPEN MODAL
====================== */
async function openLinkModal(parentId) {

  currentParentId = parentId;

  const select = document.getElementById('parentStudentsSelect');
  if (!select) return;

  const students = await apiRequest('/api/students');
  if (!students) return;

  select.innerHTML = '';

  students.forEach((s) => {
    select.innerHTML += `
      <option value="${s.id}">
        ${s.full_name}
      </option>
    `;
  });

  const parent = allParents.find(p => p.id === parentId);
  if (!parent) return;

  const linkedIds = parent.students.map(s => s.id);

  Array.from(select.options).forEach(option => {
    option.selected = linkedIds.includes(option.value);
  });

  if (linkModal) {
    linkModal.show();
  }
}

/* ======================
SAVE LINKS
====================== */
async function saveParentLinks() {

  if (!currentParentId) return;

  const select = document.getElementById('parentStudentsSelect');
  if (!select) return;

  const selected = Array.from(select.selectedOptions)
    .map(o => o.value);

  await apiRequest(`/api/parents/${currentParentId}`, 'PUT', {
    student_ids: selected
  });

  if (linkModal) {
    linkModal.hide();
  }

  loadParents();
}

/* ======================
SEARCH
====================== */
function initializeSearch() {

  const input = document.getElementById('parentSearch');
  if (!input) return;

  input.addEventListener('keyup', function () {

    const keyword = this.value.toLowerCase();

    const filtered = allParents.filter(
      (p) =>
        p.full_name.toLowerCase().includes(keyword) ||
        p.email.toLowerCase().includes(keyword)
    );

    renderParents(filtered);
  });
}

/* ======================
LOGOUT
====================== */
function logout() {
  localStorage.clear();
  window.location.replace('/index.html');
}