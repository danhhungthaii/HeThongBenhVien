const appRoot = document.querySelector("#appRoot");
const sidebarToggle = document.querySelector("#sidebarToggle");
const loginModal = document.querySelector("#loginModal");
const loginBtn = document.querySelector("#loginBtn");
const loginError = document.querySelector("#loginError");
const logoutBtn = document.querySelector("#logoutBtn");
const roleOptions = document.querySelectorAll(".role-option");

const queueList = document.querySelector("#queueList");
const queueSearch = document.querySelector("#queueSearch");
const segmentedButtons = document.querySelectorAll(".segmented-btn");
const nextPatientBtn = document.querySelector("#nextPatientBtn");
const queueHint = document.querySelector("#queueHint");

const intakeName = document.querySelector("#intakeName");
const intakeDob = document.querySelector("#intakeDob");
const intakeGender = document.querySelector("#intakeGender");
const intakeContact = document.querySelector("#intakeContact");
const intakeDept = document.querySelector("#intakeDept");
const intakeVisitType = document.querySelector("#intakeVisitType");
const intakePriority = document.querySelector("#intakePriority");
const saveIntakeBtn = document.querySelector("#saveIntakeBtn");
const intakeList = document.querySelector("#intakeList");

const patientAvatar = document.querySelector("#patientAvatar");
const patientName = document.querySelector("#patientName");
const patientAge = document.querySelector("#patientAge");
const patientGender = document.querySelector("#patientGender");
const patientId = document.querySelector("#patientId");
const userName = document.querySelector("#userName");
const userRole = document.querySelector("#userRole");

const vitalBloodPressure = document.querySelector("#vitalBloodPressure");
const vitalHeartRate = document.querySelector("#vitalHeartRate");
const vitalTemperature = document.querySelector("#vitalTemperature");
const vitalSpo2 = document.querySelector("#vitalSpo2");
const inputPulse = document.querySelector("#inputPulse");
const inputTemperature = document.querySelector("#inputTemperature");
const inputWeight = document.querySelector("#inputWeight");
const inputHeight = document.querySelector("#inputHeight");

const chiefComplaint = document.querySelector("#chiefComplaint");
const diagnosisSearch = document.querySelector("#diagnosisSearch");
const diagnosisSelected = document.querySelector("#diagnosisSelected");
const clinicalNotes = document.querySelector("#clinicalNotes");
const saveEncounterBtn = document.querySelector("#saveEncounterBtn");

const allergyList = document.querySelector("#allergyList");
const submitLabsBtn = document.querySelector("#submitLabsBtn");
const submitImagingBtn = document.querySelector("#submitImagingBtn");
const addPrescriptionBtn = document.querySelector("#addPrescriptionBtn");
const submitPrescriptionBtn = document.querySelector("#submitPrescriptionBtn");
const prescriptionList = document.querySelector("#prescriptionList");

const state = {
  token: localStorage.getItem("his_token") || "",
  encounterId: null,
  patientId: null,
  queueStatus: "all",
  roleChoice: "Bác sĩ",
  role: "",
  intakeItems: [],
};

function setModalVisible(visible) {
  if (!loginModal) return;
  loginModal.classList.toggle("is-hidden", !visible);
}

function setAuthToken(token) {
  state.token = token;
  if (token) {
    localStorage.setItem("his_token", token);
    setModalVisible(false);
  } else {
    localStorage.removeItem("his_token");
    setModalVisible(true);
  }
}

function setRole(role) {
  state.role = role || "";
  state.roleChoice = role || state.roleChoice;
  applyRolePermissions();
}

function setDisabled(element, disabled) {
  if (!element) return;
  element.disabled = disabled;
  element.classList.toggle("is-disabled", disabled);
}

