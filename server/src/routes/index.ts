import { Router } from 'express';

import { getLogger } from '../logging_config';

const logger = getLogger('routes');
const router = Router();

// Example route with logging
router.get('/example', (req, res) => {
  logger.info('Example route accessed', {
    query: req.query,
    params: req.params,
  });
  res.json({ message: 'Example route' });
});

export const routes = router;
