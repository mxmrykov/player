import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { BiErrorCircle, BiCheckCircle } from 'react-icons/bi'
import axios from "axios"
import { Helmet } from "react-helmet"
import { motion as m } from 'framer-motion'

export default function Add() {
    const navigate = useNavigate()
    const [file, setFile] = useState()
    const [user, setUser] = useState({})
    const [uploadFileChangedData, setUploadFileChangedData] = useState({})
    const [error, setError] = useState()
    const [message, setMessage] = useState()
    const [preloaded, setPreloaded] = useState(false)
    const SERVER = `${window.location.protocol}//${window.location.hostname}`
    if (!localStorage.getItem('token')) navigate('/authorization')
    axios.interceptors.response.use(res => {
        if (res.data.type && res.data.type === 'sesseion expired') {
            localStorage.removeItem('token')
            navigate('/authorization')
        }
        return res
    })
    async function uploadSong() {
        const formData = new FormData()
        formData.append('file', file)
        if (uploadFileChangedData?.songName && uploadFileChangedData?.songSinger) {
            const request = await axios.post(SERVER + `/internal/process.php?type=uploadSong&token=${localStorage.getItem('token')}&SN=${uploadFileChangedData.songName}&SS=${uploadFileChangedData.songSinger}&userAdded=${user['internal.id']}`, formData, {
                method: 'POST'
            })
            if (request.data.ok) {
                displayMessage('Песня добавлена')
                setTimeout(() => {
                    window.location.href = ''
                }, 200)
            }
            else {
                if (request.data.type === 'cannot cannot add song to main library') displayErrors('Не удалось добавить песню')
                else if (request.data.type === 'cannot upload song to server') displayErrors('Не удалось загрузить песню на сервер')
                else if (request.data.type === 'DB error') displayErrors('Произошла внутреняя ошибка сервера')
                else displayErrors('Произошла неизвестная ошибка')
            }

        }
    }
    async function getUser() {
        const request = await axios.get(SERVER + `/internal/process.php?type=getuser&token=${localStorage.getItem('token')}`)
        if (request.data.ok) setUser(JSON.parse(JSON.stringify(request.data.user)))
        else {
            if (request.data.type === 'cannot get session') displayErrors('#1031\nCannot get session')
            else if (request.data.type === 'internal server error') displayErrors('#1030\nВнутреняя ошибка сервера')
        }
    }
    const getUpload = e => {
        if (e.target.files) {
            setFile(e.target.files[0])
            setUploadFileChangedData(pState => ({ ...pState, songName: e.target.files[0].name }))
            setUploadFileChangedData(pState => ({ ...pState, songSinger: e.target.files[0].name.split('_')[0] }))
        }
    }
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
    return <m.div initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.5 }}><section className="App" style={{ backgroundImage: 'radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )' }}>
            {error ? <div className="error-window">
                <BiErrorCircle size={25} color="red" /><p className="error-window-text">{error}</p>
            </div> : ''}
            {message ? <div className="message-window">
                <BiCheckCircle size={25} color="green" /><p className="error-window-text">{message}</p>
            </div> : ''}
            <Helmet>
                <title>Добавить песню</title>
                <link rel="apple-touch-icon" href={user?.avatar} />
                <link rel="shortcut icon" href={user?.avatar} />
            </Helmet>
            <span className="back-button" onClick={() => navigate('/')} >&lt; Назад</span>
            <section className="upload-top">
                <h1 style={{ margin: 5 }}>Добавление песни</h1>
                <div className="column-center">
                    <label className="button" style={{ textAlign: 'center' }} for="addon">Загрузить</label>
                    <input accept="audio/*" name="file" onChange={getUpload} id="addon" style={{ display: 'none' }} type="file"></input>
                </div>
            </section>
            {file && <section className="upload-top column-center">
                <input onChange={e => setUploadFileChangedData(pState => ({ ...pState, songName: e.target.value }))} type="text" value={uploadFileChangedData?.songName} placeholder="Название песни" />
                <input onChange={e => setUploadFileChangedData(pState => ({ ...pState, songSinger: e.target.value }))} type="text" value={uploadFileChangedData?.songSinger} placeholder="Исполнитель" />
                <button className={!(uploadFileChangedData?.songSinger || !uploadFileChangedData?.songName) ? 'btn-disabled' : null} onClick={() => uploadSong()}>Продолжить</button>
            </section>}
        </section>
    </m.div>
}