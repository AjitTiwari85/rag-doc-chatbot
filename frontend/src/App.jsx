import { useState, useRef } from "react";

const API_URL = "http://localhost:8000";

function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setUploaded(true);
        setMessages([
          { role: "system", content: `Document uploaded successfully (${data.chunks} chunks processed). Ask me anything about it.` },
        ]);
      } else {
        alert(data.detail || "Upload failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const question = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.detail}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to server" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col h-screen">

        {/* Header */}
        <div className="py-4 px-4 border-b border-neutral-200">
          <h1 className="text-lg font-medium text-neutral-800">Document Q&A</h1>
        </div>

        {/* Upload Section */}
        {!uploaded && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
            <div className="w-full max-w-sm border border-dashed border-neutral-300 rounded-xl p-8 text-center bg-white">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer text-sm text-neutral-600 hover:text-neutral-900"
              >
                {file ? file.name : "Click to select a PDF"}
              </label>
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-5 py-2 bg-neutral-900 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-neutral-700 transition"
            >
              {uploading ? "Processing..." : "Upload Document"}
            </button>
          </div>
        )}

        {/* Chat Section */}
        {uploaded && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-neutral-900 text-white"
                        : msg.role === "system"
                        ? "bg-blue-50 text-blue-800 text-xs"
                        : "bg-neutral-200 text-neutral-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-200 px-4 py-2 rounded-2xl text-sm text-neutral-500">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="border-t border-neutral-200 p-4">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your document..."
                  rows={1}
                  className="flex-1 resize-none border border-neutral-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm disabled:opacity-40 hover:bg-neutral-700 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;