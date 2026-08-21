import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8000";

function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState(null);
  const [documentName, setDocumentName] = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fileInputRef = useRef(null);

  // --------------------------------------------------
  // Load Documents
  // --------------------------------------------------

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/documents`);

      if (!res.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await res.json();

      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // --------------------------------------------------
  // File Selection
  // --------------------------------------------------

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    setFile(selectedFile);
  };

  // --------------------------------------------------
  // Upload
  // --------------------------------------------------

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      const document = data.document;

      setDocumentId(document.id);
      setDocumentName(document.filename);
      setUploaded(true);

      setMessages([
        {
          role: "system",
          content: `Document uploaded successfully (${document.chunks} chunks processed). Ask me anything about it.`,
        },
      ]);

      // Refresh sidebar
      await fetchDocuments();

      // Clear selected file
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      console.error(err);
      alert(err.message || "Error connecting to server");
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------
  // Select Document
  // --------------------------------------------------

  const handleSelectDocument = (document) => {
    if (loading) return;

    setDocumentId(document.id);
    setDocumentName(document.filename);
    setUploaded(true);

    setMessages([
      {
        role: "system",
        content: `You are chatting with "${document.filename}". Ask me anything about it.`,
      },
    ]);

    setInput("");
  };

  // --------------------------------------------------
  // Delete Document
  // --------------------------------------------------

  const handleDeleteDocument = async (documentIdToDelete) => {
    if (deletingId || loading) return;

    const document = documents.find(
      (doc) => doc.id === documentIdToDelete
    );

    if (!document) return;

    const confirmed = window.confirm(
      `Delete "${document.filename}"?`
    );

    if (!confirmed) return;

    setDeletingId(documentIdToDelete);

    try {
      const res = await fetch(
        `${API_URL}/documents/${documentIdToDelete}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Failed to delete document"
        );
      }

      // Remove from sidebar immediately
      setDocuments((prev) =>
        prev.filter(
          (doc) => doc.id !== documentIdToDelete
        )
      );

      // If deleted document is currently selected
      if (documentId === documentIdToDelete) {
        handleNewDocument();
      }

    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // Chat History
  // --------------------------------------------------

  const buildHistory = () => {
    return messages
      .filter(
        (msg) =>
          msg.role === "user" ||
          msg.role === "assistant"
      )
      .map((msg) => {
        const role =
          msg.role === "user"
            ? "User"
            : "Assistant";

        return `${role}: ${msg.content}`;
      })
      .join("\n");
  };

  // --------------------------------------------------
  // Send Message
  // --------------------------------------------------

  const handleSend = async () => {
    if (
      !input.trim() ||
      loading ||
      !documentId
    ) {
      return;
    }

    const question = input.trim();

    setInput("");

    const history = buildHistory();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
      {
        role: "assistant",
        content: "",
      },
    ]);

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/chat/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            document_id: documentId,
            history,
          }),
        }
      );

      if (!res.ok || !res.body) {
        const errorData = await res
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.detail || "Stream failed"
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedText = "";

      while (true) {
        const { done, value } =
          await reader.read();

        if (done) break;

        const chunkText = decoder.decode(
          value,
          { stream: true }
        );

        accumulatedText += chunkText;

        setMessages((prev) => {
          const updated = [...prev];

          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulatedText,
          };

          return updated;
        });
      }

      const remainingText = decoder.decode();

      if (remainingText) {
        accumulatedText += remainingText;

        setMessages((prev) => {
          const updated = [...prev];

          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulatedText,
          };

          return updated;
        });
      }

    } catch (err) {
      console.error(err);

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "assistant",
          content:
            err.message ||
            "Error connecting to server",
        };

        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Keyboard
  // --------------------------------------------------

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  // --------------------------------------------------
  // New Document
  // --------------------------------------------------

  const handleNewDocument = () => {
    setFile(null);
    setUploaded(false);
    setUploading(false);
    setMessages([]);
    setInput("");
    setLoading(false);

    setDocumentId(null);
    setDocumentName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="h-screen bg-neutral-50 flex">

      {/* ============================================
          SIDEBAR
      ============================================ */}

      {sidebarOpen && (
        <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">

          {/* Sidebar Header */}

          <div className="p-4 border-b border-neutral-200">

            <div className="flex items-center justify-between">

              <h2 className="text-sm font-semibold text-neutral-800">
                Documents
              </h2>

              <button
                onClick={handleNewDocument}
                disabled={loading}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-40"
              >
                + New
              </button>

            </div>

          </div>

          {/* Document List */}

          <div className="flex-1 overflow-y-auto p-2">

            {documents.length === 0 ? (

              <div className="px-3 py-8 text-center">

                <p className="text-xs text-neutral-400">
                  No documents yet
                </p>

              </div>

            ) : (

              <div className="space-y-1">

                {documents.map((document) => {

                  const isSelected =
                    document.id === documentId;

                  const isDeleting =
                    deletingId === document.id;

                  return (
                    <div
                      key={document.id}
                      className={`group flex items-center gap-2 rounded-lg ${
                        isSelected
                          ? "bg-neutral-100"
                          : "hover:bg-neutral-50"
                      }`}
                    >

                      {/* Select Document */}

                      <button
                        onClick={() =>
                          handleSelectDocument(
                            document
                          )
                        }
                        disabled={loading}
                        className="flex-1 min-w-0 text-left px-3 py-2.5 disabled:opacity-50"
                      >

                        <div className="flex items-center gap-2">

                          <span className="text-sm">
                            📄
                          </span>

                          <span className="text-xs text-neutral-700 truncate">
                            {document.filename}
                          </span>

                        </div>

                        <p className="text-[10px] text-neutral-400 mt-1 ml-6">
                          {document.chunks} chunks
                        </p>

                      </button>

                      {/* Delete */}

                      <button
                        onClick={() =>
                          handleDeleteDocument(
                            document.id
                          )
                        }
                        disabled={
                          deletingId !== null ||
                          loading
                        }
                        title="Delete document"
                        className="mr-2 p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                      >
                        {isDeleting
                          ? "..."
                          : "🗑"}
                      </button>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

        </aside>
      )}

      {/* ============================================
          MAIN
      ============================================ */}

      <main className="flex-1 min-w-0 flex flex-col">

        {/* Header */}

        <header className="h-14 px-4 border-b border-neutral-200 bg-white flex items-center gap-3">

          <button
            onClick={() =>
              setSidebarOpen((prev) => !prev)
            }
            className="text-neutral-500 hover:text-neutral-900 text-lg"
            title="Toggle sidebar"
          >
            ☰
          </button>

          <div className="min-w-0">

            <h1 className="text-sm font-semibold text-neutral-800">
              Document Q&A
            </h1>

            {uploaded && (
              <p className="text-[11px] text-neutral-400 truncate">
                {documentName}
              </p>
            )}

          </div>

        </header>

        {/* ==========================================
            UPLOAD
        ========================================== */}

        {!uploaded && (

          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">

            <div className="w-full max-w-sm border border-dashed border-neutral-300 rounded-xl p-8 text-center bg-white">

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="fileInput"
              />

              <label
                htmlFor="fileInput"
                className="cursor-pointer text-sm text-neutral-600 hover:text-neutral-900"
              >
                {file
                  ? file.name
                  : "Click to select a PDF"}
              </label>

            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-5 py-2 bg-neutral-900 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-neutral-700 transition"
            >
              {uploading
                ? "Processing..."
                : "Upload Document"}
            </button>

          </div>

        )}

        {/* ==========================================
            CHAT
        ========================================== */}

        {uploaded && (

          <>

            {/* Messages */}

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

              <div className="max-w-3xl mx-auto space-y-4">

                {messages.map((msg, i) => (

                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-neutral-900 text-white"
                          : msg.role === "system"
                          ? "bg-blue-50 text-blue-800 text-xs"
                          : "bg-neutral-200 text-neutral-800"
                      }`}
                    >

                      {msg.content === "" &&
                      loading &&
                      i === messages.length - 1
                        ? "Thinking..."
                        : msg.content}

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* Input */}

            <div className="border-t border-neutral-200 bg-white p-4">

              <div className="max-w-3xl mx-auto">

                <div className="flex gap-2">

                  <textarea
                    value={input}
                    onChange={(e) =>
                      setInput(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your document..."
                    rows={1}
                    disabled={loading}
                    className="flex-1 resize-none border border-neutral-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 disabled:bg-neutral-100"
                  />

                  <button
                    onClick={handleSend}
                    disabled={
                      loading ||
                      !input.trim() ||
                      !documentId
                    }
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm disabled:opacity-40 hover:bg-neutral-700 transition"
                  >
                    {loading ? "..." : "Send"}
                  </button>

                </div>

                <p className="text-[11px] text-neutral-400 mt-2">
                  Press Enter to send • Shift + Enter for new line
                </p>

              </div>

            </div>

          </>

        )}

      </main>

    </div>
  );
}

export default App;