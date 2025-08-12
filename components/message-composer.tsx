"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Users, MessageSquare, Clock, LayoutTemplateIcon as Template, Calendar } from "lucide-react"
import type { Contact } from "@/app/page"

interface MessageComposerProps {
  selectedContacts: string[]
  contacts: Contact[]
}

interface MessageTemplate {
  id: string
  name: string
  content: string
  category: string
}

interface SendProgress {
  total: number
  sent: number
  failed: number
  isActive: boolean
}

const messageTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "Welcome Message",
    content:
      "Welcome to our service! We're excited to have you on board. Feel free to reach out if you have any questions.",
    category: "Welcome",
  },
  {
    id: "2",
    name: "Promotional Offer",
    content: "🎉 Special offer just for you! Get 20% off your next purchase. Use code SAVE20. Valid until {date}.",
    category: "Marketing",
  },
  {
    id: "3",
    name: "Event Reminder",
    content: "Don't forget! Our event is happening on {date} at {time}. We look forward to seeing you there!",
    category: "Events",
  },
  {
    id: "4",
    name: "Follow Up",
    content: "Hi {name}, just following up on our previous conversation. Let me know if you need any assistance!",
    category: "Follow-up",
  },
]

export function MessageComposer({ selectedContacts, contacts }: MessageComposerProps) {
  const [message, setMessage] = useState("")
  const [sendProgress, setSendProgress] = useState<SendProgress>({ total: 0, sent: 0, failed: 0, isActive: false })
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)

  const selectedContactsData = contacts.filter((contact) => selectedContacts.includes(contact.id))

  const applyTemplate = (templateId: string) => {
    const template = messageTemplates.find((t) => t.id === templateId)
    if (template) {
      setMessage(template.content)
    }
  }

  const personalizeMessage = (baseMessage: string, contact: Contact): string => {
    return baseMessage
      .replace(/{name}/g, contact.name)
      .replace(/{phone}/g, contact.phone)
      .replace(/{date}/g, new Date().toLocaleDateString())
      .replace(/{time}/g, new Date().toLocaleTimeString())
  }

  const simulateMessageSending = async (contacts: Contact[], message: string) => {
    const total = contacts.length
    setSendProgress({ total, sent: 0, failed: 0, isActive: true })

    for (let i = 0; i < contacts.length; i++) {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400))

      // Simulate 95% success rate
      const success = Math.random() > 0.05

      if (success) {
        setSendProgress((prev) => ({ ...prev, sent: prev.sent + 1 }))
      } else {
        setSendProgress((prev) => ({ ...prev, failed: prev.failed + 1 }))
      }

      // Store message in history
      const messageHistory = JSON.parse(localStorage.getItem("whatsapp-message-history") || "[]")
      const newMessage = {
        id: Date.now().toString() + i,
        contactId: contacts[i].id,
        contactName: contacts[i].name,
        contactPhone: contacts[i].phone,
        message: personalizeMessage(message, contacts[i]),
        status: success ? "delivered" : "failed",
        sentAt: new Date().toISOString(),
        scheduled: isScheduled,
      }
      messageHistory.unshift(newMessage)
      localStorage.setItem("whatsapp-message-history", JSON.stringify(messageHistory))
    }

    setSendProgress((prev) => ({ ...prev, isActive: false }))
  }

  const handleSendMessage = async () => {
    if (!message.trim() || selectedContacts.length === 0) return

    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      alert("Please set both date and time for scheduled messages")
      return
    }

    if (isScheduled) {
      // Store scheduled message
      const scheduledMessages = JSON.parse(localStorage.getItem("whatsapp-scheduled-messages") || "[]")
      const newScheduledMessage = {
        id: Date.now().toString(),
        message,
        contacts: selectedContactsData,
        scheduledFor: new Date(`${scheduleDate}T${scheduleTime}`).toISOString(),
        createdAt: new Date().toISOString(),
      }
      scheduledMessages.push(newScheduledMessage)
      localStorage.setItem("whatsapp-scheduled-messages", JSON.stringify(scheduledMessages))

      alert(`Message scheduled for ${new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}`)
      setMessage("")
      setScheduleDate("")
      setScheduleTime("")
      setIsScheduled(false)
      return
    }

    await simulateMessageSending(selectedContactsData, message)
    setMessage("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Compose Message
          </CardTitle>
          <CardDescription>Create and send bulk messages to your selected contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compose" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here... Use {name} for personalization"
                  className="min-h-32"
                  maxLength={1000}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Use {"{name}"} for personalization. WhatsApp supports text, emojis, and basic formatting</span>
                  <span>{message.length}/1000</span>
                </div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="schedule"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="schedule" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule Message
                  </Label>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Template className="h-4 w-4" />
                  <span className="font-medium">Message Templates</span>
                </div>

                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTemplate && (
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{messageTemplates.find((t) => t.id === selectedTemplate)?.content}</p>
                    </div>
                    <Button onClick={() => applyTemplate(selectedTemplate)} variant="outline" size="sm">
                      Use This Template
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {sendProgress.isActive && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Sending messages...</span>
                <span>
                  {sendProgress.sent + sendProgress.failed}/{sendProgress.total}
                </span>
              </div>
              <Progress value={((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-green-600">✓ {sendProgress.sent} sent</span>
                {sendProgress.failed > 0 && <span className="text-red-600">✗ {sendProgress.failed} failed</span>}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {selectedContacts.length} contacts selected
              {isScheduled && (
                <Badge variant="outline" className="ml-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  Scheduled
                </Badge>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || selectedContacts.length === 0 || sendProgress.isActive}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendProgress.isActive ? (
                <>Sending...</>
              ) : isScheduled ? (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Message
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedContactsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recipients ({selectedContactsData.length})</CardTitle>
            <CardDescription>Your message will be sent to these contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {selectedContactsData.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                      {contact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                    {message && (
                      <p className="text-xs text-blue-600 mt-1 truncate">
                        Preview: {personalizeMessage(message, contact).substring(0, 50)}...
                      </p>
                    )}
                  </div>
                  {contact.tags.length > 0 && (
                    <div className="flex gap-1">
                      {contact.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No contacts selected</h3>
            <p className="text-muted-foreground mb-4">Select contacts from the Contacts tab to send messages</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
