import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Hash, User, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChannelCardProps {
  channelName: string;
  channelDescription: string;
  createdAt: string;
  adminName: string;
  adminAvatar?: string;
}

export default function ChannelCard({
  channelName,
  channelDescription,
  createdAt,
  adminName,
  adminAvatar,
}: ChannelCardProps) {
  return (
    <Card className="w-full max-w-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 text-white">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Hash className="h-5 w-5 " />
        <CardTitle className="text-lg font-semibold  truncate">
          {channelName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4  mt-1 flex-shrink-0" />
          <p className="text-sm  line-clamp-3">
            {channelDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4  flex-shrink-0" />
          <span className="text-sm ">
            {createdAt}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4  flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-sm ">{adminName}</span>
            <Badge variant="outline" className="text-xs ">
              Admin
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full  hover:bg-gray-100"
        >
          Join Channel
        </Button>
      </CardFooter>
    </Card>
  );
}