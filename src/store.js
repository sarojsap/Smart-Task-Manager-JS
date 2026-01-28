const STORAGE_KEY = "smart_tasks";

// Internal save function
function saveToStorage(tasks){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Create reactive tasks array
function createTaskStore(initialTasks = []) {
    return new Proxy(initialTasks,{
        set(target, property, value){
            target[property] = value;

            // Save only if array was modified
            if (!isNaN(property) || property === "length"){
                saveToStorage(target)
            }
            return true
        }
    });
}

export const Store = {
    tasks: createTaskStore([]),

    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data){
            const parsed = JSON.parse(data);
            this.tasks.splice(0, this.tasks.length, ...parsed)
        }
    },

    add(task) {
    this.tasks.push(task); // auto-saved
  },

  remove(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1); // auto-saved
    }
  }

};