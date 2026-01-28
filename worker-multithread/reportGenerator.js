const { parentPort, workerData } = require('worker_threads');


const generateReport = (checklists) => {
    return checklists.map(cl => {
        
        const reportHeader = `ARCHIVE_REPORT_${cl.id}_${Date.now()}`;
        

        for (let i = 0; i < 1e6; i++) { 
            Math.random() * Math.random(); 
        }

        return {
            id: cl.id,
            status: 'PROCESSED',
            fileName: `${reportHeader}.pdf`,
            compressedSize: '1.2MB'
        };
    });
};

const processedData = generateReport(workerData);
parentPort.postMessage(processedData);