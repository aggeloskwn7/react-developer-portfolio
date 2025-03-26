import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageProps {
  imageUrl: string;
  onImageUpdate: (newImageUrl: string) => void;
}

export function ProfileImage({ imageUrl, onImageUpdate }: ProfileImageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or GIF image.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/profile/image", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      
      const data = await response.json();
      onImageUpdate(data.imagePath);
      
      toast({
        title: "Success",
        description: "Profile image updated successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8 md:mb-0 relative w-[120px] h-[120px]">
      <div className="w-full h-full rounded-full overflow-hidden bg-primary-700 flex items-center justify-center border-3 border-white shadow-lg">
        <img 
          src={imageUrl || "https://via.placeholder.com/120x120"}
          alt="Profile Picture" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute right-0 bottom-0 z-10">
        <Input 
          type="file" 
          ref={inputRef}
          accept="image/jpeg,image/png,image/gif" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <Button 
          size="icon"
          onClick={handleUploadClick}
          className="rounded-full bg-accent hover:bg-accent/90 h-9 w-9"
          disabled={isUploading}
        >
          {isUploading ? (
            <i className="ri-loader-4-line animate-spin text-white"></i>
          ) : (
            <i className="ri-camera-line text-white"></i>
          )}
        </Button>
      </div>
    </div>
  );
}
