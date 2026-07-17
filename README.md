# CoDraw - Collaborative Whiteboard Application

A modern, real-time collaborative whiteboard application engineered with React, Redux Toolkit, Express, and Socket.IO.

* **Multiplayer Drawing Synchronization**: Instant, low-latency drawing updates as collaborators draw freehand paths (pencil), lines, rectangles, circles, or insert text.
* **Vector Manipulation (Select & Move)**: Use the selection tool to click on any element (pencil path, shape, text) and drag it to a new location. Moving changes are broadcasted in real time.
* **Smart Session Persistence**: Auto-saves board elements per room to local disk (`server/data/rooms.json`). If the server restarts, your boards are preserved.
* **Auto-Join & Local Cache**: Stores nicknames and cursor colors in `localStorage`. Page reloads automatically auto-join the last active room if the URL room ID is present.
* **Multi-Tab Optimization**: Automatically filters out duplicate usernames and cursor rendering when multiple tabs are opened in the same browser session.
* **Canvas Tools & Navigation**:
  * **Infinite Board**: Zoom in/out at the cursor point (up to 800%) and pan around using right-click/middle-click/spacebar dragging.
  * **Settings Panels**: Context-sensitive settings (presets and custom colors, brush thickness, outline vs. solid fill).
  * **Export & Clear**: Download your board state locally as a high-quality PNG image or clear the board for the entire room.
* **Sleek Dark Mode UI**: Frosted glass floating toolbars (`backdrop-filter`) with responsive design for multiple viewport sizes.

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Redux Toolkit, Socket.IO Client, Lucide React, Custom Vanilla CSS.
* **Backend**: Node.js, Express, Socket.IO, File System Persistence.

## 📦 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js (v18.0.0 or higher recommended)
* npm (v9.0.0 or higher recommended)

### Step 1: Install Dependencies

Open two terminal sessions:

#### Terminal 1: Backend Server
```bash
cd server
npm install
```

#### Terminal 2: React Frontend
```bash
cd my-app
npm install
```

### Step 2: Start the Servers

#### Terminal 1: Start Backend Server
```bash
cd server
npm start
```
*The server will start running on port `3003`.*

#### Terminal 2: Start React Frontend
```bash
cd my-app
npm start
```
*The frontend development server will launch (usually on `http://localhost:5173`).*

### Step 3: Collaborate

1. Open your browser and navigate to the local frontend URL (e.g. `http://localhost:5173`).
2. Log in with a nickname, select a cursor color, and type a Room ID (or click **Generate**).
3. Copy the invite link from the sidebar room badge, or copy the URL (e.g. `http://localhost:5173/?room=xyz123`).
