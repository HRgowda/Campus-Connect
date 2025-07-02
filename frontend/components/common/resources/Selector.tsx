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
  { value: "1", name: "Physics Cycle" },
  { value: "2", name: "Chemistry Cycle" },
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
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Semester" />
      </SelectTrigger>
      <SelectContent>
        {semesters.map((semester) => (
          <SelectItem
            key={semester.value}
            value={semester.value}
            className="hover:bg-slate-700 cursor-pointer"
          >
            {semester.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}