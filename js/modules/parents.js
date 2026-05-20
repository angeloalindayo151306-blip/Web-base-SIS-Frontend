let allParents = [];
let currentParentId = null;
let linkModal;

document.addEventListener('DOMContentLoaded', () => {
  linkModal = new bootstrap.Modal(document.getElementById('linkModal'));
  loadParents();
  initializeSearch();
});

async function loadParents() {
  const parents = await apiRequest('/api/parents');
  if (!parents) return;

  allParents = parents;
  renderParents(parents);
}

function renderParents(parents) {

  const table = document.getElementById('parentTable');
  table.innerHTML = '';

  parents.forEach((p) => {

    const students = p.students.length
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

async function openLinkModal(parentId) {

  currentParentId = parentId;

  const students = await apiRequest('/api/students');
  const select = document.getElementById('parentStudentsSelect');

  select.innerHTML = '';

  students.forEach((s) => {
    select.innerHTML += `
      <option value="${s.id}">
        ${s.full_name}
      </option>
    `;
  });

  const parent = allParents.find(p => p.id === parentId);
  const linkedIds = parent.students.map(s => s.id);

  Array.from(select.options).forEach(option => {
    option.selected = linkedIds.includes(option.value);
  });

  linkModal.show();
}

async function saveParentLinks() {

  const selected = Array.from(
    document.getElementById('parentStudentsSelect').selectedOptions
  ).map(o => o.value);

  await apiRequest(`/api/parents/${currentParentId}`, 'PUT', {
    student_ids: selected
  });

  linkModal.hide();
  loadParents();
}

function initializeSearch() {

  const input = document.getElementById('parentSearch');

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

function logout() {
  localStorage.clear();
  window.location.replace('/index.html');
}