const STORAGE_KEY = "codex-todo-list-v1";
const form = document.querySelector("#todo-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#todo-list");
const template = document.querySelector("#todo-template");
const emptyState = document.querySelector("#empty-state");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const clearCompletedButton = document.querySelector("#clear-completed");
const totalCount = document.querySelector("#total-count");
const activeCount = document.querySelector("#active-count");
const doneCount = document.querySelector("#done-count");
const progressValue = document.querySelector("#progress-value");
const progressPercent = document.querySelector("#progress-percent");
const weekday = document.querySelector("#weekday");
const todayDate = document.querySelector("#today-date");
let currentFilter = "all";
let todos = loadTodos();
renderDate();
render();
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) { input.focus(); return; }
  todos.unshift({ id: createId(), title, completed: false, createdAt: new Date().toISOString() });
  input.value = "";
  saveTodos();
  render();
});
filterButtons.forEach((button) => {
  button.addEventListener("click", () => { currentFilter = button.dataset.filter; render(); });
});
clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
});
function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [makeTodo("整理今天的优先事项", false, -40), makeTodo("完成一个小任务", false, -28), makeTodo("回顾已经完成的事项", true, -16)];
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((todo) => todo && typeof todo.title === "string").map((todo) => ({
      id: typeof todo.id === "string" ? todo.id : createId(),
      title: todo.title.slice(0, 90),
      completed: Boolean(todo.completed),
      createdAt: todo.createdAt || new Date().toISOString(),
    }));
  } catch { return []; }
}
function makeTodo(title, completed, minutesOffset) {
  const date = new Date(Date.now() + minutesOffset * 60 * 1000);
  return { id: createId(), title, completed, createdAt: date.toISOString() };
}
function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function saveTodos() { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }
function render() {
  updateFilters();
  updateStats();
  const visibleTodos = getVisibleTodos();
  list.innerHTML = "";
  emptyState.hidden = visibleTodos.length > 0;
  visibleTodos.forEach((todo) => list.appendChild(createTodoElement(todo)));
}
function updateFilters() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}
function updateStats() {
  const total = todos.length;
  const done = todos.filter((todo) => todo.completed).length;
  const active = total - done;
  const percent = total ? Math.round((done / total) * 100) : 0;
  totalCount.textContent = total;
  activeCount.textContent = active;
  doneCount.textContent = done;
  progressPercent.textContent = `${percent}%`;
  progressValue.style.strokeDasharray = `${percent} 100`;
  clearCompletedButton.disabled = done === 0;
}
function getVisibleTodos() {
  if (currentFilter === "active") return todos.filter((todo) => !todo.completed);
  if (currentFilter === "done") return todos.filter((todo) => todo.completed);
  return todos;
}
function createTodoElement(todo) {
  const fragment = template.content.cloneNode(true);
  const item = fragment.querySelector(".todo-item");
  const checkbox = fragment.querySelector("input[type='checkbox']");
  const title = fragment.querySelector(".task-title");
  const meta = fragment.querySelector(".task-meta");
  const deleteButton = fragment.querySelector(".delete-button");
  item.classList.toggle("is-done", todo.completed);
  checkbox.checked = todo.completed;
  title.textContent = todo.title;
  meta.textContent = `${todo.completed ? "已完成" : "待处理"} · ${formatTime(todo.createdAt)}`;
  checkbox.addEventListener("change", () => {
    todos = todos.map((itemTodo) => itemTodo.id === todo.id ? { ...itemTodo, completed: checkbox.checked } : itemTodo);
    saveTodos();
    render();
  });
  deleteButton.addEventListener("click", () => {
    todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
    saveTodos();
    render();
  });
  return fragment;
}
function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
function renderDate() {
  const now = new Date();
  weekday.textContent = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(now);
  todayDate.textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(now);
}
