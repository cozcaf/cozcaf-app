"use client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Phone, Calendar } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL,listAll,deleteObject } from "firebase/storage"
import { useEffect, useState } from "react"




export function ImageList() {
    
    
    const [images, setImages] = useState<any[]>([]); 


    const  onDeleteImage = async (imageName: string) => {
        try {
            const imageRef = ref(storage, `messages/${imageName}`);
            await deleteObject(imageRef);
            setImages(images.filter(image => image.name !== imageName));
        } catch (error) {
            console.error("Error deleting image:", error);
        }

    }


    useEffect(()=>{
         try{

             const fetchImages = async () => {

                 const imagesRef = ref(storage, "messages/");
                 const listResult = await listAll(imagesRef);
                 const urls = await Promise.all(
                     listResult.items.map(async (itemRef) => ({
                         name: itemRef.name,
                         url: await getDownloadURL(itemRef),
                     }))
                 );
                 setImages(urls);
             }
             fetchImages();


         }catch(e){
             console.log("image list error", e);
         }
    },[images])


    return (
        <div className="space-y-4">
            {/* Select All Header */}
            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                {/* <Checkbox
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
                </span> */}
            </div>

            {/* Contact List */}
            <div className="grid gap-1 grid-cols-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-10 lg:gap-[10px]">

                {
                    images.map((image, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-2">
                                <div className="flex items-center gap-1">
                                    <img src={image.url} alt={`Image ${index + 1}`} className="w-16 h-16 object-cover rounded-md" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteImage(image.name)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                         
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                     
                                </div>
                            </CardContent>
                        </Card>
                    ))
                }

                {/* {contacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-2">
                            <div className="flex items-center space-x-4">
                                <Checkbox
                                    checked={selectedContacts.includes(contact.id)}
                                    onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                                />

                                <Avatar>
                                    <AvatarFallback className="bg-green-100 text-green-700">
                                        {contact.profile?.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-row items-baseline  gap-2">
                                            <h3 className="font-semibold text-gray-900 truncate">{contact.profile?.name}</h3>
                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                <Phone className="h-3 w-3 mr-1" />
                                                {contact.wa_id}
                                            </div>

                                        </div>

                                        <div className="flex flex-row gap-3">
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
                ))} */}
            </div>
        </div>
    )
}
