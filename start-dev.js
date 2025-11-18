import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

console.log('🚀 Starting Auditor Veritas development environment...\n')

// Start backend
console.log('📡 Starting backend server...')
const backend = spawn('node', ['server.js'], {
  cwd: join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
})

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('🎨 Starting frontend development server...')
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  })

  // Handle process exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...')
    backend.kill()
    frontend.kill()
    process.exit()
  })
}, 2000)