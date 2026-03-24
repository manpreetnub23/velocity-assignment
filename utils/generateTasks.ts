import type { Task } from "../types/task";
const users = ["AB", "CD", "EF", "GH", "IJ", "KL"] as const;
const priorities = ["low", "medium", "high", "critical"] as const;
const statuses = ["todo", "inprogress", "review", "done"] as const;

export function generateTasks(count = 500): Task[] {
	const tasks: Task[] = [];

	for (let i = 0; i < count; i++) {
		const start =
			Math.random() > 0.2 ? Date.now() - Math.random() * 10e8 : null;
		const due = Date.now() + Math.random() * 10e8;

		tasks.push({
			id: String(i),
			title: `Task ${i}`,
			status: statuses[Math.floor(Math.random() * statuses.length)],
			priority: priorities[Math.floor(Math.random() * priorities.length)],
			assignee: users[Math.floor(Math.random() * users.length)],
			startDate: start ? new Date(start).toISOString() : undefined,
			dueDate: new Date(due).toISOString(),
		});
	}

	return tasks;
}
