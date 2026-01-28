import { Store } from "./store.js";
import { renderTasks } from "./ui.js";

// DOM elements
const titleInput = document.getElementById("task-title");
const priorityInput = document.getElementById("task-priority");
const dateInput = document.getElementById("task-date");
const addBtn = document.getElementById("add-task-btn");

// Initial load
Store.load();
renderTasks(Store.tasks);

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
  renderTasks(Store.tasks);
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