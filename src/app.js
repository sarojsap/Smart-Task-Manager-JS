import { Store } from "./store.js";
import { renderTasks, updateStats, showEditModal, hideEditModal, showShortcutsModal, hideShortcutsModal } from "./ui.js";
import { debounce, isToday, isThisWeek, isOverdue } from "./utils.js";

// ============================================
// DOM ELEMENTS
// ============================================

// Input elements
const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const priorityInput = document.getElementById("task-priority");
const dateInput = document.getElementById("task-date");
const clearFormBtn = document.getElementById("clear-form-btn");

// Filter elements
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");
const dateFilter = document.getElementById("date-filter");
const filterPills = document.querySelectorAll(".filter-pill");

// Task list
const taskListEl = document.getElementById("task-list");

// Modals
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const closeModalBtn = document.getElementById("close-modal");
const cancelEditBtn = document.getElementById("cancel-edit");
const shortcutsModal = document.getElementById("shortcuts-modal");
const shortcutsBtn = document.getElementById("shortcuts-btn");
const closeShortcutsBtn = document.getElementById("close-shortcuts");

// Theme
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

// ============================================
// INITIALIZATION
// ============================================

Store.load();
applyFilters();
initTheme();

// ============================================
// TASK MANAGEMENT
// ============================================

// Handle Add Task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  const task = {
    id: Date.now(),
    title,
    priority: priorityInput.value,
    dueDate: dateInput.value,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  Store.add(task);
  clearForm();
  applyFilters();
  showToast("✅ Task added successfully!");
});

// Clear form
clearFormBtn.addEventListener("click", clearForm);

function clearForm() {
  titleInput.value = "";
  priorityInput.value = "medium";
  dateInput.value = "";
  titleInput.focus();
}

// ============================================
// FILTERING & SEARCH
// ============================================

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = statusFilter.value;
  const priorityValue = priorityFilter.value;
  const dateValue = dateFilter.value;

  const filteredTasks = Store.tasks.filter((task) => {
    // Search match
    const matchesSearch = task.title.toLowerCase().includes(searchTerm);

    // Status match
    const matchesStatus = statusValue === "all" || task.status === statusValue;

    // Priority match
    const matchesPriority = priorityValue === "all" || task.priority === priorityValue;

    // Date match
    let matchesDate = true;
    if (dateValue !== "all") {
      if (dateValue === "today") {
        matchesDate = task.dueDate && isToday(task.dueDate);
      } else if (dateValue === "week") {
        matchesDate = task.dueDate && isThisWeek(task.dueDate);
      } else if (dateValue === "overdue") {
        matchesDate = task.dueDate && isOverdue(task.dueDate) && task.status !== "completed";
      } else if (dateValue === "nodate") {
        matchesDate = !task.dueDate;
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  renderTasks(filteredTasks);
  updateStats(Store.tasks);
}

// Debounced search
const debouncedFilter = debounce(applyFilters, 300);
searchInput.addEventListener("input", debouncedFilter);

// Filter changes
statusFilter.addEventListener("change", applyFilters);
priorityFilter.addEventListener("change", applyFilters);
dateFilter.addEventListener("change", applyFilters);

// Quick filter pills
filterPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    // Update active pill styling
    filterPills.forEach((p) => {
      p.classList.remove("bg-gradient-to-r", "from-violet-500", "to-indigo-500", "text-white", "shadow-md");
      p.classList.add("bg-slate-100", "dark:bg-slate-700", "text-slate-600", "dark:text-slate-300");
    });
    pill.classList.remove("bg-slate-100", "dark:bg-slate-700", "text-slate-600", "dark:text-slate-300");
    pill.classList.add("bg-gradient-to-r", "from-violet-500", "to-indigo-500", "text-white", "shadow-md");

    const filter = pill.dataset.filter;

    // Reset all dropdown filters
    statusFilter.value = "all";
    priorityFilter.value = "all";
    dateFilter.value = "all";

    // Apply the quick filter
    if (filter === "pending" || filter === "inprogress" || filter === "completed") {
      statusFilter.value = filter;
    } else if (filter === "high") {
      priorityFilter.value = "high";
    } else if (filter === "overdue") {
      dateFilter.value = "overdue";
    }

    applyFilters();
  });
});

// ============================================
// TASK ACTIONS (Event Delegation)
// ============================================

taskListEl.addEventListener("click", (e) => {
  const taskEl = e.target.closest("[data-id]");
  if (!taskEl) return;

  const id = Number(taskEl.dataset.id);
  const action = e.target.closest("[data-action]")?.dataset.action;

  if (!action) return;

  if (action === "delete") {
    if (confirm("Are you sure you want to delete this task?")) {
      Store.remove(id);
      applyFilters();
      showToast("🗑️ Task deleted");
    }
  }

  if (action === "toggle") {
    const task = Store.tasks.find((t) => t.id === id);
    if (task) {
      // Cycle through statuses: pending -> inprogress -> completed -> pending
      const statusCycle = ["pending", "inprogress", "completed"];
      const currentIndex = statusCycle.indexOf(task.status);
      task.status = statusCycle[(currentIndex + 1) % statusCycle.length];
      Store.save();
      applyFilters();
      showToast(`Status: ${task.status === "inprogress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}`);
    }
  }

  if (action === "edit") {
    const task = Store.tasks.find((t) => t.id === id);
    if (task) {
      showEditModal(task);
    }
  }
});

