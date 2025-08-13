"use client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2, Phone, Calendar } from "lucide-react"
import type { Contact } from "@/app/page"

interface ContactListProps {
  contacts: Contact[]
  selectedContacts: string[]
  onSelectionChange: (selected: string[]) => void
  onDeleteContact: (id: string) => void
}

export function ContactList({ contacts, selectedContacts, onSelectionChange, onDeleteContact }: ContactListProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(contacts.map((contact) => contact.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedContacts, contactId])
    } else {
      onSelectionChange(selectedContacts.filter((id) => id !== contactId))
    }
  }

  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length
  const isIndeterminate = selectedContacts.length > 0 && selectedContacts.length < contacts.length

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No contacts found</p>
        <p className="text-sm text-muted-foreground">Add your first contact to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Select All Header */}
      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          ref={(ref) => {
            if (ref) (ref as HTMLInputElement).indeterminate = isIndeterminate
          }}
        />
        <span className="text-sm font-medium">
          {selectedContacts.length > 0
            ? `${selectedContacts.length} of ${contacts.length} selected`
            : `Select all ${contacts.length} contacts`}
        </span>
      </div>

      {/* Contact List */}
      {/* <div className="grid gap-2">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-row items-baseline  gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{contact.profile?.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.wa_id}
                      </div>
                      
                    </div>
                    
                    <div className="flex flex-row gap-3 ">
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        
                        {new Date(contact?.createdAt?._seconds * 1000).toDateString()}
                      </div>
                       <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    </div>
                   
                  </div>
 
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      <div className="grid gap-2">
  {contacts.map((contact) => (
    <Card key={contact.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          {/* Checkbox */}
          <Checkbox
            checked={selectedContacts.includes(contact.id)}
            onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              
              {/* Left Side: Name & Phone */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {contact.profile?.name}
                </h3>
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <Phone className="h-3 w-3 mr-1" />
                  {contact.wa_id}
                </div>
              </div>

              {/* Right Side: Date & Delete Button */}
              <div className="flex flex-row sm:flex-row gap-2 sm:gap-3 items-center text-xs sm:text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(contact?.createdAt?._seconds * 1000).toDateString()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteContact(contact.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

    </div>
  )
}
