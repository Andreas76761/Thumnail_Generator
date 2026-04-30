export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs px-4 py-3 rounded-xl shadow-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
      }`}>
        <p className="text-sm leading-relaxed font-medium">{message.content}</p>
        <p className={`text-xs mt-2 font-medium ${isUser ? 'text-blue-100' : 'text-gray-600'}`}>
          {new Date(message.timestamp).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}
