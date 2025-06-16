"use client"

import {
  BookText,
  FilePlus,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  NotebookPen,
  UserRound,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios"
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AppSidebarProps {
  userType: "student" | "professor";
}

export function AppSidebar({ userType }: AppSidebarProps) {
  const router = useRouter()
  const [userName, setuserName] = useState<string>("")
  const [userEmail, setuserEmail] = useState<string>("")

  const sidebarItems = userType === "student"
    ? [
        { title: "Home", icon: LayoutDashboard, url: "/student/home" },
        { title: "Campus Feed", icon: Home, url: "/student/feed" },
        { title: "Channels", icon: Users, url: "/student/channels" },
        { title: "Notes & Resources", icon: BookText, url: "/student/resources" },
        { title: "Resume Analyzer", icon: FilePlus, url: "/student/resume_analyzer" },
        { title: "Feedback Portal", icon: MessageCircle, url: "/student/feedback" },
      ]
    : [
        { title: "Home", icon: LayoutDashboard, url: "/professor/home" },
        { title: "Campus Feed", icon: Home, url: "/professor/feed" },
        { title: "Channels", icon: Users, url: "/professor/channels" },
        { title: "Upload Resources", icon: FilePlus, url: "/professor/upload" },
        { title: "Student Feedback", icon: NotebookPen, url: "/professor/feedbacks" },
      ];

  useEffect(() => {
     const userData = async () => {
      try{
        const response = await axiosInstance.get("/me")
        const userData = response.data
        setuserName(userData.name)
        setuserEmail(userData.email)
      } catch (error: any) {
        console.log(error)
    }
  }

  userData()
  }, [userType])

  const handleLogout = async () => {
    try{
      const res = await axiosInstance.post('/logout')

      localStorage.removeItem("role")

      toast("Logged out successfully!", {
        style: {
          backgroundColor: "#14532D",
          color: "#fff",
          border: "1px solid #4ADE80",
        }
      })

      if (userType == "student") {
        window.location.href = "/student/signin"
      } else {
        window.location.href = "/professor/signin"
      }
    } catch (error: any){
      console.log(error)
    }
  }
 
  return (
    <Sidebar className="bg-black">
      <SidebarContent className="p-2 flex flex-col justify-between h-full">
        {/* Top Section */}
        <div>
          <SidebarGroup>
            <SidebarGroupLabel className="text-white text-xl">
              Campus Connect
            </SidebarGroupLabel>
            <SidebarGroupContent className="pt-6">
              <SidebarMenu className="text-white space-y-4">
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center">
          <div  className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/image1.jpeg" alt="User" onClick={() => router.push("/student/profile")} className="cursor-pointer" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="text-white text-sm">
              <div className="font-medium">{userName}</div>
              <div className="text-xs text-white/70">{userEmail}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
