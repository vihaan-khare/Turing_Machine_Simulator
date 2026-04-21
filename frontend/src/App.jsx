import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, AlertTriangle, Settings2, Code, HardDrive } from 'lucide-react';
import { preconfiguredMachines } from './machines';

export default function App() {
  const [machineId, setMachineId] = useState(preconfiguredMachines[0].id);
  const selectedMachine = preconfiguredMachines.find(m => m.id === machineId) || preconfiguredMachines[0];
  
  const [tapeInput, setTapeInput] = useState(selectedMachine.tapeInput);
  
  const [trace, setTrace] = useState([]);
  const [haltReason, setHaltReason] = useState(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(200); // ms per step
  
  const [error, setError] = useState("");
  const isSimulated = trace.length > 0;
  
  // Update tape input when machine changes
  useEffect(() => {
    setTapeInput(selectedMachine.tapeInput);
    setTrace([]);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [machineId, selectedMachine.tapeInput]);

  const handleSimulate = async () => {
    setError("");
    try {
      const payload = {
          ...selectedMachine,
          tapeInput: tapeInput // Use current state as tape
      };
      const res = await fetch('http://localhost:3001/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setTrace(data.trace);
      setHaltReason(data.haltReason);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err) {
      setError("Failed to connect to backend engine.");
      console.error(err);
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying && trace.length > 0) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, trace, playSpeed]);

  const currentStateNode = trace.length > 0 ? trace[currentStep] : null;

  return (
    <div className="min-h-screen p-6 font-mono text-sm max-w-7xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <HardDrive className="text-indigo-500" />
          Turing Machine Simulator
        </h1>
        <div className="flex items-center gap-4">
          <select 
            value={machineId} 
            onChange={e => setMachineId(e.target.value)}
            className="bg-gray-800 border items-center border-gray-700 text-white rounded px-4 py-2"
          >
            {preconfiguredMachines.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </header>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded flex gap-3 items-center">
          <AlertTriangle /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
             
             <h2 className="text-lg text-gray-300 font-semibold mb-6 flex items-center gap-2">
                Tape Visualization
             </h2>
             
             <div className="min-h-[120px] flex items-center justify-center p-4 bg-gray-900 rounded-lg shadow-inner overflow-x-auto relative">
                {currentStateNode ? (
                  <TapeDisplay 
                    tape={currentStateNode.tape} 
                    headPos={currentStateNode.head} 
                  />
                ) : (
                  <div className="text-gray-500 italic">Run simulation to view tape</div>
                )}
             </div>

             <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={!isSimulated || currentStep >= trace.length - 1}
                    className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white flex items-center justify-center shadow-lg shadow-indigo-500/20"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button 
                    onClick={() => setCurrentStep(prev => Math.min(prev + 1, trace.length - 1))}
                    disabled={!isSimulated || isPlaying || currentStep >= trace.length - 1}
                    className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                  >
                    <SkipForward size={20} />
                  </button>
                  <button 
                    onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
                    disabled={!isSimulated}
                    className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-1 items-end">
                    <label className="text-xs text-gray-400">Speed (ms/step)</label>
                    <input 
                      type="range" 
                      min="50" max="1000" step="50"
                      value={playSpeed}
                      onChange={e => setPlaySpeed(Number(e.target.value))}
                      className="accent-indigo-500 w-32" 
                    />
                </div>
             </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex-1 flex flex-col">
             <h2 className="text-lg text-gray-300 font-semibold mb-4">Execution Trace (State: {currentStateNode ? currentStateNode.state : '-'})</h2>
             <div className="flex-1 overflow-y-auto pr-2 custom-scroll max-h-[300px]">
                {!isSimulated && <p className="text-gray-500">No trace available.</p>}
                {trace.map((t, i) => (
                  <div 
                    key={i} 
                    className={`py-2 px-3 border-b border-gray-800/50 flex justify-between cursor-pointer rounded transition-colors ${i === currentStep ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/50' : 'hover:bg-gray-800 text-gray-400'}`}
                    onClick={() => { setIsPlaying(false); setCurrentStep(i); }}
                  >
                    <span className="w-16 opacity-50">#{t.step}</span>
                    <span className="w-24">State {t.state}</span>
                    <span className="flex-1 text-right truncate opacity-80">{t.tape.substring(t.head - 5, t.head + 6)}</span>
                  </div>
                ))}
             </div>
             {haltReason && currentStep === trace.length - 1 && (
                <div className="py-3 px-4 mt-4 bg-green-500/10 text-green-400 rounded text-center border border-green-500/20 shadow-lg font-bold">
                   Halted: {haltReason.replace('_', ' ').toUpperCase()}
                </div>
             )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-xl">
            <h2 className="text-lg text-gray-300 font-semibold mb-4 flex items-center gap-2">
              <Settings2 size={18} /> Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">Initial Tape (Input string)</label>
                <input 
                  type="text" 
                  value={tapeInput}
                  onChange={e => setTapeInput(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg p-3 text-white transition-all font-mono"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Init State</label>
                  <input type="number" readOnly value={selectedMachine.initialState} className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-500 cursor-not-allowed" />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">Max Steps</label>
                  <input type="number" readOnly value={selectedMachine.maxSteps} className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              <button 
                onClick={handleSimulate}
                className="w-full py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg active:scale-[0.98] mt-4 tracking-wider flex items-center justify-center gap-2"
              >
                COMPILE &amp; RUN
              </button>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex-1 flex flex-col shadow-xl">
             <h2 className="text-lg text-gray-300 font-semibold mb-4 flex items-center gap-2">
               <Code size={18} /> Transitions Map
             </h2>
             <div className="flex-1 overflow-y-auto pr-2 px-1 max-h-[400px]">
               <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="text-gray-500 border-b border-gray-800">
                     <th className="pb-2 font-medium text-center">State</th>
                     <th className="pb-2 font-medium text-center">Read</th>
                     <th></th>
                     <th className="pb-2 font-medium text-center">Write</th>
                     <th className="pb-2 font-medium text-center">Dir</th>
                     <th className="pb-2 font-medium text-center">Next</th>
                   </tr>
                 </thead>
                 <tbody>
                 {selectedMachine.transitions.map((t, idx) => {
                    let isCurrent = false;
                    if (currentStateNode && currentStateNode.state === t.state) {
                       const symb = currentStateNode.tape[currentStateNode.head];
                       if (symb === t.read || (t.read === '_' && symb === undefined)) isCurrent = true;
                    }
                    
                    return (
                      <tr key={idx} className={`border-b border-gray-800/50 transition-colors ${isCurrent ? 'bg-indigo-500/20 text-indigo-200' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                        <td className="py-2 text-center rounded-l">{t.state}</td>
                        <td className="py-2 text-center font-bold text-indigo-400">{t.read === '_' ? 'B' : t.read}</td>
                        <td className="py-2 text-center opacity-30">→</td>
                        <td className="py-2 text-center font-bold text-green-400">{t.write === '_' ? 'B' : t.write}</td>
                        <td className="py-2 text-center"><span className="bg-gray-900 border border-gray-700 rounded px-1.5 py-0.5 text-xs">{t.dir === 1 ? 'R' : t.dir === -1 ? 'L' : 'S'}</span></td>
                        <td className="py-2 text-center text-rose-300 rounded-r">{t.nextState}</td>
                      </tr>
                    )
                 })}
                 </tbody>
               </table>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

function TapeDisplay({ tape, headPos }) {
  const windowSize = 21; 
  const half = Math.floor(windowSize / 2);
  let startIdx = headPos - half;
  
  const cells = [];
  for (let i = 0; i < windowSize; i++) {
    const idx = startIdx + i;
    const char = (idx >= 0 && idx < tape.length) ? tape[idx] : '_';
    const isHead = idx === headPos;
    
    cells.push(
      <div 
        key={idx} 
        className={`w-12 h-14 flex-shrink-0 flex items-center justify-center font-bold text-xl border-2 rounded-md ${isHead ? 'border-indigo-500 bg-indigo-500 text-white transform scale-110 shadow-lg shadow-indigo-500/50 relative z-10' : 'border-gray-800 text-gray-500 bg-gray-950'} transition-all duration-200`}
      >
        {char === '_' ? <span className="opacity-20 block scale-75">B</span> : char}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-4 relative">
       <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none rounded" />
       <div className="flex gap-1.5 items-center transition-transform duration-300 flex-nowrap" style={{ transform: 'translateX(0)' }}>
         {cells}
       </div>
    </div>
  );
}
