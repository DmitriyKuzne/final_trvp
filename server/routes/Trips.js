import express from "express";
const router = express.Router();
import validateToken from "../middlewares/AuthMiddleware.js"; 
//вытаскиваем модель базы данных по данным рейсов
import TripsModel from '../models/Trips.js';

import FerriesModel from '../models/Ferries.js';

//маршрутизатор запроса на получение всех рейсов
router.get("/", async (req, res) => {
    //получаем список всех постов
    const listOfTrips = await TripsModel.find().exec();
    //отправляем результат на клиент-приложение проекта
    res.json({listOfTrips: listOfTrips});
});

//маршрутизатор запроса на создание нового рейса авторизованным администратором порта
router.post("/", validateToken, async (req, res) => {
    try 
    {            
        const doc = new TripsModel({
            //Пункт назначения
            destinationStateName: req.body.destinationStateName,
            //название парома
            ferryName: req.body.ferryName,
            //имя администратора порта
            portAdminName: req.body['portАdmin'].portAdminName,
            //идентификатор администратора порта
            portAdminId: req.body['portАdmin'].id
        })
            
        //фиксируем новый рейс в базе данных
        await doc.save();

        //отправляем сообщение об успешной фиксации нового рейса на клиент приложение проекта
        return res.json({message: 'Success'});
    }
    catch (err)
    {
        res.status(500).json({
            message: 'Could not create the trip'
        })
    }
})

