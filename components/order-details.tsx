"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MessageCircle,
  Edit,
  Printer,
  Download,
  Calendar,
  DollarSign,
  User,
  Truck,
} from "lucide-react"
import type { Order } from "@/app/page"

interface OrderDetailsProps {
  order: Order
  onBack: () => void
  onUpdateOrder: (id: string, updates: Partial<Order>) => void
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const orderTimeline = [
  { status: "pending", label: "Order Placed", description: "Customer placed order via WhatsApp" },
  { status: "confirmed", label: "Order Confirmed", description: "Order details verified and confirmed" },
  { status: "processing", label: "Processing", description: "Order is being prepared" },
  { status: "shipped", label: "Shipped", description: "Order has been dispatched" },
  { status: "delivered", label: "Delivered", description: "Order delivered to customer" },
]

export function OrderDetails({ order, onBack, onUpdateOrder }: OrderDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(order.notes || "")

  const StatusIcon = statusIcons[order.status]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStatusUpdate = (newStatus: Order["status"]) => {
    onUpdateOrder(order.id, { status: newStatus })
  }

  const handleNotesUpdate = () => {
    onUpdateOrder(order.id, { notes })
    setIsEditing(false)
  }

  const getCurrentStatusIndex = () => {
    return orderTimeline.findIndex((item) => item.status === order.status)
  }

  const handleWhatsAppMessage = () => {
    const message = `Hi ${order.customerName}! Your order #${order.id.slice(-6)} is currently ${order.status}. Thank you for your business!`
    const whatsappUrl = `https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id.slice(-6)}</h1>
            <p className="text-gray-500">{formatDate(order.orderDate)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleWhatsAppMessage}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Message Customer
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${statusColors[order.status]} text-sm px-3 py-1`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <Select value={order.status} onValueChange={handleStatusUpdate}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
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
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {orderTimeline.map((item, index) => {
                  const currentIndex = getCurrentStatusIndex()
                  const isCompleted = index <= currentIndex
                  const isCurrent = index === currentIndex
                  const TimelineIcon = statusIcons[item.status as keyof typeof statusIcons]

                  return (
                    <div key={item.status} className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          isCompleted
                            ? "bg-green-100 border-green-500 text-green-600"
                            : "bg-gray-100 border-gray-300 text-gray-400"
                        }`}
                      >
                        <TimelineIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${isCompleted ? "text-green-600" : "text-gray-400"}`}>
                          {item.label}
                          {isCurrent && <span className="ml-2 text-xs text-blue-600">(Current)</span>}
                        </div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{order.items.length} items in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatCurrency(item.price)} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Notes</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this order..."
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleNotesUpdate} className="bg-green-600 hover:bg-green-700">
                      Save Notes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">{order.notes || "No notes added for this order."}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Name</Label>
                <div className="mt-1 font-medium">{order.customerName}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Phone</Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono">{order.customerPhone}</span>
                  <Button variant="outline" size="sm" onClick={() => window.open(`tel:${order.customerPhone}`)}>
                    <Phone className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Customer Since</Label>
                <div className="mt-1 text-sm text-gray-600">New Customer</div>
              </div>
              <Button variant="outline" className="w-full bg-transparent" onClick={handleWhatsAppMessage}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send WhatsApp Message
              </Button>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order ID</span>
                <span className="font-mono text-sm">#{order.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Date Placed</span>
                <span className="text-sm">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Items</span>
                <span className="text-sm">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment</span>
                <span className="text-sm">Cash on Delivery</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Package className="h-4 w-4 mr-2" />
                Mark as Shipped
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Delivered
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Delivery
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent">
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
