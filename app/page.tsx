"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactList } from "@/components/contact-list"
import { AddContactDialog } from "@/components/add-contact-dialog"
import { MessageComposer } from "@/components/message-composer"
import { MessageHistory } from "@/components/message-history"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { OrdersManagement } from "@/components/orders-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, BarChart3, Plus, ShoppingCart } from "lucide-react"

export interface Contact {
  id: string
  name: string
  phone: string
  tags: string[]
  addedDate: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  total: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  orderDate: string
  notes?: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)
  const [messageHistory, setMessageHistory] = useState<any[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const savedContacts = localStorage.getItem("whatsapp-contacts")
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts))
    }

    const savedHistory = localStorage.getItem("whatsapp-message-history")
    if (savedHistory) {
      setMessageHistory(JSON.parse(savedHistory))
    }

    const savedOrders = localStorage.getItem("whatsapp-orders")
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("whatsapp-contacts", JSON.stringify(contacts))
  }, [contacts])

  useEffect(() => {
    localStorage.setItem("whatsapp-orders", JSON.stringify(orders))
  }, [orders])

  const addContact = (contact: Omit<Contact, "id" | "addedDate">) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      addedDate: new Date().toISOString(),
    }
    setContacts((prev) => [...prev, newContact])
  }

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
    setSelectedContacts((prev) => prev.filter((contactId) => contactId !== id))
  }

  const addOrder = (order: Omit<Order, "id" | "orderDate">) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      orderDate: new Date().toISOString(),
    }
    setOrders((prev) => [...prev, newOrder])
  }

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, ...updates } : order)))
  }

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id))
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Bulk Messenger</h1>
          <p className="text-gray-600">Manage contacts and send bulk messages efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedContacts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messageHistory.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Contact Management</CardTitle>
                    <CardDescription>Add, edit, and organize your WhatsApp contacts</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddContactOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search contacts by name, phone, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <ContactList
                  contacts={filteredContacts}
                  selectedContacts={selectedContacts}
                  onSelectionChange={setSelectedContacts}
                  onDeleteContact={deleteContact}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compose">
            <MessageComposer selectedContacts={selectedContacts} contacts={contacts} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement
              orders={orders}
              contacts={contacts}
              onAddOrder={addOrder}
              onUpdateOrder={updateOrder}
              onDeleteOrder={deleteOrder}
            />
          </TabsContent>

          <TabsContent value="history">
            <MessageHistory messageHistory={messageHistory} contacts={contacts} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard messageHistory={messageHistory} contacts={contacts} />
          </TabsContent>
        </Tabs>

        <AddContactDialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen} onAddContact={addContact} />
      </div>
    </div>
  )
}
