import { useTaskStore, useFilteredTasks } from '../../../store/useTaskStore'
import { formatDueDate } from '../../../utils/dateUtils'
import type { Task } from '../../../types/task'
import { shallow } from 'zustand/shallow'

const columns = ['todo', 'inprogress', 'review', 'done'] as const
type Status = typeof columns[number]

const columnMeta: Record<Status, { label: string; accent: string }> = {
    todo: { label: 'To Do', accent: 'bg-slate-400' },
    inprogress: { label: 'In Progress', accent: 'bg-blue-400' },
    review: { label: 'Review', accent: 'bg-amber-400' },
    done: { label: 'Done', accent: 'bg-emerald-400' },
}

const priorityStyles = {
    low: { dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    medium: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
    high: { dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
    critical: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
}

export default function KanbanBoard() {
    const filteredTasks = useFilteredTasks() // ✅ FIXED

    const setDraggedTask = useTaskStore((s) => s.setDraggedTask)
    const draggedTask = useTaskStore((s) => s.draggedTask)
    const moveTask = useTaskStore((s) => s.moveTask)
    const setPlaceholderTaskId = useTaskStore((s) => s.setPlaceholderTaskId)
    const users = useTaskStore((s) => s.users)

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
            {columns.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col)
                const meta = columnMeta[col]
                const isDropTarget = !!draggedTask

                return (
                    <div
                        key={col}
                        data-column={col}
                        className={`flex flex-col rounded-xl border transition-colors duration-150 min-w-[260px] md:min-w-0
                            ${isDropTarget
                                ? 'border-blue-200 bg-blue-50/60'
                                : 'border-slate-200 bg-slate-100/70'
                            }`}
                        onPointerUp={() => {
                            setPlaceholderTaskId(null)
                            if (draggedTask) moveTask(draggedTask.id, col)
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${meta.accent}`} />
                            <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                {meta.label}
                            </h2>
                            <span className="ml-auto text-xs text-slate-400 font-medium">
                                {colTasks.length}
                            </span>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-2 px-2 pb-3 overflow-y-auto max-h-[65vh]">
                            {colTasks.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-6">No tasks</p>
                            )}

                            {colTasks.map((task) => {
                                const isDragging = draggedTask?.id === task.id
                                const pStyle = priorityStyles[task.priority]
                                const taskUsers = users.filter((u) => u.taskId === task.id)

                                return (
                                    <div key={task.id}>
                                        {isDragging && (
                                            <div className="h-[88px] rounded-lg border-2 border-dashed border-slate-300 bg-white/50" />
                                        )}

                                        <div
                                            className={`bg-white border border-slate-200 rounded-lg p-3 shadow-sm
                                                cursor-grab active:cursor-grabbing select-none
                                                hover:bg-slate-50 hover:shadow-md hover:border-slate-300
                                                transition-all duration-100
                                                ${isDragging ? 'opacity-0' : 'opacity-100'}`}
                                            onPointerDown={(e) => {
                                                e.preventDefault()
                                                setDraggedTask(task)
                                                setPlaceholderTaskId(task.id)

                                                const el = e.currentTarget
                                                const rect = el.getBoundingClientRect()

                                                el.style.position = 'fixed'
                                                el.style.left = rect.left + 'px'
                                                el.style.top = rect.top + 'px'
                                                el.style.width = rect.width + 'px'
                                                el.style.zIndex = '1000'
                                                el.style.pointerEvents = 'none'
                                                el.style.opacity = '0.95'
                                                el.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)'
                                                el.style.transform = 'rotate(1.5deg)'

                                                const move = (ev: PointerEvent) => {
                                                    el.style.left = ev.clientX - rect.width / 2 + 'px'
                                                    el.style.top = ev.clientY - rect.height / 2 + 'px'
                                                }

                                                const up = (ev: PointerEvent) => {
                                                    const below = document.elementFromPoint(ev.clientX, ev.clientY)
                                                    const colEl = below?.closest('[data-column]')
                                                    if (colEl) {
                                                        moveTask(task.id, colEl.getAttribute('data-column') as Status)
                                                    }

                                                    setDraggedTask(null)
                                                    setPlaceholderTaskId(null)

                                                    el.style.position = ''
                                                    el.style.left = ''
                                                    el.style.top = ''
                                                    el.style.width = ''
                                                    el.style.zIndex = ''
                                                    el.style.pointerEvents = ''
                                                    el.style.opacity = ''
                                                    el.style.boxShadow = ''
                                                    el.style.transform = ''

                                                    window.removeEventListener('pointermove', move)
                                                    window.removeEventListener('pointerup', up)
                                                }

                                                window.addEventListener('pointermove', move)
                                                window.addEventListener('pointerup', up)
                                            }}
                                        >
                                            <p className="text-sm font-medium text-slate-800 leading-snug mb-2">
                                                {task.title}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-500 uppercase shrink-0">
                                                        {task.assignee?.[0] ?? '?'}
                                                    </div>
                                                    <span className="text-xs text-slate-400 truncate">{task.assignee}</span>
                                                </div>

                                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${pStyle.bg} ${pStyle.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
                                                    {task.priority}
                                                </span>
                                            </div>

                                            <div className="mt-1.5 text-[11px] text-slate-400">
                                                {formatDueDate(task.dueDate)}
                                            </div>

                                            {taskUsers.length > 0 && (
                                                <div className="flex -space-x-2 mt-2">
                                                    {taskUsers.slice(0, 2).map((u) => (
                                                        <div
                                                            key={u.id}
                                                            className="w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center border-2 border-white"
                                                            style={{ backgroundColor: u.color }}
                                                        >
                                                            {u.name}
                                                        </div>
                                                    ))}
                                                    {taskUsers.length > 2 && (
                                                        <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 text-[10px] flex items-center justify-center border-2 border-white">
                                                            +{taskUsers.length - 2}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}