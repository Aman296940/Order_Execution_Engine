# Demo Video Script - Order Execution Engine

**Target Length:** 1-2 minutes  
**Format:** Screen recording with voiceover or captions

---

## Pre-Recording Setup

### Terminal Windows to Open:
1. **Terminal 1:** Server logs (main view)
2. **Terminal 2:** Create orders (will run multiple times)
3. **Terminal 3:** WebSocket client 1
4. **Terminal 4:** WebSocket client 2
5. **Terminal 5:** WebSocket client 3

### Before Recording:
- [ ] Server is running: `npm run dev`
- [ ] PostgreSQL and Redis are running
- [ ] All terminals are ready
- [ ] Screen recording software is set up
- [ ] Clear browser/terminal history for clean view

---

## Video Script

### **Scene 1: Introduction (0:00 - 0:10)**

**[Screen: Show README.md or project structure]**

**Voiceover/Captions:**
> "This is the Order Execution Engine - a high-performance system for executing DEX trades with intelligent routing between Raydium and Meteora. Let me show you how it works."

**[Action: Switch to terminal showing server running]**

---

### **Scene 2: Server Running (0:10 - 0:15)**

**[Screen: Terminal 1 - Server logs]**

**Voiceover/Captions:**
> "The server is running on port 3000, connected to PostgreSQL and Redis. Notice the clean architecture with separate services for routing, queuing, and WebSocket updates."

**[Action: Point out/highlight:**
- "Redis connected successfully"
- "Database initialized successfully"
- "Server listening on http://0.0.0.0:3000"
**]**

---

### **Scene 3: Submit Multiple Orders (0:15 - 0:35)**

**[Screen: Terminal 2 - Create orders]**

**Voiceover/Captions:**
> "Now I'll submit 5 orders simultaneously to demonstrate the queue system and concurrent processing."

**[Action: Run these commands quickly one after another:]**

```bash
# Terminal 2 - Run these in quick succession
node examples/create-order.js
node examples/create-order.js
node examples/create-order.js
node examples/create-order.js
node examples/create-order.js
```

**[Screen: Show orderIds being returned]**

**Voiceover/Captions:**
> "Each order gets a unique ID and is immediately queued for processing. Notice how fast the API responds - orders are validated and added to the queue in milliseconds."

**[Action: Copy the orderIds from output]**

---

### **Scene 4: WebSocket Connections (0:35 - 0:50)**

**[Screen: Split screen - 3 WebSocket terminals]**

**Voiceover/Captions:**
> "Let's connect WebSocket clients to watch real-time status updates for three of these orders."

**[Action: In Terminals 3, 4, 5 - Connect WebSockets:]**

```bash
# Terminal 3
node examples/websocket-client.js <orderId1>

# Terminal 4  
node examples/websocket-client.js <orderId2>

# Terminal 5
node examples/websocket-client.js <orderId3>
```

**[Screen: Show WebSocket connections established]**

**Voiceover/Captions:**
> "WebSocket connections are established. Now we'll see real-time updates as orders progress through the system."

---

### **Scene 5: Status Updates Flow (0:50 - 1:10)**

**[Screen: Show WebSocket terminals receiving updates]**

**Voiceover/Captions:**
> "Watch the status updates flow in real-time: pending, routing, building, submitted, and confirmed."

**[Action: Highlight status transitions in WebSocket terminals:**
- `pending` → Order received
- `routing` → Comparing DEX prices
- `building` → Creating transaction
- `submitted` → Transaction sent
- `confirmed` → Success with txHash
**]**

**[Screen: Show multiple orders updating simultaneously]**

**Voiceover/Captions:**
> "Notice how multiple orders are processed concurrently. The queue system handles 10 orders simultaneously with rate limiting."

---

### **Scene 6: DEX Routing Decisions (1:10 - 1:25)**

**[Screen: Terminal 1 - Server logs showing DEX routing]**

**Voiceover/Captions:**
> "The key feature is intelligent DEX routing. Let's look at the server logs to see the routing decisions."

**[Action: Scroll to/show DEX routing log entries:]**

```
DEX Routing Decision:
  Raydium: 99.37 USDC (price: 0.996723)
  Meteora: 98.69 USDC (price: 0.988897)
  Selected: raydium (99.37 USDC)
```

**Voiceover/Captions:**
> "For each order, the system fetches quotes from both Raydium and Meteora, compares prices including fees, and automatically selects the best execution price. This ensures optimal trade execution."

**[Action: Show 2-3 different routing decisions]**

---

### **Scene 7: Queue Processing (1:25 - 1:40)**

**[Screen: Terminal 1 - Show queue processing logs]**

**Voiceover/Captions:**
> "The BullMQ queue system processes orders with concurrency control. You can see multiple orders being processed in parallel."

**[Action: Highlight in logs:**
- "Order <id> added to queue"
- "Processing order <id>"
- "Job <id> completed successfully"
**]**

**Voiceover/Captions:**
> "The system handles 10 concurrent orders and processes up to 100 orders per minute, with automatic retry logic for failed executions."

---

