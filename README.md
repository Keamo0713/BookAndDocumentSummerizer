
# 📚 BookAndDocumentSummerizer

BookAndDocumentSummerizer is a web-based application that allows users to **search books using the OpenLibrary API**, **upload PDF documents**, and receive **automated summaries** using AI. It provides a simple and user-friendly interface that helps users quickly understand books or documents without reading the entire text.

## ✨ Features

- 🔍 Search for books via OpenLibrary API
- 📤 Upload PDF files and receive AI-generated summaries
- 🧠 Extract key points and keywords using Natural Language Processing
- 📱 Responsive frontend built with React
- ⚙️ Backend API with Python (Django or Flask)
- ☁️ Deployable to Render.com with Gunicorn and pip

## 🚀 Live Demo

> Coming Soon — hosted on Render.com

## 🛠 Tech Stack

| Layer     | Technology                |
|-----------|---------------------------|
| Frontend  | React.js (JavaScript)     |
| Backend   | Python (Django or Flask)  |
| AI        | Gemini / OpenAI / Transformers |
| Hosting   | Render.com                |
| API       | OpenLibrary API, PDF parser |

## 🧪 Local Setup

### 1. Clone the repo
git clone https://github.com/keamo0713/BookAndDocumentSummerizer.git
cd BookAndDocumentSummerizer
2. Set up backend (Python)
bash
Copy
Edit
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
3. Run the backend
bash
Copy
Edit
gunicorn BookAndDocumentSummerizer.wsgi
4. Set up frontend (React)
bash
Copy
Edit
cd client
npm install
npm start
🧾 Render Deployment (Optional)
When deploying to Render.com, use the following settings:

Build Command: pip install -r requirements.txt

Start Command: gunicorn LumiReads.wsgi

Root Directory: (leave blank or use server/ if needed)

Instance Type: Starter or Free

