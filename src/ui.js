import { getPriorityColor } from "./utils.js";

const taskListEl = document.getElementById("task-list");

export function renderTasks(tasks) {
  if (!tasks.length) {
    taskListEl.innerHTML = `
      <li class="text-center text-gray-500 py-4">
        No tasks found
      </li>
    `;
    return;
  }

  const html = tasks
    .map(task => {
      const priorityClass = getPriorityColor(task.priority);

      return `
        <li 
          class="flex items-center justify-between p-3 border-l-4 rounded bg-gray-50 dark:bg-gray-700 ${priorityClass}"
          data-id="${task.id}"
        >
          <div>
            <h3 class="font-medium ${task.completed ? "line-through opacity-60" : ""}">
              ${task.title}
            </h3>
            <p class="text-xs text-gray-500">
              Due: ${task.dueDate || "No deadline"}
            </p>
          </div>

          <div class="flex gap-2">
            <button
              data-action="toggle"
              class="text-xs px-2 py-1 border rounded"
            >
              ✓
            </button>

            <button
              data-action="delete"
              class="text-xs px-2 py-1 border border-red-400 text-red-600 rounded"
            >
              Delete
            </button>
          </div>
        </li>
      `;
    })
    .join("");

  taskListEl.innerHTML = html;
}
