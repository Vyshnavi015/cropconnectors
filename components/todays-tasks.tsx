"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, CheckCircle, Calendar, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion, AnimatePresence } from "framer-motion"

interface TodayTask {
  id: string
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high" | "critical"
  category: "irrigation" | "fertilizer" | "pest" | "harvest" | "planting" | "general"
  createdAt: string
  completedAt?: string
}

export function TodaysTasks() {
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<TodayTask[]>([])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TodayTask["priority"],
    category: "general" as TodayTask["category"],
  })

  // Load today's tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("todaysTasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    } else {
      // Initialize with some sample tasks for today
      const sampleTasks: TodayTask[] = [
        {
          id: "1",
          title: "Check irrigation system",
          description: "Inspect all irrigation lines and sprinklers",
          completed: true,
          priority: "high",
          category: "irrigation",
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Apply fertilizer to wheat field",
          description: "Apply nitrogen-rich fertilizer to the north wheat field",
          completed: false,
          priority: "medium",
          category: "fertilizer",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Monitor pest activity",
          description: "Check crops for signs of pest damage or disease",
          completed: false,
          priority: "high",
          category: "pest",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          title: "Check market prices",
          description: "Review current market prices for upcoming harvest",
          completed: false,
          priority: "low",
          category: "general",
          createdAt: new Date().toISOString(),
        },
      ]
      setTasks(sampleTasks)
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("todaysTasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: TodayTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      category: newTask.category,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [...prev, task])
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "general",
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

  const updateTask = (id: string, updates: Partial<TodayTask>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
    setEditingTask(null)
  }

  const getPriorityColor = (priority: TodayTask["priority"]) => {
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

  const getCategoryIcon = (category: TodayTask["category"]) => {
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

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.filter((task) => !task.completed).length

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-emerald-800 flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5" />
              {t("dashboard.tasks")} - Today
            </CardTitle>
            <CardDescription className="text-emerald-600">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsAddingTask(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="text-lg font-bold text-emerald-700">{tasks.length}</div>
            <div className="text-xs text-emerald-600">Total</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-blue-700">{pendingCount}</div>
            <div className="text-xs text-blue-600">Pending</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-700">{completedCount}</div>
            <div className="text-xs text-green-600">Done</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div className="flex gap-2">
                <Button onClick={addTask} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Add Task
                </Button>
                <Button onClick={() => setIsAddingTask(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                  task.completed ? "bg-green-50 border-green-200" : "bg-white border-emerald-100 hover:bg-emerald-50"
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`font-medium text-sm ${
                          task.completed ? "line-through text-gray-500" : "text-emerald-800"
                        }`}
                      >
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{getCategoryIcon(task.category)}</span>
                        <Badge className={`${getPriorityColor(task.priority)} text-white text-xs px-1 py-0`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    {task.description && (
                      <p className={`text-xs ${task.completed ? "text-gray-400" : "text-emerald-600"}`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Created:{" "}
                          {new Date(task.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {task.completedAt && (
                        <span className="text-green-600">
                          ✓ {new Date(task.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingTask(task.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 h-6 w-6 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTask(task.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-6 text-emerald-600">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks for today. Add your first task!</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="pt-3 border-t border-emerald-100">
            <div className="flex items-center justify-between text-xs text-emerald-600 mb-1">
              <span>Progress</span>
              <span>
                {completedCount}/{tasks.length} completed
              </span>
            </div>
            <div className="w-full bg-emerald-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
