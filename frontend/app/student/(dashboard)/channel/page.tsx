"use client"

import ChannelComponent from "@/components/channel/Channels"
import { Button } from "@/components/ui/button" // if your button is used inside ChannelComponent

export default function ChannelPage() {
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

      {/* You can optionally add empty state or grid later */}
      {/* <div className="text-center text-white/50 mt-20">
        No channels yet. Start by creating one!
      </div> */}
    </div>
  )
}