### **Scene 8: Design Decisions Summary (1:40 - 2:00)**

**[Screen: Show architecture diagram or code structure]**

**Voiceover/Captions:**
> "Key design decisions: Market orders for simplicity, BullMQ for reliable queuing, WebSocket for real-time updates, and intelligent DEX routing for best execution. The architecture is modular and easily extensible to support limit orders and sniper orders."

**[Action: Show final WebSocket confirmations with txHashes]**

**Voiceover/Captions:**
> "All orders completed successfully with transaction hashes. The system is production-ready and deployed at [your Railway URL]."

**[Screen: Show README with deployment URL]**

---

## Detailed Action Plan

### Step-by-Step Recording Guide

#### **Preparation (5 minutes)**
1. Start PostgreSQL and Redis (if using Docker)
2. Start server: `npm run dev` in Terminal 1
3. Wait for "Server listening" message
4. Open 4 more terminal windows
5. Position windows for recording:
   - Terminal 1 (Server): Top-left, larger
   - Terminal 2 (Create orders): Top-right
   - Terminals 3-5 (WebSockets): Bottom, side-by-side

#### **Recording Steps**

1. **Record Introduction (10 seconds)**
   - Show project structure or README
   - Explain what the system does

2. **Show Server Running (5 seconds)**
   - Focus on Terminal 1
   - Highlight connection messages

3. **Create 5 Orders (20 seconds)**
   - Quickly run `node examples/create-order.js` 5 times
   - Copy orderIds as they appear
   - Show the fast API responses

4. **Connect WebSockets (15 seconds)**
   - Connect 3 WebSocket clients with different orderIds
   - Show "WebSocket connection established" messages

5. **Show Status Updates (20 seconds)**
   - Let orders process naturally
   - Highlight status transitions in WebSocket terminals
   - Show multiple orders updating

6. **Show DEX Routing (15 seconds)**
   - Scroll to server logs
   - Highlight DEX routing decision logs
   - Explain the price comparison

7. **Show Queue Processing (15 seconds)**
   - Show queue logs
   - Highlight concurrent processing
   - Show completion messages

8. **Closing (20 seconds)**
   - Show final confirmations
   - Summarize design decisions
   - Show deployment URL

---

## Tips for Recording

### **Screen Recording:**
- **Windows:** Use Windows Game Bar (Win+G) or OBS Studio
- **Mac:** Use QuickTime or OBS Studio
- **Resolution:** 1080p minimum
- **Frame Rate:** 30fps is fine

### **Terminal Setup:**
- Use larger font sizes (14-16pt)
- Use dark theme for better visibility
- Clear terminal history before recording
- Use full-screen or large terminal windows

### **Timing:**
- Practice the sequence once before recording
- Keep transitions smooth
- Don't rush - let status updates happen naturally
- Pause briefly at key moments (routing decisions, confirmations)

### **Voiceover (Optional):**
- Record voiceover separately if needed
- Or use captions/text overlays
- Keep explanations concise
- Focus on what's happening on screen

### **Editing Tips:**
- Add text overlays for key points
- Highlight important log entries
- Add arrows/annotations for routing decisions
- Speed up waiting periods (status transitions)
- Add smooth transitions between scenes

---

## Example Commands (Copy-Paste Ready)

### Terminal 2 - Create Orders:
```bash
node examples/create-order.js
# Wait for orderId, then run again
node examples/create-order.js
node examples/create-order.js
node examples/create-order.js
node examples/create-order.js
```

### Terminal 3, 4, 5 - WebSocket Clients:
```bash
# Replace <orderId> with actual IDs from Terminal 2
node examples/websocket-client.js <orderId1>
node examples/websocket-client.js <orderId2>
node examples/websocket-client.js <orderId3>
```

---

## What to Highlight in Video

✅ **Must Show:**
- [x] Server starting and connections
- [x] 5 orders being created
- [x] WebSocket connections
- [x] Status updates (pending → routing → confirmed)
- [x] DEX routing decisions in logs
- [x] Queue processing multiple orders
- [x] Final confirmations with txHashes

✅ **Nice to Have:**
- [x] Architecture diagram
- [x] Code structure
- [x] Deployment URL
- [x] Design decisions explanation

---

## Post-Recording

1. **Edit video:**
   - Trim to 1-2 minutes
   - Add captions if no voiceover
   - Add text overlays for key points
   - Smooth transitions

2. **Upload to YouTube:**
   - Title: "Order Execution Engine - DEX Routing & Real-time Updates"
   - Description: Include GitHub link and deployment URL
   - Make it Public or Unlisted
   - Add tags: #Solana #DEX #WebSocket #NodeJS

3. **Update README:**
   - Add YouTube link to README.md line 314
   - Commit and push to GitHub

---

## Quick Reference Checklist

- [ ] Server running (`npm run dev`)
- [ ] 5 terminal windows open
- [ ] Screen recorder ready
- [ ] Practice run completed
- [ ] Record video (1-2 min)
- [ ] Edit and add captions
- [ ] Upload to YouTube
- [ ] Add link to README
- [ ] Push to GitHub

**Good luck with your video! 🎥**

