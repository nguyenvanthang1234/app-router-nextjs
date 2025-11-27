'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Paper, TextField, Typography, Avatar, CircularProgress, Fab, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'
import Icon from 'src/components/Icon'
import ReactMarkdown from 'react-markdown'
import { useTranslation } from 'react-i18next'

// Type cho Message
type Message = {
  role: 'user' | 'model'
  text: string
}

// Style cho Chat Container
const ChatContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: '80px',
  right: '20px',
  width: '350px',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 9999,
  overflow: 'hidden',
  boxShadow: theme.shadows[10],
  borderRadius: '16px',
  backgroundColor: theme.palette.background.paper
}))

const MessagesArea = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '16px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#121212'
}))

const MessageBubble = styled(Box)<{ role: 'user' | 'model' }>(({ theme, role }) => ({
  maxWidth: '85%',
  padding: '10px 14px',
  borderRadius: '12px',
  wordBreak: 'break-word',
  alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
  backgroundColor: role === 'user' ? theme.palette.primary.main : theme.palette.background.default,
  color: role === 'user' ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderBottomRightRadius: role === 'user' ? '2px' : '12px',
  borderBottomLeftRadius: role === 'model' ? '2px' : '12px',
  boxShadow: theme.shadows[1],
  '& p': { margin: 0 } // Reset margin của thẻ p trong ReactMarkdown
}))

const ChatBotAI = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay? 👋' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)

    try {
      // Chuẩn bị history cho API - Lọc bỏ tin nhắn chào mừng ban đầu nếu nó là role model
      const history = messages
        .filter((_, index) => index > 0) // Bỏ tin nhắn đầu tiên (Chào mừng)
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))

      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3002'
      const res = await fetch(`${apiHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: history
        })
      })

      const data = await res.json()

      if (data.typeError) {
        setMessages(prev => [...prev, { role: 'model', text: 'Lỗi: ' + data.typeError }])
      } else {
        setMessages(prev => [...prev, { role: 'model', text: data.data?.response || data.text }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Có lỗi kết nối mạng. Vui lòng thử lại.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Nút mở chat */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <Fab color='primary' aria-label='chat' onClick={() => setIsOpen(!isOpen)}>
          <Icon icon={isOpen ? 'tabler:x' : 'tabler:message-chatbot'} fontSize={28} />
        </Fab>
      </Box>

      {/* Khung chat */}
      {isOpen && (
        <ChatContainer elevation={3}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 32, height: 32 }}>AI</Avatar>
              <Typography variant='subtitle1' fontWeight='bold'>
                Trợ lý ảo
              </Typography>
            </Box>
            <IconButton size='small' onClick={() => setIsOpen(false)} sx={{ color: 'inherit' }}>
              <Icon icon='tabler:minus' />
            </IconButton>
          </Box>

          {/* Messages */}
          <MessagesArea>
            {messages.map((msg, index) => (
              <MessageBubble key={index} role={msg.role}>
                {msg.role === 'model' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  <Typography variant='body2'>{msg.text}</Typography>
                )}
              </MessageBubble>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', pl: 1 }}>
                <CircularProgress size={16} />
                <Typography variant='caption' color='text.secondary'>
                  Đang tìm kiếm sản phẩm...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </MessagesArea>

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder='Bạn cần tìm gì?...'
              size='small'
              variant='outlined'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSend} disabled={!input.trim() || loading} color='primary'>
                    <Icon icon='tabler:send' />
                  </IconButton>
                )
              }}
            />
          </Box>
        </ChatContainer>
      )}
    </>
  )
}

export default ChatBotAI
