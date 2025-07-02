"use client"

import ChannelComponent from "@/components/channel/Channels"
import ChannelCard from "@/components/channel/ChannelCard"
import axiosInstance from "@/lib/axios"
import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { userAtom } from "@/app/atoms/atoms"

interface ChannelDataProps {
  id: string
  name: string
  description: string
  created_at: string
  created_by_role: string
  created_by_id: string
  isPrivate: boolean
}

export default function ChannelPage() {
  const [channelData, setChannelData] = useState<ChannelDataProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [user] = useAtom(userAtom)

  useEffect(() => {
    const getChannels = async () => {
      try {
        const res = await axiosInstance.get<ChannelDataProps[]>("/channel/public_channels", {
          params: {
            memberId: user?.id
          }
        })
        setChannelData(res.data)
      } catch (err) {
        console.error("Failed to fetch channels:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    getChannels()
  }, [user])

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-semibold">Channels</h1>
          <p className="text-sm text-white/70 mt-1">
            Stay connected. Stay informed with the latest updates and discussions.
          </p>
        </div>
        <ChannelComponent />
      </div>

      {/* States */}
      {loading ? (
        <p className="text-white/70">Loading channels...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load channels.</p>
      ) : channelData.length === 0 ? (
        <p className="text-white/70">No public channels available.</p>
      ) : (
        <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channelData.map((channel) => (
            <ChannelCard
              key={channel.id}
              channelName={channel.name}
              channelDescription={channel.description}
              createdAt={new Date(channel.created_at).toLocaleString()} // ✅ Fixes Invalid Date
              adminName={channel.created_by_role} // TEMP until admin name is returned by API
              adminAvatar="https://example.com/avatar.jpg"
            />
          ))}
        </div>
      )}
    </div>
  )
}
