'use strict';

/* ===== DATA LAYER ===== */

const SKILLS = [
  'Посадка',
  'Движение с места',
  'Переключение передач',
  'Повороты',
  'Торможение',
  'Разворот',
  'Парковка задним ходом',
  'Параллельная парковка',
  'Горка',
  'Обгон',
  'Стоянка',
  'Экзаменационный маршрут',
  'Зеркала',
  'Скоростной режим',
  'Дорожные знаки',
  'Безопасность',
  'Психология'
];

const STORAGE_KEY = 'driving_school_data';

function getDefaultData() {
  return { students: [] };
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  }
  try {
    return JSON.parse(raw);
  } catch(e) {
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getStudent(id) {
  const data = loadData();
  return data.students.find(s => s.id === id);
}

function addStudent(student) {
  const data = loadData();
  student.id = generateId();
  student.lessons = [];
  data.students.push(student);
  saveData(data);
  return student;
}

function updateStudent(id, updates) {
  const data = loadData();
  const idx = data.students.findIndex(s => s.id === id);
  if (idx === -1) return null;
  data.students[idx] = { ...data.students[idx], ...updates };
  saveData(data);
  return data.students[idx];
}

function deleteStudent(id) {
  const data = loadData();
  data.students = data.students.filter(s => s.id !== id);
  saveData(data);
}

function addLesson(studentId, lesson) {
  const data = loadData();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return null;
  lesson.id = generateId();
  student.lessons.push(lesson);
  saveData(data);
  return lesson;
}

function getLessons(studentId) {
  const student = getStudent(studentId);
  return student ? student.lessons : [];
}

/* ===== PLACEHOLDER PHOTOS ===== */

function generatePlaceholderPhoto(seed) {
  const colors = ['#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#C62828', '#00695C', '#283593', '#E65100'];
  const color = colors[seed % colors.length];
  const initials = seed.toString().padStart(2, '0');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
    <rect width="150" height="150" fill="${color}" rx="16"/>
    <text x="75" y="85" text-anchor="middle" font-size="40" fill="white" font-family="Arial,sans-serif">👤</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/* ===== TEST DATA ===== */

function seedTestData() {
  const data = getDefaultData();
  data.students = [
    {
      id: generateId(),
      photo: generatePlaceholderPhoto(1),
      name: 'Иванов Иван Иванович',
      year: 2002,
      lessons: [
        {
          id: generateId(),
          date: '2026-04-28',
          time: '14:00',
          skills: [0, 1, 2, 3],
          comment: 'Первое занятие. Освоили посадку, трогание с места. Иван быстро привык к педалям.'
        },
        {
          id: generateId(),
          date: '2026-05-02',
          time: '15:30',
          skills: [3, 4, 5],
          comment: 'Повороты и торможение. Хорошая работа, нужно больше практики с зеркалами.'
        }
      ]
    },
    {
      id: generateId(),
      photo: generatePlaceholderPhoto(2),
      name: 'Петрова Анна Сергеевна',
      year: 2003,
      lessons: [
        {
          id: generateId(),
          date: '2026-04-30',
          time: '10:00',
          skills: [0, 1, 7, 8],
          comment: 'Параллельная парковка. Анна отлично чувствует габариты автомобиля.'
        }
      ]
    },
    {
      id: generateId(),
      photo: generatePlaceholderPhoto(3),
      name: 'Сидоров Алексей Павлович',
      year: 2001,
      lessons: []
    }
  ];
  saveData(data);
}

/* ===== NAVIGATION ===== */

let currentStudentId = null;
let currentPage = 'main';
let confirmCallback = null;

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  currentPage = pageId;

  const backBtn = document.getElementById('btnBack');
  backBtn.classList.toggle('hidden', pageId === 'pageMain');
}

function navigateBack() {
  closeModal();
  if (currentPage === 'pageStudent') {
    renderMainPage();
    showPage('pageMain');
  }
}

/* ===== RENDER MAIN PAGE ===== */

function renderMainPage() {
  const data = loadData();
  const list = document.getElementById('studentList');
  document.getElementById('headerTitle').textContent = 'Автошкола';

  if (data.students.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>Пока нет учеников</p><p style="font-size:14px;margin-top:8px;color:#bdbdbd;">Нажмите + чтобы добавить</p></div>';
    return;
  }

  list.innerHTML = data.students.map(student => `
    <div class="student-card" onclick="openStudentCard('${student.id}')">
      <img class="student-photo" src="${student.photo || generatePlaceholderPhoto(0)}" alt="${escapeHtml(student.name)}" loading="lazy">
      <div class="student-info">
        <div class="student-name">${escapeHtml(student.name)}</div>
        <div class="student-year">${student.year} г.р.</div>
      </div>
    </div>
  `).join('');
}

/* ===== STUDENT CARD ===== */

function openStudentCard(id) {
  currentStudentId = id;
  const student = getStudent(id);
  if (!student) return;

  showPage('pageStudent');
  document.getElementById('headerTitle').textContent = escapeHtml(student.name.split(' ')[0]);

  renderStudentCard(student);
}

function renderStudentCard(student) {
  const container = document.getElementById('pageStudent');

  const lessonsHtml = student.lessons.length === 0
    ? '<div class="empty-state" style="padding:20px 0;"><p style="font-size:14px;">Нет учебных занятий</p></div>'
    : student.lessons.slice().reverse().map(lesson => `
      <div class="lesson-item">
        <div class="lesson-header">
          <span class="lesson-date">${formatDate(lesson.date)} ${lesson.time}</span>
        </div>
        <div class="lesson-skills">
          ${lesson.skills.map(si => `<span class="skill-tag">${SKILLS[si]}</span>`).join('')}
        </div>
        ${lesson.comment ? `<div class="lesson-comment">${escapeHtml(lesson.comment)}</div>` : ''}
      </div>
    `).join('');

  container.innerHTML = `
    <div class="student-detail">
      <img class="detail-photo" src="${student.photo || generatePlaceholderPhoto(0)}" alt="${escapeHtml(student.name)}">
      <div class="detail-name">${escapeHtml(student.name)}</div>
      <div class="detail-year">${student.year} г.р.</div>

      <div class="lessons-section">
        <h3>Учебные занятия</h3>
        ${lessonsHtml}
        <button class="add-lesson-btn" onclick="showAddLessonForm('${student.id}')">+ Добавить занятие</button>
      </div>

      <button class="delete-btn" onclick="confirmDeleteStudent('${student.id}')">Удалить ученика</button>
    </div>
  `;
}

/* ===== ADD STUDENT FORM ===== */

function showAddStudentForm() {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <h3>Новый ученик</h3>
    <div class="form-container">
      <div class="form-group photo-upload">
        <input type="file" accept="image/*" capture="environment" id="addStudentPhotoInput" style="display:none;" onchange="handlePhotoUpload(event, 'addStudentPreview')">
        <img id="addStudentPreview" class="photo-preview" src="" onclick="document.getElementById('addStudentPhotoInput').click()" alt="Фото">
        <button class="photo-upload-btn" type="button" onclick="document.getElementById('addStudentPhotoInput').click()">📷 Выбрать фото</button>
      </div>
      <div class="form-group">
        <label>ФИО</label>
        <input type="text" id="addStudentName" placeholder="Фамилия Имя Отчество">
      </div>
      <div class="form-group">
        <label>Год рождения</label>
        <input type="number" id="addStudentYear" placeholder="2000" min="1950" max="2026">
      </div>
      <button class="save-btn" onclick="saveNewStudent()">Сохранить</button>
    </div>
  `;

  overlay.classList.add('active');
}

function handlePhotoUpload(event, previewId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById(previewId);
    if (img) {
      img.src = e.target.result;
    }
  };
  reader.readAsDataURL(file);
}

function saveNewStudent() {
  const photo = document.getElementById('addStudentPreview')?.src || '';
  const name = document.getElementById('addStudentName')?.value.trim();
  const yearStr = document.getElementById('addStudentYear')?.value.trim();

  if (!name) {
    alert('Введите ФИО ученика');
    return;
  }
  if (!yearStr) {
    alert('Введите год рождения');
    return;
  }
  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < 1950 || year > 2026) {
    alert('Введите корректный год рождения (1950-2026)');
    return;
  }

  const photoData = photo && photo.startsWith('data:')
    ? photo
    : generatePlaceholderPhoto(data.students ? data.students.length : 0);

  addStudent({
    photo: photoData,
    name: name,
    year: year
  });

  closeModal();
  if (currentPage === 'pageMain') {
    renderMainPage();
  } else {
    showPage('pageMain');
    renderMainPage();
  }
}

/* ===== ADD LESSON FORM ===== */

function showAddLessonForm(studentId) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const time = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  const skillsHtml = SKILLS.map((skill, i) => `
    <div class="skill-checkbox">
      <input type="checkbox" id="skill_${i}" value="${i}" checked>
      <label for="skill_${i}">${skill}</label>
    </div>
  `).join('');

  content.innerHTML = `
    <h3>Новое занятие</h3>
    <div class="form-container">
      <div class="form-group">
        <label>Дата</label>
        <input type="date" id="lessonDate" value="${today}">
      </div>
      <div class="form-group">
        <label>Время</label>
        <input type="time" id="lessonTime" value="${time}">
      </div>
      <div class="form-group">
        <label>Навыки</label>
        <div class="skills-grid">
          ${skillsHtml}
        </div>
      </div>
      <div class="form-group">
        <label>Комментарий</label>
        <textarea id="lessonComment" placeholder="Что отрабатывали, успехи, замечания..."></textarea>
      </div>
      <button class="save-btn" onclick="saveNewLesson('${studentId}')">Сохранить занятие</button>
    </div>
  `;

  overlay.classList.add('active');
}

function saveNewLesson(studentId) {
  const date = document.getElementById('lessonDate')?.value;
  const time = document.getElementById('lessonTime')?.value;

  if (!date || !time) {
    alert('Введите дату и время занятия');
    return;
  }

  const selectedSkills = [];
  for (let i = 0; i < SKILLS.length; i++) {
    const el = document.getElementById('skill_' + i);
    if (el && el.checked) {
      selectedSkills.push(i);
    }
  }

  if (selectedSkills.length === 0) {
    alert('Отметьте хотя бы один навык');
    return;
  }

  const comment = document.getElementById('lessonComment')?.value.trim() || '';

  addLesson(studentId, {
    date: date,
    time: time,
    skills: selectedSkills,
    comment: comment
  });

  closeModal();
  const student = getStudent(studentId);
  if (student) {
    renderStudentCard(student);
  }
}

/* ===== DELETE STUDENT ===== */

function confirmDeleteStudent(studentId) {
  const student = getStudent(studentId);
  if (!student) return;

  document.getElementById('confirmMessage').textContent =
    `Удалить ученика "${student.name}"? Все данные будут потеряны.`;
  document.getElementById('confirmOverlay').classList.add('active');

  confirmCallback = function() {
    deleteStudent(studentId);
    closeConfirm();
    currentStudentId = null;
    renderMainPage();
    showPage('pageMain');
  };
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('active');
  confirmCallback = null;
}

function executeConfirm() {
  if (confirmCallback) {
    confirmCallback();
  }
}

/* ===== MODAL ===== */

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

/* ===== UTILITY ===== */

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return parts[2] + '.' + parts[1] + '.' + parts[0];
}

/* ===== INIT ===== */

(function init() {
  const data = loadData();
  if (data.students.length === 0) {
    seedTestData();
  }
  renderMainPage();
  showPage('pageMain');
})();
