//вытаскиваем хук useContext
import React, {useContext} from "react";
import axios from "axios";
//вытаскиваем хук useEffect и useState
import { useEffect , useState } from "react";
//вытаскиваем хук useHistory
import { useNavigate } from "react-router-dom";
//import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
//вытаскиваем контекст в который обернуто состояние авторизованного пользователя
import {AuthContext} from "../helpers/AuthContext";

//основная страница проекта
function Home() {
    //состояние списка рейсов по всем администраторам порта
    const [listOfTrips, setListOfTrips] = useState([]);
    //состояние авторизованного пользователя, полученное из контекста
    const {authState} = useContext(AuthContext);

    //определяем компонент перехода по сайтам из хука useHistory
    let navigate = useNavigate();

    useEffect(() => 
    {
        //если в localStorage нет информации об авторизованном пользователе
        if (!localStorage.getItem("accessToken")) 
        {
            //переходим на страницу авторизации пользователя
            navigate("/login");
        } 
        else 
        {
            //делаем запрос на получение всех постов и лайков авторизованного пользователя
            axios.get("http://localhost:4001/trips", 
            {
                //отправляем на сервер токен в котором содержится информация об авторизованном администраторе порта из localStorage
                headers: 
                { 
                    accessToken: localStorage.getItem("accessToken") 
                },
            })
            .then((response) => 
            {
                //получили список всех рейсов
                setListOfTrips(response.data.listOfTrips);
            });
        }
    }, [navigate]);

    return (
        <div>
            {/*Показываем все рейсы на этой странице */}           
            { authState.status ? (listOfTrips.map((value, key) => {
                return (
                    <div key={key} className="trip">
                        {/*Название поста */}
                        <div className="title"> {"id "} {value._id}  {" FerryName "}  {value.ferryName} </div>
                            <div className="body"
                                //Возможность перехода на страницу показа полной информации о рейсе включая его подробности
                                onClick={() => {
                                    navigate(`/trip/${value._id}`);
                                }}
                            >
                            {/*Пункт назначения в рейсе*/}
                            {value.destinationStateName}
                        </div>
                        <div className="footer">
                            <div className="portAdminName">
                                {value.portAdminName} 
                            </div>
                        </div>
                    </div>
                );
                })) : 
                (
                    <>
                    </>
                )
            }
        </div>
    );
}

export default Home;