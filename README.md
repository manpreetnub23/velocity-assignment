# 🚀 Project Tracker UI (Frontend Assignment)

A fully functional multi-view project management interface built with React + TypeScript.


## 🧠 Features

### 1. Multi-View System
- Kanban Board
- List View (Virtual Scrolling)
- Timeline (Gantt View)
- Instant switching using shared state (no re-fetch)

---

### 2. Custom Drag-and-Drop (No Libraries)
- Built using native pointer events
- Smooth dragging with floating card
- Placeholder maintains layout stability
- Snap-to-column drop logic
- Works for mouse interactions

---

### 3. Virtual Scrolling (List View)
- Only visible rows are rendered
- Buffer rows added to avoid flicker
- Absolute positioning used for smooth scrolling
- Handles 500+ tasks efficiently

---

### 4. Timeline / Gantt View
- Tasks rendered as horizontal bars
- Based on start and due date
- Color-coded by priority
- Today marker line included
- Horizontally scrollable

---

### 5. Filters + URL Sync
- Multi-select filters (status, priority, assignee)
- Date range filtering
- Filters update instantly
- Synced with URL query params
- Supports back/forward navigation

---

### 6. Live Collaboration Simulation
- Simulated users using interval updates
- Users randomly move between tasks
- Avatar indicators shown on cards
- Multiple users stack with overflow (+N)
- Active users displayed in header

---

### 7. Empty States
- Kanban columns show "No tasks"
- List view shows "No results"
- Timeline handles empty datasets

---

## 🏗️ Tech Stack

- React (Vite)
- TypeScript
- Zustand (state management)
- Tailwind CSS

---

## ⚙️ Setup Instructions

```bash
git clone <repo-url>
cd project
npm install
npm run 

# image of performance score 
![Performance Screenshot](./assets/performance.png)

# State Management Choice
# Zustand was used because:

# Lightweight and simple
# No boilerplate (compared to Redux)
# Easy global state sharing across views
# Perfect for UI-heavy applications

# Virtual Scrolling Approach
# Calculated visible rows using scroll position
# Only rendered visible + buffer rows
# Used a container with total height
# Positioned rows using absolute positioning

# Virtual Scrolling Approach
# Calculated visible rows using scroll position
# Only rendered visible + buffer rows
# Used a container with total height
# Positioned rows using absolute positioning

# Drag-and-Drop Approach
# Implemented using pointer events
# Card converted to floating element on drag
# Placeholder inserted to prevent layout shift
# Drop zones detected using DOM APIs
# State updated on valid drop