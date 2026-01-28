const STORAGE_KEY = "smart_tasks";

// Internal save function
function saveToStorage(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Create reactive tasks array with Proxy
function createTaskStore(initialTasks = []) {
  return new Proxy(initialTasks, {
    set(target, property, value) {
      target[property] = value;

      // Save only if array was modified (not internal properties)
      if (!isNaN(property) || property === "length") {
        saveToStorage(target);
      }
      return true;
    },
    deleteProperty(target, property) {
      delete target[property];
      saveToStorage(target);
      return true;
    },
  });
}

export const Store = {
  tasks: createTaskStore([]),

  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Migrate old tasks that don't have 'status' field
        const migratedTasks = parsed.map((task) => ({
          ...task,
          status: task.status || (task.completed ? "completed" : "pending"),
        }));
        this.tasks.splice(0, this.tasks.length, ...migratedTasks);
      } catch (e) {
        console.error("Error loading tasks from localStorage:", e);
        this.tasks.splice(0, this.tasks.length);
      }
    }
  },

  add(task) {
    this.tasks.push(task);
  },

  remove(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }
  },

  update(id, updates) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      Object.assign(task, updates);
      this.save();
    }
  },

  save() {
    saveToStorage(this.tasks);
  },

  getById(id) {
    return this.tasks.find((t) => t.id === id);
  },

  // Stats helpers
  getStats() {
    return {
      total: this.tasks.length,
      pending: this.tasks.filter((t) => t.status === "pending").length,
      inprogress: this.tasks.filter((t) => t.status === "inprogress").length,
      completed: this.tasks.filter((t) => t.status === "completed").length,
    };
  },
};