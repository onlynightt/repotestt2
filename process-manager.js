
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProcessManager {
    constructor() {
        this.botProcess = null;
        this.restartCount = 0;
        this.maxRestarts = 10;
        this.restartDelay = 5000; // 5 seconds
        this.lastRestartTime = 0;
        this.minRestartInterval = 30000; // 30 seconds minimum between restarts
    }

    start() {
        //console.log('🚀 Starting Discord bot with auto-restart...');
        this.spawnBot();
    }

    spawnBot() {
        try {
            this.botProcess = spawn('node', ['index.js'], {
                stdio: ['inherit', 'inherit', 'inherit'],
                cwd: process.cwd()
            });

        // console.log(`✅ Bot process started with PID: ${this.botProcess.pid}`);

            this.botProcess.on('close', (code, signal) => {
                console.log(`\n⚠️ Bot process exited with code ${code} and signal ${signal}`);
                this.handleBotExit(code, signal);
            });

            this.botProcess.on('error', (error) => {
                console.error('❌ Bot process error:', error);
                this.handleBotExit(1, 'ERROR');
            });

        } catch (error) {
            console.error('❌ Failed to start bot process:', error);
            this.scheduleRestart();
        }
    }

    handleBotExit(code, signal) {
        const now = Date.now();
        
        // If bot was intentionally stopped (code 0) or terminated by SIGTERM, don't restart
        if (code === 0 || signal === 'SIGTERM') {
            console.log('🛑 Bot was intentionally stopped. Not restarting.');
            return;
        }

        // Check if we're restarting too frequently
        if (now - this.lastRestartTime < this.minRestartInterval) {
            this.restartCount++;
            console.log(`⚠️ Restart attempt ${this.restartCount}/${this.maxRestarts}`);
            
            if (this.restartCount >= this.maxRestarts) {
                console.error('❌ Maximum restart attempts reached. Stopping auto-restart.');
                process.exit(1);
            }
        } else {
            this.restartCount = 0; // Reset counter if enough time has passed
        }

        this.lastRestartTime = now;
        this.scheduleRestart();
    }

    scheduleRestart() {
        console.log(`🔄 Scheduling bot restart in ${this.restartDelay / 1000} seconds...`);
        
        setTimeout(() => {
            console.log('🔄 Restarting bot...');
            this.spawnBot();
        }, this.restartDelay);
    }

    stop() {
        if (this.botProcess) {
            console.log('🛑 Stopping bot process...');
            this.botProcess.kill('SIGTERM');
        }
    }
}

// Handle process termination
const processManager = new ProcessManager();

process.on('SIGINT', () => {
   // console.log('\n🛑 Received SIGINT. Shutting down...');
    processManager.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down...');
    processManager.stop();
    process.exit(0);
});

// Start the process manager
processManager.start();