function applyRolePermissions() {
  const role = state.role || "";
  const isDoctor = role.startsWith("Bác sĩ");
  const isNurse = role === "Điều dưỡng";
  const isReception = role === "Lễ tân";

  const intakeFields = [
    intakeName,
    intakeDob,
    intakeGender,
    intakeContact,
    intakeDept,
    intakeVisitType,
    intakePriority,
  ];
  intakeFields.forEach((field) => setDisabled(field, !isReception));
  setDisabled(saveIntakeBtn, !isReception);

  setDisabled(nextPatientBtn, !(isReception || isNurse));

  const vitalsFields = [
    inputPulse,
    inputTemperature,
    inputWeight,
    inputHeight,
  ];
  vitalsFields.forEach((field) => setDisabled(field, !(isDoctor || isNurse)));

  const doctorFields = [
    chiefComplaint,
    diagnosisSearch,
    diagnosisSelected,
    clinicalNotes,
  ];
  doctorFields.forEach((field) => setDisabled(field, !isDoctor));
  setDisabled(saveEncounterBtn, !(isDoctor || isNurse));
  setDisabled(submitLabsBtn, !isDoctor);
  setDisabled(submitImagingBtn, !isDoctor);
  setDisabled(addPrescriptionBtn, !isDoctor);
  setDisabled(submitPrescriptionBtn, !isDoctor);
}

async function apiFetch(url, options = {}) {
  const headers = options.headers || {};
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setAuthToken("");
  }

  return response;
}

