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
        className="border border-blue-500 text-lg p-5 rounded-md cursor-pointer hover:border-blue-700 transition-all duration-200 hover:shadow-lg"
      >
        + Create
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
