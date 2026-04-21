<<<<<<< HEAD
<<<<<<< HEAD
# Universal Turing Machine Simulator

This project is a high-performance Turing Machine simulator designed for Automata Theory coursework. 
It cleanly separates core computation (C language) from interaction & visualization (React Native Web/Vite).

## Setup & Running

### Requirements
- Node.js (v18+)
- (Optional) a C compiler like GCC to compile the core engine.

### Instructions

1. **Start the Backend API:**
   ```bash
   cd backend
   npm install
   node index.js
   ```
   *Note: If `tm_sim.exe` is successfully compiled using the provided C code, the Node process will pipe inputs via IPC. If the executable is missing (e.g. no C compiler installed), a 100% compliant JavaScript fallback engine is invoked automatically!*

2. **Start the React Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Open the App:** Navigate to the local URL (usually `http://localhost:5173`).

## Features
- Dynamic tape with simulated infinite bounds arrays.
- 1s+1s binary addition, unary increments, palindrome checking, busy beavers.
- State-machine visualizer mapping the exact active transition against the tape in real time.
- Smooth playback mechanisms with adjustable UI tracing ticks.
=======

>>>>>>> 4352bb56d3491b4603175963150ab3c23d6c7f7f
=======

>>>>>>> 4352bb56d3491b4603175963150ab3c23d6c7f7f
