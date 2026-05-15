document.addEventListener('DOMContentLoaded', init);

let html5QrCode;

async function init() {
  await loadOfferings();

  // ✅ Set today as default date
  document.getElementById('attendanceDate').value = new Date()
    .toISOString()
    .split('T')[0];
}

/* ✅ Load Teacher Classes */
async function loadOfferings() {
  const data = await apiRequest('/api/teachers/dashboard');
  if (!data || !data.classes) return;

  const select = document.getElementById('offeringSelect');

  data.classes.forEach((cls) => {
    select.innerHTML += `
      <option value="${cls.offering_id}">
        ${cls.subject} - Semester ${cls.semester}
      </option>
    `;
  });
}

/* ✅ Load Students for Selected Class + Date */
async function loadStudents() {
  const offeringId = document.getElementById('offeringSelect').value;
  const date = document.getElementById('attendanceDate').value;

  if (!offeringId || !date) {
    alert('Select class and date first.');
    return;
  }

  const students = await apiRequest(
    `/api/teachers/offering/${offeringId}/attendance?date=${date}`
  );

  const table = document.getElementById('teacherAttendanceTable');
  table.innerHTML = '';

  if (!students || students.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-muted">
          No students found.
        </td>
      </tr>
    `;
    return;
  }

  students.forEach((s) => {
    const attendance = s.attendance?.[0];
    const currentStatus = attendance?.status || 'Absent';

    table.innerHTML += `
      <tr>
        <td>${s.students.first_name} ${s.students.last_name}</td>

        <td>
          <select class="form-select status">
            <option value="Present" ${
              currentStatus === 'Present' ? 'selected' : ''
            }>Present</option>
            <option value="Absent" ${
              currentStatus === 'Absent' ? 'selected' : ''
            }>Absent</option>
            <option value="Late" ${
              currentStatus === 'Late' ? 'selected' : ''
            }>Late</option>
          </select>
        </td>

        <td>
          <button class="btn btn-success btn-sm"
            onclick="saveAttendance('${s.id}', this)">
            Save
          </button>
        </td>
      </tr>
    `;
  });
}

/* ✅ Save Manual Attendance */
async function saveAttendance(enrollmentId, btn) {
  const row = btn.closest('tr');
  const status = row.querySelector('.status').value.toLowerCase();
  const date = document.getElementById('attendanceDate').value;

  await apiRequest('/api/teachers/attendance', 'POST', {
    offering_enrollment_id: enrollmentId,
    attendance_date: date,
    status,
  });

  alert('Attendance saved ✅');
}

/* ✅ Start QR Scanner */
function startQRScanner() {
  const offeringId = document.getElementById('offeringSelect').value;
  const date = document.getElementById('attendanceDate').value;

  if (!offeringId || !date) {
    alert('Select class and date first.');
    return;
  }

  document.getElementById('qr-reader').style.display = 'block';

  html5QrCode = new Html5Qrcode('qr-reader');

  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: 250 },

    async (decodedText) => {
      await apiRequest('/api/teachers/attendance/scan', 'POST', {
        qr_code_value: decodedText,
        offering_id: offeringId,
        attendance_date: date,
      });

      alert('QR Attendance recorded ✅');

      // ✅ Reload table
      loadStudents();
    },

    (errorMessage) => {
      // ignore scan errors
    }
  );
}

async function submitManualQR() {
  const offeringId = document.getElementById('offeringSelect').value;
  const date = document.getElementById('attendanceDate').value;
  const qrValue = document.getElementById('manualQrInput').value.trim();

  if (!offeringId || !date || !qrValue) {
    alert('Select class, date, and enter QR value.');
    return;
  }

  await apiRequest('/api/teachers/attendance/scan', 'POST', {
    qr_code_value: qrValue,
    offering_id: offeringId,
    attendance_date: date,
  });

  alert('Manual attendance recorded ✅');

  document.getElementById('manualQrInput').value = '';

  loadStudents(); // refresh table
}
