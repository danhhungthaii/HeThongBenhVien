import { useEffect, useMemo, useState } from "react";

const defaultQueue = [
  {
    Full_Name: "Trần Ngọc Anh",
    Queue_Number: "Q-001",
    Status: "WAITING",
    ETA_Minutes: 5,
    Priority: false,
  },
  {
    Full_Name: "Phạm Minh Khoa",
    Queue_Number: "Q-002",
    Status: "WAITING",
    ETA_Minutes: 12,
    Priority: true,
  },
  {
    Full_Name: "Lê Thảo Vy",
    Queue_Number: "Q-003",
    Status: "IN_PROGRESS",
    ETA_Minutes: null,
    Priority: false,
  },
  {
    Full_Name: "Nguyễn Hải Long",
    Queue_Number: "Q-004",
    Status: "DONE",
    ETA_Minutes: null,
    Priority: false,
  },
];

const defaultIntakes = [
  { Full_Name: "Trần Phương Anh", Department: "Nội tổng quát", Visit_Type: "Mới tiếp nhận" },
  { Full_Name: "Đặng Minh Khoa", Department: "Tim mạch", Visit_Type: "BHYT" },
];

const diagnosisSuggestions = [
  { code: "J06.9", desc: "Nhiễm trùng hô hấp trên cấp" },
  { code: "R50.9", desc: "Sốt không rõ nguyên nhân" },
  { code: "M79.3", desc: "Đau cơ" },
];

const labOptions = [
  "Công thức máu (CBC)",
  "Hóa sinh cơ bản",
  "Chức năng gan",
  "Tổng phân tích nước tiểu",
];

const imagingOptions = ["X-Quang ngực", "CT Scan - Head", "MRI - Spine", "Siêu âm tổng quát"];

const drugSuggestions = ["Amoxicillin", "Ibuprofen", "Metformin"];

