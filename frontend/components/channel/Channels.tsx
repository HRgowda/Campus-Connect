"use client";
import { Button } from "../ui/button";
import { useState } from "react";
import ChannelModal from "./ChannelModal";

interface FormData {
  name: string;
  description: string;
  isPrivate: boolean;
}

export default function ChannelComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    isPrivate: false,
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-6 py-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg border-0"
      >
        + Create Channel
      </Button>

      {isModalOpen && (
        <ChannelModal
          formData={formData}
          setFormData={handleInputChange}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
