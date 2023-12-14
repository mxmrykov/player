import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BiErrorCircle, BiExit } from 'react-icons/bi'
import { BsMusicNoteBeamed } from 'react-icons/bs'
import { Helmet } from "react-helmet"
import { PiUserCircleFill } from "react-icons/pi"
import { AiOutlineFileAdd, AiFillSetting } from 'react-icons/ai'

export default function Home() {
    const navigate = useNavigate()
    const [user, setUser] = useState({})
    const [error, setError] = useState()
    const [preloaded, setPreloaded] = useState(false)
    const SERVER = `${window.location.protocol}//${window.location.hostname}`
    if (!localStorage.getItem('token')) navigate('/authorization')
    axios.interceptors.response.use(res => {
        if (res.data.type && res.data.type === 'sesseion expired') {
            localStorage.removeItem('token')
            navigate('/authorization')
        } else if (res.data.type && res.data.type === 'session aborted') {
            localStorage.removeItem('token')
            navigate('/authorization')
        }
        return res
    })
    async function getUser() {
        const request = await axios.get(SERVER + `/internal/process.php?type=getuser&token=${localStorage.getItem('token')}`)
        if (request.data.ok) setUser(JSON.parse(JSON.stringify(request.data.user)))
        else {
            if (request.data.type === 'cannot get session') displayErrors('#1031\nCannot get session')
            else if (request.data.type === 'internal server error') displayErrors('#1030\nВнутреняя ошибка сервера')
        }
    }
    async function LogOut() {
        const request = await axios.get(SERVER + `/internal/process.php?type=exit&token=${localStorage.getItem('token')}`)
        if (!request.data.ok) {
            if (request.data.type === 'error at session aborting') displayErrors('Ошибка в завершении сеанса')
            else displayErrors('Произошла ошибка на сервере')
        }
    }
    
    function displayErrors(type) {
        setError(type)
        setTimeout(() => {
            setError()
        }, 3000);
    }
    if (!preloaded) {
        getUser()
        setPreloaded(true)
    }
    return <section className='App' style={{ backgroundImage: 'radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )' }}>
        {error ? <div className="error-window">
            <BiErrorCircle size={25} color="red" /><p className="error-window-text">{error}</p>
        </div> : ''}
        <div className="greetings-main">
            <h1>Привет, {user.name}</h1>
        </div>
        <Helmet>
            <title>Dreamity</title>
            <link rel="apple-touch-icon" href={user?.avatar}/>
            <link rel="shortcut icon" href={user?.avatar}/>
        </Helmet>
        <section className="home-pagecard-parent">
            <article onClick={() => navigate('/me')} className="home-pagecard">
                <PiUserCircleFill style={{ marginInline: 15 }} size={30} color='#714aff' />
                <h1>Мой профиль</h1>
            </article>
            <article onClick={() => navigate('/music')} className="home-pagecard">
                <BsMusicNoteBeamed style={{ marginInline: 15 }} size={30} color='#714aff' />
                <h1>Моя музыка</h1>
            </article>
            <article onClick={() => navigate('/add')} className="home-pagecard">
                <AiOutlineFileAdd style={{ marginInline: 15 }} size={30} color='#714aff' />
                <h1>Добавить песню</h1>
            </article>
            <article onClick={() => navigate('/settings')} className="home-pagecard">
                <AiFillSetting style={{ marginInline: 15 }} size={30} color='#714aff' />
                <h1>Настройки</h1>
            </article>
            <article onClick={() => {
                LogOut()
            }} className="home-pagecard">
                <BiExit style={{ marginInline: 15 }} size={30} color='red' />
                <h1>Выйти</h1>
            </article>
        </section>
    </section>
}