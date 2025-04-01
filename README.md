# Real-Time Chat Room Application

A modern, real-time chat application built with Next.js, Node.js, Socket.io, and MongoDB.

## Features

- Create and join chat rooms instantly
- Real-time messaging using WebSockets
- Anonymous usernames
- Message history with MongoDB
- Read receipts
- Modern UI with Tailwind CSS

## Project Structure

```
chatroom/
├── client/           # Next.js frontend application
├── server/           # Node.js backend application
└── README.md         # Project documentation
```

## Deployment Instructions

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Create a new project on Vercel
3. Connect your GitHub repository
4. Add the following environment variables:
   - `NEXT_PUBLIC_SERVER_URL`: URL of your deployed backend server
5. Deploy

### Backend Deployment (Render/Railway)

1. Push your code to GitHub
2. Create a new Web Service on Render or a project on Railway
3. Connect your repository
4. Add the following environment variables:
   - `PORT`: The port on which the server will run (usually provided by the platform)
   - `MONGODB_URI`: MongoDB connection string
   - `CLIENT_URL`: URL of your Vercel frontend deployment
5. Deploy

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatroom
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
   - Create `.env.local` in the client directory
   - Create `.env` in the server directory
   - Fill in your MongoDB connection string and other variables

4. Start the development servers:
```bash
# In the root directory
npm run dev
```

## Production URLs

- Frontend: https://chatroom-client.vercel.app
- Backend: https://chatroom-server-production.onrender.com

## Tech Stack

- Frontend: Next.js with Tailwind CSS
- Backend: Node.js with Express.js
- Real-Time: Socket.io
- Database: MongoDB Atlas
- Deployment: Vercel (Frontend), Render/Railway (Backend)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 