//маршрутизатор запроса на сервер на увеличение числа грузов по рейсу
router.put("/addHuge", async (req, res) => {
    try
    {
        //вытаскиваем название парома по рейсу, добавочное число грузов и сам идентификатор рейса tripId
        const {addHugeСompartmentsQuant, tripId, ferryName} = req.body;

        //определяем парома рейса
        const ferry = await FerriesModel.findOne({ferryName: ferryName });

        //определяем рейс
        const trip = await TripsModel.findById(tripId);

        if (trip.hugeСompartmentsQuant === undefined) trip.hugeСompartmentsQuant = 0;

        if ( ferry.cargoСompartmentsQuant >= trip.hugeСompartmentsQuant + addHugeСompartmentsQuant)
        {
            //меняем название рейса с определенным идентификатором tripId           
            await TripsModel.updateOne(
                {
                    _id: tripId
                },
                {
                    hugeСompartmentsQuant:  trip.hugeСompartmentsQuant + addHugeСompartmentsQuant
                }
            );
 
            //новое количество грузов по рейсу отправляем на клиент-приложение проекта
            return res.json({
                newHugeСompartmentsQuant: trip.hugeСompartmentsQuant + addHugeСompartmentsQuant,
                message: "success"
            });   
        }
        else
        {
            return res.json({
                message: "no success"
            });
        }
        
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
    
})

//маршрутизатор запроса на сервер на изменение содержания поста 
router.put("/addCar", async (req, res) => {
    try
    {
        //вытаскиваем название парома по рейсу, добавочное число машинных мест и сам идентификатор рейса tripId
        const {tripCarType, tripId, ferryName} = req.body;

        //определяем парома рейса
        const ferry = await FerriesModel.findOne({ferryName: ferryName });

        //определяем рейс
        const trip = await TripsModel.findById(tripId);

        if (trip.passengerCarsQuant == undefined)  trip.passengerCarsQuant = 0;
        if (trip.trucksQuant == undefined)  trip.trucksQuant = 0;
        if (trip.tractorsQuant == undefined)  trip.tractorsQuant = 0;

        let parkingSpacesTripQuant = trip.passengerCarsQuant + Number(2)*trip.trucksQuant + Number(3)*trip.tractorsQuant;

        if (ferry.parkingSpacesQuant >= parkingSpacesTripQuant+Number(tripCarType))
        {
            switch (Number(tripCarType)) 
            {
                case Number(1):  
                {
                    await TripsModel.updateOne(
                        {
                            _id: tripId
                        },
                        {
                            passengerCarsQuant : trip.passengerCarsQuant+Number(1)
                        }
                    );

                    return res.json({
                        newPassengerCarsQuant: trip.passengerCarsQuant+Number(1),
                        message: "success"
                    });
                    break;
                }
                case Number(2):  
                {
                    await TripsModel.updateOne(
                        {
                            _id: tripId
                        },
                        {
                            trucksQuant : trip.trucksQuant+Number(1)
                        }
                    );

                    return res.json({
                        newTrucksQuant: trip.trucksQuant+Number(1),
                        message: "success"
                    });
                  break;
                }
                case Number(3):  
                {
                    await TripsModel.updateOne(
                        {
                            _id: tripId
                        },
                        {
                            tractorsQuant : trip.tractorsQuant+Number(1)
                        }
                    );

                    return res.json({
                        newTractorsQuant: trip.tractorsQuant+Number(1),
                        message: "success"
                    });
                    break;
                }
            }
        }
        else
        {
            return res.json({
                message: "no success"
            });
        }
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор запроса на перемещение числа грузов между рейсами
router.put("/transitHuge", async (req, res) => {
    try
    {        
        const { transitHugeСompartmentsQuant, tripIdFrom, tripIdTo, ferryNameTo} = req.body;

        const ferryTo = await FerriesModel.findOne({ferryName: ferryNameTo});

        const tripFrom = await TripsModel.findById(tripIdFrom);
        const tripTo = await TripsModel.findById(tripIdTo);

        if (tripTo.hugeСompartmentsQuant === undefined) tripTo.hugeСompartmentsQuant = 0;

        if (ferryTo.cargoСompartmentsQuant >= tripTo.hugeСompartmentsQuant + transitHugeСompartmentsQuant)
        {
                  
            await TripsModel.updateOne(
                {
                    _id: tripFrom
                },
                {
                    hugeСompartmentsQuant:  tripFrom.hugeСompartmentsQuant - transitHugeСompartmentsQuant
                }
            );

            await TripsModel.updateOne(
                {
                    _id: tripTo
                },
                {
                    hugeСompartmentsQuant:  tripTo.hugeСompartmentsQuant + transitHugeСompartmentsQuant
                }
            );
 
            //новое количество грузов по рейсу отправляем на клиент-приложение проекта
            return res.json({
                newHugeСompartmentsQuant: tripFrom.hugeСompartmentsQuant - transitHugeСompartmentsQuant,
                message: "success"
            });   
        }
        else
        {
            return res.json({
                message: "no success"
            });
        }
        
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор запроса на перемещение числа грузов между рейсами
router.put("/transitCar", async (req, res) => {
    try
    {        
        const { tripCarType, tripIdFrom, tripIdTo, ferryNameTo} = req.body;

        const ferryTo = await FerriesModel.findOne({ferryName: ferryNameTo});

        //определяем рейс
        const tripFrom = await TripsModel.findById(tripIdFrom);
        const tripTo   = await TripsModel.findById(tripIdTo);

        if (tripTo.passengerCarsQuant == undefined)  tripTo.passengerCarsQuant = 0;
        if (tripTo.trucksQuant == undefined)         tripTo.trucksQuant = 0;
        if (tripTo.tractorsQuant == undefined)       tripTo.tractorsQuant = 0;

        let parkingSpacesTripToQuant = tripTo.passengerCarsQuant + Number(2)*tripTo.trucksQuant + Number(3)*tripTo.tractorsQuant;

        if (ferryTo.parkingSpacesQuant >= parkingSpacesTripToQuant+Number(tripCarType))
        {
            switch (Number(tripCarType)) 
            {
                case Number(1):  
                {
                    await TripsModel.updateOne(
                        {
                            _id: tripIdFrom
                        },
                        {
                            passengerCarsQuant : tripFrom.passengerCarsQuant - Number(1)
                        }
                    );

                    await TripsModel.updateOne(
                        {
                            _id: tripIdTo
                        },
                        {
                            passengerCarsQuant : tripTo.passengerCarsQuant + Number(1)
                        }
                    );

                    return res.json({
                        newPassengerCarsQuant: tripFrom.passengerCarsQuant - Number(1),
                        message: "success"
                    });
                    break;
                }
                case Number(2):  
                {
                    await TripsModel.updateOne(
                        {
                            _id: tripIdFrom
                        },
                        {
                            trucksQuant : tripFrom.trucksQuant - Number(1)
                        }
                    );

                    await TripsModel.updateOne(
                        {
                            _id: tripIdTo
                        },
                        {
                            trucksQuant : tripTo.trucksQuant + Number(1)
                        }
                    );

                    return res.json({
                        newTrucksQuant: tripFrom.trucksQuant - Number(1),
                        message: "success"
                    });
                  break;
                }
                case Number(3):  
                {
                    await TripsModel.updateOne(
                        {
                            _id: tripIdFrom
                        },
                        {
                            tractorsQuant : tripFrom.tractorsQuant - Number(1)
                        }
                    );

                    await TripsModel.updateOne(
                        {
                            _id: tripIdTo
                        },
                        {
                            tractorsQuant : tripTo.tractorsQuant + Number(1)
                        }
                    );

                    return res.json({
                        newTractorsQuant: tripFrom.tractorsQuant - Number(1),
                        message: "success"
                    });
                    break;
                }
            }
        }
        else
        {
            return res.json({
                message: "no success"
            });
        }
        
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

//маршрутизатор запроса на сервер на удаление рейса из базы данных TripsModel
router.delete("/:id", validateToken, async (req, res) => {
    try
    {
        //вытаскиваем идентификатор удаляемого поста
        const tripId = req.params.id;

        //удаляем соответствующий пост
        TripsModel.findOneAndDelete(
            {
                _id: tripId
            },
            (err, doc) => 
            {
                //ошибка при удалении поста
                if (err) 
                {
                    console.log(err);
                    return res.status(500).json({
                        message: 'Could not delete the post'
                    })
                }
                //рейс, который нужно удалить не найден
                if (!doc) {
                    return res.status(404).json({
                        message: 'Trip not found'
                    })
                }
                //рейс, который нужно удалить, удален
                res.json("Trip was deleted!");
            }
        )
    }
    catch (err)
    {
        res.status(500).json({
            message: 'No access'
        })
    }
})

export default router;