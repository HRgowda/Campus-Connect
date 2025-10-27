"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAtom } from "jotai"
import { resourceAtom } from "@/app/atoms/atoms"

const semesters = [
  { value: "P", name: "Physics Cycle" },
  { value: "C", name: "Chemistry Cycle" },
  { value: "3", name: "3rd Semester" },
  { value: "4", name: "4th Semester" },
  { value: "5", name: "5th Semester" },
  { value: "6", name: "6th Semester" },
  { value: "7", name: "7th Semester" },
  { value: "8", name: "8th Semester" },
]

export default function SemesterSelector() {
  const [, setResourceAtom] = useAtom(resourceAtom)

  return (
    <Select
      onValueChange={(value: string) => {
        setResourceAtom({semester : value})
      }}
    >
      <SelectTrigger className="w-[200px] border-input focus:ring-2 focus:ring-primary focus:border-transparent">
        <SelectValue placeholder="Select Semester" />
      </SelectTrigger>
      <SelectContent>
        {semesters.map((semester) => (
          <SelectItem
            key={semester.value}
            value={semester.value}
            className="hover:bg-accent hover:text-accent-foreground cursor-pointer focus:bg-accent focus:text-accent-foreground"
          >
            {semester.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}