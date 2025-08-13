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
            {/* Contact List */}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((image, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-2">
                            <div className="relative">
                                {/* Image */}
                                <img
                                    src={image.url}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-32 sm:h-40 object-cover rounded-md"
                                />

                                {/* Delete Button (top-right overlay) */}
                                <button
                                    onClick={() => onDeleteImage(image.name)}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>


            <div className="grid gap-1 grid-cols-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-10 lg:gap-[10px]">

                {/* {
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
                } */}

                
               
  



            </div>
        </div>
    )
}
