import React from 'react';
//вытаскиваем хук useHistory 
import {useNavigate} from "react-router-dom";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import axios from "axios";

//функция регистрации администратора порта
function Registration() {
    //начальное состояние данных для регистрации администратора порта
    const initialValues = {
        //пустое имя администратора порта
        portAdminName: "",
        //пустой пароль администратора порта
        password: ""
    }

    //определяем компонент перехода по сайтам из хука useHistory
    let navigate = useNavigate();

    //схема проверки данных для регистрации администратора порта
    const validationSchema = Yup.object().shape({
        //так будем проверять имя регистрируемого администратора порта
        portAdminName: Yup.string().min(3).max(15).required(),
        //так будем проверять пароль регистрируемого администратора порта
        password: Yup.string().min(4).max(20).required()
    })

    const onSubmit = (data) => {
        //осуществляем запрос на регистрацию администратора порта
        axios.post("http://localhost:4001/auth", data).then(() => {
            //в случае успешной регистрации пользователя переходим на страницу авторизации администратора порта
            navigate('/login');
        })
    };

    return (
        <div className="createTripPage">
            <Formik 
                initialValues={initialValues} 
                onSubmit={onSubmit} 
                validationSchema={validationSchema}
            >
                <Form className="formContainer">
                    <label>portAdminName: </label>
                    <ErrorMessage name="portAdminName" component="span"/>
                    {/*Поле задания имени регистрируемого администратора порта*/}
                    <Field 
                        autocomplete="off"
                        id="inputCreateTrip" 
                        name="portAdminName" 
                        placeholder="(Ex, John...)"
                    />
                    <label>Password: </label>
                    <ErrorMessage name="password" component="span"/>
                    {/*Поле задания пароля регистрируемого администратора порта*/}
                    <Field 
                        autocomplete="off"
                        type="password"
                        id="inputCreateTrip" 
                        name="password" 
                        placeholder="Your Password..."
                    />
                    {/*Кнопка запуска процесса регистрации администратора порта*/}
                    <button type="submit">Register</button>
                </Form>
            </Formik>
        </div>
    )
}

export default Registration;