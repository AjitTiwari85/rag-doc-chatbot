function UploadScreen({
  file,
  onFileChange,
  onUpload,
  uploading = false,
  fileInputRef,
}) {
  return (
    <main className="flex-1 min-h-0 overflow-y-auto bg-neutral-50">
      <div className="min-h-full flex items-center justify-center px-4 py-8 sm:px-6">

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">

            <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="w-7 h-7 text-neutral-600"
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

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11v6"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.5 14 2.5 3 2.5-3"
                />
              </svg>
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              Upload a document
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm text-neutral-400">
              Upload a PDF and start asking questions about it.
            </p>

          </div>

          {/* Upload Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 shadow-sm">

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={onFileChange}
              className="hidden"
              id="document-file-input"
            />

            {/* Drop Area */}
            <label
              htmlFor="document-file-input"
              className="
                block
                cursor-pointer
                rounded-xl
                border
                border-dashed
                border-neutral-300
                px-5
                py-8
                sm:py-10
                text-center
                hover:border-neutral-400
                hover:bg-neutral-50
                transition
              "
            >

              {file ? (
                <div className="flex flex-col items-center">

                  {/* File Icon */}
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="w-5 h-5 text-neutral-600"
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

                  <p
                    title={file.name}
                    className="max-w-full px-2 text-sm font-medium text-neutral-800 truncate"
                  >
                    {file.name}
                  </p>

                  <p className="text-xs text-neutral-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <span className="mt-3 text-[11px] text-neutral-500">
                    Click to choose another PDF
                  </span>

                </div>
              ) : (
                <div className="flex flex-col items-center">

                  {/* Upload Icon */}
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="w-5 h-5 text-neutral-600"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m7.5 8.5 4.5-4.5 4.5 4.5"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 14v4.25A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25V14"
                      />
                    </svg>
                  </div>

                  <p className="text-sm font-medium text-neutral-700">
                    Choose a PDF file
                  </p>

                  <p className="text-xs text-neutral-400 mt-1">
                    Click here to browse your files
                  </p>

                  <span className="inline-flex mt-3 px-2.5 py-1 rounded-md bg-neutral-100 text-[10px] text-neutral-500">
                    PDF only
                  </span>

                </div>
              )}

            </label>

            {/* Upload Button */}
            <button
              type="button"
              onClick={onUpload}
              disabled={!file || uploading}
              className="
                w-full
                mt-4
                h-11
                rounded-xl
                bg-neutral-900
                text-white
                text-sm
                font-medium
                hover:bg-neutral-800
                active:scale-[0.99]
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition
              "
            >
              {uploading
                ? "Processing document..."
                : "Upload Document"}
            </button>

          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-[11px] text-neutral-400">
              Your PDF will be processed into searchable chunks.
            </span>
          </div>

        </div>
      </div>
    </main>
  );
}

export default UploadScreen;