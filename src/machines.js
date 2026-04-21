export const preconfiguredMachines = [
  {
    id: "binary_addition",
    name: "Addition (1s + 1s = )",
    initialState: 0,
    maxSteps: 500,
    tapeInput: "111+11=",
    transitions: [
      { state: 0, read: '1', write: '1', dir: 1, nextState: 0 },
      { state: 0, read: '+', write: '1', dir: 1, nextState: 1 },
      { state: 1, read: '1', write: '1', dir: 1, nextState: 1 },
      { state: 1, read: '=', write: '_', dir: -1, nextState: 2 },
      { state: 2, read: '1', write: '=', dir: -1, nextState: 3 },
      { state: 3, read: '1', write: '1', dir: -1, nextState: 3 },
      { state: 3, read: '_', write: '_', dir: 1, nextState: 99 } // 99 is Halt
    ]
  },
  {
    id: "unary_increment",
    name: "Unary Increment",
    initialState: 0,
    maxSteps: 200,
    tapeInput: "1111",
    transitions: [
      { state: 0, read: '1', write: '1', dir: 1, nextState: 0 },
      { state: 0, read: '_', write: '1', dir: 0, nextState: 99 }
    ]
  },
  {
    id: "palindrome",
    name: "Palindrome Recognition",
    initialState: 0,
    maxSteps: 600,
    tapeInput: "101101",
    transitions: [
      { state: 0, read: '0', write: '_', dir: 1, nextState: 1 },
      { state: 0, read: '1', write: '_', dir: 1, nextState: 2 },
      { state: 0, read: '_', write: 'Y', dir: 0, nextState: 99 }, 
      
      { state: 1, read: '0', write: '0', dir: 1, nextState: 1 },
      { state: 1, read: '1', write: '1', dir: 1, nextState: 1 },
      { state: 1, read: '_', write: '_', dir: -1, nextState: 3 },
      
      { state: 2, read: '0', write: '0', dir: 1, nextState: 2 },
      { state: 2, read: '1', write: '1', dir: 1, nextState: 2 },
      { state: 2, read: '_', write: '_', dir: -1, nextState: 4 },
      
      { state: 3, read: '0', write: '_', dir: -1, nextState: 5 },
      { state: 3, read: '1', write: 'N', dir: 0, nextState: 99 }, 
      { state: 3, read: '_', write: 'Y', dir: 0, nextState: 99 }, 
      
      { state: 4, read: '1', write: '_', dir: -1, nextState: 5 },
      { state: 4, read: '0', write: 'N', dir: 0, nextState: 99 }, 
      { state: 4, read: '_', write: 'Y', dir: 0, nextState: 99 }, 
      
      { state: 5, read: '0', write: '0', dir: -1, nextState: 5 },
      { state: 5, read: '1', write: '1', dir: -1, nextState: 5 },
      { state: 5, read: '_', write: '_', dir: 1, nextState: 0 }
    ]
  },
  {
    id: "busy_beaver",
    name: "Busy Beaver (3-State)",
    initialState: 0,
    maxSteps: 100,
    tapeInput: "_",
    transitions: [
      { state: 0, read: '_', write: '1', dir: 1, nextState: 1 },
      { state: 0, read: '1', write: '1', dir: -1, nextState: 2 },
      
      { state: 1, read: '_', write: '1', dir: -1, nextState: 0 },
      { state: 1, read: '1', write: '1', dir: 1, nextState: 1 },
      
      { state: 2, read: '_', write: '1', dir: -1, nextState: 1 },
      { state: 2, read: '1', write: '1', dir: 0, nextState: 99 }
    ]
  }
];
