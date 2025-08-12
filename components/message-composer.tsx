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
import { Send, Users, MessageSquare, Clock, LayoutTemplateIcon as Template, Calendar, ImagePlus, ImageIcon, X } from "lucide-react"
import type { Contact } from "@/app/page"
import { messageHistoryService } from "@/lib/firebase-services"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"


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

interface ImageAttachment {
  id: string
  file: File
  preview: string
  uploaded?: boolean
  url?: string
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
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)


  const selectedContactsData = contacts.filter((contact) => selectedContacts.includes(contact.id))

  const applyTemplate = (templateId: string) => {
    const template = messageTemplates.find((t) => t.id === templateId)
    if (template) {
      setMessage(template.content)
    }
  }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newAttachments: ImageAttachment[] = []

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const id = Math.random().toString(36).substr(2, 9)
        const preview = URL.createObjectURL(file)
        newAttachments.push({ id, file, preview, uploaded: false })
      }
    })

    setImageAttachments((prev) => [...prev, ...newAttachments])

    // Reset the input
    event.target.value = ""
  }

   const removeImage = (id: string) => {
    setImageAttachments((prev) => {
      const attachment = prev.find((att) => att.id === id)
      if (attachment) {
        URL.revokeObjectURL(attachment.preview)
      }
      return prev.filter((att) => att.id !== id)
    })
  }

  const uploadImagesToStorage = async (): Promise<string[]> => {
    if (!storage || imageAttachments.length === 0) return []

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (const attachment of imageAttachments) {
        if (!attachment.uploaded) {
          const timestamp = Date.now()
          const fileName = `messages/${timestamp}_${attachment.file.name}`
          const storageRef = ref(storage, fileName)

          await uploadBytes(storageRef, attachment.file)
          const downloadURL = await getDownloadURL(storageRef)
          uploadedUrls.push(downloadURL)

          // Update attachment status
          setImageAttachments((prev) =>
            prev.map((att) => (att.id === attachment.id ? { ...att, uploaded: true, url: downloadURL } : att)),
          )
        } else if (attachment.url) {
          uploadedUrls.push(attachment.url)
        }
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      throw new Error("Failed to upload images")
    } finally {
      setUploadingImages(false)
    }

    return uploadedUrls
  }

  const personalizeMessage = (baseMessage: string, contact: Contact): string => {
    return baseMessage
      .replace(/{name}/g, contact.name)
      .replace(/{phone}/g, contact.phone)
      .replace(/{date}/g, new Date().toLocaleDateString())
      .replace(/{time}/g, new Date().toLocaleTimeString())
  }

  const simulateMessageSending = async (contacts: Contact[], message: string,imageUrls: string[] = []) => {
    const total = contacts.length
    setSendProgress({ total, sent: 0, failed: 0, isActive: true })

    const phoneNumbers = contacts.map((contact) => contact.wa_id)

  //  alert(JSON.stringify(imageUrls))

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sendBulkMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": `${process.env.NEXT_PUBLIC_API_KEY}` },
      body: JSON.stringify({
          phoneNumbers:phoneNumbers,
          message:message,
          imageUrl:imageUrls.length ===0 ? "": imageUrls[0],
      }),
    });
    const errorData = await response.json();
    console.log("errorData", errorData)
    setSendProgress((prev) => ({ ...prev, isActive: false }))
  }

  const handleSendMessage = async () => {
    if ((!message.trim() && imageAttachments.length === 0) || selectedContacts.length === 0) return

     
    try{
       let imageUrls: string[] = []
        if (imageAttachments.length > 0) {
        imageUrls = await uploadImagesToStorage()
        }
        await simulateMessageSending(selectedContactsData, message,imageUrls)
        setMessage("")
        setImageAttachments([])

    }catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }


    
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
              {/* <TabsTrigger value="templates">Templates</TabsTrigger> */}
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
                 <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> 
                    Attach Images
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      disabled={uploadingImages}
                      className="flex items-center gap-2"
                    >
                      <ImagePlus className="h-4 w-4" /> 
                      Add Images
                    </Button>
                  </div>
                </div>
              {imageAttachments.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
                    {imageAttachments.map((attachment) => (
                      <div key={attachment.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img
                            src={attachment.preview || "/placeholder.svg"}
                            alt="Attachment preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(attachment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {attachment.uploaded && (
                          <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        <p className="text-xs text-center mt-1 truncate">{attachment.file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
                {uploadingImages && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    Uploading images...
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
                      {contact.profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{contact.profile.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.wa_id}</p>
                    {message && (
                      <p className="text-xs text-blue-600 mt-1 truncate">
                        Preview: {personalizeMessage(message, contact).substring(0, 50)}...
                      </p>
                    )}
                  </div>
                  {/* {contact.tags.length > 0 && (
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
                  )} */}
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
