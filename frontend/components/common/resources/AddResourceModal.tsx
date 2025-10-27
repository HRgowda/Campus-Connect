"use client"

import { useState } from 'react';
import { useAtom } from 'jotai';
import { BookOpen, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resourceAtom, selectedSubjectAtom } from '@/app/atoms/atoms';
import axiosInstance from "@/lib/axios";
import { showSuccessToast, showErrorToast } from "@/lib/toastUtils";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const semesters = [
  { value: "P", name: "Physics Cycle" },
  { value: "C", name: "Chemistry Cycle" },
  { value: "3", name: "3rd Semester" },
  { value: "4", name: "4th Semester" },
  { value: "5", name: "5th Semester" },
  { value: "6", name: "6th Semester" },
  { value: "7", name: "7th Semester" },
  { value: "8", name: "8th Semester" },
];

export default function AddResourceModal({ isOpen, onClose }: AddResourceModalProps) {
  const [resourceName, setResourceName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [resource] = useAtom(resourceAtom);
  const [selectedSubject] = useAtom(selectedSubjectAtom);

  // Map the selected semester value to its name for display
  const selectedSemester = semesters.find((sem) => sem.value === resource?.semester)?.name || 'Not selected';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resource?.semester || !selectedSubject?.subjectCode || !file) return; // Prevent submission if required fields are missing

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceName', resourceName);
      formData.append('subjectId', selectedSubject.id);

      await axiosInstance.post("/professor/upload_resource", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccessToast("Resource added successfully!");

      setResourceName('');
      setFile(null);
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || "Error while adding resource. Please try again.";
      showErrorToast(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md mx-auto border border-border animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen size={20} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">Add New Resource</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors p-1 rounded-full hover:bg-accent"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Semester Display */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Semester</label>
            <p className="text-card-foreground px-4 py-3 bg-muted border border-border rounded-lg font-medium">
              {selectedSemester}
            </p>
          </div>

          {/* Resource Name Field */}
          <div className="space-y-2">
            <label htmlFor="resourceName" className="block text-sm font-medium text-foreground">
              Resource Name
            </label>
            <Input
              id="resourceName"
              type="text"
              value={resourceName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResourceName(e.target.value)}
              className="w-full border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="Enter resource name"
              required
            />
          </div>

          {/* File Upload Field */}
          <div className="space-y-2">
            <label htmlFor="file" className="block text-sm font-medium text-foreground">
              Upload File
            </label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="w-full border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent hover:text-accent-foreground py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Cancel</span>
              <X size={16} />
            </Button>
            <Button
              type="submit"
              disabled={!resource?.semester || !selectedSubject?.subjectCode || !file}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Submit</span>
              <Check size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}