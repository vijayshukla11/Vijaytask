'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, Calendar, Clock, CircleCheck as CheckCircle2, Circle, TriangleAlert as AlertTriangle, Filter, Search, Plus, ChevronDown, GripVertical, Trash2, CreditCard as Edit2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Task, Brand } from '@/types/database'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'

const TASK_STATUSES = ['not_started', 'pending', 'in_progress', 'waiting', 'blocked', 'completed'] as const
const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
const TASK_CATEGORIES = ['daily', 'weekly', 'monthly', 'business', 'learning', 'project', 'trading', 'personal'] as const

const statusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  not_started: { bg: 'bg-dark-800', border: 'border-dark-700', text: 'text-dark-300', label: 'Not Started' },
  pending: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Pending' },
  in_progress: { bg: 'bg-primary-500/10', border: 'border-primary-500/30', text: 'text-primary-400', label: 'In Progress' },
  waiting: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Waiting' },
  blocked: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', label: 'Blocked' },
  completed: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Completed' },
}

const priorityColors: Record<string, string> = {
  low: 'text-dark-400',
  medium: 'text-blue-400',
  high: 'text-amber-400',
  critical: 'text-rose-400',
}

export default function TasksPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showNewTask, setShowNewTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      const [tasksResult, brandsResult] = await Promise.all([
        supabase.from('tasks').select('*, brands(name)').order('created_at', { ascending: false }),
        supabase.from('brands').select('*').order('name'),
      ])

      if (tasksResult.data) setTasks(tasksResult.data as Task[])
      if (brandsResult.data) setBrands(brandsResult.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Group tasks by status for Kanban view
  const tasksByStatus = TASK_STATUSES.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(t => t.status === status)
    return acc
  }, {} as Record<string, Task[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 bg-mesh-gradient">
      <div className="p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Tasks</h1>
            <p className="text-dark-400 mt-1">Manage your tasks and priorities</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewTask(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium"
            >
              <Plus className="w-4 h-4" />
              New Task
            </motion.button>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 glass-dark rounded-xl">
            {[
              { mode: 'kanban' as const, icon: LayoutGrid, label: 'Kanban' },
              { mode: 'list' as const, icon: List, label: 'List' },
              { mode: 'calendar' as const, icon: Calendar, label: 'Calendar' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  viewMode === mode
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 rounded-xl glass-dark text-white placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500 min-w-[200px]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl glass-dark text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              {TASK_STATUSES.map(s => (
                <option key={s} value={s}>{statusColors[s].label}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 rounded-xl glass-dark text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Priority</option>
              {TASK_PRIORITIES.map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {TASK_STATUSES.map((status, idx) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col"
              >
                <div className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-t-xl border-b-0',
                  statusColors[status].bg,
                  statusColors[status].border,
                  'border'
                )}>
                  <span className={cn('font-medium text-sm', statusColors[status].text)}>
                    {statusColors[status].label}
                  </span>
                  <span className="text-xs text-dark-500">
                    {tasksByStatus[status].length}
                  </span>
                </div>
                <div className="flex-1 glass-dark rounded-b-xl p-3 space-y-2 min-h-[400px]">
                  <AnimatePresence>
                    {tasksByStatus[status].map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl bg-dark-900/50 border border-dark-800 hover:border-dark-700 group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm text-white font-medium line-clamp-2">{task.title}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1 rounded hover:bg-dark-800 text-dark-400 hover:text-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 rounded hover:bg-rose-500/20 text-dark-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-dark-500">
                          <span className={priorityColors[task.priority]}>●</span>
                          {task.due_date && (
                            <span className={cn(
                              new Date(task.due_date) < new Date() && task.status !== 'completed' && 'text-rose-400'
                            )}>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {tasksByStatus[status].length === 0 && (
                    <div className="text-center py-8 text-xs text-dark-600">
                      No tasks
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="glass-dark rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 px-6 py-4 bg-dark-900/50 border-b border-dark-800 text-xs font-medium text-dark-500">
              <div className="w-6"></div>
              <div>Title</div>
              <div>Priority</div>
              <div>Status</div>
              <div>Due Date</div>
              <div>Actions</div>
            </div>
            <div className="divide-y divide-dark-800">
              <AnimatePresence>
                {filteredTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-[auto,1fr,auto,auto,auto,auto] gap-4 px-6 py-4 items-center hover:bg-dark-900/30 transition-colors group"
                  >
                    <div>
                      <button
                        onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-dark-600 group-hover:text-primary-400 transition-colors" />
                        )}
                      </button>
                    </div>
                    <div>
                      <p className={cn(
                        'text-sm font-medium',
                        task.status === 'completed' ? 'text-dark-500 line-through' : 'text-white'
                      )}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-dark-500 mt-0.5 truncate">{task.description}</p>
                      )}
                    </div>
                    <div>
                      <span className={cn('text-xs font-medium uppercase', priorityColors[task.priority])}>
                        {task.priority}
                      </span>
                    </div>
                    <div>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        statusColors[task.status].bg,
                        statusColors[task.status].border,
                        statusColors[task.status].text,
                        'border'
                      )}>
                        {statusColors[task.status].label}
                      </span>
                    </div>
                    <div className="text-sm text-dark-400 font-mono">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-2 rounded-lg hover:bg-dark-800 text-dark-500 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 rounded-lg hover:bg-rose-500/20 text-dark-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="glass-dark rounded-2xl p-6">
            <div className="grid grid-cols-7 gap-px bg-dark-800 rounded-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-xs font-medium text-dark-500 bg-dark-900">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, idx) => {
                const date = new Date()
                date.setDate(date.getDate() - date.getDay() + idx)
                const dateStr = date.toISOString().split('T')[0]
                const dayTasks = filteredTasks.filter(t => t.due_date === dateStr)
                const isToday = dateStr === new Date().toISOString().split('T')[0]

                return (
                  <div
                    key={idx}
                    className={cn(
                      'min-h-24 p-2 bg-dark-900/50 hover:bg-dark-900 transition-colors',
                      isToday && 'bg-primary-500/5'
                    )}
                  >
                    <span className={cn(
                      'text-xs font-mono',
                      isToday ? 'text-primary-400 font-bold' : 'text-dark-500'
                    )}>
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded truncate',
                            statusColors[task.status].bg,
                            statusColors[task.status].text
                          )}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-dark-500">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* New Task Modal - placeholder */}
        <AnimatePresence>
          {showNewTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowNewTask(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-dark rounded-2xl p-6 w-full max-w-lg"
              >
                <h2 className="text-xl font-bold text-white font-display mb-4">Create New Task</h2>
                <p className="text-dark-400">Task creation form would go here...</p>
                <button
                  onClick={() => setShowNewTask(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
