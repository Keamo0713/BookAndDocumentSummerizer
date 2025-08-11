LumiReads
LumiReads is a web application that enables users to search for books using the OpenLibrary API, generate summaries of book descriptions or uploaded documents (PDF/text) with the Gemini API, and create audio versions using the ElevenLabs API. The frontend is built with React, and the backend uses FastAPI, deployed on Render.
Features

Search for books by title with up to 10 results including titles, authors, and cover images.
Generate text summaries and audio in multiple languages (English, French, Spanish, Afrikaans, Zulu).
Upload PDF or text files for summarization and audio generation.
Download summaries as .txt files and audio as .mp3 files.
Responsive UI with gradient background and card-based layout.

Project Structure
LumiReads/
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── ...            # Other React files
│   ├── package.json
│   └── ...
├── server/                # FastAPI backend
│   ├── main.py            # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   ├── .env               # Environment variables (local use)
│   └── ...
├── render.yaml            # Render deployment configuration
├── README.md              # This file
└── .gitignore

Prerequisites

Node.js (v14 or higher)
Python (3.8 or higher)
npm (included with Node.js)
pip (included with Python)
Git (for version control)
API keys for:
Google Gemini API
ElevenLabs API


A GitHub account and Render account for deployment.

Setup Instructions
1. Clone the Repository
git clone https://github.com/Keamo0713/LumiReads.git
cd LumiReads

2. Set Up the Backend

Navigate to the server directory:cd server


Create a virtual environment and activate it:python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate    # Linux/Mac


Install backend dependencies:pip install -r requirements.txt


Create a .env file:echo "GEMINI_API_KEY=your_gemini_api_key" > .env
echo "ELEVENLABS_API_KEY=your_elevenlabs_api_key" >> .env

Replace with your actual API keys (not needed for Render deployment).

3. Set Up the Frontend

Navigate to the client directory:cd ../client


Install frontend dependencies:npm install



4. Run Locally

Start the backend:cd ../server
uvicorn main:app --reload


Start the frontend (new terminal):cd ../client
npm start

Open http://localhost:3000.

5. Deploy on Render

Push changes to GitHub:git add .
git commit -m "Update for deployment"
git push origin main


In Render Dashboard, create a Blueprint:
Go to New > Blueprint.
Connect https://github.com/Keamo0713/LumiReads.
Select main branch.


Set environment variables for lumireads-backend:
GEMINI_API_KEY: Your Gemini API key.
ELEVENLABS_API_KEY: Your ElevenLabs API key.


Deploy. Access:
Frontend: https://lumireads-frontend.onrender.com
Backend: https://lumireads-backend.onrender.com



Usage

Open the frontend URL.
Search Books: Enter a title (e.g., "Pride and Prejudice"), click "Search", then "Summarize" for a summary and audio.
Upload Documents: Select a language, upload a PDF/text file, click "Summarize & Voice".
Downloads: Click "Download TXT" or "Download MP3".

Example Output

Search: "Pride and Prejudice"
Result: [{"title": "Pride and Prejudice", "author": "Jane Austen", "key": "/books/OL12345M", "cover_i": 12345}, ...]
Summary: "Pride and Prejudice is a romantic novel..."
Audio: MP3 narration.


Upload: PDF chapter
Summary: "The chapter describes..."
Audio: MP3 narration.



Troubleshooting

Service Root Directory Missing:
Ensure server directory is at repository root. Check with:dir


Update Render Root Directory to server and redeploy.


Build Fails on Render:
Verify server/requirements.txt exists.
Check Render logs in Dashboard.


Frontend Connection Issues:
Ensure REACT_APP_API_URL matches backend URL (e.g., https://lumireads-backend.onrender.com).
Update CORS in main.py:app.add_middleware(CORSMiddleware, allow_origins=["https://lumireads-frontend.onrender.com"], allow_methods=["*"], allow_headers=["*"])




API Key Errors:
Confirm keys are set in Render Dashboard for lumireads-backend.


Test Backend:curl "https://lumireads-backend.onrender.com/health"



Security Notes

Store API keys in Render’s Dashboard, not .env for deployment.
Use HTTPS in production.
Add .env to .gitignore.

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/YourFeature).
Commit changes (git commit -m "Add YourFeature").
Push (git push origin feature/YourFeature).
Open a pull request.

