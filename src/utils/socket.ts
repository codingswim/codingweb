import { io } from 'socket.io-client'

const socketUrl = import.meta.env.PROD ? import.meta.env.VITE_SOCKET_URL : 'http://localhost:3000'

// 创建 Socket 实例
const socket = io(socketUrl, {
    // 自动重连（Socket.io 自带）
    reconnection: true,
    reconnectionAttempts: 100, // 重连次数
    reconnectionDelay: 3000, // 重连间隔
    transports: ['websocket'], // 强制使用 WebSocket 协议（不降级）
})

// 导出实例，全局使用
export default socket