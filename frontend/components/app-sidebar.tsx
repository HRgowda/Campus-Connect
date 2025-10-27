"use client"

import {
  BookText,
  FilePlus,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  NotebookPen,
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
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { showSuccessToast } from "@/lib/toastUtils";

interface AppSidebarProps {
  userType: "student" | "professor";
}

export function AppSidebar({ userType }: AppSidebarProps) {
  const router = useRouter();
  const [userName, setuserName] = useState<string>("");
  const [userEmail, setuserEmail] = useState<string>("");

  const sidebarItems =
    userType === "student"
      ? [
          { title: "Home", icon: LayoutDashboard, url: "/student/home" },
          { title: "Campus Feed", icon: Home, url: "/student/feed" },
          { title: "Channels", icon: Users, url: "/student/channel" },
          { title: "Notes & Resources", icon: BookText, url: "/student/resources" },
          { title: "Resume Analyzer", icon: FilePlus, url: "/student/resume_analyzer" },
          { title: "Feedback Portal", icon: MessageCircle, url: "/student/feedback_portal" },
        ]
      : [
          { title: "Home", icon: LayoutDashboard, url: "/professor/home" },
          { title: "Campus Feed", icon: Home, url: "/professor/feed" },
          { title: "Channels", icon: Users, url: "/professor/channels" },
          { title: "Notes & Resources", icon: FilePlus, url: "/professor/resources" },
          { title: "Student Feedback", icon: NotebookPen, url: "/professor/feedbacks" },
        ];

  useEffect(() => {
    const userData = async () => {
      try {
        const response = await axiosInstance.get("/me");
        const userData = response.data;
        setuserName(userData.name);
        setuserEmail(userData.email);
      } catch (error: any) {
        console.log(error);
      }
    };

    userData();
  }, [userType]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
      localStorage.removeItem("role");
      showSuccessToast("Logged out successfully!");
      if (userType == "student") {
        window.location.href = "/student/signin";
      } else {
        window.location.href = "/professor/signin";
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <Sidebar className="bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50 border-r border-sidebar-border shadow-xl">
      <SidebarContent className="p-4 flex flex-col justify-between h-full">
        {/* Top Section */}
        <div>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground text-2xl font-bold mb-6 text-center">
              Campus Connect
            </SidebarGroupLabel>
            <SidebarGroupContent className="pt-2">
              <SidebarMenu className="text-sidebar-foreground space-y-2">
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full rounded-lg transition-all duration-200">
                      <a
                        href={item.url}
                        className="flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium text-sidebar-foreground hover:text-blue-700 transition-all duration-200"
                      >
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md flex-shrink-0">
                          <item.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="flex-1 whitespace-normal break-words">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-sidebar-border bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl mx-2 mb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-blue-200 hover:ring-blue-300 transition-all duration-300">
                  <AvatarImage
                    src="/image1.jpeg"
                    alt="User"
                    onClick={() => router.push("/student/profile")}
                    className="cursor-pointer hover:scale-105 transition-transform duration-300"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                    {userName ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2) : "CN"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="text-sidebar-foreground text-sm">
                <div className="font-semibold text-base">{userName}</div>
                <div className="text-xs text-sidebar-foreground/70 break-all max-w-[140px]">{userEmail}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:bg-red-100 hover:text-red-600 transition-all duration-300 rounded-xl p-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}