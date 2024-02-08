import express from "express";
const router = express.Router();
//вытаскиваем модель базы данных по лайкам
import FerriesModel from "../models/Ferries.js";

//маршрутизатор запроса на получение всей информации о названиях паромов
router.get("/ferriesNames", async (_, res) => {

    let listOfFerriesNames = [];
    const listOfFerries = await FerriesModel.find().exec();

    await listOfFerries.map((item) => {
        listOfFerriesNames.push(item.ferryName);
    })

    //отправляем результат на клиент-приложение проекта
    res.json({listOfFerriesNames: listOfFerriesNames});
});

router.get("/", async (_, res) => {

    let listOfFerries = await FerriesModel.find().exec();

    //отправляем результат на клиент-приложение проекта
    res.json({listOfFerries: listOfFerries});
});

router.post("/", async (req, res) => {
    let listOfFerriesNames = [];
    await req.body.map((item) => {
        listOfFerriesNames.push(item.ferryName);
        //создаем нового администратора порта и собираем по нему данные
        const ferry = new FerriesModel(item);
        //сохраняем нового администратора порта
        ferry.save()
    })

    res.json({listOfFerriesNames: listOfFerriesNames});
});


export default router;