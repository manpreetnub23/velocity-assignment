import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '../../../store/useTaskStore'

const statuses = ['todo', 'inprogress', 'review', 'done'] as const
const priorities = ['low', 'medium', 'high', 'critical'] as const
const users = ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL'] as const

type FilterKey = 'status' | 'priority' | 'assignee'

const statusMeta: Record<string, { label: string; dot: string }> = {
    todo: { label: 'To Do', dot: 'bg-slate-400' },
    inprogress: { label: 'In Progress', dot: 'bg-blue-400' },
    review: { label: 'Review', dot: 'bg-amber-400' },
    done: { label: 'Done', dot: 'bg-emerald-400' },
}

const priorityMeta: Record<string, { label: string; dot: string }> = {
    low: { label: 'Low', dot: 'bg-emerald-400' },
    medium: { label: 'Medium', dot: 'bg-amber-400' },
    high: { label: 'High', dot: 'bg-orange-400' },
    critical: { label: 'Critical', dot: 'bg-red-500' },
}

export default function FilterBar() {
    const filters = useTaskStore((s) => s.filters)
    const setFilters = useTaskStore((s) => s.setFilters)

    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    const toggle = (key: FilterKey, value: string) => {
        const current = filters[key]
        setFilters({
            [key]: current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value],
        })
    }

    const activeCount =
        filters.status.length +
        filters.priority.length +
        filters.assignee.length +
        (filters.from ? 1 : 0) +
        (filters.to ? 1 : 0)

    const clearAll = () => setFilters({
        status: [], priority: [], assignee: [],
        from: undefined, to: undefined,
    })

    return (
        <div className="relative" ref={ref}>

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={open}
                aria-label={`Filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-150
                    ${open
                        ? 'bg-slate-800 border-slate-800 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                    }`}
            >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Filters
                {activeCount > 0 && (
                    <span
                        aria-hidden="true"
                        className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center
                            ${open ? 'bg-white text-slate-800' : 'bg-slate-800 text-white'}`}
                    >
                        {activeCount}
                    </span>
                )}
            </button>

            {/* Popover — anchors left on mobile, centered on larger screens */}
            {open && (
                <div
                    role="dialog"
                    aria-label="Filter options"
                    className="
                        absolute top-full mt-2 z-50
                        left-0 w-[calc(100vw-2rem)]
                        sm:left-1/2 sm:-translate-x-1/2 sm:w-[90vw]
                        md:w-[680px]
                        bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden
                    "
                >
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">Filters</span>
                        {activeCount > 0 && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Grid: 1-col on mobile, 2-col on sm, 4-col on md */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y md:divide-y-0 md:divide-x divide-slate-100 p-4 sm:p-5 gap-y-4 md:gap-y-0">

                        {/* STATUS */}
                        <div className="md:pr-5">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                            <div className="flex flex-col gap-1">
                                {statuses.map((s) => {
                                    const meta = statusMeta[s]
                                    const isActive = filters.status.includes(s)
                                    return (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => toggle('status', s)}
                                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-100 w-full text-left
                                                ${isActive ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                                            <span className="flex-1 truncate">{meta.label}</span>
                                            {isActive && (
                                                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                                    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* PRIORITY */}
                        <div className="sm:pl-4 md:px-5">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</p>
                            <div className="flex flex-col gap-1">
                                {priorities.map((p) => {
                                    const meta = priorityMeta[p]
                                    const isActive = filters.priority.includes(p)
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => toggle('priority', p)}
                                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-100 w-full text-left
                                                ${isActive ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                                            <span className="flex-1">{meta.label}</span>
                                            {isActive && (
                                                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                                    <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* ASSIGNEE */}
                        <div className="md:px-5">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Assignee</p>
                            <div className="flex flex-wrap gap-1.5">
                                {users.map((u) => {
                                    const isActive = filters.assignee.includes(u)
                                    return (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => toggle('assignee', u)}
                                            aria-pressed={isActive}
                                            aria-label={`Assignee ${u}`}
                                            className={`w-8 h-8 rounded-full text-[11px] font-semibold border transition-all duration-100
                                                ${isActive
                                                    ? 'bg-slate-800 border-slate-800 text-white'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                                                }`}
                                        >
                                            {u}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* DATE RANGE */}
                        <div className="md:pl-5">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Due Date</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="filter-from" className="text-xs text-slate-400 w-8 shrink-0">From</label>
                                    <input
                                        id="filter-from"
                                        type="date"
                                        value={filters.from ?? ''}
                                        onChange={(e) => setFilters({ from: e.target.value || undefined })}
                                        className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600
                                            hover:border-slate-300 focus:outline-none focus:border-blue-300 transition-colors min-w-0"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="filter-to" className="text-xs text-slate-400 w-8 shrink-0">To</label>
                                    <input
                                        id="filter-to"
                                        type="date"
                                        value={filters.to ?? ''}
                                        onChange={(e) => setFilters({ to: e.target.value || undefined })}
                                        className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600
                                            hover:border-slate-300 focus:outline-none focus:border-blue-300 transition-colors min-w-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}