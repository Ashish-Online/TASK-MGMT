import { Router } from 'express';
import authRoutes from './auth.routes.js';
import roleRouters from './role.routes.js';
import permissionRouters from './permission.routes.js';
import DashboardRouters from './dashboard.routes.js';
import NotificationRouters from './notification.routes.js';
import Task from './task.routes.js';
import TaskActivity from './taskActivity.routes.js';
import TaskComment from './taskComment.routes.js';
import User from './user.routes.js';
import TaskAttachment from '../routes/taskAttachment.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Workflow Engine API is running'
  });
});


router.use('/auth', authRoutes);
router.use('/role', roleRouters);
router.use('/permission', permissionRouters);
router.use('/dashboard', DashboardRouters);
router.use('/notification', NotificationRouters);
router.use('/task', Task);
router.use('/taskActivity', TaskActivity);
router.use('/taskComment', TaskComment);
router.use('/user', User);
router.use('/taskAttachment', TaskAttachment)


export default router;