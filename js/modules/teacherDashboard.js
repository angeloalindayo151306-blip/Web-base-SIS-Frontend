document.addEventListener('DOMContentLoaded', loadDashboard);

async function loadDashboard() {
  const data = await apiRequest('/api/teachers/dashboard');
  if (!data) return;

  renderProfile(data.profile || {});
  renderCards(data.totals || {});
  renderSubjects(data.classes || []); // ✅ FIXED
  loadActiveSchoolYear(); // ✅ ensure school year loads
}

/* PROFILE */
function renderProfile(profile) {
  document.getElementById('teacherName').innerText = profile.full_name || '-';

  document.getElementById('teacherDepartment').innerText =
    profile.department || '-';

  // ✅ Load email separately
  loadTeacherEmail();
}

async function loadTeacherEmail() {
  const profile = await apiRequest('/api/teachers/profile');
  if (profile) {
    document.getElementById('teacherEmail').innerText = profile.email || '-';
  }
}

/* CARDS */
function renderCards(totals) {
  const container = document.getElementById('teacherCards');
  container.innerHTML = `
    ${createCard('Subjects Assigned', totals.subjects || 0, 'primary')}
    ${createCard('Students Handled', totals.students || 0, 'success')}
    ${createCard('Grades Encoded', totals.grades || 0, 'warning')}
    ${createCard('Attendance Records', totals.attendance || 0, 'danger')}
  `;
}

function createCard(title, value, color) {
  return `
    <div class="col-md-3">
      <div class="card shadow border-0 text-white bg-${color} p-4">
        <h3>${value}</h3>
        <p class="mb-0">${title}</p>
      </div>
    </div>
  `;
}

/* SUBJECT LIST */
function renderSubjects(classes) {
  const list = document.getElementById('subjectList');
  list.innerHTML = '';

  if (!classes || classes.length === 0) {
    list.innerHTML = `
      <li class="list-group-item text-muted">
        No assigned subjects.
      </li>
    `;
    return;
  }

  classes.forEach((cls) => {
    list.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${cls.subject}
        <span class="badge bg-secondary">
          Semester ${cls.semester}
        </span>
      </li>
    `;
  });
}

/* LOAD ACTIVE SCHOOL YEAR */
async function loadActiveSchoolYear() {
  const active = await apiRequest('/api/school-years/active');
  if (active && active.name) {
    document.getElementById('activeSchoolYear').innerText = active.name;
  } else {
    document.getElementById('activeSchoolYear').innerText = 'Not Set';
  }
}
