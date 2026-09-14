import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    { role: 'assistant', text: "Hi! Ask me things like \"earphones under Rs. 10000\" or \"show me smart watches\".", products: [] }
  ]);
  const [loading, setLoading] = useState(false);

  async function send(e) {
    e.preventDefault();
    if (!message.trim()) return;
    const userMsg = { role: 'user', text: message, products: [] };
    setConversation(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message });
      setConversation(prev => [...prev, { role: 'assistant', text: res.data.reply, products: res.data.products }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {open ? (
        <div className="card w-80 h-96 flex flex-col shadow-xl">
          <div className="flex items-center justify-between p-3 border-b border-line">
            <span className="font-medium text-sm">Shopping assistant</span>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-ink">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
            {conversation.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                <p className={`inline-block px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-forest text-white' : 'bg-forest-light text-ink'}`}>
                  {msg.text}
                </p>
                {msg.products?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.products.map(p => (
                      <Link key={p.id} to={`/products/${p.id}`} onClick={() => setOpen(false)} className="flex items-center gap-2 border border-line rounded p-1.5 hover:border-forest">
                        <img src={p.image} className="w-8 h-8 object-cover rounded" />
                        <div className="text-left">
                          <p className="text-xs font-medium leading-tight">{p.name}</p>
                          <p className="text-xs text-muted">Rs. {p.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-muted text-xs">Thinking…</p>}
          </div>
          <form onSubmit={send} className="p-3 border-t border-line flex gap-2">
            <input className="input" placeholder="Ask for a product…" value={message} onChange={e => setMessage(e.target.value)} />
            <button className="btn-primary py-2 px-3 text-sm">Send</button>
          </form>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-primary rounded-full w-14 h-14 flex items-center justify-center text-xl shadow-lg">
          💬
        </button>
      )}
    </div>
  );
}
