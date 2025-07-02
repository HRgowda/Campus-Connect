import {atom} from "jotai"

export interface UserAtomType {
  id: string,
  name: string,
  email: string | null, 
  role: string
}

export interface ResourceAtomType {
  semester: string,
}

export const userAtom = atom<UserAtomType | null>(null)
export const resourceAtom = atom<ResourceAtomType | null>(null)