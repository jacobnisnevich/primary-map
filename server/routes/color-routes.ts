import * as express from 'express';

import { getMapPalette } from '../service/color-service';

const router = express.Router();

router.get('/palette', async (req, res, next) => {
  try {
    const palette = await getMapPalette();
    res.send({ palette });
  } catch (e) {
    next(e);
  }
});

export default router;
