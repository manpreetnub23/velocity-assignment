import { create } from "zustand";
import type { Task } from "../types/task";
import { generateTasks } from "../utils/generateTasks";
import { useMemo } from "react";

type Filters = {
	status: string[];
	priority: string[];
	assignee: string[];
	from?: string;
	to?: string;
};

type UserPresence = {
	id: string;
	name: string;
	color: string;
	taskId: string | null;
};

type Store = {
	tasks: Task[];
	setTasks: (tasks: Task[]) => void;
	updateTask: (id: string, updates: Partial<Task>) => void;

	// 🔹 Drag & Drop
	draggedTask: Task | null;
	setDraggedTask: (task: Task | null) => void;
	moveTask: (id: string, status: Task["status"]) => void;

	// 🔹 Placeholder
	placeholderTaskId: string | null;
	setPlaceholderTaskId: (id: string | null) => void;

	// 🔹 Filters
	filters: Filters;
	setFilters: (updates: Partial<Filters>) => void;

	// 🔹 Collaboration
	users: UserPresence[];
	setUsers: (
		users: UserPresence[] | ((prev: UserPresence[]) => UserPresence[]),
	) => void;
};

export const useFilteredTasks = () => {
	const tasks = useTaskStore((s) => s.tasks);
	const filters = useTaskStore((s) => s.filters);

	return useMemo(() => {
		return tasks.filter((task) => {
			if (filters.status.length && !filters.status.includes(task.status))
				return false;
			if (filters.priority.length && !filters.priority.includes(task.priority))
				return false;
			if (filters.assignee.length && !filters.assignee.includes(task.assignee))
				return false;

			const due = new Date(task.dueDate).getTime();
			if (filters.from && due < new Date(filters.from).getTime()) return false;
			if (filters.to && due > new Date(filters.to).getTime()) return false;

			return true;
		});
	}, [tasks, filters]);
};

export const useTaskStore = create<Store>((set) => ({
	// 🔹 Tasks
	tasks: generateTasks(),

	setTasks: (tasks) => set({ tasks }),

	updateTask: (id, updates) =>
		set((state) => ({
			tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
		})),

	// 🔹 Drag & Drop
	draggedTask: null,
	setDraggedTask: (task) => set({ draggedTask: task }),

	moveTask: (id, status) =>
		set((state) => ({
			tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
		})),

	// 🔹 Placeholder
	placeholderTaskId: null,
	setPlaceholderTaskId: (id) => set({ placeholderTaskId: id }),

	// 🔹 Filters
	filters: {
		status: [],
		priority: [],
		assignee: [],
	},

	setFilters: (updates) =>
		set((state) => ({
			filters: { ...state.filters, ...updates },
		})),

	// 🔥 Collaboration (NEW)
	users: [
		{ id: "u1", name: "A", color: "#f87171", taskId: null },
		{ id: "u2", name: "B", color: "#60a5fa", taskId: null },
		{ id: "u3", name: "C", color: "#34d399", taskId: null },
	],

	setUsers: (users) =>
		set((state) => ({
			users: typeof users === "function" ? users(state.users) : users,
		})),
}));
