import express from "express";
const router = express.Router();
//вытаскиваем модель базы данных по данным администратора порта
import PortAdminsModel from "../models/PortAdmins.js";
import bcrypt from "bcrypt";
//вытаскиваем функцию определения данных по авторизованному пользователю
import validateToken from "../middlewares/AuthMiddleware.js"; 
import jwt from "jsonwebtoken";


//маршрутизатор запроса по регистрации администратора порта
router.post("/", async (req, res) => {
    try 
    {     
        //проверяем есть ли регистрируемый администратор порта в базе данных
        PortAdminsModel.findOne({portAdminName: req.body.portAdminName}, (err, portAdminExist) => 
        {
            //существующего администратора порта удаляем из базы данных
            if (portAdminExist != undefined)
            {
                PortAdminsModel.findOneAndDelete(
                {
                    portAdminName: req.body.portAdminName
                },
                (err, doc) => {
                });
            }

            //хэшируем пароль
            bcrypt.hash(req.body.password,10).then((hashedPassword) => 
            {
                //создаем нового администратора порта и собираем по нему данные
                const portAdmin = new PortAdminsModel({
                    portAdminName: req.body.portAdminName,
                    password: hashedPassword
                });
 
                //сохраняем нового администратора порта
                portAdmin.save()
                //возвращаем успех, если новый администратор порта успешно добавлен в базу данных
                .then((_) => {
                    res.json("SUCCESS");
                })
                //фиксируем ошибку, если новый администратор порта не был успешно добавлен в базу данных
                .catch((error) => {
                    res.status(500).send({
                        message: "Error creating portAdmin",
                        error
                    })
                })
            })
            //фиксируем ошибку, если пароль не захэширован
            .catch((e) => {
                res.status(500).send({
                    message: "Password was not hashed successfully",
                    e
                })
            })
        })
    } 
    catch (e) 
    {
        console.log(e);
        res.send({message: "Server error"})
    }
})


//маршрутизатор запроса по авторизации зарегистрированного администратора порта
router.post("/login", async (req, res) => {
    try
    {
        //ищем администратора порта с именем portAdminName по всей базе данных администраторов портов
        const portAdmin = await PortAdminsModel.findOne({portAdminName: req.body.portAdminName});

        //если администратора порта нет нет, то выводим сообщение что требуемый администратор порта не найден
        if (!portAdmin) res.json({error: "port Admin Doesn't Exist"});

        //Проверяем правильность пароля авторизируемого пользователя
        const isValidPass = await bcrypt.compare(req.body.password, portAdmin.password);
    
        if (!isValidPass) {
            return req.status(400).json({
                message: 'Wrong portAdminName And Password Combination'
            })
        }

        //составляем токен авторизируемого администратора порта по его имени portAdmin.portAdminName
        //и идентификатору portAdmin.id
        const accessToken = jwt.sign(
            {portAdminName: portAdmin.portAdminName, id: portAdmin.id}, 
            "importantsecret"
        );

        //отправляем на клиент-приложение все данные об авторизированном администраторе порта
        res.json({token: accessToken, portAdminName: portAdmin.portAdminName, id: portAdmin.id});
    }
    catch (err) 
    {
        res.status(500).json({
            message: 'Failed to log in'
        });
    }
})

//маршрутизатор запроса на проверку существования авторизированного администратора порта
router.get("/", validateToken, async (req, res) => {
    try
    {
        //из базы данных MongoDb собираем все данные по администратору порта с идентификатором req.portAdmin.id       
        if (req.body['portАdmin'] == null || req.body['portАdmin'] == undefined)
        {
            res.json({
                message: 'The port administrator was not found'
            })
        }
        else
        {
            const portAdmin = await PortAdminsModel.findById(req.body['portАdmin'].id);
            if (portAdmin == null || portAdmin == undefined)
            {
                res.json({  message: 'The port administrator was not found'})
            }
            else
            {
                res.json(portAdmin._doc);
            }
        }
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})


export default router;