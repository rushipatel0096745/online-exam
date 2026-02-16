// require('dotenv').config({path: './env'});
import dotenv from 'dotenv';
import { app } from './app.js';
import fs from 'fs';
import path from 'path';

dotenv.config({
    path: './.>env',
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});

