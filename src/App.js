import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import "./index.css";

function App() {
    const [language, setLanguage] = useState("en");
    const [searchTerm, setSearchTerm] = useState("");
    const [bookResults, setBookResults] = useState([]);
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lastBookKey, setLastBookKey] = useState("");
    const backendUrl = "http://localhost:8000"; // Change to 8001 if needed

    // 🔍 Direct OpenLibrary Search
    const searchBooks = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setError("");
        try {
            const res = await axios.get(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}`
            );
            const topResults = res.data.docs.slice(0, 10).map((doc) => ({
                title: doc.title,
                author: doc.author_name?.[0] || "Unknown",
                cover_i: doc.cover_i,
                key: doc.key,
            }));
            setBookResults(topResults);
        } catch (err) {
            console.error("OpenLibrary search failed:", err);
            setError("Failed to search books. Please try again.");
            setBookResults([]);
        }
    };

    // 📖 Summarize book
    const summarizeBook = async (bookKey) => {
        setLoading(true);
        setSummary("");
        setAudioUrl("");
        setError("");
        setLastBookKey(bookKey);

        try {
            const params = new URLSearchParams();
            params.append("book_key", bookKey);
            params.append("language", language);

            const res = await axios.post(`${backendUrl}/summarize_book`, params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            console.log("Book summary response:", res.data); // Debug response

            const data = res.data;

            if (data.summary) {
                setSummary(data.summary);
            } else {
                setSummary("No summary received.");
                setError("No summary provided by the backend.");
            }

            if (data.audio) {
                const audioBlob = b64toBlob(data.audio, "audio/mpeg");
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
            } else {
                setError("Audio generation failed. Check backend logs or ElevenLabs API key.");
            }
        } catch (err) {
            console.error("Summarize book error:", err);
            setSummary("Error summarizing book. Is backend running?");
            setError(`Failed to summarize book: ${err.message}. Try again or check backend.`);
        } finally {
            setLoading(false);
        }
    };

    // 📁 Summarize uploaded file
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        setSummary("");
        setAudioUrl("");
        setError("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", language);

        try {
            const res = await axios.post(`${backendUrl}/summarize`, formData);
            console.log("File summary response:", res.data); // Debug response

            const data = res.data;

            if (data.summary) {
                setSummary(data.summary);
            } else {
                setSummary("No summary received.");
                setError("No summary provided by the backend.");
            }

            if (data.audio) {
                const audioBlob = b64toBlob(data.audio, "audio/mpeg");
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
            } else {
                setError("Audio generation failed. Check backend logs or ElevenLabs API key.");
            }
        } catch (err) {
            console.error("File summarization failed:", err);
            setSummary("Failed to summarize file. Check backend.");
            setError(`Failed to summarize file: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const downloadSummary = () => {
        const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "summary.txt");
    };

    const downloadAudio = () => {
        if (audioUrl) {
            fetch(audioUrl)
                .then((r) => r.blob())
                .then((b) => saveAs(b, "summary.mp3"));
        }
    };

    // Helper function to convert base64 to Blob
    const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-indigo-900 text-white py-6 px-4 sm:px-6 lg:px-8 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src="/logo.png"
                            alt="App Logo"
                            className="h-12 w-12 rounded-full"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/48")}
                        />
                        <h1 className="text-2xl font-bold tracking-tight">
                            Book & Document Summarizer
                        </h1>
                    </div>
                    <nav className="hidden md:flex space-x-6">
                        <a href="#search" className="text-indigo-100 hover:text-white transition">Search Books</a>
                        <a href="#upload" className="text-indigo-100 hover:text-white transition">Upload Files</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Summarize Books and Documents
                    </h2>
                    <p className="mt-3 text-lg text-gray-600">
                        Search for books or upload files to get instant summaries and audio narration in multiple languages
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md flex items-center justify-between">
                        <p>{error}</p>
                        {lastBookKey && error.includes("summarize book") && (
                            <button
                                onClick={() => summarizeBook(lastBookKey)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition font-medium"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Book Search Section */}
                    <section id="search" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Search Free Books</h3>
                        <form onSubmit={searchBooks} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language for Summary
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-700 bg-white transition duration-200"
                                >
                                    <option value="en">English</option>
                                    <option value="fr">French</option>
                                    <option value="es">Spanish</option>
                                    <option value="af">Afrikaans</option>
                                    <option value="zu">Zulu</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by book title..."
                                    className="flex-grow p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-700 placeholder-gray-400 bg-white transition duration-200"
                                />
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition duration-200 font-medium"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                        <div className="overflow-y-auto max-h-[28rem] space-y-4 mt-6 pr-2">
                            {bookResults.map((book, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition duration-200 border border-gray-100"
                                >
                                    {book.cover_i ? (
                                        <img
                                            src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                                            alt={`${book.title} cover`}
                                            className="w-16 h-24 rounded-md object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm">
                                            No Cover
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                        <h4 className="text-lg font-medium text-gray-900 line-clamp-2">{book.title}</h4>
                                        <p className="text-sm text-gray-600">by {book.author}</p>
                                    </div>
                                    <button
                                        onClick={() => summarizeBook(book.key)}
                                        disabled={loading}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition duration-200 font-medium"
                                    >
                                        Summarize
                                    </button>
                                </div>
                            ))}
                            {bookResults.length === 0 && searchTerm && (
                                <p className="text-gray-500 text-center py-4">No books found for "{searchTerm}".</p>
                            )}
                        </div>
                    </section>

                    {/* File Upload Section */}
                    <section id="upload" className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Upload PDF or Text</h3>
                        <form onSubmit={handleUpload} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language for Summary
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-700 bg-white transition duration-200"
                                >
                                    <option value="en">English</option>
                                    <option value="fr">French</option>
                                    <option value="es">Spanish</option>
                                    <option value="af">Afrikaans</option>
                                    <option value="zu">Zulu</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Choose File (PDF or Text)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition duration-200"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !file}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition duration-200 font-medium"
                            >
                                {loading ? "Processing..." : "Summarize & Generate Voice"}
                            </button>
                        </form>
                    </section>

                    {/* Summary Display Section */}
                    {summary && (
                        <section className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg mt-8 border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Summary</h3>
                            <textarea
                                value={summary}
                                readOnly
                                rows={8}
                                className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 resize-none bg-gray-50 focus:outline-none"
                            />
                            <div className="flex flex-wrap gap-4 mt-6 items-center">
                                <button
                                    onClick={downloadSummary}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition duration-200 font-medium"
                                >
                                    Download Summary (TXT)
                                </button>
                                {audioUrl && (
                                    <>
                                        <audio
                                            controls
                                            src={audioUrl}
                                            className="flex-grow max-w-md"
                                        />
                                        <button
                                            onClick={downloadAudio}
                                            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 transition duration-200 font-medium"
                                        >
                                            Download Audio (MP3)
                                        </button>
                                    </>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center space-x-3 text-gray-900 font-medium">
                            <svg
                                className="animate-spin h-6 w-6 text-indigo-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                            </svg>
                            <span>Processing, please wait...</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;