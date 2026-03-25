import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { useTaskStore } from '../store/useTaskStore'

const KanbanBoard = lazy(() => import('../src/components/kanban/KanbanBoard'))
const ListView = lazy(() => import('../src/components/list/ListView'))
const TimelineView = lazy(() => import('../src/components/timeline/TimelineView'))

import FilterBar from '../src/components/common/FilterBar'

const views = ['kanban', 'list', 'timeline'] as const

export default function Dashboard() {
    const [view, setView] = useState<'kanban' | 'list' | 'timeline'>('kanban')
    const [menuOpen, setMenuOpen] = useState(false)

    const filters = useTaskStore((s) => s.filters)
    const users = useTaskStore((s) => s.users)
    const taskCount = useTaskStore((s) => s.tasks.length)

    const setFilters = useTaskStore((s) => s.setFilters)
    const setUsers = useTaskStore((s) => s.setUsers)

    const activeUsers = useMemo(() => users.filter((u) => u.taskId !== null), [users])

    // URL → filters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        setFilters({
            status: params.get('status')?.split(',') || [],
            priority: params.get('priority')?.split(',') || [],
            assignee: params.get('assignee')?.split(',') || [],
            from: params.get('from') || undefined,
            to: params.get('to') || undefined,
        })
    }, [setFilters])

    // filters → URL
    useEffect(() => {
        const params = new URLSearchParams()
        if (filters.status.length) params.set('status', filters.status.join(','))
        if (filters.priority.length) params.set('priority', filters.priority.join(','))
        if (filters.assignee.length) params.set('assignee', filters.assignee.join(','))
        if (filters.from) params.set('from', filters.from)
        if (filters.to) params.set('to', filters.to)

        const query = params.toString()
        window.history.pushState({}, '', query ? `?${query}` : window.location.pathname)
    }, [filters])

    // 👇 HEAVY PART FIXED
    useEffect(() => {
        if (!taskCount) return

        const interval = setInterval(() => {
            const tasks = useTaskStore.getState().tasks

            setUsers((prev) =>
                prev.map((user) => ({
                    ...user,
                    taskId: tasks[Math.floor(Math.random() * tasks.length)]?.id || null,
                }))
            )
        }, 2000)

        return () => clearInterval(interval)
    }, [taskCount, setUsers])

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* Header */}
            <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">
                        <h1 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight truncate">
                            Project Board
                        </h1>
                        <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
                            Track and manage your tasks
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-4">

                        {activeUsers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {activeUsers.length} viewing
                                </span>
                                <div className="flex -space-x-2">
                                    {activeUsers.slice(0, 5).map((u) => (
                                        <div
                                            key={u.id}
                                            title={u.name}
                                            className="w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center border-2 border-white transition-all duration-300"
                                            style={{ backgroundColor: u.color }}
                                        >
                                            {u.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            {views.map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize
                                        ${view === v
                                            ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                                            : 'text-slate-500'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </nav>

                        <FilterBar />
                    </div>

                    <button
                        className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-600"
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        ☰
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden mt-3 pt-3 border-t border-slate-100 flex flex-col gap-3">
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start">
                            {views.map((v) => (
                                <button
                                    key={v}
                                    onClick={() => { setView(v); setMenuOpen(false) }}
                                    className={`px-3 py-1.5 rounded-md text-sm capitalize
                                        ${view === v
                                            ? 'bg-white text-slate-800 border'
                                            : 'text-slate-500'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>

                        <FilterBar />
                    </div>
                )}
            </header>

            {/* Main */}
            <main className="p-3 sm:p-4 md:p-6">
                <Suspense fallback={<div className="text-sm text-slate-400">Loading...</div>}>
                    {view === 'kanban' && <KanbanBoard />}
                    {view === 'list' && <ListView />}
                    {view === 'timeline' && <TimelineView />}
                </Suspense>
            </main>
        </div>
    )
}