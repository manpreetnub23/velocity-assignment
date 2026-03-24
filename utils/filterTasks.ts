import { Task } from "../types/task";

export function filterTasks(tasks: Task[], filters: any) {
	return tasks.filter((task) => {
		if (filters.status.length && !filters.status.includes(task.status)) {
			return false;
		}

		if (filters.priority.length && !filters.priority.includes(task.priority)) {
			return false;
		}

		if (filters.assignee.length && !filters.assignee.includes(task.assignee)) {
			return false;
		}

		if (filters.from && new Date(task.dueDate) < new Date(filters.from)) {
			return false;
		}

		if (filters.to && new Date(task.dueDate) > new Date(filters.to)) {
			return false;
		}

		return true;
	});
}
