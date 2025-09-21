"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, CheckCircle, Circle, Calendar } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion, AnimatePresence } from "framer-motion"

interface TodoTask {
  id: string
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high" | "critical"
  category: "irrigation" | "fertilizer" | "pest" | "harvest" | "planting" | "general"
  dueDate: string
  createdAt: string
  completedAt?: string
}

export function TodoListManager() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<TodoTask[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created">("dueDate")

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TodoTask["priority"],
    category: "general" as TodoTask["category"],
    dueDate: "",
  })

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("farmingTasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("farmingTasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: TodoTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      category: newTask.category,
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [...prev, task])
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "general",
      dueDate: "",
    })
    setIsAddingTask(false)
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const updateTask = (id: string, updates: Partial<TodoTask>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
    setEditingTask(null)
  }

  const getPriorityColor = (priority: TodoTask["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryIcon = (category: TodoTask["category"]) => {
    switch (category) {
      case "irrigation":
        return "💧"
      case "fertilizer":
        return "🌱"
      case "pest":
        return "🐛"
      case "harvest":
        return "🌾"
      case "planting":
        return "🌱"
      default:
        return "📋"
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case "priority":
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      case "created":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.filter((task) => !task.completed).length
  const overdueCount = tasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) < new Date(),
  ).length

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {t("dashboard.tasks")} Manager
            </CardTitle>
            <CardDescription className="text-emerald-600">Organize and track your farming activities</CardDescription>
          </div>
          <Button onClick={() => setIsAddingTask(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="text-2xl font-bold text-emerald-700">{tasks.length}</div>
            <div className="text-xs text-emerald-600">Total Tasks</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-700">{pendingCount}</div>
            <div className="text-xs text-blue-600">Pending</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-2xl font-bold text-green-700">{completedCount}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="text-2xl font-bold text-red-700">{overdueCount}</div>
            <div className="text-xs text-red-600">Overdue</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-3">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="created">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Task Form */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3"
            >
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                className="border-emerald-200"
              />
              <Textarea
                placeholder="Task description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                className="border-emerald-200"
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select
                  value={newTask.priority}
                  onValueChange={(value: any) => setNewTask((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={newTask.category}
                  onValueChange={(value: any) => setNewTask((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="irrigation">Irrigation</SelectItem>
                    <SelectItem value="fertilizer">Fertilizer</SelectItem>
                    <SelectItem value="pest">Pest Control</SelectItem>
                    <SelectItem value="harvest">Harvest</SelectItem>
                    <SelectItem value="planting">Planting</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="border-emerald-200"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addTask} className="bg-emerald-600 hover:bg-emerald-700">
                  Add Task
                </Button>
                <Button onClick={() => setIsAddingTask(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence>
            {sortedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  task.completed
                    ? "bg-green-50 border-green-200"
                    : task.dueDate && new Date(task.dueDate) < new Date()
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-emerald-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1" />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-emerald-800"}`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getCategoryIcon(task.category)}</span>
                        <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    {task.description && (
                      <p className={`text-sm ${task.completed ? "text-gray-400" : "text-emerald-600"}`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span
                            className={
                              !task.completed && new Date(task.dueDate) < new Date() ? "text-red-600 font-medium" : ""
                            }
                          >
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.completedAt && (
                        <span className="text-green-600">
                          Completed: {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => setEditingTask(task.id)}
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => deleteTask(task.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {sortedTasks.length === 0 && (
          <div className="text-center py-8 text-emerald-600">
            <Circle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No tasks found. Add your first farming task!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
