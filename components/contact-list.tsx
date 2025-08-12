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
            if (ref) ref.indeterminate = isIndeterminate
          }}
        />
        <span className="text-sm font-medium">
          {selectedContacts.length > 0
            ? `${selectedContacts.length} of ${contacts.length} selected`
            : `Select all ${contacts.length} contacts`}
        </span>
      </div>

      {/* Contact List */}
      <div className="grid gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                />

                <Avatar>
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {contact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3 mr-1" />
                    {contact.phone}
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Added {new Date(contact.addedDate).toLocaleDateString()}
                  </div>

                  {contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
