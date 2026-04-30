const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const TM_EXECUTABLE = path.join(__dirname, '../c_engine/tm_sim.exe');

function runJSEngine(initialState, maxSteps, tapeInput, transitions, res) {
    const MAX_TAPE_SIZE = 10000;
    const tape = new Array(MAX_TAPE_SIZE).fill('_');
    const startPos = Math.floor(MAX_TAPE_SIZE / 2);
    
    let tapeStr = tapeInput || "EMPTY";
    if (tapeStr !== "EMPTY" && tapeStr.length > 0) {
        for(let i = 0; i < tapeStr.length; i++) {
            tape[startPos + i] = tapeStr[i];
        }
    }
    
    let head = startPos;
    let state = initialState;
    let minUsed = startPos;
    let maxUsed = tapeStr !== "EMPTY" && tapeStr.length > 0 ? startPos + tapeStr.length - 1 : startPos;
    
    const trace = [];
    let haltReason = null;
    let finalState = null;
    
    function recordStep(stepCount) {
        let pStart = minUsed - 5;
        let pEnd = maxUsed + 5;
        if (pStart < 0) pStart = 0;
        if (pEnd >= MAX_TAPE_SIZE) pEnd = MAX_TAPE_SIZE - 1;
        
        let tStr = "";
        for(let i = pStart; i <= pEnd; i++) tStr += tape[i];
        trace.push({
            step: stepCount,
            state: state,
            head: head - pStart,
            tape: tStr
        });
    }
    
    recordStep(0);
    
    let stepCount = 0;
    while(stepCount < maxSteps) {
        const symbol = tape[head];
        const trans = transitions.find(t => t.state === state && t.read === symbol);
        
        if (!trans) {
            haltReason = 'halting_state';
            finalState = state;
            break;
        }
        
        tape[head] = trans.write;
        state = trans.nextState;
        head += trans.dir;
        
        if (head < minUsed) minUsed = head;
        if (head > maxUsed) maxUsed = head;
        
        stepCount++;
        recordStep(stepCount);
    }
    
    if (stepCount >= maxSteps) {
        haltReason = 'limit_reached';
    }
    
    res.json({ trace, haltReason, finalState });
}

function encodeUTMTape(transitions, tapeInput) {
    let enc = "";
    for (const t of transitions) {
        const dir = t.dir === 1 ? 'R' : t.dir === -1 ? 'L' : 'S';
        enc += `(${t.state},${t.read},${t.nextState},${t.write},${dir});`;
    }
    enc += "#" + (tapeInput || "EMPTY");
    return enc;
}

function runCEngine(initialState, maxSteps, tapeInput, transitions, res) {
    const tmProcess = spawn(TM_EXECUTABLE);
    let outputData = '';
    let errorData = '';
    
    tmProcess.stdout.on('data', (data) => { outputData += data; });
    tmProcess.stderr.on('data', (data) => { errorData += data; });
    
    tmProcess.on('close', (code) => {
        if (code !== 0 || errorData) {
            console.error("C Engine Error:", errorData);
            return runJSEngine(initialState, maxSteps, tapeInput, transitions, res); // Fallback if C crashes
        }
        
        const lines = outputData.trim().split('\n');
        const trace = [];
        let haltReason = null;
        let finalState = null;
        
        for (const line of lines) {
            if (line.startsWith('TRACE|')) {
                const parts = line.split('|');
                trace.push({
                    step: parseInt(parts[1]),
                    state: parseInt(parts[2]),
                    head: parseInt(parts[3]),
                    tape: parts[4] ? parts[4].trim() : ''
                });
            } else if (line.startsWith('HALT|')) {
                haltReason = 'halting_state';
                finalState = parseInt(line.split('|')[2]);
            } else if (line.startsWith('LIMIT|')) {
                haltReason = 'limit_reached';
            }
        }
        res.json({ trace, haltReason, finalState });
    });
    
    tmProcess.stdin.write(`${initialState} ${maxSteps}\n`);
    const utmTape = encodeUTMTape(transitions, tapeInput);
    tmProcess.stdin.write(`${utmTape}\n`);
    tmProcess.stdin.end();
}

app.post('/api/simulate', (req, res) => {
    console.log("Simulate requested");
    const { initialState, maxSteps, tapeInput, transitions } = req.body;
    if (fs.existsSync(TM_EXECUTABLE)) {
        runCEngine(initialState, maxSteps, tapeInput, transitions, res);
    } else {
        runJSEngine(initialState, maxSteps, tapeInput, transitions, res);
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
