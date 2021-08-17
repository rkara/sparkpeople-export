const express = require('express');
const cors = require('cors');

import { BlogController } from './api/blog.controller';

const app = express();
app.use(cors());

app.use('/api/blogs', BlogController);

app.use('/', express.static('dist/spark-backup'));

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Api started on port ${port}`));
