let html5QrCode;
let currentOfferingId = null;

document.addEventListener('DOMContentLoaded', loadOfferings);

async function loadOfferings() {
  const offerings = await apiRequest('/api/subject-offerings');
  if (!offerings) return;

  const select = document.getElementById('offeringSelect');
  select.innerHTML = '<option value="">Select Class</option>';

  offerings.forEach((o) => {
    select.innerHTML += `
      <option value="${o.id}">
        ${o.subject_name} - ${o.school_year} (Sem ${o.semester})
      </option>
    `;
  });
}

function startScanning() {
  const offeringId = document.getElementById('offeringSelect').value;

  if (!offeringId) {
    alert('Please select a class first.');
    return;
  }

  currentOfferingId = offeringId;

  loadClassStatus();

  html5QrCode = new Html5Qrcode('qr-reader');

  html5QrCode
    .start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      onScanSuccess
    )
    .catch(() => {
      console.warn('Camera not available.');
    });
}

function stopScanning() {
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {});
  }
}

async function onScanSuccess(decodedText) {
  await handleQr(decodedText);
}

async function submitManualQr() {
  const qrValue = document.getElementById('manualQrInput').value;
  if (!qrValue) return;

  await handleQr(qrValue);
}

async function handleQr(qrValue) {
  const result = await apiRequest('/api/attendance', 'POST', {
    qr_code_value: qrValue,
    offering_id: currentOfferingId,
  });

  const alertBox = document.getElementById('scanResult');

  if (result && !result.error) {
    alertBox.className = 'alert alert-success';
    alertBox.innerText = result.message;
    loadClassStatus();
  } else {
    alertBox.className = 'alert alert-danger';
    alertBox.innerText = result?.error || 'Error marking attendance.';
  }

  alertBox.classList.remove('d-none');
}

async function loadClassStatus() {
  const data = await apiRequest(
    `/api/attendance/class-status/${currentOfferingId}`
  );

  if (!data) return;

  const container = document.getElementById('attendanceList');

  container.innerHTML = `
    <h6 class="mb-3">
      Present: ${data.present} / ${data.total}
    </h6>
  `;

  data.students.forEach((s) => {
    container.innerHTML += `
      <div class="d-flex justify-content-between border-bottom py-2">
        <span>${s.first_name} ${s.last_name}</span>
        <span class="${s.present ? 'text-success' : 'text-danger'}">
          ${s.present ? 'Present' : 'Absent'}
        </span>
      </div>
    `;
  });
}