// ============================================
// EDIT MODAL
// ============================================

closeModalBtn.addEventListener("click", hideEditModal);
cancelEditBtn.addEventListener("click", hideEditModal);

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) {
    hideEditModal();
  }
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = Number(document.getElementById("edit-task-id").value);
  const task = Store.tasks.find((t) => t.id === id);

  if (task) {
    task.title = document.getElementById("edit-task-title").value.trim();
    task.priority = document.getElementById("edit-task-priority").value;
    task.status = document.getElementById("edit-task-status").value;
    task.dueDate = document.getElementById("edit-task-date").value;
    Store.save();
    hideEditModal();
    applyFilters();
    showToast("✏️ Task updated!");
  }
});

// ============================================
// SHORTCUTS MODAL
// ============================================

shortcutsBtn.addEventListener("click", showShortcutsModal);
closeShortcutsBtn.addEventListener("click", hideShortcutsModal);

shortcutsModal.addEventListener("click", (e) => {
  if (e.target === shortcutsModal) {
    hideShortcutsModal();
  }
});

// ============================================
// DRAG & DROP
// ============================================

let draggedId = null;

taskListEl.addEventListener("dragstart", (e) => {
  const el = e.target.closest("[data-id]");
  if (!el) return;
  draggedId = Number(el.dataset.id);
  el.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
});

taskListEl.addEventListener("dragend", (e) => {
  const el = e.target.closest("[data-id]");
  if (el) el.classList.remove("dragging");
  draggedId = null;
});

taskListEl.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
});

taskListEl.addEventListener("drop", (e) => {
  e.preventDefault();
  const targetEl = e.target.closest("[data-id]");
  if (!targetEl || draggedId === null) return;

  const targetId = Number(targetEl.dataset.id);
  if (draggedId === targetId) return;

  const fromIndex = Store.tasks.findIndex((t) => t.id === draggedId);
  const toIndex = Store.tasks.findIndex((t) => t.id === targetId);

  if (fromIndex !== -1 && toIndex !== -1) {
    const [moved] = Store.tasks.splice(fromIndex, 1);
    Store.tasks.splice(toIndex, 0, moved);
    Store.save();
    applyFilters();
  }

  draggedId = null;
});

// ============================================
// THEME TOGGLE
// ============================================

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    root.classList.add("dark");
  } else if (savedTheme === "light") {
    root.classList.remove("dark");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.classList.add("dark");
  }
}

themeToggle.addEventListener("click", () => {
  root.classList.toggle("dark");
  const isDark = root.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  showToast(isDark ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

window.addEventListener("keydown", (e) => {
  // Don't trigger shortcuts when typing in input fields
  const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);

  // Alt + N: Focus new task input
  if (e.altKey && e.key.toLowerCase() === "n") {
    e.preventDefault();
    titleInput.focus();
  }

  // Alt + S: Focus search
  if (e.altKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    searchInput.focus();
  }

  // Alt + D: Toggle dark mode
  if (e.altKey && e.key.toLowerCase() === "d") {
    e.preventDefault();
    themeToggle.click();
  }

  // Escape: Clear filters / Close modals
  if (e.key === "Escape") {
    if (editModal.classList.contains("modal-show")) {
      hideEditModal();
    } else if (shortcutsModal.classList.contains("modal-show")) {
      hideShortcutsModal();
    } else {
      searchInput.value = "";
      statusFilter.value = "all";
      priorityFilter.value = "all";
      dateFilter.value = "all";
      
      // Reset filter pills
      filterPills.forEach((p) => {
        p.classList.remove("bg-gradient-to-r", "from-violet-500", "to-indigo-500", "text-white", "shadow-md");
        p.classList.add("bg-slate-100", "dark:bg-slate-700", "text-slate-600", "dark:text-slate-300");
      });
      filterPills[0].classList.remove("bg-slate-100", "dark:bg-slate-700", "text-slate-600", "dark:text-slate-300");
      filterPills[0].classList.add("bg-gradient-to-r", "from-violet-500", "to-indigo-500", "text-white", "shadow-md");
      
      applyFilters();
    }
  }

  // ?: Show shortcuts modal
  if (e.key === "?" && !isTyping) {
    e.preventDefault();
    showShortcutsModal();
  }
});

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, duration = 2500) {
  // Remove existing toast
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white;
    padding: 0.875rem 1.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.5);
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  // Animate out
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Export for global access
window.applyFilters = applyFilters;
