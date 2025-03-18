import React, { useCallback } from 'react';

type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSubmit,
  isLoading,
}) => {
  // Using useCallback to ensure the handler has a stable reference.
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!event || !event.target) {
        console.error("onChange: event or event.target is undefined", event);
        return;
      }
      // Extract the value immediately to avoid issues with synthetic events being recycled.
      const newValue = event.target.value;
      setInput(newValue);
    },
    [setInput]
  );

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={input}
        onChange={onChange}
        placeholder="Enter your message..."
        disabled={isLoading}
        className="flex-1 border rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
