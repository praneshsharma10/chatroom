'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      alert('Please enter a username');
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 10);
    router.push(`/room/${newRoomId}?username=${encodeURIComponent(username)}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !username) {
      alert('Please enter both room ID and username');
      return;
    }
    router.push(`/room/${roomId}?username=${encodeURIComponent(username)}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-3xl font-bold text-center mb-8">Chat Room</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Create a Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label htmlFor="create-username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="create-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your username"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Room
              </button>
            </form>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Join a Room</h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="room-id" className="block text-sm font-medium text-gray-700">
                  Room ID
                </label>
                <input
                  type="text"
                  id="room-id"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter room ID"
                />
              </div>
              <div>
                <label htmlFor="join-username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="join-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your username"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 