import { io } from 'socket.io-client'

const token = process.argv[2]
if (!token) {
  console.log('NO_TOKEN')
  process.exit(3)
}

const s = io('http://127.0.0.1:3000', {
  auth: { token },
  transports: ['websocket', 'polling']
})

s.on('connect', () => {
  console.log('CONNECTED', s.id)
  s.emit('joinTicket', 1)
})

s.on('ticket:message', (d) => {
  console.log('EVENT_RECEIVED ticket:message', JSON.stringify(d))
  s.close()
  process.exit(0)
})

s.on('connect_error', (e) => {
  console.log('CONNECT_ERROR', e.message)
  process.exit(1)
})

setTimeout(() => {
  console.log('TIMEOUT_NO_EVENT')
  process.exit(2)
}, 15000)
