'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface Message {
  id: string;
  content: string;
  username: string;
  timestamp: Date;
  readBy: Array<{ username: string; timestamp: Date }>;
}

export default function ChatRoom() {
  const searchParams = useSearchParams();
  const params = useParams();
  const roomId = params.roomId as string;
  const username = searchParams.get('username');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId || !username) return;

    // Get the server URL from environment variables
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5002';
    console.log('Connecting to server:', serverUrl);
    
    // Configure Socket.io with error handling and reconnection
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],  // Try websocket first, fallback to polling
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    // Setup connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server with ID:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    setSocket(newSocket);

    // Join room
    newSocket.emit('join_room', roomId);

    // Fetch message history
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/rooms/${roomId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data));

    // Listen for new messages
    newSocket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for read receipts
    newSocket.on('message_read_receipt', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                readBy: [...msg.readBy, { username, timestamp: new Date() }],
              }
            : msg
        )
      );
    });

    return () => {
      newSocket.emit('leave_room', roomId);
      newSocket.disconnect();
    };
  }, [roomId, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      roomId,
      message: newMessage,
      username,
    });

    setNewMessage('');
  };

  if (!roomId || !username) {
    return <div>Invalid room or username</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Room: {roomId}</h1>
          <p className="text-gray-600">Logged in as: {username}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.username === username ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.username === username
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <div className="text-sm font-semibold mb-1">
                  {message.username}
                </div>
                <div className="break-words">{message.content}</div>
                <div className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                {message.readBy.length > 0 && (
                  <div className="text-xs mt-1 opacity-75">
                    Read by: {message.readBy.map((r) => r.username).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white shadow-md p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
} 