function calculateAge(dateString) {
  if (!dateString) return "--";
  const birth = new Date(dateString);
  if (Number.isNaN(birth.getTime())) return "--";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function renderQueue(items) {
  if (!queueList) return;
  const searchValue = queueSearch?.value?.toLowerCase() || "";
  const filtered = items.filter((item) => {
    const nameMatch = item.Full_Name?.toLowerCase().includes(searchValue);
    const idMatch = String(item.Queue_Number || "")
      .toLowerCase()
      .includes(searchValue);
    return nameMatch || idMatch;
  });

  queueList.innerHTML = filtered
    .map((item) => {
      const status = (item.Status || "WAITING").toUpperCase();
      const statusLabel = status;
      const statusClass =
        status === "DONE"
          ? "done"
          : status === "IN_PROGRESS"
          ? "in-progress"
          : "waiting";
      const etaText =
        status === "DONE"
          ? "✔ Hoàn tất"
          : status === "IN_PROGRESS"
          ? "⏱ Đang khám"
          : `⏱ ${item.ETA_Minutes ?? "--"} phút`;
      const isPriority = Boolean(item.Priority || item.Is_Emergency);
      const priorityBadge = isPriority
        ? '<span class="priority-badge">Ưu tiên</span>'
        : "";
      return `
        <article class="queue-card ${statusClass} ${
          isPriority ? "priority" : ""
        }">
          <div class="queue-top">
            <h3>${item.Full_Name}</h3>
            <span class="queue-status ${statusClass}">${statusLabel}</span>
          </div>
          <div class="queue-meta">
            <span class="badge">${item.Queue_Number}</span>
            ${priorityBadge}
            <span class="eta">${etaText}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderIntakeList() {
  if (!intakeList) return;
  const items = state.intakeItems.slice(0, 6);
  if (items.length === 0) return;
  intakeList.innerHTML = items
    .map(
      (item) => `
        <div class="intake-item">
          <div>
            <strong>${item.name}</strong>
            <span>• ${item.dept}</span>
          </div>
          <span class="intake-status">${item.visitType}</span>
        </div>
      `
    )
    .join("");
}

async function loadQueue() {
  const response = await apiFetch(`/api/queue?status=${state.queueStatus}`);
  if (!response.ok) return;
  const data = await response.json();
  renderQueue(data.items || []);
}

async function loadPatient() {
  const response = await apiFetch("/api/patients/current");
  if (!response.ok) return;
  const data = await response.json();
  const patient = data.patient;
  const encounter = data.encounter;

  if (patient) {
    state.patientId = patient.Patient_ID;
    patientAvatar.textContent = patient.Full_Name.slice(0, 2).toUpperCase();
    patientName.textContent = patient.Full_Name;
    patientAge.textContent = `${calculateAge(patient.Birth_Date)} tuổi`;
    patientGender.textContent = patient.Gender;
    patientId.textContent = patient.Patient_ID.slice(0, 8).toUpperCase();
  }

  if (encounter) {
    state.encounterId = encounter.Encounter_ID;
    chiefComplaint.value = encounter.Chief_Complaint || "";
    diagnosisSelected.value = encounter.Main_ICD10 || "";
    clinicalNotes.value = encounter.Clinical_Notes || "";
    if (encounter.Pulse) {
      vitalHeartRate.textContent = encounter.Pulse;
      if (inputPulse) inputPulse.value = encounter.Pulse;
    }
    if (encounter.Temperature) {
      vitalTemperature.textContent = encounter.Temperature;
      if (inputTemperature) inputTemperature.value = encounter.Temperature;
    }
    if (encounter.Weight && inputWeight) {
      inputWeight.value = encounter.Weight;
    }
    if (encounter.Height && inputHeight) {
      inputHeight.value = encounter.Height;
    }
  }
}

async function loadAllergies() {
  if (!state.patientId) return;
  const response = await apiFetch(`/api/allergies?patientId=${state.patientId}`);
  if (!response.ok) return;
  const data = await response.json();
  const items = data.items || [];
  allergyList.innerHTML = items
    .map((item) => `<div class="alert-item">${item}</div>`)
    .join("");
}

async function loadIntakes() {
  if (!intakeList) return;
  const response = await apiFetch("/api/intakes?limit=6");
  if (!response.ok) return;
  const data = await response.json();
  const items = data.items || [];
  intakeList.innerHTML = items
    .map(
      (item) => `
        <div class="intake-item">
          <div>
            <strong>${item.Full_Name}</strong>
            <span>• ${item.Department || "--"}</span>
          </div>
          <span class="intake-status">${item.Visit_Type || "--"}</span>
        </div>
      `
    )
    .join("");
}

async function saveEncounter() {
  if (!state.encounterId) return;
  const pulseValue = inputPulse?.value ? Number(inputPulse.value) : null;
  const tempValue = inputTemperature?.value
    ? Number(inputTemperature.value)
    : null;
  const weightValue = inputWeight?.value ? Number(inputWeight.value) : null;
  const heightValue = inputHeight?.value ? Number(inputHeight.value) : null;
  const payload = {
    chiefComplaint: chiefComplaint.value,
    diagnosisCode: diagnosisSelected.value,
    clinicalNotes: clinicalNotes.value,
    pulse: Number.isNaN(pulseValue) ? null : pulseValue,
    temperature: Number.isNaN(tempValue) ? null : tempValue,
    weight: Number.isNaN(weightValue) ? null : weightValue,
    height: Number.isNaN(heightValue) ? null : heightValue,
  };
  const response = await apiFetch(`/api/encounters/${state.encounterId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    await loadPatient();
    if (queueHint) {
      queueHint.textContent = "Đã lưu hồ sơ khám.";
    }
  } else if (queueHint) {
    queueHint.textContent = "Không thể lưu hồ sơ khám.";
  }
}

function collectCheckedValues(sectionSelector) {
  return Array.from(
    document.querySelectorAll(`${sectionSelector} input[type="checkbox"]`)
  )
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function createPrescriptionItem() {
  const wrapper = document.createElement("div");
  wrapper.className = "prescription-item";
  wrapper.innerHTML = `
    <input type="text" class="input-field" placeholder="Tên thuốc" />
    <div class="prescription-row">
      <input type="text" class="input-field" placeholder="Liều dùng" />
      <input type="text" class="input-field" placeholder="Số ngày" />
    </div>
  `;
  return wrapper;
}

async function submitOrders(kind) {
  if (!state.encounterId) return;
  const section =
    kind === "labs"
      ? document.querySelector("#labOrdersCard")
      : document.querySelector("#imagingOrdersCard");
  if (!section) return;
  const items = Array.from(section.querySelectorAll("input[type=checkbox]"))
    .filter((input) => input.checked)
    .map((input) => input.value);

  if (items.length === 0) {
    if (queueHint) {
      queueHint.textContent = "Vui lòng chọn ít nhất một chỉ định.";
    }
    return;
  }

  const body =
    kind === "labs"
      ? { encounterId: state.encounterId, tests: items }
      : { encounterId: state.encounterId, items };

  const response = await apiFetch(`/api/orders/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok && queueHint) {
    queueHint.textContent = "Không thể gửi chỉ định. Vui lòng thử lại.";
  }
}

async function submitPrescriptions() {
  if (!state.encounterId) return;
  const items = Array.from(
    prescriptionList.querySelectorAll(".prescription-item")
  ).map((item) => {
    const inputs = item.querySelectorAll("input");
    return {
      drug: inputs[0].value.trim(),
      dosage: inputs[1].value.trim(),
      duration: inputs[2].value.trim(),
    };
  });

  const filtered = items.filter((item) => item.drug);
  if (filtered.length === 0) {
    if (queueHint) {
      queueHint.textContent = "Vui lòng nhập ít nhất một thuốc.";
    }
    return;
  }

  const response = await apiFetch("/api/prescriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encounterId: state.encounterId, items: filtered }),
  });

  if (!response.ok && queueHint) {
    queueHint.textContent = "Không thể lưu toa thuốc. Vui lòng thử lại.";
  }
}

async function handleLogin() {
  loginError.textContent = "";
  const username = document.querySelector("#loginUsername").value.trim();
  const password = document.querySelector("#loginPassword").value.trim();
  if (!username || !password) {
    loginError.textContent = "Vui lòng nhập đầy đủ tài khoản và mật khẩu.";
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let detail = "Không thể đăng nhập. Vui lòng thử lại.";
      if (response.status === 401) {
        detail = "Sai tài khoản hoặc mật khẩu.";
      } else {
        try {
          const payload = await response.json();
          if (payload?.error) {
            detail = payload.error;
          }
        } catch (err) {
          detail = "Không thể đăng nhập. Vui lòng thử lại.";
        }
      }
      loginError.textContent = detail;
      return;
    }

    const data = await response.json();
    setAuthToken(data.token);
    if (data.user) {
      userName.textContent = data.user.name;
      userRole.textContent = data.user.role;
      setRole(data.user.role);
      roleOptions.forEach((option) => {
        const isActive = option.dataset.role === data.user.role;
        option.classList.toggle("active", isActive);
      });
    }
    await refreshDashboard();
  } catch (error) {
    const hint = window.location.protocol === "file:"
      ? "Hãy mở trang bằng http://localhost:3000 để đăng nhập."
      : "Không kết nối được server. Hãy kiểm tra backend đang chạy.";
    loginError.textContent = hint;
  }
}

async function handleLogout(event) {
  event.preventDefault();
  if (state.token) {
    await apiFetch("/api/auth/logout", { method: "POST" });
  }
  setAuthToken("");
}

async function refreshDashboard() {
  await loadQueue();
  await loadIntakes();
  await loadPatient();
  await loadAllergies();
}

async function loadSession() {
  const response = await apiFetch("/api/auth/me");
  if (!response.ok) return;
  const data = await response.json();
  if (data.user) {
    userName.textContent = data.user.name;
    userRole.textContent = data.user.role;
    setRole(data.user.role);
  }
}

if (sidebarToggle && appRoot) {
  sidebarToggle.addEventListener("click", () => {
    appRoot.classList.toggle("sidebar-collapsed");
  });
}

if (queueSearch) {
  queueSearch.addEventListener("input", () => loadQueue());
}

segmentedButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    segmentedButtons.forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    state.queueStatus = btn.dataset.status || "all";
    loadQueue();
  });
});

if (loginBtn) {
  loginBtn.addEventListener("click", handleLogin);
}

if (roleOptions.length > 0) {
  roleOptions.forEach((option) => {
    option.addEventListener("click", () => {
      roleOptions.forEach((item) => item.classList.remove("active"));
      option.classList.add("active");
      state.roleChoice = option.dataset.role || "Bác sĩ";
    });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", handleLogout);
}

if (saveEncounterBtn) {
  saveEncounterBtn.addEventListener("click", saveEncounter);
}

if (submitLabsBtn) {
  submitLabsBtn.addEventListener("click", () => submitOrders("labs"));
}

if (submitImagingBtn) {
  submitImagingBtn.addEventListener("click", () => submitOrders("imaging"));
}

if (addPrescriptionBtn) {
  addPrescriptionBtn.addEventListener("click", () => {
    prescriptionList.appendChild(createPrescriptionItem());
  });
}

if (submitPrescriptionBtn) {
  submitPrescriptionBtn.addEventListener("click", submitPrescriptions);
}

if (saveIntakeBtn) {
  saveIntakeBtn.addEventListener("click", async () => {
    const name = intakeName?.value.trim();
    const birthDate = intakeDob?.value;
    const gender = intakeGender?.value.trim();
    const contact = intakeContact?.value.trim();
    const dept = intakeDept?.value.trim();
    const visitType = intakeVisitType?.value.trim();
    const priority = Boolean(intakePriority?.checked);
    if (!name || !gender || !dept || !visitType) {
      if (queueHint) {
        queueHint.textContent =
          "Vui lòng nhập đầy đủ họ tên, giới tính, chuyên khoa và loại khám trước khi lưu.";
      }
      return;
    }
    const response = await apiFetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        birthDate,
        gender,
        contact,
        department: dept,
        visitType,
        priority,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      if (queueHint) {
        queueHint.textContent =
          payload?.error || "Không thể lưu hồ sơ. Vui lòng thử lại.";
      }
      return;
    }

    if (intakeName) intakeName.value = "";
    if (intakeDob) intakeDob.value = "";
    if (intakeGender) intakeGender.value = "";
    if (intakeContact) intakeContact.value = "";
    if (intakeDept) intakeDept.value = "";
    if (intakeVisitType) intakeVisitType.value = "";
    if (intakePriority) intakePriority.checked = false;
    if (queueHint) {
      queueHint.textContent = "Đã lưu hồ sơ tiếp nhận.";
    }
    await refreshDashboard();
  });
}

if (nextPatientBtn) {
  nextPatientBtn.addEventListener("click", async () => {
    const response = await apiFetch("/api/queue/next", { method: "POST" });
    if (!response.ok) {
      if (queueHint) {
        queueHint.textContent = "Không còn bệnh nhân đang chờ.";
      }
      return;
    }
    if (queueHint) {
      queueHint.textContent = "Đã gọi bệnh nhân tiếp theo.";
    }
    await refreshDashboard();
  });
}

if (diagnosisSearch) {
  const suggestions = document.querySelectorAll(".suggestion .code");
  suggestions.forEach((code) => {
    code.closest(".suggestion").addEventListener("click", () => {
      diagnosisSelected.value = code.textContent.trim();
    });
  });
}

const drugSuggestions = document.querySelectorAll(
  "#drugSearch ~ .suggestions .suggestion"
);
if (drugSuggestions.length > 0) {
  drugSuggestions.forEach((item) => {
    item.addEventListener("click", () => {
      const drugName = item.textContent.trim();
      if (!drugName) return;
      const inputs = prescriptionList.querySelectorAll(
        ".prescription-item input"
      );
      let target = Array.from(inputs).find((input, index) => index % 3 === 0 && !input.value.trim());
      if (!target) {
        const newItem = createPrescriptionItem();
        prescriptionList.appendChild(newItem);
        target = newItem.querySelector("input");
      }
      if (target) target.value = drugName;
    });
  });
}

if (state.token) {
  setModalVisible(false);
  loadSession();
  refreshDashboard();
} else {
  setModalVisible(true);
}
