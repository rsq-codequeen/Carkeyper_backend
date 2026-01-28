const { parentPort, workerData } = require('worker_threads');

/**
 * THE REASONING:
 * Thread A (Generator): Simulates high-frequency incoming GPS data.
 * Thread B (Analyzer): Independently scans that data for security breaches.
 * Both run without blocking the main Express.js API.
 */

if (workerData.role === 'GENERATOR') {
    setInterval(() => {
        const log = {
            id: Math.floor(Math.random() * 900) + 100,
            timestamp: new Date().toLocaleTimeString(),
            location: "Zone " + String.fromCharCode(65 + Math.floor(Math.random() * 6)),
            type: 'PING'
        };
        parentPort.postMessage(log);
    }, 1500); // Sends a ping every 1.5 seconds
}

if (workerData.role === 'ANALYZER') {
    parentPort.on('message', (log) => {
      
        if (log.location === 'Zone D') {
            parentPort.postMessage({
                ...log,
                type: 'ALERT',
                message: `CRITICAL: Unauthorized entry in Zone D by Vehicle ${log.id}`
            });
        }
    });
}