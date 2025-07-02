export type Subject = {
  name: string
  code: string
}

export const subjectsBySemester : Record<string, Subject[]> = {
  "1": [
    { name: "Mathematics - I", code: "MATH101" },
    { name: "Engineering Physics", code: "PHY101" },
    { name: "Basic Electrical Engineering", code: "EEE101" },
    { name: "Engineering Graphics", code: "ENGG101" },
    { name: "Environmental Science", code: "EVS101" },
    { name: "English Communication", code: "ENG101" },
  ],
  "2": [
    { name: "Mathematics - II", code: "MATH201" },
    { name: "Engineering Chemistry", code: "CHEM201" },
    { name: "Programming in C", code: "CSE201" },
    { name: "Mechanics", code: "MECH201" },
    { name: "Electrical Lab", code: "EEE201" },
    { name: "Soft Skills", code: "ENG201" },
  ],
  "3": [
    { name: "Data Structures", code: "CS301" },
    { name: "Discrete Mathematics", code: "MATH301" },
    { name: "Computer Organization", code: "CS302" },
    { name: "Digital Electronics", code: "ECE301" },
    { name: "OOP", code: "CS303" },
    { name: "Data Structures Lab", code: "CSL301" },
  ],
  "4": [
    { name: "Operating Systems", code: "CS401" },
    { name: "DBMS", code: "CS402" },
    { name: "Microprocessors", code: "ECE401" },
    { name: "Software Engineering", code: "CS403" },
    { name: "OOP Lab", code: "CSL402" },
    { name: "DBMS Lab", code: "CSL403" },
  ],
  "5": [
    { name: "Computer Networks", code: "CS501" },
    { name: "Compiler Design", code: "CS502" },
    { name: "Theory of Computation", code: "CS503" },
    { name: "Machine Learning", code: "CS504" },
    { name: "CN Lab", code: "CSL501" },
    { name: "ML Lab", code: "CSL502" },
  ],
  "6": [
    { name: "Full Stack Development", code: "BIS601" },
    { name: "Machine Learning", code: "BCS602" },
    { name: "Cloud Computing", code: "BCS603" },
    { name: "Renewable Energy Resources", code: "BCS604" },
    { name: "Software Testing", code: "BCSL601" },
    { name: "ML Lab", code: "BCSL602" },
  ],
  "7": [
    { name: "Cybersecurity", code: "CS701" },
    { name: "Big Data", code: "CS702" },
    { name: "IoT", code: "CS703" },
    { name: "DevOps", code: "CS704" },
    { name: "Seminar", code: "CSP701" },
    { name: "Mini Project", code: "CSP702" },
  ],
  "8": [
    { name: "Internship", code: "CSP801" },
    { name: "Project Phase 2", code: "CSP802" },
    { name: "Elective - I", code: "CSE801" },
    { name: "Elective - II", code: "CSE802" },
    { name: "Professional Ethics", code: "HSS801" },
    { name: "Technical Writing", code: "HSS802" },
  ]
}
