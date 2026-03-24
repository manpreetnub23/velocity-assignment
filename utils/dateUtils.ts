export function formatDueDate(dateStr: string) {
	const date = new Date(dateStr);
	const today = new Date();

	const diff = Math.floor(
		(today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diff === 0) return "Due Today";
	if (diff > 7) return `${diff} days overdue`;
	if (diff > 0) return "Overdue";

	return date.toLocaleDateString();
}
