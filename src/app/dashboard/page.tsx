'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, CircleCheck as CheckCircle2, Clock, TriangleAlert as AlertTriangle, Briefcase, BookOpen, Rocket, ChartLine as LineChart, Plus, Sparkles, Zap, Target, Calendar, ChevronRight, Activity } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Task, Brand, LearningTopic, Project, Trade } from '@/types/database'
import { cn } from '@/utils/cn'

// Animated counter component
function AnimatedCounter({ value, duration = 1000, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <span>{count}{suffix}</span>
}

// KPI Card component
function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color,
  delay = 0,
  onClick,
}: {
  title: string
  value: number
  subtitle: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ElementType
  color: string
  delay?: number
  onClick?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-dark-900 to-dark-950 border border-dark-800',
        'hover:border-dark-700 transition-all duration-300 cursor-pointer group',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${color}15 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              border: `1px solid ${color}30`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                trend === 'up' && 'bg-emerald-500/10 text-emerald-400',
                trend === 'down' && 'bg-rose-500/10 text-rose-400',
                trend === 'neutral' && 'bg-dark-700 text-dark-400'
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>

        <h3 className="text-sm font-medium text-dark-400 mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-display">
            <AnimatedCounter value={value} />
          </span>
        </div>
        <p className="text-xs text-dark-500 mt-1">{subtitle}</p>
      </div>

      {/* Progress indicator line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / 50) * 100, 100)}%` }}
          transition={{ duration: 1, delay: delay + 0.5 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
        />
      </div>
    </motion.div>
  )
}

// Main dashboard component
export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [learningTopics, setLearningTopics] = useState<LearningTopic[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      const [
        tasksResult,
        brandsResult,
        learningResult,
        projectsResult,
        tradesResult,
      ] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('brands').select('*').order('priority'),
        supabase.from('learning_topics').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('trades').select('*').order('trade_date', { ascending: false }).limit(30),
      ])

      if (tasksResult.data) setTasks(tasksResult.data)
      if (brandsResult.data) setBrands(brandsResult.data)
      if (learningResult.data) setLearningTopics(learningResult.data)
      if (projectsResult.data) setProjects(projectsResult.data)
      if (tradesResult.data) setTrades(tradesResult.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Calculate KPIs
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    return new Date(t.due_date) < new Date()
  }).length
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length

  const businessProgress = Math.round(
    brands.reduce((acc, b) => acc + b.progress, 0) / Math.max(brands.length, 1)
  )
  const learningProgress = Math.round(
    learningTopics.reduce((acc, l) => acc + l.progress, 0) / Math.max(learningTopics.length, 1)
  )
  const projectProgress = Math.round(
    projects.reduce((acc, p) => acc + p.progress, 0) / Math.max(projects.length, 1)
  )

  const totalPnL = trades.reduce((acc, t) => acc + (t.profit_loss || 0), 0)

  // Get current hour for AI recommendation
  const currentHour = currentTime.getHours()

  // AI recommendation based on time
  const getAIRecommendation = () => {
    if (currentHour >= 10 && currentHour < 11) {
      return { time: '10:00 AM', task: 'Check JustMySalad Sales & Operations', priority: 'high' }
    } else if (currentHour >= 11 && currentHour < 12) {
      return { time: '11:00 AM', task: 'Review Shiprocket Claims Status', priority: 'high' };
    } else if (currentHour >= 12 && currentHour < 13) {
      return { time: '12:00 PM', task: 'Update Clinza Product Listings', priority: 'medium' };
    } else if (currentHour >= 13 && currentHour < 14) {
      return { time: '1:00 PM', task: 'Lunch Break & Recharge', priority: 'low' };
    } else if (currentHour >= 14 && currentHour < 16) {
      return { time: '2:00 PM', task: 'Nymi Expansion Tasks Review', priority: 'high' };
    } else if (currentHour >= 16 && currentHour < 18) {
      return { time: '4:00 PM', task: 'Business Analyst Learning Session', priority: 'medium' };
    } else if (currentHour >= 18 && currentHour < 20) {
      return { time: '6:00 PM', task: 'AI Projects Development', priority: 'medium' };
    }
    return { time: 'Now', task: 'Review Today\'s Priorities', priority: 'medium' };
  }

  const recommendation = getAIRecommendation()

  // Today's tasks (due today or overdue)
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => {
    if (t.status === 'completed') return false
    if (t.due_date === today) return true
    if (t.due_date && new Date(t.due_date) < new Date()) return true
    return false
  }).slice(0, 5)

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm text-dark-400 mb-1">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold font-display text-white">
                Good {currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening'}, Vijay
              </h1>
              <p className="text-dark-400 mt-1">Here's your business overview</p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                New Task
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* AI Recommendation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="glass-dark rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent-gold/20 to-amber-500/10 border border-accent-gold/30">
                <Sparkles className="w-6 h-6 text-accent-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-accent-gold font-semibold">
                    AI Recommendation
                  </span>
                  <span className="text-xs text-dark-500 font-mono">{recommendation.time}</span>
                </div>
                <p className="text-lg font-semibold text-white">{recommendation.task}</p>
                <p className="text-sm text-dark-400 mt-0.5">
                  Based on your schedule and priorities
                </p>
              </div>
            </div>
            <div className={'px-3 py-1.5 rounded-full text-xs font-semibold uppercase ' +
              (recommendation.priority === 'high'
                ? 'bg-rose-500/20 text-rose-400'
                : recommendation.priority === 'medium'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-dark-700 text-dark-400')}>
              {recommendation.priority} priority
            </div>
          </div>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
          <KPICard
            title="Total Tasks"
            value={totalTasks}
            subtitle="All tasks"
            icon={Target}
            color="#a855f7"
            delay={0.1}
          />
          <KPICard
            title="Completed"
            value={completedTasks}
            subtitle="Done"
            trend={completedTasks > 0 ? 'up' : 'neutral'}
            trendValue={`${Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}%`}
            icon={CheckCircle2}
            color="#10b981"
            delay={0.15}
          />
          <KPICard
            title="Pending"
            value={pendingTasks}
            subtitle="In progress"
            trend={pendingTasks > 5 ? 'down' : 'neutral'}
            icon={Clock}
            color="#3b82f6"
            delay={0.2}
          />
          <KPICard
            title="Overdue"
            value={overdueTasks}
            subtitle="Past due"
            trend={overdueTasks > 0 ? 'down' : undefined}
            icon={AlertTriangle}
            color="#f43f5e"
            delay={0.25}
          />
          <KPICard
            title="Business"
            value={businessProgress}
            subtitle="Progress %"
            trend="up"
            icon={Briefcase}
            color="#f59e0b"
            delay={0.3}
          />
          <KPICard
            title="Learning"
            value={learningProgress}
            subtitle="Progress %"
            trend="up"
            icon={BookOpen}
            color="#06b6d4"
            delay={0.35}
          />
          <KPICard
            title="Projects"
            value={projectProgress}
            subtitle="Progress %"
            icon={Rocket}
            color="#ec4899"
            delay={0.4}
          />
          <KPICard
            title="Trading P&L"
            value={totalPnL}
            subtitle={`₹ ${totalPnL >= 0 ? '+' : ''}`}
            trend={totalPnL >= 0 ? 'up' : 'down'}
            icon={LineChart}
            color={totalPnL >= 0 ? '#10b981' : '#f43f5e'}
            delay={0.45}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Focus */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-dark rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white font-display flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-gold" />
                  Today's Focus
                </h2>
                <span className="text-sm text-dark-400 font-mono">{todayTasks.length} tasks</span>
              </div>

              {todayTasks.length > 0 ? (
                <div className="space-y-3">
                  {todayTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="p-4 rounded-xl bg-dark-900/50 border border-dark-800 hover:border-dark-700 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-3 h-3 rounded-full',
                          task.priority === 'high' && 'bg-rose-500',
                          task.priority === 'medium' && 'bg-primary-500',
                          task.priority === 'low' && 'bg-dark-500'
                        )} />
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                            {task.title}
                          </p>
                          <p className="text-xs text-dark-500 mt-0.5">
                            {task.due_date && new Date(task.due_date) < new Date() ? 'Overdue' : 'Due today'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-dark-600 group-hover:text-dark-400 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                  <p className="text-dark-400">All caught up for today!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions & Brands */}
          <div className="space-y-6">
            {/* Brand Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-white font-display mb-4">
                Brand Health
              </h2>
              <div className="space-y-3">
                {brands.slice(0, 5).map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${brand.progress > 70 ? '#10b98120' : brand.progress > 40 ? '#f59e0b20' : '#f43f5e20'})`,
                          border: `1px solid ${brand.progress > 70 ? '#10b98150' : brand.progress > 40 ? '#f59e0b50' : '#f43f5e50'}`,
                          color: brand.progress > 70 ? '#10b981' : brand.progress > 40 ? '#f59e0b' : '#f43f5e',
                        }}
                      >
                        {brand.progress}%
                      </div>
                      <span className="text-sm text-dark-200">{brand.name}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${brand.progress}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        className={cn(
                          'h-full rounded-full',
                          brand.progress > 70 && 'bg-emerald-500',
                          brand.progress <= 70 && brand.progress > 40 && 'bg-amber-500',
                          brand.progress <= 40 && 'bg-rose-500'
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-white font-display flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary-400" />
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                  <p className="text-xs text-dark-500">Brands</p>
                  <p className="text-xl font-bold text-white mt-1">{brands.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                  <p className="text-xs text-dark-500">Projects</p>
                  <p className="text-xl font-bold text-white mt-1">{projects.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                  <p className="text-xs text-dark-500">Trades</p>
                  <p className="text-xl font-bold text-white mt-1">{trades.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                  <p className="text-xs text-dark-500">Blocked</p>
                  <p className="text-xl font-bold text-rose-400 mt-1">{blockedTasks}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Learning Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6"
        >
          <div className="glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white font-display flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Learning Progress
              </h2>
              <span className="text-xs text-dark-500 font-mono">Daily goal: 2 hours</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {learningTopics.slice(0, 4).map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="p-4 rounded-xl bg-dark-900/50 border border-dark-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-400 uppercase tracking-wider">{topic.category}</span>
                    <span className={cn(
                      'text-xs font-semibold',
                      topic.progress === 100 && 'text-emerald-400',
                      topic.progress >= 50 && topic.progress < 100 && 'text-primary-400',
                      topic.progress < 50 && 'text-amber-400'
                    )}>
                      {topic.progress}%
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium truncate">{topic.topic}</p>
                  <div className="mt-2 w-full h-1 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.progress}%` }}
                      transition={{ duration: 1, delay: 1.1 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
