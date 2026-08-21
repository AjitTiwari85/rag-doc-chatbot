function DocumentList({
  documents = [],
  selectedDocumentId,
  onSelect,
  onDelete,
  deletingId = null,
}) {
  if (!documents.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
          <span className="text-lg">📄</span>
        </div>

        <p className="text-sm font-medium text-neutral-700">
          No documents yet
        </p>

        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          Upload a PDF to start asking questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {documents.map((document) => {
        const isSelected =
          document.id === selectedDocumentId;

        const isDeleting =
          deletingId === document.id;

        return (
          <div
            key={document.id}
            className={`
              group
              flex items-center gap-1
              rounded-xl
              border
              transition-colors
              ${
                isSelected
                  ? "bg-neutral-100 border-neutral-200"
                  : "bg-transparent border-transparent hover:bg-neutral-50 hover:border-neutral-200"
              }
            `}
          >
            {/* Document */}
            <button
              type="button"
              onClick={() => onSelect(document)}
              disabled={isDeleting}
              className="
                flex-1
                min-w-0
                flex items-center
                gap-3
                px-3
                py-2.5
                text-left
                rounded-xl
                disabled:opacity-50
              "
            >
              {/* PDF Icon */}
              <div
                className={`
                  shrink-0
                  w-8 h-8
                  rounded-lg
                  flex items-center justify-center
                  ${
                    isSelected
                      ? "bg-white"
                      : "bg-neutral-100"
                  }
                `}
              >
                <span className="text-sm">
                  📄
                </span>
              </div>

              {/* Document Info */}
              <div className="min-w-0 flex-1">
                <p
                  title={document.filename}
                  className={`
                    text-xs
                    font-medium
                    truncate
                    ${
                      isSelected
                        ? "text-neutral-900"
                        : "text-neutral-700"
                    }
                  `}
                >
                  {document.filename}
                </p>

                <p className="text-[10px] text-neutral-400 mt-1">
                  {document.chunks}{" "}
                  {document.chunks === 1
                    ? "chunk"
                    : "chunks"}
                </p>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-900" />
              )}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(document.id)}
              disabled={isDeleting}
              aria-label={`Delete ${document.filename}`}
              title="Delete document"
              className="
                shrink-0
                mr-2
                w-8 h-8
                flex items-center justify-center
                rounded-lg
                text-neutral-400
                opacity-0
                group-hover:opacity-100
                focus:opacity-100
                hover:bg-red-50
                hover:text-red-600
                disabled:opacity-50
                transition
              "
            >
              {isDeleting ? (
                <span className="text-xs">
                  ...
                </span>
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
                    d="M3 6h18"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 6l-1 15H6L5 6"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 10v7"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 10v7"
                  />
                </svg>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default DocumentList;