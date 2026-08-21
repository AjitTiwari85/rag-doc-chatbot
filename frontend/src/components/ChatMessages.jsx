function ChatMessages({
  messages = [],
  loading = false,
}) {
  const hasChatMessages = messages.some(
    (message) =>
      message.role === "user" ||
      message.role === "assistant"
  );

  if (!hasChatMessages) {
    return (
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="h-full flex items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-md text-center">

            <div className="mx-auto w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="w-6 h-6 text-neutral-500"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.5h9M7.5 12h6"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.36 0-2.65-.32-3.79-.9L4 20l.9-3.71A8.46 8.46 0 0 1 3 11.5a8.5 8.5 0 1 1 17 0Z"
                />
              </svg>
            </div>

            <h2 className="text-sm font-semibold text-neutral-800">
              Ask questions about your document
            </h2>

            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
              Ask about anything in the selected PDF.
              Answers are generated from your document.
            </p>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-0 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-3 py-5 sm:px-5 sm:py-6">

        <div className="space-y-4 sm:space-y-5">

          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const isSystem = message.role === "system";
            const isAssistant =
              message.role === "assistant";

            const isLastMessage =
              index === messages.length - 1;

            const isThinking =
              isAssistant &&
              !message.content &&
              loading &&
              isLastMessage;

            if (isSystem) {
              return (
                <div
                  key={index}
                  className="flex justify-center"
                >
                  <div className="max-w-xl rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-[11px] leading-relaxed text-blue-700 text-center">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`flex ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`
                    flex
                    items-end
                    gap-2
                    max-w-[92%]
                    sm:max-w-[80%]
                    ${isUser ? "flex-row-reverse" : ""}
                  `}
                >

                  {/* Avatar */}
                  <div
                    className={`
                      hidden sm:flex
                      shrink-0
                      w-7 h-7
                      rounded-full
                      items-center
                      justify-center
                      text-[10px]
                      font-semibold
                      ${
                        isUser
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }
                    `}
                  >
                    {isUser ? "You" : "AI"}
                  </div>

                  {/* Message */}
                  <div
                    className={`
                      min-w-0
                      px-3.5 py-2.5
                      sm:px-4 sm:py-3
                      rounded-2xl
                      text-sm
                      leading-relaxed
                      whitespace-pre-wrap
                      break-words
                      ${
                        isUser
                          ? "bg-neutral-900 text-white rounded-br-md"
                          : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-md shadow-sm"
                      }
                    `}
                  >
                    {isThinking ? (
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span className="text-xs text-neutral-400">
                          Thinking
                        </span>

                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-neutral-400 animate-pulse" />
                          <span className="w-1 h-1 rounded-full bg-neutral-400 animate-pulse [animation-delay:150ms]" />
                          <span className="w-1 h-1 rounded-full bg-neutral-400 animate-pulse [animation-delay:300ms]" />
                        </span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>

                </div>
              </div>
            );
          })}

          {/* Bottom spacing */}
          <div className="h-1" />

        </div>
      </div>
    </main>
  );
}

export default ChatMessages;