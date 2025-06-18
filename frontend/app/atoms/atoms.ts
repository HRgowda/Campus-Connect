import {atom} from "jotai"

export interface UserAtomType {
  id: string,
  name: string,
  email: string | null, 
  role: string
}

export const userAtom = atom<UserAtomType | null>(null)