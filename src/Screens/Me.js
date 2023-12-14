import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BiErrorCircle } from 'react-icons/bi'
import { PiPlayFill, PiPauseDuotone } from 'react-icons/pi'
import { FiVolume2 } from 'react-icons/fi'
import { Helmet } from "react-helmet"
import axios from "axios"
import { motion as m } from 'framer-motion'

export default function Me() {
    const navigate = useNavigate()
    const [user, setUser] = useState({})
    const [error, setError] = useState()
    const [songs, setSongs] = useState()
    const [player, setPLayer] = useState({ play: false, currentSongTiming: 0, volume: 0.5 })
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
    async function getUser() {
        const request = await axios.get(SERVER + `/internal/process.php?type=getuser&token=${localStorage.getItem('token')}`)
        if (request.data.ok) setUser(JSON.parse(JSON.stringify(request.data.user)))
        else {
            if (request.data.type === 'cannot get session') displayErrors('#1031\nCannot get session')
            else if (request.data.type === 'internal server error') displayErrors('#1030\nВнутреняя ошибка сервера')
        }
    }
    useEffect(() => {
        if (player.currentSong) if (player.play) {
            document.getElementById(player.currentSong).play()
            document.getElementById(player.currentSong).currentTime = 0
        }
        else {
            document.getElementById(player.currentSong).pause()
        }
    }, [player.play, player.currentSong])
    async function getUserSongs() {
        const request = await axios.get(SERVER + `/internal/process.php?type=getUserSongs&token=${localStorage.getItem('token')}`)
        if (request.data.ok) setSongs(request.data.userSongs.slice(0, 3))
        else if (!request.data.ok) {
            if (request.data.type === 'DB error') displayErrors('Произошла внутреняя ошибка сервера')
            else displayErrors('Произошла неизвестная ошибка')
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
        getUserSongs()
        setPreloaded(true)
    }
    if (player.play) {
        setInterval(() => setPLayer(p => ({ ...p, currentSongTiming: Number(document.getElementById(player.currentSong)?.currentTime) })), 1000);
    }
    return <m.div initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.5 }}><section className="App" style={{ backgroundImage: 'radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )' }}>
            {error ? <div className="error-window">
                <BiErrorCircle size={25} color="red" /><p className="error-window-text">{error}</p>
            </div> : ''}
            <Helmet>
                <title>{player.play ? player.name : 'Профиль'}</title>
                <link rel="apple-touch-icon" href={user?.avatar} />
                <link rel="shortcut icon" href={user?.avatar} />
            </Helmet>
            <section className="column-center">
                <span className="back-button" onClick={() => navigate('/')} >&lt; Назад</span>
                <div className="profile-card">
                    <img onClick={() => navigate('/settings')} alt="user" style={{ backgroundColor: 'lightgrey' }} src={user?.avatar} />
                </div>
                <section className="slider-profile-main">
                    <div className="profile-top">
                        <h1 style={{ marginBottom: 10 }}>@{user?.login}</h1>
                        <h3 style={{ marginBottom: 10 }}>{user?.name}</h3>
                        <h4 style={{ marginBottom: 10 }}>Песен залито: {user?.added}</h4>
                    </div>
                    {/* <div className="column-center">
                    <button className="btn-disabled">Подписаны: </button>
                </div> */}
                    <hr color="lightgrey" />
                    <div>
                        <h4>Последние загруженные</h4>
                        <p onClick={() => navigate('/music')} style={{ margin: 0, color: "blue" }}>См. все &gt;</p>
                    </div>
                    <div className="column-center">
                        {songs?.length > 0 ? songs.map(el => {
                            return <article key={el['song.internal.id']} className="song-box column-center">
                                <audio id={el['song.internal.id']} preload="metadata" src={`${SERVER}/internal/usersMusic/${el['song.internal.id']}.${el['song.extension']}`} />
                                <div className="line-end max-width">
                                    <div className="line-start">
                                        <span className="toggle-play">
                                            {player.play && player.currentSong === el['song.internal.id'] ? <PiPauseDuotone size={25} color="#896DDF" onClick={() => {
                                                setPLayer(prevState => ({
                                                    ...prevState, play: false
                                                }))
                                                document.getElementById(player.currentSong).pause()
                                            }} /> :
                                                <PiPlayFill size={25} color="#896DDF" onClick={() => {

                                                    if (player.play && player.currentSong !== el['song.internal.id']) {
                                                        document.getElementById(player.currentSong).pause()
                                                        document.getElementById(player.currentSong).currentTime = 0
                                                    }
                                                    setPLayer(prevState => ({ ...prevState, currentSong: el['song.internal.id'], play: true, name: el['song.name'] + ' - ' + el['song.singer'] }))
                                                }} />}
                                        </span>
                                        <span>
                                            <p style={{ fontSize: '1.1rem' }}>{el['song.name']}</p>
                                            <p>{el['song.singer']}</p>
                                        </span>
                                    </div>
                                    {player.currentSong === el['song.internal.id'] && <div className="line-start">
                                        <FiVolume2 size={25} color="#896DDF" />
                                        <input onChange={e => {
                                            document.getElementById(player.currentSong).volume = e.target.value
                                            setPLayer(prevState => ({ ...prevState, volume: e.target.value }))
                                        }} min={0} max={1} step={0.05} value={player.volume} className="vol-level-audio" type="range" />
                                    </div>}
                                </div>
                                {player.currentSong === el['song.internal.id'] && <div style={{ maxWidth: '100%' }}>
                                    <input style={{ width: 450, maxWidth: '95%' }} min={0} onChange={e => {
                                        document.getElementById(el['song.internal.id']).currentTime += (e.target.value - document.getElementById(el['song.internal.id']).currentTime)
                                    }} max={Number(document.getElementById(el['song.internal.id'])?.duration)} value={Number(document.getElementById(player.currentSong).currentTime)} type="range" />
                                    <div className="line-end">
                                        <p style={{ width: 50, textAlign: "center" }}>
                                            {Math.floor(document.getElementById(el['song.internal.id'])?.currentTime / 60)}:
                                            {(Math.trunc(document.getElementById(el['song.internal.id'])?.currentTime -
                                                Math.floor(document.getElementById(el['song.internal.id'])?.currentTime / 60) * 60)) < 10
                                                ? "0" + (Math.trunc(document.getElementById(el['song.internal.id'])?.currentTime -
                                                    Math.floor(document.getElementById(el['song.internal.id'])?.currentTime / 60) * 60)) :
                                                (Math.trunc(document.getElementById(el['song.internal.id'])?.currentTime - Math.floor(document.getElementById(el['song.internal.id'])?.currentTime / 60) * 60))}
                                        </p>
                                        <p style={{ width: 50, textAlign: "center" }}>
                                            {Math.floor(document.getElementById(el['song.internal.id'])?.duration / 60)}:
                                            {Math.trunc(document.getElementById(el['song.internal.id'])?.duration - Math.floor(document.getElementById(el['song.internal.id'])?.duration / 60) * 60) < 10
                                                ? "0" + (Math.trunc(document.getElementById(el['song.internal.id'])?.duration -
                                                    Math.floor(document.getElementById(el['song.internal.id'])?.duration / 60) * 60)) :
                                                (Math.trunc(document.getElementById(el['song.internal.id'])?.duration - Math.floor(document.getElementById(el['song.internal.id'])?.duration / 60) * 60))}
                                        </p>
                                    </div>
                                </div>}
                            </article>
                        }) : <p>Песни не найдены</p>}
                    </div>
                </section>
            </section>
        </section>
    </m.div>
}