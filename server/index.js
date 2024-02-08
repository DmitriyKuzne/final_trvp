import express from "express";
import cors from "cors";

//external imports
import mongoose from "mongoose";

//подключаем базу данных Mongo DB
mongoose.connect(
    'mongodb://127.0.0.1:27017/portApplicationDb',
    {
        //these are options to ensure that the connection is done properly
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }
)
.then(() => 
{
     console.log("Successfully connected to MongoDB Atlas!")        
})
.catch((error) => 
{
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
})  

const app = express();
//ответ с роутеров будет приходить в формате json
app.use(express.json());
//включаем возможность перехода с одного локального адреса на другой
app.use(cors());

//задаем порт сервера
const PORT = process.env.PORT || 4001;

//маршрутизаторы
import tripsRouter from './routes/Trips.js';
//подключаем маршрутизаторы запросов по рейсам
app.use("/trips", tripsRouter);

import ferriesRouter from "./routes/Ferries.js";
//подключаем маршрутизаторы запросов по паромам
app.use("/ferries", ferriesRouter);

import portAdminsRouter from "./routes/PortAdmins.js";
//подключаем маршрутизаторы запросов по администраторам порта
app.use("/auth", portAdminsRouter);

const start = async () => {
    try 
    {        
        //запускаем сервер
        await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    }
    catch (e) {
        console.log(e);
    }
} 

start();