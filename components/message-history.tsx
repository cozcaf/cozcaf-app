"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react"
import type { Contact } from "@/app/page"

interface MessageHistoryProps {
  messageHistory: any[]
  contacts: Contact[]
}

export function MessageHistory({ messageHistory, contacts }: MessageHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredHistory = messageHistory.filter((msg) => {
    const matchesSearch =
      msg.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.contactPhone.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || msg.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (messageHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>View your sent messages and delivery status</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No messages sent yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message History</CardTitle>
        <CardDescription>View your sent messages and delivery status</CardDescription>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredHistory.map((msg) => (
            <div key={msg.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                      {msg.contactName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{msg.contactName}</p>
                    <p className="text-xs text-muted-foreground">{msg.contactPhone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusIcon(msg.status)}
                  <Badge className={getStatusColor(msg.status)}>{msg.status}</Badge>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <p className="text-sm">{msg.message}</p>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Sent: {new Date(msg.sentAt).toLocaleString()}</span>
                {msg.scheduled && (
                  <Badge variant="outline" className="text-xs">
                    Scheduled
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No messages found matching your search.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
