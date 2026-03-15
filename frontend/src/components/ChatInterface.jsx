import { Avatar } from './Avatar';

export function ChatInterface({ tutor, chatMessages, chatInput, setChatInput, onSendMessage, onBack, chatEndRef }) {
  if (!tutor) return null;
  return (
    <div className="page-content chat-page">
      <button className="back-btn" onClick={onBack}>← Back to Profile</button>

      <div className="chat-wrapper card">
        <div className="chat-header">
          <Avatar initials={tutor.avatar} size={44} />
          <div className="chat-header-info">
            <div className="chat-tutor-name">
              {tutor.name}
              {tutor.verified && <span className="verified-check">✓</span>}
            </div>
            <div className="chat-tutor-sub">{tutor.subject} · Replies {tutor.responseTime}</div>
          </div>
          <span className="chat-online-dot" />
        </div>

        <div className="chat-messages">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'tutor-row'}`}>
              {msg.sender === 'tutor' && (
                <Avatar initials={tutor.avatar} size={30} />
              )}
              <div className={`chat-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-tutor'}`}>
                {msg.text}
                <span className="bubble-time">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-bar">
          <input
            className="chat-input"
            placeholder={`Message ${tutor.name.split(' ')[0]}...`}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSendMessage()}
          />
          <button className="chat-send-btn" onClick={onSendMessage} disabled={!chatInput.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
