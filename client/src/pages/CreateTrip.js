//вытаскиваем хук useEffect
import React, {useEffect, useState} from "react";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from 'yup';
import axios from 'axios';
//вытаскиваем хук useNavigate
import {useNavigate} from "react-router-dom";

//функция создания рейса администратором порта
function CreateTrip() {
    //определяем компонент перехода по сайтам из хука useNavigate
    let navigate = useNavigate();

    //состояние списка названий паромов
    const [ferryNames, setFerryNames] = useState([]);

    //состояние списка пунктов назначения
    const [destinationStateNames,   setDestinationStateNames ] = useState(['Oslo','Turku', 'Stogolm']);

    //состояние названия нового пункта назначения
    const [newDestinationStateName, setNewDestinationStateName] = useState('');

    //начальное состояние данных по рейсу, который создается авторизованным администратором порта
    const initialValues = {
        destinationStateName: "",
        ferryName: "",
    }

    useEffect(() => {
        //авторизованного администратора порта нет, переходим на страницу авторизации администратора порта
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
        }
        else
        {
            //делаем запрос на скачивание с сервера  названий паромов  
            axios.get(`http://localhost:4001/ferries/ferriesNames`).then((response) => 
            {
                if (response.data.listOfFerriesNames.length === 0)
                {
                    //делаем запрос на сервер на создание базы данных по паромам
                    axios.post("http://localhost:4001/ferries", 
                    [
                    {
                        ferryName: "Europe",
                        parkingSpacesQuant: 300,
                        cargoСompartmentsQuant: 300
                    },
                    {
                        ferryName: "Festival",
                        parkingSpacesQuant: 200,
                        cargoСompartmentsQuant: 200
                    },
                    {
                        ferryName: "Symphony",
                        parkingSpacesQuant: 100,
                        cargoСompartmentsQuant: 100
                    }
                    ])
                    .then((response) => {
                        setFerryNames(response.data.listOfFerriesNames);
                    })
                                     
                }
                else
                {
                    setFerryNames(response.data.listOfFerriesNames);
                }
            })  
        }
    }, [navigate])

    //схема проверки данных рейса, который создается автоизованным администратором порта
    const validationSchema = Yup.object().shape({
        ferryName: Yup.string().required(""),
        destinationStateName: Yup.string().required("")
    })

    const onSubmit = (data) => {        
        //делаем запрос на сервер на создание нового рейса авторизованным администратором порта
        axios.post("http://localhost:4001/trips", 
        //отправляем данные для создания указанного рейса
        {
            //Пункт назначения
            destinationStateName: destinationStateNames[data.destinationStateName],
            //название парома
            ferryName: ferryNames[data.ferryName],
        }, 
        {
            //отправляем токен в котором содержится информация об авторизованном администраторе порта из localStorage
            headers: {accessToken: localStorage.getItem("accessToken")}
        }).then((res) => {
            if (res.data.message === 'Success')
            {
                //переходим на основную страницу проекта
                navigate("/");
            }
        })
    }

    return (
        <div className="createTripPage">
            <Formik 
                initialValues={initialValues} 
                onSubmit={onSubmit} 
                validationSchema={validationSchema}
            >
                <Form className="formContainer">
                    <div className="body">{"Name of ferry"}</div>
                    <Field 
                        component="select" 
                        id="ferryNameId" 
                        name="ferryName" 
                        placeholder="select options"
                    >
                        <option value={-1}>{""}</option>
                        {ferryNames.map((item, key) => {
                            return (
                                <option value={key}>{item}</option>
                            )
                        })}
                    </Field>
                    <ErrorMessage name="ferryName"/>

                    <div className="body">{"Name of state destination"}</div>
                    <Field 
                        component="select" 
                        id="destinationStateNameId" 
                        name="destinationStateName" 
                        placeholder="select options"
                    >
                        <option value={-1}>{""}</option>
                        {destinationStateNames.map((item, key) => {
                            return (
                                <option value={key}>{item}</option>
                            )
                        })}
                    </Field>
                    <ErrorMessage name="destinationStateName"/>

                    <button type="submit">Create Trip</button>
                </Form>
            </Formik>

            <div className="rightSide">
                <div className="addDestinationStateName">
                    {/*Поле задания нового пункта назначения*/}
                    <input 
                        type="text"
                        placeholder="dest Name..."
                        autoComplete="off"
                        value={newDestinationStateName}
                        onChange={(event) => {  
                            setNewDestinationStateName(event.target.value);
                        }}
                    />
                    {/*Кнопка добавления нового пункта назначения к имеющимся*/}
                    <button 
                        onClick={() => {
                            setDestinationStateNames([...destinationStateNames, newDestinationStateName]);
                            //Очищаем состояние задания нового пункта назначения
                            setNewDestinationStateName("");
                        }}
                    >
                        Add destination state name
                    </button>
                </div> 
            </div>
        </div>
    )
}

export default CreateTrip;