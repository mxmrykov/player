import React, { useState } from "react"
import axios from "axios"
import { BiErrorCircle, BiCheckCircle } from 'react-icons/bi'
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import {motion as m} from 'framer-motion'

export default function Settings() {
    const navigate = useNavigate()
    const [user, setUser] = useState({})
    const [message, setMessage] = useState()
    const [updUser, setUpdUser] = useState({})
    const [error, setError] = useState()
    const [preloaded, setPreloaded] = useState(false)
    const SERVER = `${window.location.protocol}//${window.location.hostname}`
    if (!localStorage.getItem('token')) navigate('/authorization')
    function displayErrors(type) {
        setError(type)
        setTimeout(() => {
            setError()
        }, 3000);
    }
    function displayMessage(type) {
        setMessage(type)
        setTimeout(() => {
            setMessage()
        }, 3000);
    }
    if (!preloaded) {
        getUser()
        setPreloaded(true)
    }
    async function updUserF() {
        if (updUser.newImage) {
            var formData = new FormData()
            formData.append('newImg', updUser.newImage)
            const request = await axios.post(SERVER + `/internal/process.php?type=updUser&token=${localStorage.getItem('token')}&newName=${updUser.newName}&wi=p`, formData, {
                method: 'POST'
            })
            if (request.data.ok) {
                displayMessage('Данные обновлены')
                setTimeout(() => {
                    window.location.href = ''
                }, 2500);
            }
            else {
                if (request.data.type === 'DB error') displayErrors('#100\nВнутреняя ошибка')
                else if (request.data.type === 'cannot cannot upd user') displayErrors("Произошла ошибка обновления")
                else if (request.data.type === 'cannot upload img to server') displayErrors("Пользователь уже обновлен")
            }
        } else {
            const request = await axios.post(SERVER + `/internal/process.php?type=updUser&token=${localStorage.getItem('token')}&newName=${updUser.newName}&wi=n`, {
                method: 'POST'
            })
            if (request.data.ok) {
                displayMessage('Данные обновлены')
                setTimeout(() => {
                    window.location.href = ''
                }, 2500);
            }
            else {
                if (request.data.type === 'DB error') displayErrors('#100\nВнутреняя ошибка')
                else if (request.data.type === 'cannot cannot upd user') displayErrors("Пользователь уже обновлен")
            }
        }
    }
    async function getUser() {
        const request = await axios.get(SERVER + `/internal/process.php?type=getuser&token=${localStorage.getItem('token')}`)
        if (request.data.ok) {
            setUser(JSON.parse(JSON.stringify(request.data.user)))
            setUpdUser(prev => ({ ...prev, newName: request.data.user.name }))
        }
        else {
            if (request.data.type === 'cannot get session') displayErrors('#1031\nCannot get session')
            else if (request.data.type === 'internal server error') displayErrors('#1030\nВнутреняя ошибка сервера')
        }
    }
    const uploadPhoto = e => {
        setUpdUser(prev => ({ ...prev, newImage: e.target.files[0] }))
        console.log('photo ' + e.target.files[0].name + ' uploaded to client')
    }
    if (!user.name) return null
    else return <m.div initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0.5 }}><section className="App" style={{ backgroundImage: 'radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )' }}>
        {error ? <div className="error-window">
            <BiErrorCircle size={25} color="red" /><p className="error-window-text">{error}</p>
        </div> : ''}
        {message ? <div className="message-window">
            <BiCheckCircle size={25} color="green" /><p className="error-window-text">{message}</p>
        </div> : ''}
        <Helmet>
            <title>Настройки</title>
            <link rel="apple-touch-icon" href={user?.avatar}/>
            <link rel="shortcut icon" href={user?.avatar}/>
        </Helmet>
        <section className="settings-profile-card">
            <h2 style={{ marginBottom: 15 }}>Настройки профиля</h2>
            <div className="column-center">
                <label for="newImg">
                    <img alt="newImg" className="circle" style={{ width: 250, backgroundColor: "lightgrey" }} src={updUser.newImage ? URL.createObjectURL(updUser.newImage) : user.avatar} />
                    <input onChange={uploadPhoto} name="newImg" style={{ display: 'none' }} id="newImg" type="file" accept="image/*" />
                </label>
                <div>
                    <label for="userNewName">Имя</label>
                    <input onChange={e => {
                        let txt = e.target.value
                        txt = txt.replace(/[^0-9A-zА-я-_]/, "")
                        setUpdUser(prev => ({ ...prev, newName: txt }))
                    }} id="userNewName" value={updUser.newName} />
                </div>
                <button className={((updUser.newName.length !== 0 && updUser.newName !== user.name) || (updUser.newImage && updUser.newName.length !== 0)) ? '' : 'btn-disabled'} onClick={() => {
                    if ((updUser.name !== '' && updUser.newName !== user.name) || updUser.newImage) {
                        updUserF()
                    }
                }}>
                    Сохранить
                </button>
            </div>
        </section>
        <span className="back-button" onClick={() => navigate('/')} >&lt; Назад</span>
    </section>
    </m.div>
}