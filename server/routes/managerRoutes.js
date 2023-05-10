const Router = require('express')
const router = new Router()

const ManagerController = require('../controllers/managerController')

const managerMiddleware = require('../middlewares/user/checkRoleMiddleware')
const authMiddleware = require('../middlewares/user/authMiddleware')

router.get('/request', authMiddleware, managerMiddleware('MANAGER'), ManagerController.getAllRequest)
router.get('/request/:id', authMiddleware, managerMiddleware('MANAGER'), ManagerController.getOneRequest)
router.put('/request/:id', authMiddleware, managerMiddleware('MANAGER'), ManagerController.updateRequest)
router.post('/request', authMiddleware, managerMiddleware('MANAGER'), ManagerController.createAppointment)

module.exports = router