from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import PyPDF2
from docx import Document
import google.generativeai as genai
from typing import Dict
import os, re

app = FastAPI()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")

# Function to extract text from PDF
def extract_text_from_pdf(file: UploadFile) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

# Function to extract text from Word document
def extract_text_from_docx(file: UploadFile) -> str:
    try:
        doc = Document(file.file)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading Word document: {str(e)}")

# Function to analyze resume using Gemini
async def analyze_resume_with_gemini(resume_text: str) -> Dict:
    prompt = """
You are a professional resume analyst and career advisor. Analyze the resume text below and provide a detailed, structured review in the following format:

### Strengths
1. **<Title>**: <Detailed explanation of the strength and its impact>
2. **<Title>**: <Detailed explanation of the strength and its impact>

### Gaps
1. **<Title>**: <Detailed explanation of the gap and why it matters>
2. **<Title>**: <Detailed explanation of the gap and why it matters>

### Suggestions
1. **<Title>**: <Detailed explanation of the suggestion and how to implement it>
2. **<Title>**: <Detailed explanation of the suggestion and how to implement it>

Guidelines:
- Use numbered lists under each section.
- Each point should begin with a short, bolded title followed by a colon and a detailed explanation.
- Avoid generic or vague feedback. Be specific and personalized to the resume content.
- Do not include any introductory or closing statements. Return only the three structured sections.

Here is the resume text to analyze:
\"\"\"
{resume_text}
\"\"\"
"""
    try:
        response = model.generate_content(prompt.format(resume_text=resume_text))
        text = response.text.strip()

        def extract_section(header: str, next_header: str = None) -> str:
            pattern = rf"### {header}\s*(.*?)\s*(?=### {next_header}|$)" if next_header else rf"### {header}\s*(.*)"
            match = re.search(pattern, text, re.DOTALL)
            if match:
                return match.group(1).strip()
            else:
                return "No information provided."

        return {
            "strengths": extract_section("Strengths", "Gaps"),
            "gaps": extract_section("Gaps", "Suggestions"),
            "suggestions": extract_section("Suggestions")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume with Gemini: {str(e)}")