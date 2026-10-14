import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const AIAssistant = ({ onBookRideFromAI }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your EV Ride AI Copilot. Ask me to find charging stations, predict battery ranges, estimate fares, or book rides instantly (e.g., 'Book a luxury EV from India Gate to Airport')!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Process message after short typing delay
    setTimeout(() => {
      let responseText = "I'm processing that. You can ask me to book a ride, estimate fares, check nearest charging hubs, or analyze EV range!";

      const lower = userText.toLowerCase();

      // Check if it's a ride booking query
      if (lower.includes('book') || lower.includes('ride') || lower.includes('go to') || lower.includes('travel')) {
        let pickup = 'Unnamed Road, Sultanpur, Bihar';
        let dropoff = 'Indira Gandhi International Airport, New Delhi';

        // Simple extraction logic
        if (lower.includes('from') && lower.includes('to')) {
          const fromIdx = lower.indexOf('from') + 4;
          const toIdx = lower.indexOf('to');

          if (toIdx > fromIdx) {
            pickup = userText.substring(fromIdx, toIdx).trim();
            dropoff = userText.substring(toIdx + 2).trim();
          }
        } else if (lower.includes('to')) {
          const toIdx = lower.indexOf('to') + 2;
          dropoff = userText.substring(toIdx).trim();
          pickup = 'Current Location';
        }

        // Clean trailing prefixes
        pickup = pickup.replace(/^(a|an|the|my)\s+/i, '');
        dropoff = dropoff.replace(/^(a|an|the|my)\s+/i, '');

        onBookRideFromAI(pickup, dropoff);
        responseText = `🚗 I've initialized the booking flow for you! 
        • Pickup: **${pickup}** 
        • Destination: **${dropoff}** 
        Please select your preferred EV model in the Left Panel and click 'Book Ride' to confirm!`;

        toast.success("AI Copilot auto-filled booking details!");
      }
      // Check for charger station query
      else if (lower.includes('charger') || lower.includes('charging') || lower.includes('station') || lower.includes('power')) {
        responseText = `🔋 There are 3 active charging stations nearby:
        1. **Connaught Place Hyper-Hub** (Superfast 120kW, 4 slots free)
        2. **South Ext EV Plaza** (Fast 50kW, 2 slots free)
        3. **Noida Sec-62 Charge-Point** (Slow 22kW, 6 slots free)
        Click on the 'Charging Stations' button on the map to navigate to them!`;
      }
      // Check for fare prediction query
      else if (lower.includes('fare') || lower.includes('price') || lower.includes('cost') || lower.includes('estimate')) {
        responseText = `💰 **AI Fare Prediction**: 
        - Standard EV Car rate: ₹15/km
        - Luxury EV Rate: ₹32/km
        *Note: Due to dynamic green energy credits, routes with EV swap integration receive a 10% discount!*`;
      }
      // Check for battery prediction query
      else if (lower.includes('battery') || lower.includes('range') || lower.includes('power') || lower.includes('charge')) {
        responseText = `🔋 **EV Range Analytics**:
        - Most EVs in our fleet support up to **320 km** on a full charge.
        - The current average temperature of 31°C provides optimal **98% battery efficiency**. 
        - Rain or strong headwinds may reduce efficiency by 8-12%.`;
      }
      // Check for traffic query
      else if (lower.includes('traffic') || lower.includes('jam') || lower.includes('route')) {
        responseText = `🚦 **Real-time Traffic Alert**: 
        - Ring Road has moderate congestion. 
        - Mathura Road is clear. 
        - The AI Route planner has automatically rerouted to save you 4 minutes of transit time!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  return (
    <div className="ai-assistant-wrapper">
      {/* Floating Action Button */}
      <button
        className={`ai-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant Copilot"
      >
        <span className="ai-fab-icon">{isOpen ? '✕' : '💬'}</span>
        {!isOpen && <span className="ai-fab-badge">AI</span>}
      </button>

      {/* Glassmorphism Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <span className="ai-avatar">🤖</span>
              <div>
                <div className="ai-chat-title">EV Ride AI Copilot</div>
                <div className="ai-chat-status">
                  <span className="ai-status-dot"></span> Online
                </div>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message-bubble ${msg.sender}`}>
                <div className="ai-msg-text" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                <div className="ai-msg-time">{msg.time}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask AI: 'Book ride to airport'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="ai-send-btn">
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
