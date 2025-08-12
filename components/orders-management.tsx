"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Trash2, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import type { Order, Contact, OrderItem } from "@/app/page"
import { OrderDetails } from "./order-details"

interface OrdersManagementProps {
  orders: Order[]
  contacts: Contact[]
  onAddOrder: (order: Omit<Order, "id" | "orderDate">) => void
  onUpdateOrder: (id: string, updates: Partial<Order>) => void
  onDeleteOrder: (id: string) => void
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Package,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export function OrdersManagement({
  orders,
  contacts,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
}: OrdersManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  const [newOrder, setNewOrder] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    items: [{ id: "1", name: "", quantity: 1, price: 0 }] as OrderItem[],
    status: "pending" as Order["status"],
    notes: "",
  })

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddItem = () => {
    setNewOrder((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: "", quantity: 1, price: 0 }],
    }))
  }

  const handleRemoveItem = (itemId: string) => {
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  const handleItemChange = (itemId: string, field: keyof OrderItem, value: string | number) => {
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    }))
  }

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  const handleSubmitOrder = () => {
    const total = calculateTotal(newOrder.items)
    onAddOrder({
      ...newOrder,
      total,
    })

    setNewOrder({
      customerId: "",
      customerName: "",
      customerPhone: "",
      items: [{ id: "1", name: "", quantity: 1, price: 0 }],
      status: "pending",
      notes: "",
    })
    setIsAddOrderOpen(false)
  }

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    onUpdateOrder(orderId, { status: newStatus })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleBackToOrders = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  if (showOrderDetails && selectedOrder) {
    return <OrderDetails order={selectedOrder} onBack={handleBackToOrders} onUpdateOrder={onUpdateOrder} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Track and manage WhatsApp orders from your customers</CardDescription>
            </div>
            <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Order</DialogTitle>
                  <DialogDescription>Add a new order from a WhatsApp customer</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={newOrder.customerName}
                        onChange={(e) => setNewOrder((prev) => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone Number</Label>
                      <Input
                        id="customerPhone"
                        value={newOrder.customerPhone}
                        onChange={(e) => setNewOrder((prev) => ({ ...prev, customerPhone: e.target.value }))}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Order Items</Label>
                    <div className="space-y-2 mt-2">
                      {newOrder.items.map((item, index) => (
                        <div key={item.id} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Input
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="w-20">
                            <Input
                              type="number"
                              placeholder="Qty"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 1)
                              }
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              placeholder="Price"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                handleItemChange(item.id, "price", Number.parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          {newOrder.items.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                      className="mt-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="status">Order Status</Label>
                    <Select
                      value={newOrder.status}
                      onValueChange={(value: Order["status"]) => setNewOrder((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={newOrder.notes}
                      onChange={(e) => setNewOrder((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about the order..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Order Total:</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(calculateTotal(newOrder.items))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOrderOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitOrder} className="bg-green-600 hover:bg-green-700">
                    Create Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by customer name, phone, or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {orders.length === 0
                        ? "No orders yet. Create your first order!"
                        : "No orders match your search criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const StatusIcon = statusIcons[order.status]
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">#{order.id.slice(-6)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value: Order["status"]) => handleStatusUpdate(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <div className="flex items-center gap-2">
                                <StatusIcon className="h-3 w-3" />
                                <span className="capitalize">{order.status}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(order.orderDate)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => onDeleteOrder(order.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
