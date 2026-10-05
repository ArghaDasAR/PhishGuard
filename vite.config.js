import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Lightweight local development middleware for /api/analyze-gemma
try {
  process.loadEnvFile()
} catch {}

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/analyze-gemma')) {
          try {
            const chunks = []
            let totalBytes = 0
            const MAX_BODY = 25 * 1024 * 1024 // 25MB limit for image payloads

            for await (const chunk of req) {
              totalBytes += chunk.length
              if (totalBytes > MAX_BODY) {
                res.statusCode = 413
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, aiAvailable: false, error: 'Payload too large' }))
                return
              }
              chunks.push(chunk)
            }

            const bodyStr = Buffer.concat(chunks).toString('utf-8')
            if (bodyStr) {
              try {
                req.body = JSON.parse(bodyStr)
              } catch {
                req.body = bodyStr
              }
            }

            res.status = (code) => {
              res.statusCode = code
              return res
            }
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
              return res
            }

            const { default: handler } = await server.ssrLoadModule('./api/analyze-gemma.js')
            await handler(req, res)
          } catch (err) {
            console.error('Dev API handler error:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, aiAvailable: false, error: 'Internal dev API error' }))
          }
        } else {
          next()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
