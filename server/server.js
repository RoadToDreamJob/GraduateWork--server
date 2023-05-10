require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const path = require('path')
const sequelize = require('./models/db')
const models = require('./models/models')
const routes = require('./routes/routes')
const errorHandler = require('./middlewares/errorHandlerMiddleware')

const app = express()
app.use(express.json())
app.use(cors())
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    maxFiles: 1
}))
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', routes)

/** last middleware **/
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT)
    } catch (err) {
        console.log(`The following error occurred while connecting to the database: ${err.message}`)
    }
}

start().then(() => {
    console.log(`Server start successfully on PORT ${PORT}`)
}).catch((err) => {
    console.log(`Server find next errors: ${err.message}`)
})