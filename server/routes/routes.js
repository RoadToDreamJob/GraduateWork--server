const Router = require('express')
const router = new Router()

const adminRoutes = require('./adminRoutes')
const clientRoutes = require('./clientRoutes')
const doctorRoutes = require('./doctorRoutes')
const managerRoutes = require('./managerRoutes')
const userRoutes = require('./userRoutes')

router.use('/admin', adminRoutes)
router.use('/client', clientRoutes)
router.use('/doctor', doctorRoutes)
router.use('/manager', managerRoutes)
router.use('/user', userRoutes)

module.exports = router