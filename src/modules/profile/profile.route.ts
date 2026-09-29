import { Router } from 'express';
import { getProfile, upsertProfile } from './profile.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate';
import { upsertProfileSchema } from './profile.validation';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.put('/', validate(upsertProfileSchema), upsertProfile);

export default router;
