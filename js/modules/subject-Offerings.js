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

    const daysDisplay = o.days && o.days.length > 0
      ? o.days.join(', ')
      : '-';

    table.innerHTML += `
      <tr>
        <td>${o.subject_name}</td>
        <td>${o.teacher_name}</td>
        <td>${o.school_year}</td>
        <td>${o.semester}</td>
        <td>${daysDisplay}</td>
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
async function saveSubjectOffering() {

  const subject_id = document.getElementById('offeringSubject').value;
  const teacher_id = document.getElementById('offeringTeacher').value;
  const school_year_id = document.getElementById('offeringSchoolYear').value;
  const semester = document.getElementById('offeringSemester').value;

  // ✅ MULTI-DAY SELECT
  const selectedDays = Array.from(
    document.getElementById('offeringDays').selectedOptions
  ).map(o => o.value);

  const start_time = document.getElementById('startTime').value;
  const end_time = document.getElementById('endTime').value;

  if (
    !subject_id ||
    !teacher_id ||
    !school_year_id ||
    !semester ||
    selectedDays.length === 0 ||
    !start_time ||
    !end_time
  ) {
    alert('All fields are required.');
    return;
  }

  if (start_time >= end_time) {
    alert('Start time must be earlier than end time.');
    return;
  }

  await apiRequest('/api/subject-offerings', 'POST', {
    subject_id,
    teacher_id,
    school_year_id,
    semester,
    days: selectedDays,
    start_time,
    end_time
  });

  alert('Subject offering created ✅');
  location.reload();
}

/* DELETE */
async function deleteOffering(id) {
  if (!confirm('Delete this offering?')) return;

  await apiRequest(`/api/subject-offerings/${id}`, 'DELETE');
  loadOfferings();
}