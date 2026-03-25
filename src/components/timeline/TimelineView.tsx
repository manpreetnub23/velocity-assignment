import { useFilteredTasks } from '../../../store/useTaskStore'
import { useMemo } from 'react'

const DAY_WIDTH = 36

const priorityBar: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    low: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
}

function getDaysFromStart(dateStr: string, startOfMonth: Date) {
    return Math.floor((new Date(dateStr).getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24))
}

function getDuration(start?: string, end?: string) {
    if (!start || !end) return 1
    return Math.max(
        1,
        Math.ceil(
            (new Date(end).getTime() - new Date(start).getTime()) /
            (1000 * 60 * 60 * 24)
        )
    )
}

export default function TimelineView() {
    const filteredTasks = useFilteredTasks() // ✅ FIXED

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)

    const processedTasks = useMemo(() => {
        return filteredTasks.map(task => ({
            ...task,
            left: Math.max(0, getDaysFromStart(task.startDate || task.dueDate, startOfMonth)),
            width: getDuration(task.startDate, task.dueDate) * DAY_WIDTH
        }))
    }, [filteredTasks, startOfMonth])

    const totalDays = endOfMonth.getDate()
    const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' })
    const todayDay = today.getDate()

    const todayOffset = getDaysFromStart(today.toISOString(), startOfMonth)

    const isWeekend = (i: number) => {
        const d = new Date(year, month, i + 1).getDay()
        return d === 0 || d === 6
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-4 sm:px-5 py-3 border-b border-slate-200 flex justify-between">
                <h2 className="text-sm font-semibold text-slate-700">{monthName}</h2>
                <span className="text-xs text-slate-400">{filteredTasks.length} tasks</span>
            </div>

            {/* Scroll */}
            <div className="overflow-x-auto">
                <div className="relative" style={{ width: totalDays * DAY_WIDTH, minWidth: '100%' }}>

                    {/* Days */}
                    <div className="flex border-b bg-white sticky top-0 z-10">
                        {Array.from({ length: totalDays }).map((_, i) => {
                            const isToday = i + 1 === todayDay
                            const weekend = isWeekend(i)

                            return (
                                <div
                                    key={i}
                                    className={`flex flex-col items-center py-2 text-xs border-r
                                        ${weekend ? 'bg-slate-50' : ''}
                                        ${isToday ? 'bg-blue-50' : ''}`}
                                    style={{ width: DAY_WIDTH }}
                                >
                                    <span className={`font-semibold ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-[9px] text-slate-300">
                                        {new Date(year, month, i + 1)
                                            .toLocaleString('default', { weekday: 'short' })
                                            .slice(0, 2)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Body */}
                    <div className="relative">

                        {/* Today line */}
                        <div
                            className="absolute top-0 bottom-0 w-px bg-blue-400 opacity-60"
                            style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
                        />

                        {/* Tasks */}
                        <div className="py-2 space-y-1.5">
                            {filteredTasks.length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-8">
                                    No tasks found
                                </p>
                            )}

                            {processedTasks.slice(0, 50).map((task) => {
                                const pStyle =
                                    priorityBar[task.priority] ?? priorityBar.low

                                return (
                                    <div key={task.id} className="relative h-7 flex items-center">
                                        <div
                                            className={`absolute h-5 rounded-md border text-xs px-2 flex items-center truncate
                                                ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                                            style={{
                                                left: task.left * DAY_WIDTH,
                                                width: Math.max(task.width, DAY_WIDTH),
                                            }}
                                        >
                                            {task.title}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}