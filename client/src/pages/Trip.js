import React, {useEffect, useState, useContext} from "react";
//вытаскиваем хуки useParams и useHistory
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
//вытаскиваем контекст в который обернуто состояние авторизованного пользователя
import {AuthContext} from "../helpers/AuthContext";

import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from 'yup';

//страница показа конкретного рейса
function Trip() 
{
    //обьекты рейса
    const tripsObjectsTypes = ["huge", "car"];
    //типы машин в рейс
    const carsTypes = ["passenger car", "truck", "tractor"];

    //вытаскиваем идентификатор отображаемого рейса id
    const {id} = useParams();
    //состояние данных рейса 
    const [tripData, setTripData] = useState({});
    //состояние авторизованного администратора порта, полученное из контекста
    const {authState} = useContext(AuthContext);

    //состояние количества грузов в рейсе
    const [hugeСompartmentsQuant, setHugeСompartmentsQuant] = useState(0);

    //состояние количества легковых машин в рейсе
    const [passengerCarsQuant, setPassengerCarsQuant] = useState(0);
    //состояние грузовиков в рейсе
    const [trucksQuant,        setTrucksQuant]        = useState(0);
    //состояние тягачей в рейсе
    const [tractorsQuant,      setTractorsQuant]      = useState(0);

    //состояние добавляемого типа обЪекта в рейс
    const [tripObjectType, setTripObjectType] = useState(0);
    //состояние добавляемого типа машины в рейс
    const [tripCarType,        setTripCarType] = useState(0);

    //состояние идентификаторов других рейсов
    const [addTripsIds,         setAddTripsIds] = useState([]);
    //идентификатор выбранного другого рейса
    const [selectAddTripId, setSelectAddTripId] = useState('');

    //количество ячеек для груза в пароме рейса
    const [cargoСompartmentsQuant, setCargoСompartmentsQuant] = useState(0);
    //количество машиномест в пароме рейса
    const [parkingSpacesQuant, setParkingSpacesQuant] = useState(0);

    const initialValues = {
        selectAddTripId: '',
        tripObjectType: 0,
        tripCarType: 0
    }

    const validationSchema = Yup.object().shape({
        selectAddTripId: Yup.string().required(""),
        tripObjectType: Yup.number().min(0).max(2),
        tripCarType: Yup.number().min(0).max(3),
    })

    const [carTypeHidden, setCarTypeHidden] = useState(true);

    const [fullOtherTripsData,  setFullOtherTripsData] = useState(undefined);

    //определяем компонент перехода по сайтам из хука useNavigate
    let navigate = useNavigate();

    useEffect(() => 
    {
        //делаем запрос на скачивание с сервера информации о посте с идентификатором id
        axios.get("http://localhost:4001/trips",
        {
        }).then((response) => 
        {
            let _addTripsIds = [];
            let _fullOtherTripsData = [];
            
            (response.data.listOfTrips).map((item1) => 
            {   
                if (item1._id === id)
                {
                    //фиксируем данные о рейсе с идентификатором id
                    setTripData(item1);

                    //начальное количество грузов в рейсе
                    item1.hugeСompartmentsQuant === undefined || item1.hugeСompartmentsQuant === null ? setHugeСompartmentsQuant(0) : setHugeСompartmentsQuant(item1.hugeСompartmentsQuant);
                    item1.passengerCarsQuant    === undefined || item1.passengerCarsQuant    === null ? setPassengerCarsQuant(0)    : setPassengerCarsQuant(item1.passengerCarsQuant);
                    item1.trucksQuant           === undefined || item1.trucksQuant           === null ? setTrucksQuant(0)           : setTrucksQuant(item1.trucksQuant);
                    item1.tractorsQuant         === undefined || item1.tractorsQuant         === null ? setTractorsQuant(0)         : setTractorsQuant(item1.tractorsQuant);

                    //делаем запрос на скачивание с сервера  названий паромов  
                    axios.get(`http://localhost:4001/ferries`).then((response) => 
                    {
                        (response.data.listOfFerries).map((item2) => 
                        { 
                            if (item1.ferryName == item2.ferryName)
                            {
                                //количество ячеек для груза в пароме рейса
                                setCargoСompartmentsQuant(item2.cargoСompartmentsQuant);
                                //количество машиномест в пароме рейса
                                setParkingSpacesQuant(item2.parkingSpacesQuant);
                            }
                        })  
                    })  
                    
                }
                else
                {
                    _addTripsIds.push(item1._id);
                    _fullOtherTripsData.push(item1);
                }
            })
            // console.log(tripData);
            setAddTripsIds(_addTripsIds);
            setFullOtherTripsData(_fullOtherTripsData);
        })  
    }, [id, setTripData, setHugeСompartmentsQuant, setPassengerCarsQuant, setTrucksQuant, setTractorsQuant, setAddTripsIds]);

    //функция удаления рейса 
    const deleteTrip = (id) => {
        //делаем запрос на сервер на удаление рейса с идентификатором id
        axios.delete(`http://localhost:4001/trips/${id}`, {
            //отправляем на сервер токен в котором содержится информация об авторизованном администраторе порта из localStorage
            headers: {
                accessToken: localStorage.getItem("accessToken")
            }
        }).then(() => {
            //переходим на главную страницу проекта
            navigate("/");
        })
    }

    //добавляем грузы в рейс
    const addHuge = () => {
        //делаем запрос на сервер на увеличение числа грузов на 1 по рейсу с идентификатором tripData._id
        axios.put("http://localhost:4001/trips/addHuge", 
        {
            //добавочное число грузов по рейсу
            addHugeСompartmentsQuant: 1, 
            //идентификатор рейса
            tripId: id,
            //название парома
            ferryName: tripData.ferryName
        })
        .then((res) => {
           if (res.data.message === "success")
           {
               //новое количество обьектов в рейсе
               setHugeСompartmentsQuant(res.data.newHugeСompartmentsQuant);
           }
           else
           {
               alert("The ferry is full of huge");
           }
        })
    }

    //добавляем машины в рейс
    const addCar = () => {
        axios.put("http://localhost:4001/trips/addCar", 
        {
            //добавочное число машинных мест по рейсу
            tripCarType: tripCarType, 
            //идентификатор рейса
            tripId: id,
            //название парома
            ferryName: tripData.ferryName
        }).then(res => {
            if (res.data.message === "success")
            {
                switch (Number(tripCarType)) 
                {
                    case Number(1):  
                    {
                        //новое количество легковых машин в рейсе
                        setPassengerCarsQuant(res.data.newPassengerCarsQuant);
                        break;
                    }
                    case Number(2):  
                    {
                        //новое количество грузовиков в рейсе
                        setTrucksQuant(res.data.newTrucksQuant);
                        break;
                    }
                    case Number(3):  
                    {
                        //новое количество тягачей в рейсе
                        setTractorsQuant(res.data.newTractorsQuant);
                        break;
                    }
                    default:
                    {
                        break;
                    }
                }
            }
            else
            {
                alert("the ferry is overcrowded in terms of the number of car seats");
            }
        })   
    }

    //передача грузов на другой рейс
    const transitHuge = () => {
        const transitTripData = fullOtherTripsData.filter((item) => item._id === selectAddTripId)[0];
        //проверка на совпадение пунктов назначения
        if ( (tripData.destinationStateName !== null && tripData.destinationStateName !== undefined) && 
             (transitTripData.destinationStateName !== null && transitTripData.destinationStateName !== undefined))
        {
        if (tripData.destinationStateName === transitTripData.destinationStateName)
        {
            if (hugeСompartmentsQuant > 0)
            {
                axios.put("http://localhost:4001/trips/transitHuge", {
                    transitHugeСompartmentsQuant: 1, 
                    tripIdFrom: id,
                    tripIdTo: selectAddTripId,
                    ferryNameTo: transitTripData.ferryName,
                })
                .then((res) => {
                    if (res.data.message === "success")
                    {           
                        setHugeСompartmentsQuant(res.data.newHugeСompartmentsQuant);
                    }
                    else
                    {
                        alert("The other ferry is full of huge");
                    }
                })
            }  
        }
        else
        {
            alert("The destinations do not match");
        }
        }
    }

    //передача машин на другой рейс
    const transitCar = () => {
        const transitTripData = fullOtherTripsData.filter((item) => item._id === selectAddTripId)[0];
        //проверка на совпадение пунктов назначения
        if ( (tripData.destinationStateName !== null && tripData.destinationStateName !== undefined) &&
             (transitTripData.destinationStateName !== null && transitTripData.destinationStateName !== undefined))
        {
        if (tripData.destinationStateName === transitTripData.destinationStateName)
        {
            switch (Number(tripCarType)) 
            {
                case Number(1):  
                {
                    if (passengerCarsQuant > 0)
                    {
                        axios.put("http://localhost:4001/trips/transitCar", 
                        {
                            tripCarType: tripCarType, 
                            tripIdFrom: id,
                            tripIdTo: selectAddTripId,
                            ferryNameTo: transitTripData.ferryName
                        }).then(res => {
                            if (res.data.message === "success")
                            {
                                setPassengerCarsQuant(res.data.newPassengerCarsQuant);
                            }
                            else
                            {
                                alert("the other ferry is overcrowded in terms of the number of car seats");
                            }    
                        })
                    }
                    break;
                }     
                case Number(2):  
                {
                    if (trucksQuant > 0)
                    {
                        axios.put("http://localhost:4001/trips/transitCar", 
                        {
                            tripCarType: tripCarType, 
                            tripIdFrom: id,
                            tripIdTo: selectAddTripId,
                            ferryNameTo: transitTripData.ferryName,
                        }).then(res => {
                            if (res.data.message === "success")
                            {
                                setTrucksQuant(res.data.newTrucksQuant);
                            }
                            else
                            {
                                alert("the other ferry is overcrowded in terms of the number of car seats");
                            }    
                        })
                    }

                    break;
                }
                case Number(3):  
                {
                    if (tractorsQuant > 0)
                    {
                        axios.put("http://localhost:4001/trips/transitCar", 
                        {
                            tripCarType: tripCarType, 
                            tripIdFrom: id,
                            tripIdTo: selectAddTripId,
                            ferryNameTo: transitTripData.ferryName,
                        }).then(res => {
                            if (res.data.message === "success")
                            {
                                setTractorsQuant(res.data.newTractorsQuant);
                            }
                            else
                            {
                                alert("the other ferry is overcrowded in terms of the number of car seats");
                            }    
                        })
                    }
                    break;
                }
                default:
                {
                    break;
                }
            }
        }
        else
        {
            alert("The destinations do not match");
        }
        }
    }

    return (
        <div className="tripPage">
            <div className="leftSide">
                <div className="trip" id="individual">
                    <div 
                        className="title" 
                    >
                        {/*Название парома рейса*/}
                        {"ferryName"}  {tripData.ferryName}
                    </div>
                    <div className="body">
                        <div>
                            {/*название пункта назначения рейса*/}
                            {"destinationStateName"}  {tripData.destinationStateName}
                        </div>
                        <div>
                            {/*количество ячеек для груза в пароме рейса*/}
                            {"cargoСompartmentsQuant"}  {cargoСompartmentsQuant}
                        </div>
                        <div>
                            {/*количество машиномест в пароме рейса*/}
                            {"parkingSpacesQuant"}  {parkingSpacesQuant}
                        </div>
                    </div>
                    <div className="footer">
                        {/*Имя администратора порта, который организовал этот рейс */}
                        {tripData.portAdminName}
                        {    localStorage.accessToken !== undefined &&  
                             authState.portAdminName  !== ""        &&
                             tripData.portAdminName   !== ""        &&
                             authState.portAdminName  === tripData.portAdminName && (
                            //Кнопка удаления рейса, если рейс создан авторизованным администратором порта
                            <button 
                                onClick={() => {
                                    deleteTrip(tripData._id)
                                }}
                            >
                                Delete Trip
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="rightSideTripData">
                <div className="createTripDetails">
                    <Formik
                        initialValues={initialValues} 
                        validationSchema={validationSchema}
                    >
                        <Form className="formContainer">
                            {addTripsIds.length > 0 &&
                                <>
                                    <div className="body">{"Added trips Ids"}</div>
                                    <Field 
                                        component="select" 
                                        id="selectAddTripId" 
                                        name="selectAddTripId" 
                                        placeholder="trip Id selection"
                                        onClick={(event) => 
                                        {
                                            setSelectAddTripId(addTripsIds[event.target.value]);
                                        }}
                                    >
                                        <option value={-1}>{""}</option>
                                        {addTripsIds.map((item, key) => {
                                            return (
                                                <option value={key}>{item}</option>
                                            )
                                        })}
                                    </Field>
                                    <ErrorMessage name="selectAddTripId"/>
                                </>
                            }

                            <div className="body">{"trips objects"}</div>
                            <Field 
                                component="select" 
                                id="tripObjectTypeId" 
                                name="tripObjectType" 
                                placeholder="trip object selection"
                                onClick={(event) => 
                                {
                                    setTripObjectType(event.target.value);
                                    if (event.target.value > 1) 
                                    {
                                        setCarTypeHidden(false);
                                    }
                                    else
                                    {
                                        setCarTypeHidden(true);
                                    }
                                }}
                            >
                                <option value={0}>{""}</option>
                                {tripsObjectsTypes.map((item, key) => {
                                    return (
                                        <option value={key+1}>{item}</option>
                                    )
                                })}
                            </Field>
                            <ErrorMessage name="tripObjectType"/>

                            {carTypeHidden === false && <div className="body">{"cars types"}</div>}
                            <Field 
                                component="select" 
                                id="tripCarTypeId" 
                                name="tripCarType" 
                                placeholder="car type selection"
                                hidden = {carTypeHidden}
                                onClick={(event) => 
                                {
                                    if (event.target.value > 0)
                                    {
                                        setTripCarType(event.target.value);
                                    }
                                }}
                            >
                                <option value={0}>{""}</option>
                                {carsTypes.map((item, key) => {
                                    return (
                                        <option value={key+1}>{item}</option>
                                    )
                                })}
                            </Field>
                            <ErrorMessage name="tripCarType"/>

                            <div>
                                { (carTypeHidden === true && tripObjectType > 0) &&
                                    <>
                                        <button  onClick={addHuge}>
                                            Add new huge to ferry
                                        </button>
                                        { (selectAddTripId !== "") && 
                                        <button onClick={transitHuge}>
                                            Transit huge to another ferry
                                        </button>
                                        }
                                    </>
                                }

                                {(carTypeHidden === false && tripCarType > 0) &&
                                    <>
                                        <button onClick={addCar}>
                                            Add new car to ferry
                                        </button>
                                        { (selectAddTripId !== "") && 
                                        <button onClick={transitCar}>
                                            Transit car to another ferry
                                        </button>
                                        }
                                    </>
                                }
                            </div>

                            <div>
                                <div className="body"> 
                                    {"hugeСompartmentsQuant"}  {hugeСompartmentsQuant}
                                </div>
                                <div className="body">
                                    {"passengerCarsQuant"}  {passengerCarsQuant}      
                                </div>
                                <div className="body">
                                    {"trucksQuant"}  {trucksQuant}      
                                </div>
                                <div className="body">
                                    {"tractorsQuant"}  {tractorsQuant}     
                                </div>
                            </div>
                        </Form>
                    </Formik>
                </div>    
            </div>
        </div>
    )
}

export default Trip;