function calculateAge(dateString) {
  if (!dateString) return "--";
  const birth = new Date(dateString);
  if (Number.isNaN(birth.getTime())) return "--";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function isDoctorRole(role) {
  return role.startsWith("Bác sĩ");
}

function getStatusClasses(status, priority) {
  const base =
    "rounded-xl border px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";
  if (status === "DONE") return `${base} border-emerald-200 bg-emerald-50`;
  if (status === "IN_PROGRESS") return `${base} border-amber-200 bg-amber-50`;
  if (priority) return `${base} border-rose-300 bg-rose-50`;
  return `${base} border-slate-200 bg-white`;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("his_token") || "");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [queueStatus, setQueueStatus] = useState("all");
  const [queueSearch, setQueueSearch] = useState("");
  const [queueItems, setQueueItems] = useState(defaultQueue);
  const [intakeItems, setIntakeItems] = useState(defaultIntakes);
  const [allergyItems, setAllergyItems] = useState(["Penicillin", "Sulfa Drugs", "Aspirin"]);

  const [roleChoice, setRoleChoice] = useState("Bác sĩ");
  const [role, setRole] = useState("");
  const [user, setUser] = useState({ name: "BS. Nguyễn Minh", role: "Bác sĩ đa khoa" });

  const [encounterId, setEncounterId] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [patient, setPatient] = useState({
    Full_Name: "Nguyễn Ngọc Anh",
    Birth_Date: "1992-06-12",
    Gender: "Nữ",
    Patient_ID: "MRN-2024-8821",
  });

  const [queueHint, setQueueHint] = useState(
    "Ưu tiên hiển thị màu đỏ, trạng thái đang khám hiển thị màu vàng."
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [intakeForm, setIntakeForm] = useState({
    fullName: "",
    birthDate: "",
    gender: "",
    contact: "",
    department: "",
    visitType: "",
    priority: false,
  });

  const [encounterForm, setEncounterForm] = useState({
    pulse: "72",
    temperature: "36.8",
    weight: "",
    height: "",
    bloodPressure: "120/80",
    spo2: "98%",
    chiefComplaint: "",
    diagnosisSearch: "",
    diagnosisCode: "",
    clinicalNotes: "",
  });

  const [prescriptions, setPrescriptions] = useState([{ drug: "", dosage: "", duration: "" }]);
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [selectedImaging, setSelectedImaging] = useState([]);

  const showLoginModal = !token;

  const isDoctor = useMemo(() => isDoctorRole(role), [role]);
  const isNurse = role === "Điều dưỡng";
  const isReception = role === "Lễ tân";

  async function apiFetch(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("his_token");
      setToken("");
    }

    return response;
  }

  async function loadQueue() {
    try {
      const response = await apiFetch(`/api/queue?status=${queueStatus}`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.items)) setQueueItems(data.items);
    } catch {
      // Keep local demo data if API is not available.
    }
  }

  async function loadIntakes() {
    try {
      const response = await apiFetch("/api/intakes?limit=6");
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.items)) setIntakeItems(data.items);
    } catch {
      // Keep local demo data if API is not available.
    }
  }

  async function loadPatient() {
    try {
      const response = await apiFetch("/api/patients/current");
      if (!response.ok) return;
      const data = await response.json();
      if (data.patient) {
        setPatient(data.patient);
        setPatientId(data.patient.Patient_ID || null);
      }
      if (data.encounter) {
        setEncounterId(data.encounter.Encounter_ID || null);
        setEncounterForm((prev) => ({
          ...prev,
          chiefComplaint: data.encounter.Chief_Complaint || "",
          diagnosisCode: data.encounter.Main_ICD10 || "",
          clinicalNotes: data.encounter.Clinical_Notes || "",
          pulse: data.encounter.Pulse ? String(data.encounter.Pulse) : prev.pulse,
          temperature: data.encounter.Temperature
            ? String(data.encounter.Temperature)
            : prev.temperature,
          weight: data.encounter.Weight ? String(data.encounter.Weight) : "",
          height: data.encounter.Height ? String(data.encounter.Height) : "",
        }));
      }
    } catch {
      // Keep local demo data if API is not available.
    }
  }

  async function loadAllergies(currentPatientId) {
    if (!currentPatientId) return;
    try {
      const response = await apiFetch(`/api/allergies?patientId=${currentPatientId}`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.items)) setAllergyItems(data.items);
    } catch {
      // Keep local demo data if API is not available.
    }
  }

  async function loadSession() {
    try {
      const response = await apiFetch("/api/auth/me");
      if (!response.ok) return;
      const data = await response.json();
      if (data.user) {
        setUser({ name: data.user.name, role: data.user.role });
        setRole(data.user.role);
      }
    } catch {
      // Silently ignore if API is unavailable.
    }
  }

  async function refreshDashboard() {
    await Promise.all([loadQueue(), loadIntakes(), loadPatient()]);
  }

  useEffect(() => {
    if (!token) return;
    loadSession();
    refreshDashboard();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadQueue();
  }, [queueStatus]);

  useEffect(() => {
    if (patientId) loadAllergies(patientId);
  }, [patientId]);

  const filteredQueue = useMemo(() => {
    const query = queueSearch.trim().toLowerCase();
    return queueItems.filter((item) => {
      const name = (item.Full_Name || "").toLowerCase();
      const queueNumber = String(item.Queue_Number || "").toLowerCase();
      return !query || name.includes(query) || queueNumber.includes(query);
    });
  }, [queueItems, queueSearch]);

  function updateEncounterField(field, value) {
    setEncounterForm((prev) => ({ ...prev, [field]: value }));
  }

  function updatePrescription(index, field, value) {
    setPrescriptions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function toggleOrderValue(current, setCurrent, value) {
    setCurrent((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  }

  function pickDrugSuggestion(drugName) {
    setPrescriptions((prev) => {
      const emptyIndex = prev.findIndex((item) => !item.drug.trim());
      if (emptyIndex >= 0) {
        return prev.map((item, i) => (i === emptyIndex ? { ...item, drug: drugName } : item));
      }
      return [...prev, { drug: drugName, dosage: "", duration: "" }];
    });
  }

  async function handleLogin() {
    const username = loginForm.username.trim();
    const password = loginForm.password.trim();

    const loginAsDemo = () => {
      const demoRole = roleChoice || "Bác sĩ";
      const demoToken = `demo-token-${Date.now()}`;
      localStorage.setItem("his_token", demoToken);
      setToken(demoToken);
      setRole(demoRole);
      setUser({
        name: username || "Người dùng demo",
        role: demoRole,
      });
      setLoginForm({ username: "", password: "" });
      setLoginError("");
      setQueueHint("Đăng nhập demo thành công (không cần backend).");
    };

    if (!username || !password) {
      setLoginError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }

    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setLoginError("Sai tài khoản hoặc mật khẩu.");
        } else if (response.status === 404 || response.status === 405) {
          loginAsDemo();
        } else {
          setLoginError("Không thể đăng nhập. Vui lòng thử lại.");
        }
        return;
      }

      const data = await response.json();
      localStorage.setItem("his_token", data.token);
      setToken(data.token);
      if (data.user) {
        setUser({ name: data.user.name, role: data.user.role });
        setRole(data.user.role);
      } else {
        setRole(roleChoice);
      }
      setLoginForm({ username: "", password: "" });
      setQueueHint("Đăng nhập thành công.");
    } catch {
      loginAsDemo();
    }
  }

  async function handleLogout(e) {
    e.preventDefault();
    try {
      if (token) await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout.
    }
    localStorage.removeItem("his_token");
    setToken("");
  }

  async function handleSaveIntake() {
    const { fullName, birthDate, gender, contact, department, visitType, priority } = intakeForm;

    if (!fullName || !gender || !department || !visitType) {
      setQueueHint("Vui lòng nhập đầy đủ họ tên, giới tính, chuyên khoa và loại khám trước khi lưu.");
      return;
    }

    try {
      const response = await apiFetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          birthDate,
          gender,
          contact,
          department,
          visitType,
          priority,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setQueueHint(payload?.error || "Không thể lưu hồ sơ. Vui lòng thử lại.");
        return;
      }

      setIntakeForm({
        fullName: "",
        birthDate: "",
        gender: "",
        contact: "",
        department: "",
        visitType: "",
        priority: false,
      });
      setQueueHint("Đã lưu hồ sơ tiếp nhận.");
      await refreshDashboard();
    } catch {
      setIntakeItems((prev) => [
        {
          Full_Name: fullName,
          Department: department,
          Visit_Type: visitType,
        },
        ...prev,
      ]);
      setQueueHint("Đã lưu hồ sơ ở chế độ local demo.");
    }
  }

  async function handleNextPatient() {
    try {
      const response = await apiFetch("/api/queue/next", { method: "POST" });
      if (!response.ok) {
        setQueueHint("Không còn bệnh nhân đang chờ.");
        return;
      }
      setQueueHint("Đã gọi bệnh nhân tiếp theo.");
      await refreshDashboard();
    } catch {
      setQueueHint("Đã gọi bệnh nhân tiếp theo (demo).");
    }
  }

  async function handleSaveEncounter() {
    if (!encounterId) {
      setQueueHint("Chưa có lượt khám để lưu.");
      return;
    }

    const payload = {
      chiefComplaint: encounterForm.chiefComplaint,
      diagnosisCode: encounterForm.diagnosisCode,
      clinicalNotes: encounterForm.clinicalNotes,
      pulse: Number(encounterForm.pulse) || null,
      temperature: Number(encounterForm.temperature) || null,
      weight: Number(encounterForm.weight) || null,
      height: Number(encounterForm.height) || null,
    };

    try {
      const response = await apiFetch(`/api/encounters/${encounterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setQueueHint(response.ok ? "Đã lưu hồ sơ khám." : "Không thể lưu hồ sơ khám.");
      if (response.ok) await loadPatient();
    } catch {
      setQueueHint("Đã lưu hồ sơ khám ở chế độ local demo.");
    }
  }

  async function submitOrders(kind) {
    const selected = kind === "labs" ? selectedLabs : selectedImaging;
    if (!encounterId) {
      setQueueHint("Chưa có lượt khám để gửi chỉ định.");
      return;
    }

    if (selected.length === 0) {
      setQueueHint("Vui lòng chọn ít nhất một chỉ định.");
      return;
    }

    const body =
      kind === "labs"
        ? { encounterId, tests: selected }
        : { encounterId, items: selected };

    try {
      const response = await apiFetch(`/api/orders/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setQueueHint(response.ok ? "Đã gửi chỉ định." : "Không thể gửi chỉ định. Vui lòng thử lại.");
    } catch {
      setQueueHint("Đã gửi chỉ định ở chế độ local demo.");
    }
  }

  async function submitPrescription() {
    if (!encounterId) {
      setQueueHint("Chưa có lượt khám để xuất toa thuốc.");
      return;
    }

    const items = prescriptions.filter((item) => item.drug.trim());
    if (items.length === 0) {
      setQueueHint("Vui lòng nhập ít nhất một thuốc.");
      return;
    }

    try {
      const response = await apiFetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encounterId, items }),
      });
      setQueueHint(response.ok ? "Đã lưu toa thuốc." : "Không thể lưu toa thuốc. Vui lòng thử lại.");
    } catch {
      setQueueHint("Đã lưu toa thuốc ở chế độ local demo.");
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 px-4 py-3 backdrop-blur lg:px-6">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <div className="space-y-1.5">
                <span className="block h-0.5 w-4 rounded bg-slate-700" />
                <span className="block h-0.5 w-4 rounded bg-slate-700" />
                <span className="block h-0.5 w-4 rounded bg-slate-700" />
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
                HIS
              </div>
              <div>
                <p className="font-semibold">Hệ Thống Quản Lý Bệnh Viện</p>
                <p className="text-xs text-slate-500">Dashboard phòng khám</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs text-indigo-800">
              <p className="uppercase tracking-[0.08em] text-indigo-500">Ca trực</p>
              <p className="font-semibold">Sáng • 07:00 - 15:00</p>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600"
            >
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-sm">🔔</span>
            </button>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-2 py-1.5">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                DR
              </div>
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-0 px-0 lg:grid-cols-[240px_1fr]">
        {!sidebarCollapsed && (
          <aside className="border-r border-slate-200/80 bg-white/75 p-4 backdrop-blur lg:min-h-[calc(100vh-76px)]">
            <nav className="grid gap-1.5">
              <a href="#" className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                ⎈ Phòng khám
              </a>
              <a href="#" className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                👥 Quản lý bệnh nhân
              </a>
              <a href="#" className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                📄 Hồ sơ y tế
              </a>
              <a href="#" className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                ⚙ Cài đặt
              </a>
            </nav>
            <div className="mt-6 border-t border-slate-200 pt-4">
              <a
                href="#"
                onClick={handleLogout}
                className="block rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                ⎋ Đăng xuất
              </a>
            </div>
          </aside>
        )}

        <main className="grid min-h-[calc(100vh-76px)] grid-cols-1 overflow-hidden xl:grid-cols-[360px_minmax(420px,1fr)_360px]">
          <section className="border-r border-slate-200 bg-white/70 p-4">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Hàng đợi bệnh nhân</h2>
              <p className="text-xs text-slate-500">Theo dõi và lọc trạng thái khám.</p>
            </div>

            <div className="space-y-4 overflow-y-auto">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Tiếp nhận bệnh nhân mới</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Họ tên">
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={intakeForm.fullName}
                      onChange={(e) => setIntakeForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isReception}
                      placeholder="Nguyễn Văn A"
                    />
                  </Field>
                  <Field label="Ngày sinh">
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={intakeForm.birthDate}
                      onChange={(e) => setIntakeForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                      disabled={!isReception}
                    />
                  </Field>
                  <Field label="Giới tính">
                    <select
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={intakeForm.gender}
                      onChange={(e) => setIntakeForm((prev) => ({ ...prev, gender: e.target.value }))}
                      disabled={!isReception}
                    >
                      <option value="">Chọn giới tính</option>
                      <option>Nữ</option>
                      <option>Nam</option>
                      <option>Khác</option>
                    </select>
                  </Field>
                  <Field label="CCCD / SĐT">
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={intakeForm.contact}
                      onChange={(e) => setIntakeForm((prev) => ({ ...prev, contact: e.target.value }))}
                      disabled={!isReception}
                      placeholder="0123456789"
                    />
                  </Field>
                  <Field label="Chuyên khoa">
                    <select
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={intakeForm.department}
                      onChange={(e) => setIntakeForm((prev) => ({ ...prev, department: e.target.value }))}
                      disabled={!isReception}
                    >
                      <option value="">Chọn chuyên khoa</option>
                      <option>Nội tổng quát</option>
                      <option>Nhi</option>
                      <option>Tim mạch</option>
                      <option>Da liễu</option>
                    </select>
                  </Field>
                  <Field label="Loại khám">
                    <select
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={intakeForm.visitType}
                      onChange={(e) => setIntakeForm((prev) => ({ ...prev, visitType: e.target.value }))}
                      disabled={!isReception}
                    >
                      <option value="">Chọn loại khám</option>
                      <option>BHYT</option>
                      <option>Dịch vụ</option>
                    </select>
                  </Field>
                </div>
                <label className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={intakeForm.priority}
                    onChange={(e) => setIntakeForm((prev) => ({ ...prev, priority: e.target.checked }))}
                    disabled={!isReception}
                  />
                  Cấp cứu / ưu tiên
                </label>
                <button
                  type="button"
                  disabled={!isReception}
                  onClick={handleSaveIntake}
                  className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lưu hồ sơ
                </button>

                <div className="mt-3 grid gap-2">
                  {intakeItems.slice(0, 6).map((item) => (
                    <div
                      key={`${item.Full_Name}-${item.Department}`}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"
                    >
                      <p className="font-semibold text-slate-700">
                        {item.Full_Name} <span className="font-normal text-slate-500">• {item.Department || "--"}</span>
                      </p>
                      <span className="rounded-full bg-indigo-100 px-2 py-1 font-semibold text-indigo-700">
                        {item.Visit_Type || "--"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
                <input
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  placeholder="Tìm bệnh nhân hoặc mã số..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-8 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "all", label: "Tất cả" },
                  { value: "waiting", label: "Đang chờ" },
                  { value: "done", label: "Đã khám" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setQueueStatus(item.value)}
                    className={`rounded-lg px-2 py-2 text-xs font-semibold ${
                      queueStatus === item.value
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!(isReception || isNurse)}
                onClick={handleNextPatient}
                className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Gọi bệnh nhân tiếp theo
              </button>
              <p className="text-xs text-slate-500">{queueHint}</p>

              <div className="grid gap-2">
                {filteredQueue.map((item) => {
                  const status = (item.Status || "WAITING").toUpperCase();
                  const priority = Boolean(item.Priority || item.Is_Emergency);
                  return (
                    <article
                      key={`${item.Queue_Number}-${item.Full_Name}`}
                      className={getStatusClasses(status, priority)}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{item.Full_Name}</h3>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="rounded-md bg-blue-100 px-2 py-1 font-semibold text-blue-700">
                          {item.Queue_Number}
                        </span>
                        {priority && (
                          <span className="rounded-full bg-rose-200 px-2 py-1 font-semibold text-rose-700">
                            Ưu tiên
                          </span>
                        )}
                        <span>
                          {status === "DONE"
                            ? "✔ Hoàn tất"
                            : status === "IN_PROGRESS"
                            ? "⏱ Đang khám"
                            : `⏱ ${item.ETA_Minutes ?? "--"} phút`}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="border-r border-slate-200 bg-slate-50/65 p-4">
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="grid gap-2">
                  {["Sinh hiệu", "Chẩn đoán", "Chỉ định", "Kê đơn"].map((step, i) => (
                    <div key={step} className="flex items-center gap-2 text-xs text-slate-500">
                      <div
                        className={`grid h-7 w-7 place-items-center rounded-lg font-bold ${
                          i === 0 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{step}</p>
                        <p>
                          {i === 0 && "Đo chỉ số cơ bản"}
                          {i === 1 && "Triệu chứng & ICD-10"}
                          {i === 2 && "Xét nghiệm & hình ảnh"}
                          {i === 3 && "Toa thuốc điện tử"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">
                    {(patient.Full_Name || "NA").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{patient.Full_Name}</h2>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{calculateAge(patient.Birth_Date)} tuổi</span>
                      <span>{patient.Gender}</span>
                      <span className="font-semibold text-blue-600">
                        {(patient.Patient_ID || "MRN-XXXX").slice(0, 12).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Card title="Chỉ số sinh hiệu">
                <div className="grid grid-cols-2 gap-2">
                  <Vital label="Huyết áp" value={encounterForm.bloodPressure} unit="mmHg" />
                  <Vital label="Nhịp tim" value={encounterForm.pulse || "--"} unit="bpm" />
                  <Vital label="Nhiệt độ" value={encounterForm.temperature || "--"} unit="°C" />
                  <Vital label="SpO2" value={encounterForm.spo2} unit="Oxygen Sat." />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Field label="Nhịp tim">
                    <input
                      type="number"
                      placeholder="bpm"
                      value={encounterForm.pulse}
                      onChange={(e) => updateEncounterField("pulse", e.target.value)}
                      disabled={!(isDoctor || isNurse)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="Nhiệt độ">
                    <input
                      type="number"
                      placeholder="°C"
                      step="0.1"
                      value={encounterForm.temperature}
                      onChange={(e) => updateEncounterField("temperature", e.target.value)}
                      disabled={!(isDoctor || isNurse)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="Cân nặng">
                    <input
                      type="number"
                      placeholder="kg"
                      step="0.1"
                      value={encounterForm.weight}
                      onChange={(e) => updateEncounterField("weight", e.target.value)}
                      disabled={!(isDoctor || isNurse)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="Chiều cao">
                    <input
                      type="number"
                      placeholder="cm"
                      step="0.1"
                      value={encounterForm.height}
                      onChange={(e) => updateEncounterField("height", e.target.value)}
                      disabled={!(isDoctor || isNurse)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </Field>
                </div>
              </Card>

              <Card title="Lý do khám">
                <textarea
                  value={encounterForm.chiefComplaint}
                  onChange={(e) => updateEncounterField("chiefComplaint", e.target.value)}
                  disabled={!isDoctor}
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Nhập lý do khám chính..."
                />
              </Card>

              <Card title="Chẩn đoán (ICD-10)">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-xs text-slate-400">🔎</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-8 py-2 text-sm"
                    placeholder="Tìm mã ICD-10..."
                    value={encounterForm.diagnosisSearch}
                    onChange={(e) => updateEncounterField("diagnosisSearch", e.target.value)}
                    disabled={!isDoctor}
                  />
                </div>
                <div className="mt-2 grid gap-1.5">
                  {diagnosisSuggestions.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      disabled={!isDoctor}
                      onClick={() => updateEncounterField("diagnosisCode", item.code)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <p className="font-semibold text-blue-700">{item.code}</p>
                      <p className="text-slate-500">{item.desc}</p>
                    </button>
                  ))}
                </div>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Chẩn đoán đã chọn"
                  value={encounterForm.diagnosisCode}
                  onChange={(e) => updateEncounterField("diagnosisCode", e.target.value)}
                  disabled={!isDoctor}
                />
              </Card>

              <Card title="Ghi chú lâm sàng">
                <textarea
                  value={encounterForm.clinicalNotes}
                  onChange={(e) => updateEncounterField("clinicalNotes", e.target.value)}
                  disabled={!isDoctor}
                  className="min-h-36 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Nhập diễn biến, đánh giá và kế hoạch điều trị..."
                />
                <button
                  type="button"
                  disabled={!(isDoctor || isNurse)}
                  onClick={handleSaveEncounter}
                  className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lưu hồ sơ khám
                </button>
              </Card>
            </div>
          </section>

          <section className="bg-white/70 p-4">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Y lệnh & toa thuốc</h2>
              <p className="text-xs text-slate-500">Thực hiện xét nghiệm, chẩn đoán hình ảnh và kê đơn.</p>
            </div>

            <div className="space-y-4 overflow-y-auto">
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-rose-900">Cảnh báo dị ứng</h3>
                <div className="space-y-1.5">
                  {allergyItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-rose-300 bg-rose-200 px-2 py-1 text-xs text-rose-900"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <Card title="Chỉ định xét nghiệm">
                <OrderCheckList
                  values={labOptions}
                  selected={selectedLabs}
                  onToggle={(value) => toggleOrderValue(selectedLabs, setSelectedLabs, value)}
                  disabled={!isDoctor}
                />
                <button
                  type="button"
                  disabled={!isDoctor}
                  onClick={() => submitOrders("labs")}
                  className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Gửi xét nghiệm ({selectedLabs.length})
                </button>
              </Card>

              <Card title="Chẩn đoán hình ảnh">
                <OrderCheckList
                  values={imagingOptions}
                  selected={selectedImaging}
                  onToggle={(value) => toggleOrderValue(selectedImaging, setSelectedImaging, value)}
                  disabled={!isDoctor}
                />
                <button
                  type="button"
                  disabled={!isDoctor}
                  onClick={() => submitOrders("imaging")}
                  className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Gửi chỉ định ({selectedImaging.length})
                </button>
              </Card>

              <Card title="Toa thuốc điện tử">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-8 py-2 text-sm"
                    placeholder="Tìm thuốc..."
                    disabled={!isDoctor}
                  />
                </div>
                <div className="mt-2 grid gap-1.5">
                  {drugSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      disabled={!isDoctor}
                      onClick={() => pickDrugSuggestion(item)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid gap-2">
                  {prescriptions.map((item, index) => (
                    <div key={`rx-${index}`} className="grid gap-2">
                      <input
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Tên thuốc"
                        value={item.drug}
                        onChange={(e) => updatePrescription(index, "drug", e.target.value)}
                        disabled={!isDoctor}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Liều dùng"
                          value={item.dosage}
                          onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                          disabled={!isDoctor}
                        />
                        <input
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Số ngày"
                          value={item.duration}
                          onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                          disabled={!isDoctor}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!isDoctor}
                  onClick={() => setPrescriptions((prev) => [...prev, { drug: "", dosage: "", duration: "" }])}
                  className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  + Thêm thuốc
                </button>
                <button
                  type="button"
                  disabled={!isDoctor}
                  onClick={submitPrescription}
                  className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Xuất toa thuốc
                </button>
              </Card>
            </div>
          </section>
        </main>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Đăng nhập hệ thống</h2>
            <p className="mt-1 text-sm text-slate-500">Vui lòng đăng nhập để sử dụng các chức năng.</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Bác sĩ", "Điều dưỡng", "Lễ tân"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRoleChoice(item)}
                  className={`rounded-xl border px-2 py-2 text-xs ${
                    roleChoice === item
                      ? "border-indigo-200 bg-indigo-50 font-semibold text-indigo-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              <label className="text-xs text-slate-500">Tài khoản</label>
              <input
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="doctor"
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
              />
              <label className="text-xs text-slate-500">Mật khẩu</label>
              <input
                type="password"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={handleLogin}
                className="mt-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Đăng nhập
              </button>
              <p className="min-h-4 text-xs text-rose-600">{loginError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Vital({ label, value, unit }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-[11px] text-slate-400">{unit}</p>
    </div>
  );
}

function OrderCheckList({ values, selected, onToggle, disabled }) {
  return (
    <div className="grid gap-2 text-sm text-slate-700">
      {values.map((value) => (
        <label key={value} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(value)}
            onChange={() => onToggle(value)}
            disabled={disabled}
          />
          {value}
        </label>
      ))}
    </div>
  );
}

export default App;
