let offeringModal;
let allOfferings = [];

document.addEventListener('DOMContentLoaded', () => {
  offeringModal = new bootstrap.Modal(document.getElementById('offeringModal'));

  loadOfferings();
  loadSubjects();
  loadTeachers();
  loadSchoolYears();
});

/* LOAD OFFERINGS */
async function loadOfferings() {
  const data = await apiRequest('/api/subject-offerings');
  if (!data) return;

  allOfferings = data;
  renderOfferings(data);
}

/* RENDER TABLE */
function renderOfferings(offerings) {
  const table = document.getElementById('offeringTable');
  table.innerHTML = '';

  offerings.forEach((o) => {
    table.innerHTML += `
      <tr>
        <td>${o.subject_name}</td>
        <td>${o.teacher_name}</td>
        <td>${o.school_year}</td>
        <td>${o.semester}</td>
        <td>${o.start_time || '-'}</td>
        <td>${o.end_time || '-'}</td>
        <td>
          <button class="btn btn-sm btn-danger"
            onclick="deleteOffering('${o.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

/* REQUIRED FUNCTION ✅ */
function openOfferingModal() {
  offeringModal.show();
}

/* LOAD SUBJECTS */
async function loadSubjects() {
  const data = await apiRequest('/api/subjects');
  if (!data) return;

  const select = document.getElementById('offeringSubject');
  select.innerHTML = '';

  data.forEach((s) => {
    select.innerHTML += `
      <option value="${s.id}">
        ${s.name}
      </option>
    `;
  });
}

/* LOAD TEACHERS */
async function loadTeachers() {
  const data = await apiRequest('/api/teachers');
  if (!data) return;

  const select = document.getElementById('offeringTeacher');
  select.innerHTML = '';

  data.forEach((t) => {
    select.innerHTML += `
      <option value="${t.id}">
        ${t.full_name}
      </option>
    `;
  });
}

/* LOAD SCHOOL YEARS */
async function loadSchoolYears() {
  const data = await apiRequest('/api/school-years');
  if (!data) return;

  const select = document.getElementById('offeringSchoolYear');
  select.innerHTML = '';

  data.forEach((sy) => {
    select.innerHTML += `
      <option value="${sy.id}">
        ${sy.name}
      </option>
    `;
  });
}

/* SAVE OFFERING */
async function saveOffering() {
  const payload = {
    subject_id: document.getElementById('offeringSubject').value,
    teacher_id: document.getElementById('offeringTeacher').value,
    school_year_id: document.getElementById('offeringSchoolYear').value,
    semester: document.getElementById('offeringSemester').value,
    start_time: document.getElementById('offeringStart').value,
    end_time: document.getElementById('offeringEnd').value,
  };

  await apiRequest('/api/subject-offerings', 'POST', payload);

  offeringModal.hide();
  loadOfferings();
}

/* DELETE */
async function deleteOffering(id) {
  if (!confirm('Delete this offering?')) return;

  await apiRequest(`/api/subject-offerings/${id}`, 'DELETE');
  loadOfferings();
}
