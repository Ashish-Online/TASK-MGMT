import { Router } from 'express';
import { registerOrganization, login, changePasswordController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { registerOrganizationSchema } from '../validations/auth.validation.js';
import { loginSchema } from '../validations/auth.validation.js';
import auth from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register-organization',  validate(registerOrganizationSchema) , registerOrganization);
router.post('/login', validate(loginSchema), login);
router.patch("/change-password", auth, changePasswordController);

export default router;