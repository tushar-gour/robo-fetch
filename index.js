import express from 'express';
import avatarRoutes from './routes/avatarRoutes.js';

const app = express();
const PORT = 3000;

app.use('/', avatarRoutes);

app.listen(PORT, () => console.log(`RoboFetch is running on http://localhost:${PORT}`));