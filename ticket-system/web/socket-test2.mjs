import { io } from 'socket.io-client'

const base = 'http://127.0.0.1:3000/api/v1'

async function main() {
  const loginRes = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'staff01', password: '123456' })
  })
  const login = await loginRes.json()
  console.log('LOGIN_OK', login.user.account)

  const s = io('http://127.0.0.1:3000', {
    auth: { token: login.token },
    transports: ['websocket', 'polling']
  })

  s.on('connect', async () => {
    console.log('SOCKET_CONNECTED', s.id)
    s.emit('joinTicket', 1)
    await new Promise((r) => setTimeout(r, 500))
    const replyRes = await fetch(base + '/tickets/1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.token },
      body: JSON.stringify({ content: 'WebSocket 实时推送验证消息' })
    })
    console.log('REPLY_STATUS', replyRes.status)
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
  }, 20000)
}

main().catch((e) => {
  console.log('FATAL', e.message)
  process.exit(3)
})
