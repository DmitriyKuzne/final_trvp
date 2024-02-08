import './App.css';
import {Link, Route, Routes} from "react-router-dom";
//вытаскиваем центральную страницу проекта 
import Home from "./pages/Home";
//вытаскиваем страницу создания рейса авторизованным администратором порта
import CreateTrip from "./pages/CreateTrip";
//вытаскиваем страницу показа отдельного рейса с составлением информации по нему
import Trip from "./pages/Trip";
//вытаскиваем страницу регистрации администратора порта
import Registration from "./pages/Registration";
//вытаскиваем страницу авторизации администратора порта
import Login from "./pages/Login";
//вытаскиваем контекст, в который оборачиваем состояние авторизованного администратора порта 
import {AuthContext} from "./helpers/AuthContext";

//вытаскиваем хуки useState и useEffect
import {useState, useEffect} from 'react';
import axios from 'axios';

//вытаскиваем хук useNavigate
import {useNavigate} from "react-router-dom";

function App() {
  //определяем компонент перехода по сайтам из хука useHistory
  let navigate = useNavigate();

  //задаем начальное состояние авторизованного администратора порта
  const [authState, setAuthState] = useState({
    portAdminName: "", 
    id: 0, 
    status: false
  });

  useEffect(() => {
    //проводим запрос на существование авторизованного администратора порта
    axios.get("http://localhost:4001/auth", { 
      //вытаскиваем токен из localStorage и отправляем его на сервер под headers
      headers : {
        accessToken: localStorage.getItem('accessToken')
      }
    }).then((response) => {
      if (response.data.message === 'The port administrator was not found' || response.data.error === 'User not logged in!') 
      {
        //указанный запрос получился неудачным
        setAuthState({username: "", id: 0, status: false});
      }
      else 
      {
        //указанный запрос оказался успешным, в состояние авторизованного администратора порта
        //помещаем информацию об авторизованном администраторе порта
        setAuthState({   
          //имя авторизованного администратора порта
          portAdminName: response.data.portAdminName, 
          //идентификатор авторизованного администратора порта
          id: response.data.id, 
          //статус авторизованного администратора порта
          status: true
        });

      }
      
    })
  }, []);

  //функция удаления информации об авторизованном администраторе порта из localStorage
  const logout = () => {
    //удаляем информацию об авторизованном администраторе порта из localStorage
    localStorage.removeItem("accessToken");
    //очищаем состояние авторизации администратора порта
    setAuthState({portAdminName: "", id: 0, status: false});
    navigate("/");
  }

  return (
    <div className="App">
      {/*Оборачиваем состояние авторизации администратора порта в контекст */}
      <AuthContext.Provider value={{authState, setAuthState}}>
        
          <div className="navbar">
            <div className="links">
            
              {!authState.status ? (
                //авторизованого администратора порта нет
                <>
                  {/*Ссылка на страницу авторизации администратора порта */}
                  <Link to="/login">Login</Link>
                  {/*Ссылка на страницу регистрации администратора порта */}
                  <Link to="/registration">Registration</Link>
                </>
              ) : (
                <>
                  {/*Ссылка на основную страницу проекта*/}
                  <Link to="/">Home Page</Link>
                  {/*Ссылка на страницу создания рейсы */}
                  <Link to="/createtrip">Create A Trip</Link>
                </>
              )}
            </div>
            <div className="loggedInContainer">
              {/*Показываем имя авторизованного администратора порта, если он существует */}
              {authState.status && <h1>{authState.portAdminName}</h1>}
              {/*Кнопка очищения информации об авторизованном администраторе порта, если он существует */}              
              {authState.status && <button onClick={logout}>Logout</button>}
            </div>
          </div>
          <Routes>
            {/*Маршрутизатор перехода на основную страницу проекта */}
            <Route path="/"           element = {<Home/>} />
            {/*Маршрутизатор перехода на страницу создания рейса */}
            <Route path="/createtrip" element = {<CreateTrip/>} />
            {/*Маршрутизатор перехода на страницу показа полной информации о рейсе с идентификатором id*/}
            <Route path="/trip/:id"   element={<Trip/>} />
            {/*Маршрутизатор перехода на страницу регистрации администратора порта */}
            <Route path="/registration" element={<Registration/>} />
            {/*Маршрутизатор перехода на страницу авторизации администратора порта */}
            <Route path="/login" element={<Login/>} />
          </Routes>
      </AuthContext.Provider>
    </div>
  );
}

export default App;