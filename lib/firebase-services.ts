import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage, isFirebaseEnabled } from "./firebase"
import type { Contact, Order } from "@/app/page"

const localStorageService = {
  getContacts: (): Contact[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("whatsapp-contacts")
    return stored ? JSON.parse(stored) : []
  },

  saveContacts: (contacts: Contact[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("whatsapp-contacts", JSON.stringify(contacts))
    }
  },

  getOrders: (): Order[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("whatsapp-orders")
    return stored ? JSON.parse(stored) : []
  },

  saveOrders: (orders: Order[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("whatsapp-orders", JSON.stringify(orders))
    }
  },

  getMessageHistory: (): any[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("whatsapp-message-history")
    return stored ? JSON.parse(stored) : []
  },

  saveMessageHistory: (messages: any[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("whatsapp-message-history", JSON.stringify(messages))
    }
  },
}

// Contact Services
export const contactsService = {
  // Get all contacts
  async getContacts(): Promise<Contact[]> {
    if (!isFirebaseEnabled()) {
      return localStorageService.getContacts()
    }

    try {
      const contactsRef = collection(db, "contacts-cozcaf")
      const q = query(contactsRef, orderBy("addedDate", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[]
    } catch (error) {
      console.error("Error fetching contacts:", error)
      return localStorageService.getContacts()
    }
  },

  // Add new contact
  async addContact(contact: Omit<Contact, "id">): Promise<string> {
    if (!isFirebaseEnabled()) {
      const contacts = localStorageService.getContacts()
      const newContact = { ...contact, id: Date.now().toString(), addedDate: new Date().toISOString() }
      contacts.unshift(newContact)
      localStorageService.saveContacts(contacts)
      return newContact.id
    }

    try {
      const contactsRef = collection(db, "contacts-cozcaf")
      const docRef = await addDoc(contactsRef, {
        ...contact,
        addedDate: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding contact:", error)
      throw error
    }
  },

  // Update contact
  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    if (!isFirebaseEnabled()) {
      const contacts = localStorageService.getContacts()
      const index = contacts.findIndex((c) => c.id === id)
      if (index !== -1) {
        contacts[index] = { ...contacts[index], ...updates }
        localStorageService.saveContacts(contacts)
      }
      return
    }

    try {
      const contactRef = doc(db, "contacts", id)
      await updateDoc(contactRef, updates)
    } catch (error) {
      console.error("Error updating contact:", error)
      throw error
    }
  },

  // Delete contact
  async deleteContact(id: string): Promise<void> {
    if (!isFirebaseEnabled()) {
      const contacts = localStorageService.getContacts()
      const filtered = contacts.filter((c) => c.id !== id)
      localStorageService.saveContacts(filtered)
      return
    }

    try {
      const contactRef = doc(db, "contacts", id)
      await deleteDoc(contactRef)
    } catch (error) {
      console.error("Error deleting contact:", error)
      throw error
    }
  },

  // Subscribe to contacts changes
  subscribeToContacts(callback: (contacts: Contact[]) => void) {
    if (!isFirebaseEnabled()) {
      // For localStorage, just call the callback once with current data
      callback(localStorageService.getContacts())
      return () => {} // Return empty unsubscribe function
    }

    const contactsRef = collection(db, "contacts-cozcaf")
    const q = query(contactsRef, orderBy("addedDate", "desc"))

    return onSnapshot(q, (snapshot) => {
      const contacts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[]
      callback(contacts)
    })
  },
}

// Orders Services
export const ordersService = {
  // Get all orders
  async getOrders(): Promise<Order[]> {
    if (!isFirebaseEnabled()) {
      return localStorageService.getOrders()
    }

    try {
      const ordersRef = collection(db, "orders-cozcaf")
      const q = query(ordersRef, orderBy("orderDate", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]
    } catch (error) {
      console.error("Error fetching orders:", error)
      return localStorageService.getOrders()
    }
  },

  // Add new order
  async addOrder(order: Omit<Order, "id">): Promise<string> {
    if (!isFirebaseEnabled()) {
      const orders = localStorageService.getOrders()
      const newOrder = { ...order, id: Date.now().toString(), orderDate: new Date().toISOString() }
      orders.unshift(newOrder)
      localStorageService.saveOrders(orders)
      return newOrder.id
    }

    try {
      const ordersRef = collection(db, "orders-cozcaf")
      const docRef = await addDoc(ordersRef, {
        ...order,
        orderDate: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding order:", error)
      throw error
    }
  },

  // Update order
  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    if (!isFirebaseEnabled()) {
      const orders = localStorageService.getOrders()
      const index = orders.findIndex((o) => o.id === id)
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updates }
        localStorageService.saveOrders(orders)
      }
      return
    }

    try {
      const orderRef = doc(db, "orders", id)
      await updateDoc(orderRef, updates)
    } catch (error) {
      console.error("Error updating order:", error)
      throw error
    }
  },

  // Delete order
  async deleteOrder(id: string): Promise<void> {
    if (!isFirebaseEnabled()) {
      const orders = localStorageService.getOrders()
      const filtered = orders.filter((o) => o.id !== id)
      localStorageService.saveOrders(filtered)
      return
    }

    try {
      const orderRef = doc(db, "orders", id)
      await deleteDoc(orderRef)
    } catch (error) {
      console.error("Error deleting order:", error)
      throw error
    }
  },

  // Subscribe to orders changes
  subscribeToOrders(callback: (orders: Order[]) => void) {
    if (!isFirebaseEnabled()) {
      callback(localStorageService.getOrders())
      return () => {}
    }

    const ordersRef = collection(db, "orders-cozcaf")
    const q = query(ordersRef, orderBy("orderDate", "desc"))

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]
      callback(orders)
    })
  },
}

// Message History Services
export const messageHistoryService = {
  // Get message history
  async getMessageHistory(): Promise<any[]> {
    if (!isFirebaseEnabled()) {
      return localStorageService.getMessageHistory()
    }

    try {
      const messagesRef = collection(db, "messageHistory")
      const q = query(messagesRef, orderBy("sentAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error fetching message history:", error)
      return localStorageService.getMessageHistory()
    }
  },

  // Add message to history
  async addMessage(message: any): Promise<string> {
    if (!isFirebaseEnabled()) {
      const messages = localStorageService.getMessageHistory()
      const newMessage = { ...message, id: Date.now().toString(), sentAt: new Date().toISOString() }
      messages.unshift(newMessage)
      localStorageService.saveMessageHistory(messages)
      return newMessage.id
    }

    try {
      const messagesRef = collection(db, "messageHistory")
      const docRef = await addDoc(messagesRef, {
        ...message,
        sentAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding message:", error)
      throw error
    }
  },

  // Subscribe to message history changes
  subscribeToMessageHistory(callback: (messages: any[]) => void) {
    if (!isFirebaseEnabled()) {
      callback(localStorageService.getMessageHistory())
      return () => {}
    }

    const messagesRef = collection(db, "messageHistory")
    const q = query(messagesRef, orderBy("sentAt", "desc"))

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      callback(messages)
    })
  },
}

// File Upload Services
export const fileService = {
  // Upload file to Firebase Storage
  async uploadFile(file: File, path: string): Promise<string> {
    if (!isFirebaseEnabled()) {
      // For localStorage fallback, we'll create a local URL
      return URL.createObjectURL(file)
    }

    try {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      return downloadURL
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    }
  },

  // Delete file from Firebase Storage
  async deleteFile(path: string): Promise<void> {
    if (!isFirebaseEnabled()) {
      return // No-op for localStorage
    }

    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      console.error("Error deleting file:", error)
      throw error
    }
  },
}
