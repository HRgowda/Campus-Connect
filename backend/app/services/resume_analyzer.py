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
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable is not set")
    print("Please set the GEMINI_API_KEY environment variable to use resume analysis")
else:
    print(f"GEMINI_API_KEY is set: {GEMINI_API_KEY[:10]}...")
    genai.configure(api_key=GEMINI_API_KEY)

# Function to list available models
def list_available_models():
    """List all available Gemini models"""
    try:
        models = genai.list_models()
        print("Available Gemini models:")
        for model in models:
            print(f"  - {model.name}")
        return [model.name for model in models]
    except Exception as e:
        print(f"Error listing models: {e}")
        return []

# Initialize the Gemini model with fallback options
def get_available_model():
    """Try to get an available Gemini model with fallback options"""
    # First, let's see what models are available
    available_models = list_available_models()
    
    # Try the most common model names (including latest versions)
    model_names = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro",
        "gemini-1.5-flash", 
        "gemini-1.5-flash-002",
        "gemini-pro",
        "gemini-pro-vision",
        "models/gemini-2.0-flash-exp",
        "models/gemini-1.5-pro",
        "models/gemini-1.5-flash",
        "models/gemini-pro"
    ]
    
    for model_name in model_names:
        try:
            model = genai.GenerativeModel(model_name)
            # Don't test the model here, just return it and test during actual use
            print(f"Successfully initialized model: {model_name}")
            return model
        except Exception as e:
            print(f"Failed to initialize model {model_name}: {e}")
            continue
    
    # If none of the common names work, try any available model
    for model_name in available_models:
        if "gemini" in model_name.lower():
            try:
                model = genai.GenerativeModel(model_name)
                print(f"Successfully initialized available model: {model_name}")
                return model
            except Exception as e:
                print(f"Failed to initialize available model {model_name}: {e}")
                continue
    
    raise Exception("No available Gemini models found. Please check your API key and model availability.")

# Initialize the model
if GEMINI_API_KEY:
    try:
        model = get_available_model()
    except Exception as e:
        print(f"Warning: Could not initialize Gemini model: {e}")
        model = None
else:
    print("Skipping Gemini model initialization - no API key provided")
    model = None

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
    if model is None:
        if not GEMINI_API_KEY:
            raise HTTPException(
                status_code=500, 
                detail="Gemini API key is not configured. Please contact support to enable resume analysis."
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail="Gemini service is currently unavailable. Please try again later or contact support."
            )
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
        error_message = str(e)
        if "404" in error_message and "not found" in error_message.lower():
            raise HTTPException(
                status_code=500, 
                detail="Gemini model is currently unavailable. Please try again later or contact support."
            )
        elif "API key" in error_message.lower():
            raise HTTPException(
                status_code=500, 
                detail="API configuration error. Please contact support."
            )
        else:
            raise HTTPException(status_code=500, detail=f"Error analyzing resume with Gemini: {error_message}")