import { useState, useRef } from 'react'
import { useFilteredTasks } from '../../../store/useTaskStore'
import { memo } from 'react'

const ROW_HEIGHT = 56
const BUFFER = 5

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    todo: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    inprogress: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
    review: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
    done: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
}

const priorityDot: Record<string, string> = {
    low: 'bg-emerald-400',
    medium: 'bg-amber-400',
    high: 'bg-orange-400',
    critical: 'bg-red-500',
}

const Row = memo(({ task, ss, pd, isEven }: { task: any, ss: any, pd: string, isEven: boolean }) => (
    <div
        style={{ height: ROW_HEIGHT }}
        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors duration-75
            ${isEven ? 'bg-white' : 'bg-slate-50/40'}`}
    >
        {/* Desktop row */}
        <div className="hidden sm:grid grid-cols-12 items-center h-full px-4 text-sm">
            <span className="col-span-5 font-medium text-slate-800 truncate pr-4">
                {task.title}
            </span>

            <div className="col-span-2 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-500 uppercase">
                    {task.assignee?.[0] ?? '?'}
                </div>
                <span className="text-slate-500 truncate text-xs">
                    {task.assignee}
                </span>
            </div>

            <div className="col-span-2 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${pd}`} />
                <span className="text-slate-600 text-xs capitalize">
                    {task.priority}
                </span>
            </div>

            <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${ss.bg} ${ss.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                    {task.status === 'inprogress'
                        ? 'In Progress'
                        : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
            </div>

            <span className="col-span-1 text-right text-xs text-slate-400">
                {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })
                    : '—'}
            </span>
        </div>

        {/* Mobile row */}
        <div className="sm:hidden flex items-center gap-3 px-4 h-full">
            <span className={`w-2 h-2 rounded-full ${pd}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                    {task.title}
                </p>
                <p className="text-xs text-slate-400">
                    {task.assignee}
                </p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${ss.bg} ${ss.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                {task.status === 'inprogress'
                    ? 'In Progress'
                    : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
        </div>
    </div>
))

export default function ListView() {
    const filteredTasks = useFilteredTasks() // ✅ FIXED

    const containerRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)

    const containerHeight = 500
    const totalHeight = filteredTasks.length * ROW_HEIGHT

    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER)
    const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT)
    const endIndex = Math.min(filteredTasks.length, startIndex + visibleCount + BUFFER * 2)

    const visibleTasks = filteredTasks.slice(startIndex, endIndex)

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            {/* Desktop header */}
            <div className="hidden sm:grid grid-cols-12 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="col-span-5">Task</span>
                <span className="col-span-2">Assignee</span>
                <span className="col-span-2">Priority</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-1 text-right">Due</span>
            </div>

            {/* Mobile header */}
            <div className="sm:hidden px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {filteredTasks.length} tasks
            </div>

            {/* Virtualised rows */}
            <div
                ref={containerRef}
                style={{ height: containerHeight, overflowY: 'auto' }}
                onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            >
                {filteredTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-slate-400">
                        No tasks match the current filters
                    </div>
                ) : (
                    <div style={{ height: totalHeight, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: startIndex * ROW_HEIGHT, left: 0, right: 0 }}>
                            {visibleTasks.map((task, i) => {
                                const ss = statusStyles[task.status]
                                const pd = priorityDot[task.priority]
                                const isEven = (startIndex + i) % 2 === 0

                                return <Row key={task.id} task={task} ss={ss} pd={pd} isEven={isEven} />
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}