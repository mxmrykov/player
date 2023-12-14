import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { PiUserCircleFill } from "react-icons/pi"
import { BsFillShieldLockFill } from 'react-icons/bs'
import { BiSolidUserPin } from "react-icons/bi"
import { MdEmail } from "react-icons/md"
import { Helmet } from "react-helmet"
import { motion as m } from "framer-motion"

export default function Registration() {
    const [user, setUser] = useState({})
    const [error, setError] = useState()
    const SERVER = `${window.location.protocol}//${window.location.hostname}`
    const navigate = useNavigate()
    function validateUser() {
        return user.name?.length > 2 && user.login?.length > 2 && user.email?.length > 2 && user.password?.length > 2
    }
    async function createAccount() {
        const request = await axios.get(SERVER + `/internal/process.php?type=signup&name=${user.name}&login=${user.login}&email=${user.email}&password=${user.password}`)
        if (request.data.ok) {
            localStorage.setItem('token', request.data.token)
            navigate('/')
        } else {
            if (request.data.type === 'DB error') displayErrors('Произошла ошибка\nКод: DB')
            else if (request.data.type === 'user exists') displayErrors('Пользователь с таким логином уже существует')
            else if (request.data.type === 'cannot create user') displayErrors('Ошибка создания пользователя')
            else if (request.data.type === 'cannot create internal information') displayErrors('Произошла внутреняя ошибка сервера')
            else displayErrors('Произошла неизвестная ошибка')
        }
    }
    function displayErrors(type) {
        setError(type)
        setTimeout(() => {
            setError()
        }, 3000);
    }
    return <m.div initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.5 }}>
        <section className="App" style={{ backgroundImage: 'radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )' }}>
            <Helmet>
                <title>Регистрация</title>
            </Helmet>
            <section className="parent-mid">
                <div className="auth-window">
                    <article style={{ textAlign: "center" }}>
                        <h1>Dreamity</h1>
                        <h4>Авторизация</h4>
                    </article>
                    <div className="column-center">
                        <div className="stroke-mid-around">
                            <BiSolidUserPin size={25} />
                            <input value={user.name || ''} onChange={e => setUser(pState => ({ ...pState, name: e.target.value }))} placeholder="Имя" type="text" />
                        </div>
                        <div className="stroke-mid-around">
                            <PiUserCircleFill size={25} />
                            <input value={user.login || ''} onChange={e => setUser(pState => ({ ...pState, login: e.target.value }))} placeholder="Логин" type="text" />
                        </div>
                        <div className="stroke-mid-around">
                            <MdEmail size={25} />
                            <input value={user.email || ''} onChange={e => setUser(pState => ({ ...pState, email: e.target.value }))} placeholder="E-mail" type="text" />
                        </div>
                        <div className="stroke-mid-around">
                            <BsFillShieldLockFill size={25} />
                            <input value={user.password || ''} onChange={e => setUser(pState => ({ ...pState, password: e.target.value }))} placeholder="Пароль" type="password" />
                        </div>
                        {error ? <p className="error-log">{error}</p> : ''}
                        <button onClick={() => validateUser() ? createAccount() : displayErrors('Заполните все поля')}>Далее</button>
                    </div>
                    <div style={{ textAlign: "center", width: 100, margin: '0 auto' }}>
                        <p className="href" onClick={() => navigate('/authorization')}>Войти</p>
                    </div>
                </div>
            </section>
        </section>
    </m.div>
}