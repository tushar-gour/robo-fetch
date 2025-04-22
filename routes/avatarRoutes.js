import express from 'express';
import { getAvatarOutfits } from '../controllers/avatarController.js';

const router = express.Router();

router.get('/avatar', getAvatarOutfits);

export default router;
