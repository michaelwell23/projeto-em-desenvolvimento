import express from 'express';
import routes from './routes';

import './database';

const app = express();

app.use(routes);

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server started in port ${PORT} 🚀`);
});
