import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { PiUserCircleFill } from "react-icons/pi"
import { Helmet } from "react-helmet"
import { BsFillShieldLockFill } from 'react-icons/bs'
import { motion as m } from 'framer-motion'

export default function Authorization() {
    const navigate = useNavigate()
    const [user, setUser] = useState({})
    const [error, setError] = useState()
    const SERVER = `${window.location.protocol}//${window.location.hostname}`
    async function logIn() {
        const request = await axios.get(SERVER + `/internal/process.php?type=login&login=${user.login}&password=${user.password}`)
        if (request.data.ok) {
            localStorage.setItem('token', request.data.token)
            navigate('/')
        } else {
            if (request.data.type === 'DB error') displayErrors('Произошла ошибка\nКод: DB')
            else if (request.data.type === 'user do not exist') displayErrors('Пользователь не найден')
            else if (request.data.type === 'wrong password') displayErrors('Неверный пароль')
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
        exit={{ opacity: 0.5 }}><section className="App" style={{ backgroundImage: 'radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )' }}>
            <Helmet>
                <title>Авторизация</title>
            </Helmet>
            <section className="parent-mid">
                <div className="auth-window">
                    <article style={{ textAlign: "center" }}>
                        <h1>Dreamity</h1>
                        <h4>Авторизация</h4>
                    </article>
                    <div className="column-center">
                        <div className="stroke-mid-around">
                            <PiUserCircleFill size={25} />
                            <input value={user.login || ''} onChange={e => setUser(pState => ({ ...pState, login: e.target.value }))} placeholder="Логин" type="text" />
                        </div>
                        <div className="stroke-mid-around">
                            <BsFillShieldLockFill size={25} />
                            <input value={user.password || ''} onChange={e => setUser(pState => ({ ...pState, password: e.target.value }))} placeholder="Пароль" type="password" />
                        </div>
                        {error ? <p className="error-log">{error}</p> : ''}
                        <button onClick={() => {
                            if (user.login?.length > 0 && user.password?.length > 0) {
                                logIn()
                            } else displayErrors('Заполните все поля')
                        }}>Войти</button>
                    </div>
                    <div style={{ textAlign: "center", width: 100, margin: '0 auto' }}>
                        <p className="href" onClick={() => navigate('/signup')}>Регистрация</p>
                    </div>
                </div>
            </section>
        </section>
    </m.div>
}