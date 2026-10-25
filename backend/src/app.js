import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { validateBodyShape } from './middleware/validate.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', validateBodyShape, routes);
app.use(notFound);
app.use(errorHandler);

export default app;
