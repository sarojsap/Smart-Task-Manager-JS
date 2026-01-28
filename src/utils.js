export const getPriorityClass = (priority = "") => {
  const classes = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200"
  };

  return classes[priority.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
};


export const formatDate = (dateString) => {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString();
};

export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
