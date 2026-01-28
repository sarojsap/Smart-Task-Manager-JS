export function getPriorityColor(priority) {
  switch (priority) {
    case "high":
      return "border-red-500 text-red-600";
    case "medium":
      return "border-yellow-500 text-yellow-600";
    case "low":
      return "border-blue-500 text-blue-600";
    default:
      return "border-gray-400 text-gray-600";
  }
}
