import { Store } from "./store.js";
import { renderTasks } from "./ui.js";
import { debounce } from "./utils.js";


// DOM elements
const titleInput = document.getElementById("task-title");
const priorityInput = document.getElementById("task-priority");
const dateInput = document.getElementById("task-date");
const addBtn = document.getElementById("add-task-btn");

// Initial load
Store.load();
applyFilters();

// Handle Add Task
addBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) return;

  const task = {
    id: Date.now(),
    title,
    priority: priorityInput.value,
    dueDate: dateInput.value,
    completed: false
  };

  Store.add(task);

  // Clear inputs
  titleInput.value = "";
  priorityInput.value = "medium";
  dateInput.value = "";

  // Re-render
  applyFilters();
});

function applyFilters() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const statusFilter = document.getElementById('statusSelect').value;
    const priorityFilter = document.getElementById('prioritySelect').value;

    const filtered = Store.tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    UI.renderTasks(filtered);
}

function applyFilters() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;
  const priorityFilter = document.getElementById("priority-filter").value;

  const filteredTasks = Store.tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "pending" && !task.completed);

    const matchesPriority =
      priorityFilter === "all" ||
      task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  renderTasks(filteredTasks);
}

const debouncedFilter = debounce(applyFilters, 300);

document.getElementById("search-input")
  .addEventListener("input", debouncedFilter);

document.getElementById("status-filter")
  .addEventListener("change", applyFilters);

document.getElementById("priority-filter")
  .addEventListener("change", applyFilters);

  const taskListEl = document.getElementById("task-list");

taskListEl.addEventListener("click", (e) => {
  const taskEl = e.target.closest("[data-id]");
  if (!taskEl) return;

  const id = Number(taskEl.dataset.id);

  if (e.target.dataset.action === "delete") {
    Store.remove(id);
    applyFilters();
  }

  if (e.target.dataset.action === "toggle") {
    const task = Store.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      applyFilters();
    }
  }
});


let draggedId = null;

taskListEl.addEventListener("dragstart", (e) => {
  const el = e.target.closest("[data-id]");
  if (!el) return;
  draggedId = Number(el.dataset.id);
});

taskListEl.addEventListener("dragover", (e) => {
  e.preventDefault();
});

taskListEl.addEventListener("drop", (e) => {
  const targetEl = e.target.closest("[data-id]");
  if (!targetEl || draggedId === null) return;

  const targetId = Number(targetEl.dataset.id);

  const fromIndex = Store.tasks.findIndex(t => t.id === draggedId);
  const toIndex = Store.tasks.findIndex(t => t.id === targetId);

  if (fromIndex !== -1 && toIndex !== -1) {
    const [moved] = Store.tasks.splice(fromIndex, 1);
    Store.tasks.splice(toIndex, 0, moved);
    applyFilters();
  }

  draggedId = null;
});


const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") root.classList.add("dark");

themeToggle.addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    root.classList.contains("dark") ? "dark" : "light"
  );
});

window.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "n") {
    e.preventDefault();
    document.getElementById("task-title").focus();
  }

  if (e.altKey && e.key === "s") {
    e.preventDefault();
    document.getElementById("search-input").focus();
  }

  if (e.key === "Escape") {
    document.getElementById("search-input").value = "";
    document.getElementById("status-filter").value = "all";
    document.getElementById("priority-filter").value = "all";
    applyFilters();
  }
});
