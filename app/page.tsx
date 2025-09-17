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
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, reauthenticateWithPopup, signInWithPopup } from "firebase/auth"

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
  const [googlecontacts, setgooglecontacts] = useState<any[]>([])

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

        

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCustomer`, {
          method: "GET",
          headers: { "Content-Type": "application/json", "x-api-key": `${process.env.NEXT_PUBLIC_API_KEY}` },
        });
        const data = await response.json();
        console.log('gstlist', data?.results)
        setContacts(data?.results)
        return () => {
           
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


  const handleSyncGoogleContacts = async () => {
    try {
    //  setLoading(true);

      // Google Sign-in with extra scope for contacts
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
      let result: any; 
      // If the user is already signed in, reauthenticate
      if (auth.currentUser) {
        result = await reauthenticateWithPopup(auth.currentUser, provider);
      } else {
        // Otherwise, sign in with popup
        result = await signInWithPopup(auth, provider);
      }
      //const result = await signInWithPopup(auth, provider);
      //const result = await reauthenticateWithPopup(auth.currentUser, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        throw new Error("Google access token not found.");
      }

      // Fetch all contacts with pagination
      const allContacts = await getAllContacts(token);
      setgooglecontacts(allContacts);
      
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
     // setLoading(false);
    }
  }

  const getAllContacts = async (accessToken:any) => {
    let contactsList: any[] = [];
    let nextPageToken = "";

    do {
      const url = `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=1000${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      console.log(" all contact data",data)
      
     // contactsList = contactsList.concat(data.connections || []);
      const filtered = (data.connections || []).filter((c: any) => c.phoneNumbers && c.phoneNumbers.length > 0);
      contactsList = contactsList.concat(filtered);
     
      nextPageToken = data.nextPageToken || "";
    } while (nextPageToken);

    return contactsList;
  };



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

  // <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
  //     <h2 className="text-xl font-semibold text-red-600 mb-4">
  //       ⚠️ Outstanding Payment
  //     </h2>
  //     <p className="text-gray-700 mb-3">
  //       You have an outstanding payment of{" "}
  //       <span className="font-bold text-gray-900">₹13,000</span>.
  //     </p>
  //     <p className="text-gray-700 mb-3">
  //       To continue using our service, please make at least a partial payment of{" "}
  //       <span className="font-bold text-gray-900">₹5,000 + ₹1,700 (Meta charges) = 6700</span>.
  //     </p>
  //     <div className="bg-gray-50 p-3 rounded-lg mb-4">
  //       <p className="text-gray-800 font-medium">Pay via Google Pay:</p>
  //       <p className="text-lg font-bold text-blue-600">9037866074</p>
  //     </div>
  //     <p className="text-gray-600 text-sm mb-4">
  //       For any assistance, feel free to contact us.
  //     </p>
  //     {/* <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
  //       Make Payment
  //     </button> */}

  //     <a
  //       href="upi://pay?pa=9037866074@axib&pn=Hexcode&am=6700&cu=INR"
  //       className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
  //     >
  //       Make Payment
  //     </a>

  //   </div>

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
           
        </div>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            
          </TabsList>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                  <div>
                    <CardTitle>Contact Management</CardTitle>
                    <CardDescription>Add, edit, and organize your WhatsApp contacts</CardDescription>
                  </div>
                  
                  <div className="flex flex-row gap-2 items-center">
                  
                  <Button onClick={() => setIsAddContactOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                  </div>
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

          <TabsContent value="googlecontacts">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Google Contacts</h2>
              <p className="text-sm text-muted-foreground">
                Sync and manage your Google contacts here.
              </p>
              {googlecontacts.length > 0 ? (
                <ul className="space-y-2">
                  {googlecontacts.map((contact, index) => (
                     

                    <li key={index}>
                      <strong>{contact.names?.[0]?.displayName || "No Name"}</strong> <br />
                      
                      📱 {contact.phoneNumbers?.[0]?.value || "No Phone"}
                    </li>

                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No Google contacts found.</p>
              )}
            </div>
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
