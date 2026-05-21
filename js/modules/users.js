let userModal;
let isEditMode = false;
let allUsers = [];

console.log("THIS IS THE NEW DELETE VERSION");

document.addEventListener('DOMContentLoaded', () => {
  userModal = new bootstrap.Modal(document.getElementById('userModal'));
  loadUsers();
  initializeSearch();
});

/* ===============================
   LOAD USERS
================================ */
async function loadUsers() {
  const users = await apiRequest('/api/users');
  if (!users) return;

  allUsers = users;
  renderUsers(users);
}

/* ===============================
   SEARCH
================================ */
function initializeSearch() {
  const searchInput = document.getElementById('userSearch');
  if (!searchInput) return;

  searchInput.addEventListener('keyup', function () {
    const keyword = this.value.toLowerCase();

    const filtered = allUsers.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.role?.toLowerCase().includes(keyword)
    );

    renderUsers(filtered);
  });
}

/* ===============================
   RENDER TABLE
================================ */
function renderUsers(users) {
  const table = document.getElementById('userTable');
  table.innerHTML = '';

  users.forEach((user) => {
    table.innerHTML += `
      <tr>
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td>${renderRoleBadge(user.role)}</td>
        <td>
          <span class="badge ${user.is_active ? 'bg-success' : 'bg-secondary'}">
            ${user.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary"
            onclick="editUser('${user.id}')">
            Edit
          </button>
          <button class="btn btn-sm btn-warning"
            onclick="resetPassword('${user.id}')">
            Reset
          </button>
          <button class="btn btn-sm ${
            user.is_active ? 'btn-danger' : 'btn-success'
          }"
            onclick="toggleUserStatus('${user.id}', ${user.is_active})">
            ${user.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    `;
  });
}

/* ===============================
   ROLE BADGE
================================ */
function renderRoleBadge(role) {
  const map = {
    admin: 'bg-dark',
    teacher: 'bg-primary',
    student: 'bg-success',
    parent: 'bg-warning',
  };

  return `<span class="badge ${map[role] || 'bg-secondary'}">
            ${role}
          </span>`;
}

/* ===============================
   OPEN ADD MODAL
================================ */
function openAddModal() {
  isEditMode = false;
  clearForm();

  document.getElementById('modalTitle').innerText = 'Add User';
  document.getElementById('passwordGroup').style.display = 'block';
  document.getElementById('role').disabled = false;

  userModal.show();
}

/* ===============================
   EDIT USER
================================ */
function editUser(id) {
  const user = allUsers.find((u) => u.id === id);
  if (!user) return;

  isEditMode = true;

  document.getElementById('modalTitle').innerText = 'Edit User';
  document.getElementById('userId').value = user.id;
  document.getElementById('fullName').value = user.full_name;
  document.getElementById('email').value = user.email;
  document.getElementById('role').value = user.role;

  // 🔥 IMPORTANT:
  // Prevent changing role after creation
  document.getElementById('role').disabled = true;

  // Hide password field
  document.getElementById('passwordGroup').style.display = 'none';

  userModal.show();
}

/* ===============================
   SAVE USER
================================ */
async function saveUser() {
  const id = document.getElementById('userId').value;
  const full_name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const role = document.getElementById('role').value;
  const password = document.getElementById('password').value;

  if (!full_name || !email || !role) {
    alert('All fields are required.');
    return;
  }

  if (!isEditMode && !password) {
    alert('Password is required.');
    return;
  }

  const payload = { full_name, email, role };

  let response;

  if (!isEditMode) {
    payload.password = password;
    response = await apiRequest('/api/users', 'POST', payload);
  } else {
    response = await apiRequest(`/api/users/${id}`, 'PUT', payload);
  }

  if (!response) return;

  userModal.hide();
  loadUsers();
}

/* ===============================
   RESET PASSWORD
================================ */
async function resetPassword(id) {
  const newPassword = prompt('Enter new password:');
  if (!newPassword) return;

  const response = await apiRequest(`/api/users/${id}/reset-password`, 'PUT', {
    newPassword,
  });

  if (response) alert('Password reset ✅');
}

/* ===============================
   TOGGLE STATUS
================================ */
async function toggleUserStatus(id, isActive) {
  const action = isActive ? 'Deactivate' : 'Activate';
  if (!confirm(`${action} this user?`)) return;

  const response = await apiRequest(`/api/users/${id}`, 'DELETE');
  if (response) loadUsers();
}

/* ===============================
   CLEAR FORM
================================ */
function clearForm() {
  document.getElementById('userId').value = '';
  document.getElementById('fullName').value = '';
  document.getElementById('email').value = '';
  document.getElementById('role').value = '';
  document.getElementById('password').value = '';
}
