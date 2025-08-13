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
import { Users, MessageSquare, BarChart3, Plus, ShoppingCart, Loader2 } from "lucide-react"
import { contactsService, ordersService, messageHistoryService } from "@/lib/firebase-services"
import { ImageList } from "@/components/image-managements"

export interface Contact {
  id: string
  name: string
  phone: string
  tags: string[]
  addedDate: string,
  profile: {
    name: string
  }
  wa_id: string,
  createdAt: any
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
  const [allImages, setAllImages] = useState<string[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)
  const [messageHistory, setMessageHistory] = useState<any[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)

  const relodloadData = async () => {
    try {


      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCustomer`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "x-api-key": `${process.env.NEXT_PUBLIC_API_KEY}` },
      });
      const data = await response.json();
      console.log('gstlist', data?.results)
      setContacts(data?.results)


      //return () => { }
    } catch (err) {


    } finally {

    }
  }

  useEffect(() => {
    
const loadData = async () => {
      try {
        setLoading(true)

        // Subscribe to real-time updates
        // const unsubscribeContacts = contactsService.subscribeToContacts((newContacts) => {
        //   setContacts(newContacts)
        // })

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCustomer`, {
          method: "GET",
          headers: { "Content-Type": "application/json", "x-api-key": `${process.env.NEXT_PUBLIC_API_KEY}` },
        });
        const data = await response.json();
        console.log('gstlist', data?.results)
        setContacts(data?.results)

        // const unsubscribeOrders = ordersService.subscribeToOrders((newOrders) => {
        //   setOrders(newOrders)
        // })

        // const unsubscribeMessages = messageHistoryService.subscribeToMessageHistory((newMessages) => {
        //   setMessageHistory(newMessages)
        // })

        // Cleanup subscriptions on unmount
        return () => {
          //  unsubscribeContacts()
        //  unsubscribeOrders()
        //  unsubscribeMessages()
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setInitError("Failed to load data. Please check your Firebase configuration.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (operationError) {
      const timer = setTimeout(() => {
        setOperationError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [operationError])

  const addContact = async (contact: Omit<Contact, "id" | "addedDate">) => {
    try {

      // alert(JSON.stringify(contact, null, 2))


      // await contactsService.addContact({
      //   ...contact,
      //   addedDate: new Date().toISOString(),
      // })
      // setOperationError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/createCustomer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": `${process.env.NEXT_PUBLIC_API_KEY}` },
        body: JSON.stringify({
          phone: contact.phone,
          name: contact.name,
          tags: contact.tags,
          addedDate: new Date().toISOString(),
        }),
      });
      const errorData = await response.json();
      relodloadData()
      console.log("errorData", errorData)



    } catch (error) {
      console.error("Error adding contact:", error)
      setOperationError("Failed to add contact. Please try again.")
    }
  }

  const deleteContact = async (id: string) => {
    try {
      await contactsService.deleteContact(id)
      relodloadData()
      setSelectedContacts((prev) => prev.filter((contactId) => contactId !== id))
      setOperationError(null)
    } catch (error) {
      console.error("Error deleting contact:", error)
      setOperationError("Failed to delete contact. Please try again.")
    }
  }

  const addOrder = async (order: Omit<Order, "id" | "orderDate">) => {
    try {
      await ordersService.addOrder({
        ...order,
        orderDate: new Date().toISOString(),
      })
      setOperationError(null)
    } catch (error) {
      console.error("Error adding order:", error)
      setOperationError("Failed to add order. Please try again.")
    }
  }

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      await ordersService.updateOrder(id, updates)
      setOperationError(null)
    } catch (error) {
      console.error("Error updating order:", error)
      setOperationError("Failed to update order. Please try again.")
    }
  }

  const deleteOrder = async (id: string) => {
    try {
      await ordersService.deleteOrder(id)
      setOperationError(null)
    } catch (error) {
      console.error("Error deleting order:", error)
      setOperationError("Failed to delete order. Please try again.")
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      (contact.profile?.name?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
      contact?.wa_id.includes(searchQuery),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your WhatsApp data...</p>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">⚠️ Connection Error</div>
          <p className="text-gray-600 mb-4">{initError}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        {operationError && (
          <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center justify-between">
              <span>⚠️ {operationError}</span>
              <button onClick={() => setOperationError(null)} className="ml-4 text-red-500 hover:text-red-700">
                ×
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Bulk Messenger</h1>
          <p className="text-gray-600">Manage contacts and send bulk messages efficiently</p>
        </div>

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
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messageHistory.length}</div>
            </CardContent>
          </Card> */}
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card> */}
        </div>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            {/* <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
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

          <TabsContent value="images">
                <ImageList   />
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
