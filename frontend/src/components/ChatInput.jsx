function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled = false,
  loading = false,
  hasDocument = false,
}) {
  const canSend =
    Boolean(value?.trim()) &&
    !disabled &&
    !loading &&
    hasDocument;

  return (
    <div className="shrink-0 border-t border-neutral-200 bg-white">
      <div className="w-full max-w-3xl mx-auto px-3 py-3 sm:px-5 sm:py-4">

        {/* Input Container */}
        <div
          className={`
            flex items-end gap-2
            rounded-2xl
            border
            px-2
            py-2
            transition
            ${
              disabled
                ? "bg-neutral-50 border-neutral-200"
                : "bg-white border-neutral-300 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-100"
            }
          `}
        >

          {/* Textarea */}
          <textarea
            value={value}
            onChange={(e) =>
              onChange(e.target.value)
            }
            onKeyDown={onKeyDown}
            disabled={disabled}
            rows={1}
            placeholder={
              hasDocument
                ? "Ask a question about your document..."
                : "Select a document first..."
            }
            aria-label="Ask a question"
            className="
              flex-1
              min-w-0
              max-h-32
              resize-none
              bg-transparent
              px-2
              py-2
              text-sm
              leading-5
              text-neutral-800
              placeholder:text-neutral-400
              outline-none
              disabled:cursor-not-allowed
            "
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            aria-label="Send message"
            className="
              shrink-0
              w-9 h-9
              rounded-xl
              flex items-center justify-center
              bg-neutral-900
              text-white
              hover:bg-neutral-800
              active:scale-95
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 animate-spin"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="30 20"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 3 10.5 13.5"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 3-6.75 18-3.75-7.5L3 9.75 21 3Z"
                />
              </svg>
            )}
          </button>

        </div>

        {/* Hint */}
        <div className="flex items-center justify-center mt-2">
          <p className="text-[10px] sm:text-[11px] text-neutral-400">
            <span className="hidden sm:inline">
              Press Enter to send · Shift + Enter for new line
            </span>

            <span className="sm:hidden">
              Enter to send · Shift + Enter for new line
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default ChatInput;