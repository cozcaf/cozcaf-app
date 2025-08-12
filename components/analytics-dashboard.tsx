"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  Clock,
} from "lucide-react"
import type { Contact } from "@/app/page"

interface AnalyticsDashboardProps {
  messageHistory: any[]
  contacts: Contact[]
}

interface AnalyticsData {
  totalMessages: number
  deliveredMessages: number
  failedMessages: number
  deliveryRate: number
  totalContacts: number
  messagesThisWeek: number
  messagesThisMonth: number
  topPerformingDay: string
  averageMessagesPerDay: number
}

export function AnalyticsDashboard({ messageHistory, contacts }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("7d")

  const analyticsData: AnalyticsData = useMemo(() => {
    const now = new Date()
    const delivered = messageHistory.filter((msg) => msg.status === "delivered").length
    const failed = messageHistory.filter((msg) => msg.status === "failed").length
    const total = messageHistory.length

    // Calculate messages this week
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const messagesThisWeek = messageHistory.filter((msg) => new Date(msg.sentAt) >= weekAgo).length

    // Calculate messages this month
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const messagesThisMonth = messageHistory.filter((msg) => new Date(msg.sentAt) >= monthAgo).length

    // Find top performing day
    const dailyMessages: { [key: string]: number } = {}
    messageHistory.forEach((msg) => {
      const day = new Date(msg.sentAt).toLocaleDateString()
      dailyMessages[day] = (dailyMessages[day] || 0) + 1
    })

    const topDay = Object.entries(dailyMessages).reduce(
      (max, [day, count]) => (count > max.count ? { day, count } : max),
      { day: "N/A", count: 0 },
    )

    return {
      totalMessages: total,
      deliveredMessages: delivered,
      failedMessages: failed,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      totalContacts: contacts.length,
      messagesThisWeek,
      messagesThisMonth,
      topPerformingDay: topDay.day,
      averageMessagesPerDay: messagesThisMonth > 0 ? messagesThisMonth / 30 : 0,
    }
  }, [messageHistory, contacts])

  const getTimeRangeData = () => {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    return messageHistory.filter((msg) => new Date(msg.sentAt) >= startDate)
  }

  const timeRangeData = getTimeRangeData()
  const timeRangeDelivered = timeRangeData.filter((msg) => msg.status === "delivered").length
  const timeRangeTotal = timeRangeData.length
  const timeRangeDeliveryRate = timeRangeTotal > 0 ? (timeRangeDelivered / timeRangeTotal) * 100 : 0

  // Contact growth data
  const contactGrowthData = useMemo(() => {
    const growth: { [key: string]: number } = {}
    contacts.forEach((contact) => {
      const month = new Date(contact.addedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
      growth[month] = (growth[month] || 0) + 1
    })
    return Object.entries(growth).slice(-6) // Last 6 months
  }, [contacts])

  // Daily message volume for the selected time range
  const dailyVolumeData = useMemo(() => {
    const daily: { [key: string]: { delivered: number; failed: number } } = {}

    timeRangeData.forEach((msg) => {
      const day = new Date(msg.sentAt).toLocaleDateString()
      if (!daily[day]) {
        daily[day] = { delivered: 0, failed: 0 }
      }
      if (msg.status === "delivered") {
        daily[day].delivered++
      } else {
        daily[day].failed++
      }
    })

    return Object.entries(daily).slice(-7) // Last 7 days
  }, [timeRangeData])

  if (messageHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Track your messaging performance and contact growth</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No data available</h3>
          <p className="text-muted-foreground">Send some messages to see analytics</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Track your messaging performance and contact growth</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalMessages}</div>
            <p className="text-xs text-muted-foreground">{timeRangeTotal} in selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.deliveryRate.toFixed(1)}%</div>
            <Progress value={analyticsData.deliveryRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{timeRangeDeliveryRate.toFixed(1)}% in selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalContacts}</div>
            <p className="text-xs text-muted-foreground">Total contacts in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Messages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageMessagesPerDay.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Based on last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Message Status</CardTitle>
            <CardDescription>Breakdown of message delivery status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Delivered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analyticsData.deliveredMessages}</span>
                <Badge className="bg-green-100 text-green-800">
                  {((analyticsData.deliveredMessages / analyticsData.totalMessages) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={(analyticsData.deliveredMessages / analyticsData.totalMessages) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Failed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{analyticsData.failedMessages}</span>
                <Badge className="bg-red-100 text-red-800">
                  {((analyticsData.failedMessages / analyticsData.totalMessages) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={(analyticsData.failedMessages / analyticsData.totalMessages) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Insights</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Best Performing Day</span>
              </div>
              <span className="text-sm font-medium">{analyticsData.topPerformingDay}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Messages This Week</span>
              </div>
              <span className="text-sm font-medium">{analyticsData.messagesThisWeek}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm">Messages This Month</span>
              </div>
              <span className="text-sm font-medium">{analyticsData.messagesThisMonth}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Message Volume</CardTitle>
          <CardDescription>Message delivery trends over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyVolumeData.length > 0 ? (
              dailyVolumeData.map(([day, data]) => (
                <div key={day} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{day}</span>
                    <span>{data.delivered + data.failed} messages</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-green-500 transition-all duration-300"
                        style={{
                          width: `${(data.delivered / (data.delivered + data.failed)) * 100 || 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-red-500 transition-all duration-300"
                        style={{
                          width: `${(data.failed / (data.delivered + data.failed)) * 100 || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-green-600">✓ {data.delivered} delivered</span>
                    <span className="text-red-600">✗ {data.failed} failed</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No data for selected period</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Growth</CardTitle>
          <CardDescription>New contacts added over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contactGrowthData.length > 0 ? (
              contactGrowthData.map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm">{month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${(count / Math.max(...contactGrowthData.map(([, c]) => c))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No contact growth data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
