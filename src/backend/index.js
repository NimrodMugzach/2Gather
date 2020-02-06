const express = require('express');
require('./db/db');
const userRouter = require('./router/userRouter');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);

app.listen(port, () => {
    console.log('Server is running on port: ' + port);
});