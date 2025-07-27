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

type Subject = {
  subjectName: string
  subjectCode: string
  id: string
}

export interface Professor {
  name: string
  email: string
  id: string
}

export const professorAtom = atom<Professor | null>(null)
export const userAtom = atom<UserAtomType | null>(null)
export const resourceAtom = atom<ResourceAtomType | null>(null)
export const selectedSubjectAtom = atom<Subject | null>(null)