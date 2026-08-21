function ChatHeader({
  documentName = "",
  onMenuClick,
}) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-neutral-200">
      <div className="h-full px-4 sm:px-5 flex items-center gap-3">

        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open documents"
          className="
            md:hidden
            shrink-0
            w-9 h-9
            flex items-center justify-center
            rounded-lg
            text-neutral-600
            hover:bg-neutral-100
            hover:text-neutral-900
            active:scale-95
            transition
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              d="M4 6h16"
            />

            <path
              strokeLinecap="round"
              d="M4 12h16"
            />

            <path
              strokeLinecap="round"
              d="M4 18h16"
            />
          </svg>
        </button>

        {/* Document Icon */}
        <div className="shrink-0 w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="w-4 h-4 text-neutral-600"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 3.75A1.75 1.75 0 0 1 7.75 2h6.5L19 6.75v13.5A1.75 1.75 0 0 1 17.25 22h-9.5A1.75 1.75 0 0 1 6 20.25V3.75Z"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 2v5h5"
            />
          </svg>
        </div>

        {/* Header Content */}
        <div className="min-w-0 flex-1">

          <h1 className="text-sm font-semibold text-neutral-900">
            Document Q&A
          </h1>

          {documentName ? (
            <p
              title={documentName}
              className="text-[11px] text-neutral-400 truncate max-w-[220px] sm:max-w-md"
            >
              {documentName}
            </p>
          ) : (
            <p className="text-[11px] text-neutral-400">
              Select a document to start
            </p>
          )}

        </div>

        {/* Status */}
        {documentName && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

            <span className="text-[11px] text-neutral-400">
              Ready
            </span>
          </div>
        )}

      </div>
    </header>
  );
}

export default ChatHeader;