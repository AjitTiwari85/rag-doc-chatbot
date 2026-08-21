function Sidebar({
  isOpen,
  onClose,
  onNewDocument,
  children,
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed inset-0
            z-40
            bg-black/30
            backdrop-blur-[1px]
            md:hidden
          "
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-[280px]
          bg-white
          border-r border-neutral-200
          flex flex-col
          transform
          transition-transform
          duration-200
          ease-out

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:relative
          md:z-auto
          md:translate-x-0
          md:shrink-0
        `}
      >
        {/* Header */}
        <div className="h-16 px-4 border-b border-neutral-200 flex items-center justify-between shrink-0">

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-neutral-900">
              Documents
            </h2>

            <p className="text-[11px] text-neutral-400 mt-0.5">
              Your uploaded files
            </p>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="
              md:hidden
              w-8 h-8
              flex items-center justify-center
              rounded-lg
              text-neutral-500
              hover:bg-neutral-100
              hover:text-neutral-900
              transition
            "
          >
            ×
          </button>

        </div>

        {/* New Document */}
        <div className="p-3 shrink-0">

          <button
            type="button"
            onClick={onNewDocument}
            className="
              w-full
              h-10
              flex items-center
              justify-center
              gap-2
              rounded-lg
              bg-neutral-900
              text-white
              text-sm
              font-medium
              hover:bg-neutral-800
              active:scale-[0.99]
              transition
            "
          >
            <span className="text-base leading-none">
              +
            </span>

            <span>
              New Document
            </span>
          </button>

        </div>

        {/* Documents */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
          {children}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-4 py-3 shrink-0">
          <p className="text-[11px] text-neutral-400">
            PDF documents only
          </p>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;