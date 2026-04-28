import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler.js';
import notFound from './app/middlewares/notFount.js';



const app: Application = express();


app.use(express.json());
app.use(cors())
app.use(cookieParser());


app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Server is running...",
        environment: process.env.NODE_ENV,
        uptime: process.uptime().toFixed(2) + " seconds",
        timestamp: new Date().toISOString()
    })
});



app.use(globalErrorHandler);
app.use(notFound);

export default app;