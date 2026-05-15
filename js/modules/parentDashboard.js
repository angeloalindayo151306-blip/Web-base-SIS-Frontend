document.addEventListener('DOMContentLoaded', loadParentDashboard);

async function loadParentDashboard() {
  const data = await apiRequest('/api/parents/dashboard');
  if (!data) return;

  const container = document.getElementById('parentDashboardCards');
  container.innerHTML = '';

  data.forEach((child) => {
    const subjects = Array.isArray(child.subjects) ? child.subjects : [];
    const attendance = child.attendance_percentage ?? 0;
    const department = child.department || '-';
    const course = child.course || '-';
    const semester = child.semester || '-';
    const status = child.enrollment_status || 'Not Enrolled';

    const present = child.attendance_summary?.present ?? 0;
    const absent = child.attendance_summary?.absent ?? 0;
    const late = child.attendance_summary?.late ?? 0;

    container.innerHTML += `
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 p-4 h-100">

          <!-- ✅ Header -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">${child.name}</h5>
            <span class="badge ${
              status === 'Enrolled' ? 'bg-success' : 'bg-danger'
            }">
              ${status}
            </span>
          </div>

          <small class="text-muted d-block">
            ${department} • ${course}
          </small>
          <small class="text-muted d-block mb-3">
            Semester ${semester}
          </small>

          <hr />

          <!-- ✅ Attendance Section -->
          <h6 class="fw-bold mb-2">Attendance Overview</h6>

          <div class="d-flex justify-content-between mb-2">
            <span class="badge bg-success">
              ✅ ${present} Present
            </span>

            <span class="badge ${absent >= 3 ? 'bg-danger' : 'bg-secondary'}">
              ❌ ${absent} Absent
            </span>

            <span class="badge bg-warning text-dark">
              ⏰ ${late} Late
            </span>
          </div>

          <div class="progress mb-2" style="height: 8px;">
            <div 
              class="progress-bar ${
                attendance >= 85
                  ? 'bg-success'
                  : attendance >= 75
                  ? 'bg-warning'
                  : 'bg-danger'
              }"
              style="width: ${attendance}%"
            ></div>
          </div>

          <div class="mb-3">
            <strong>${attendance}% Overall Attendance</strong>
          </div>

          <!-- ✅ Grades Section -->
          <h6 class="fw-bold mt-3">Subjects & Final Grades</h6>

          ${
            subjects.length > 0
              ? `
                <table class="table table-sm mt-2 align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Subject</th>
                      <th class="text-end">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${subjects
                      .map((s) => {
                        const finalGrade = s.final_grade ?? '-';

                        const gradeColor =
                          finalGrade !== '-' && finalGrade < 75
                            ? 'text-danger fw-bold'
                            : 'text-success fw-bold';

                        return `
                          <tr>
                            <td>${s.name}</td>
                            <td class="text-end ${gradeColor}">
                              ${finalGrade}
                            </td>
                          </tr>
                        `;
                      })
                      .join('')}
                  </tbody>
                </table>
              `
              : '<p class="text-muted">No enrolled subjects</p>'
          }

        </div>
      </div>
    `;
  });
}
