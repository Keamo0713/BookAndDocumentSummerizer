from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import io
import requests
import os
import fitz  # PyMuPDF
import base64
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow all origins (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys and Model
GEMINI_API_KEY = "AIzaSyDz2Au-LYj909Q_YFP_f0mdGV9GzzNfw_4"
GEMINI_MODEL = "models/gemini-2.5-pro"
ELEVENLABS_API_KEY = "sk_609afccecfe96fff822ec8531f51d67cc27cff50997ca91c"
ELEVENLABS_VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ"

# ----- Helper Functions -----

def extract_text(file: UploadFile) -> str:
    try:
        ext = os.path.splitext(file.filename)[-1].lower()
        if ext == ".pdf":
            doc = fitz.open(stream=file.file.read(), filetype="pdf")
            return "".join(page.get_text() for page in doc)
        return file.file.read().decode("utf-8")
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        return ""

def summarize_with_gemini(text: str, language: str = "en") -> str:
    if not text.strip():
        return "No text provided for summarization."
    url = f"https://generativelanguage.googleapis.com/v1/{GEMINI_MODEL}:generateContent"
    headers = {"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY}
    body = {
        "contents": [
            {"parts": [{"text": f"Summarize this text in {language}:\n{text}"}]}
        ]
    }
    try:
        res = requests.post(url, headers=headers, json=body)
        res.raise_for_status()
        response_data = res.json()
        logger.info(f"Gemini response for language {language}: {response_data}")
        return response_data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        logger.error(f"Gemini summarization error: {str(e)}, Response: {res.text if 'res' in locals() else 'No response'}")
        return f"Failed to summarize: {str(e)}"

def generate_audio(summary: str, language: str = "en", voice: str = ELEVENLABS_VOICE_ID) -> bytes:
    if not summary.strip():
        logger.warning("No summary provided for audio generation.")
        return None
    # Use multilingual model for non-English languages
    model_id = "eleven_multilingual_v2" if language != "en" else "eleven_monolingual_v1"
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    body = {
        "text": summary,
        "model_id": model_id,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}
    }
    try:
        res = requests.post(url, json=body, headers=headers)
        res.raise_for_status()
        logger.info(f"ElevenLabs audio generated successfully for language {language}, length: {len(res.content)} bytes")
        return res.content
    except requests.exceptions.HTTPError as e:
        logger.error(f"ElevenLabs HTTP error: {str(e)}, Status: {res.status_code}, Response: {res.text}")
        return None
    except Exception as e:
        logger.error(f"ElevenLabs TTS error: {str(e)}")
        return None

# ----- API Endpoints -----

@app.post("/summarize")
async def summarize(file: UploadFile = File(...), language: str = Form("en")):
    try:
        text = extract_text(file)
        if not text.strip():
            logger.warning("No text found in uploaded file.")
            return JSONResponse(content={"summary": "No text found in file.", "audio": None}, status_code=400)

        summary = summarize_with_gemini(text, language)
        audio_content = generate_audio(summary, language)

        response_content = {"summary": summary}
        response_content["audio"] = base64.b64encode(audio_content).decode('utf-8') if audio_content else None
        logger.info(f"File summary response: {response_content}")
        return JSONResponse(content=response_content)
    except Exception as e:
        logger.error(f"Summarize error: {str(e)}")
        return JSONResponse(content={"summary": f"An error occurred: {str(e)}", "audio": None}, status_code=500)

@app.post("/summarize_book")
async def summarize_book(book_key: str = Form(...), language: str = Form("en")):
    try:
        url = f"https://openlibrary.org{book_key}.json"
        res = requests.get(url)
        res.raise_for_status()
        book = res.json()
        description = book.get("description", "")
        if isinstance(description, dict):
            description = description.get("value", "")
        
        # Fallback if description is empty
        if not description.strip():
            logger.warning(f"No description found for book key: {book_key}")
            title = book.get("title", "Unknown Title")
            description = f"Summary of {title} is unavailable due to missing description."
        
        summary = summarize_with_gemini(description, language)
        audio_content = generate_audio(summary, language)

        response_content = {"summary": summary}
        response_content["audio"] = base64.b64encode(audio_content).decode('utf-8') if audio_content else None
        logger.info(f"Book summary response for {book_key}: {response_content}")
        return JSONResponse(content=response_content)
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenLibrary request error for book key {book_key}: {str(e)}")
        return JSONResponse(content={"summary": f"Failed to fetch book data: {str(e)}", "audio": None}, status_code=500)
    except Exception as e:
        logger.error(f"Book summarization error: {str(e)}")
        return JSONResponse(content={"summary": f"Failed to summarize the book: {str(e)}", "audio": None}, status_code=500)