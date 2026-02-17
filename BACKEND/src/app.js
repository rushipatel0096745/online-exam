import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';


const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      // Add any other frontend URLs you need
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Credentials'],
  })
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());
// app.use(bodyParser())

// import the routes
import testRouter from './routes/test.route.js';
import adminRouter from './routes/admin.route.js';
import studentRouter from './routes/student.route.js';
import examRouter from './routes/exam.route.js';


// route declaration
app.use('/api/test', testRouter);
app.use('/api/admin', adminRouter)
app.use('/api/student', studentRouter)
app.use('/api/exams', examRouter)

export { app }


