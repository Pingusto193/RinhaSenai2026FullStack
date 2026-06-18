import 'dotenv/config'
import { join } from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'

import authRoutes from './src/routes/auth.js'
import accountRoutes from './src/routes/account.js'
import friendsRoutes from './src/routes/friends.js'
import dashboardRoutes from './src/routes/dashboard.js'
import transfersRoutes from './src/routes/transfers.js'
import investmentsRoutes from './src/routes/investments.js'
import expensesRoutes from './src/routes/expenses.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(join(import.meta.dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/friends', friendsRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/transfers', transfersRoutes)
app.use('/api/investments', investmentsRoutes)
app.use('/api/expenses', expensesRoutes)

app.use(express.static(join(import.meta.dirname, 'frontend/dist')))
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(import.meta.dirname, 'frontend/dist/index.html'))
})

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
})
