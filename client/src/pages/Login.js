import React, {useState, useContext} from 'react';
import axios from "axios";
//вытаскиваем хук useHistory 
import {useNavigate} from "react-router-dom";
//вытаскиваем контекст авторизации
import {AuthContext} from "../helpers/AuthContext";

//страница авторизации администратора порта
function Login() {
    //начальное состояние имени авторизируемого администратора порта
    const [portAdminName, setPortAdminName] = useState("");
    //начальное состояние пароля авторизируемого администратора порта
    const [password, setPassword] = useState("");
    //вытаскиваем функцию задания состояния авторизации администратора порта по контексту
    const {setAuthState} = useContext(AuthContext);

    //определяем компонент перехода по сайтам из хука useHistory
    let navigate = useNavigate();

    //функция авторизации администратора порта
    const login = () => {
        //данные по авторизируемому администратору порта
        const data = {portAdminName : portAdminName, password: password};
        //делаем запрос на осуществление авторизации администратора порта по приготовленным данным
        axios.post("http://localhost:4001/auth/login", data).then((response) => {
            if (response.data.error) 
            {
                //авторизация администратора порта не прошла выдаем ошибку через alert
                alert(response.data.error);
            }
            else
            {
                //осуществилась авторизация администратора порта
                localStorage.setItem("accessToken", response.data.token);
                //определяем состояние авторизованного администратора порта
                setAuthState({
                    //имя авторизованного администратора порта
                    portAdminName: response.data.portAdminName, 
                    //идентификатор авторизованного администратора порта
                    id: response.data.id, 
                    //статус процесса авторизации оборачиваем в true
                    status: true
                });
                //переходим на основную страницу проекта
                navigate("/");
            }
        })
    };
    
    return (
        <div className="loginContainer">
            <label>portAdminName:</label>
            {/*Поле задания имени авторизируемого администратора порта*/}
            <input 
                type="text" 
                onChange={(event) => {
                    setPortAdminName(event.target.value)
                }}
            />
            <label>Password:</label>
            {/*Поле задания пароля авторизируемого администратора порта*/}
            <input 
                type="password" 
                onChange={(event) => {
                    setPassword(event.target.value)
                }}
            />
            {/*Кнопка запуска процесса авторизации администратора порта*/}
            <button  onClick={login}>Login</button>
        </div>
    )
}

export default Login;