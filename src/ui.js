import { formatRelativeDate, isOverdue, isToday } from "./utils.js";

const taskListEl = document.getElementById("task-list");
const editModal = document.getElementById("edit-modal");
const shortcutsModal = document.getElementById("shortcuts-modal");

// ============================================
// RENDER TASKS
// ============================================

export function renderTasks(tasks) {
  if (!tasks.length) {
    taskListEl.innerHTML = `
      <li class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">No tasks found</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">Add your first task above or adjust your filters</p>
      </li>
    `;

    document.getElementById("task-count").textContent = "";
    return;
  }

  const html = tasks
    .map((task) => {
      const priorityBorderClass = getPriorityBorderClass(task.priority);
      const completedClass = task.status === "completed" ? "opacity-60" : "";
      const titleClass = task.status === "completed" ? "line-through" : "";
      const dueDateInfo = getDueDateInfo(task.dueDate, task.status);

      return `
        <li 
          class="task-item-animate group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-700/50 border-l-4 ${priorityBorderClass} shadow-sm hover:shadow-md hover:translate-x-1 transition-all duration-200 cursor-grab ${completedClass}"
          data-id="${task.id}"
          draggable="true"
        >
          <!-- Drag Handle -->
          <div class="flex-shrink-0 text-slate-300 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
            </svg>
          </div>

          <!-- Task Content -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-slate-800 dark:text-white mb-1 break-words ${titleClass}">${escapeHtml(task.title)}</h3>
            <div class="flex flex-wrap items-center gap-2 text-xs">
              ${getStatusBadge(task.status)}
              ${getPriorityBadge(task.priority)}
              ${dueDateInfo.html}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Cycle Status Button -->
            <button 
              class="p-2 rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 hover:scale-110" 
              data-action="toggle" 
              title="Change status"
            >
              ${getStatusIcon(task.status)}
            </button>
            
            <!-- Edit Button -->
            <button 
              class="p-2 rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 hover:scale-110" 
              data-action="edit" 
              title="Edit task"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            
            <!-- Delete Button -->
            <button 
              class="p-2 rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 hover:scale-110" 
              data-action="delete" 
              title="Delete task"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </li>
      `;
    })
    .join("");

  taskListEl.innerHTML = html;

  // Update task count
  document.getElementById("task-count").textContent = `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;
}

// ============================================
// UPDATE STATS
// ============================================

export function updateStats(tasks) {
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inprogress: tasks.filter((t) => t.status === "inprogress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  document.getElementById("stat-total").textContent = stats.total;
  document.getElementById("stat-pending").textContent = stats.pending;
  document.getElementById("stat-inprogress").textContent = stats.inprogress;
  document.getElementById("stat-completed").textContent = stats.completed;
}

// ============================================
// EDIT MODAL
// ============================================

export function showEditModal(task) {
  document.getElementById("edit-task-id").value = task.id;
  document.getElementById("edit-task-title").value = task.title;
  document.getElementById("edit-task-priority").value = task.priority;
  document.getElementById("edit-task-status").value = task.status;
  document.getElementById("edit-task-date").value = task.dueDate || "";

  editModal.classList.add("modal-show");
  document.getElementById("edit-task-title").focus();
}

export function hideEditModal() {
  editModal.classList.remove("modal-show");
}

// ============================================
// SHORTCUTS MODAL
// ============================================

export function showShortcutsModal() {
  shortcutsModal.classList.add("modal-show");
}

export function hideShortcutsModal() {
  shortcutsModal.classList.remove("modal-show");
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getPriorityBorderClass(priority) {
  const classes = {
    high: "border-rose-500",
    medium: "border-amber-500",
    low: "border-emerald-500",
  };
  return classes[priority] || "border-slate-300";
}

function getStatusBadge(status) {
  const badges = {
    pending: '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">⏳ Pending</span>',
    inprogress: '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">🔄 In Progress</span>',
    completed: '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">✅ Completed</span>',
  };
  return badges[status] || badges.pending;
}

function getPriorityBadge(priority) {
  const badges = {
    high: '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">High</span>',
    medium: '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Medium</span>',
    low: '<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Low</span>',
  };
  return badges[priority] || "";
}

function getStatusIcon(status) {
  if (status === "completed") {
    return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`;
  } else if (status === "inprogress") {
    return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>`;
  }
  return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`;
}

function getDueDateInfo(dueDate, status) {
  if (!dueDate) {
    return { html: '<span class="text-slate-400">📅 No deadline</span>' };
  }

  const isTaskOverdue = status !== "completed" && isOverdue(dueDate);
  const isTaskToday = isToday(dueDate);

  let className = "text-slate-500 dark:text-slate-400";
  let prefix = "📅";

  if (isTaskOverdue) {
    className = "text-rose-600 dark:text-rose-400 font-medium";
    prefix = "⚠️";
  } else if (isTaskToday) {
    className = "text-amber-600 dark:text-amber-400 font-medium";
    prefix = "🔔";
  }

  return {
    html: `<span class="${className}">${prefix} ${formatRelativeDate(dueDate)}</span>`,
  };
}