import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BiErrorCircle } from 'react-icons/bi'
import { PiPlayFill, PiPauseDuotone } from 'react-icons/pi'
import { FiVolume2 } from 'react-icons/fi'
import { Helmet } from "react-helmet"
import { TbPlayerTrackNext, TbPlayerTrackPrev } from 'react-icons/tb'
import { motion as m } from 'framer-motion'
import axios from "axios"

export default function Music() {
    const navigate = useNavigate()
    const [user, setUser] = useState({})
    const [error, setError] = useState()
    const [songs, setSongs] = useState()
    const [player, setPLayer] = useState({ play: false, currentSongTiming: 0, volume: 1.0 })
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
            document.getElementById(player.currentSong).volume = player.volume
        }
        else {
            document.getElementById(player.currentSong).pause()
        }
        if (player.currentSong) if (document.getElementById(player.currentSong).currentTime >= document.getElementById(player.currentSong).duration) playNext()
    }, [player.play, player.currentSong, player.volume, player.currentSongTiming])
    async function getUserSongs() {
        const request = await axios.get(SERVER + `/internal/process.php?type=getUserSongs&token=${localStorage.getItem('token')}`)
        if (request.data.ok) setSongs(request.data.userSongs)
        else if (!request.data.ok) {
            if (request.data.type === 'DB error') displayErrors('Произошла внутреняя ошибка сервера')
            else displayErrors('Произошла неизвестная ошибка')
        }
    }
    function playPrev() {
        setPLayer(prevState => ({
            ...prevState, currentSong: (player.currentSongInternalID > 1 ? songs[player.currentSongInternalID - 1]['song.internal.id'] : songs[0]['song.internal.id'].toString()),
            play: true, name: (player.currentSongInternalID > 1 ? songs[player.currentSongInternalID - 1]['song.name'] + ' - ' + songs[player.currentSongInternalID - 1]['song.singer'] : songs[0]['song.name'] + ' - ' + songs[0]['song.singer']),
            currentSongInternalID: (player.currentSongInternalID > 1 ? player.currentSongInternalID - 1 : songs[0].currentSongInternalID),
            ext: player.currentSongInternalID > 1 ? songs[player.currentSongInternalID - 1]['ext'] : songs[0].ext
        }))
        document.getElementById(player.currentSong).currentTime = 0
        if (player.currentSongInternalID > 0) document.getElementById(player.currentSong).src = `${SERVER}/internal/usersMusic/${songs[player.currentSongInternalID]['song.internal.id']}.${songs[player.currentSongInternalID].ext}`
    }
    function playNext() {
        setPLayer(prevState => ({
            ...prevState, currentSong: (player.currentSongInternalID < (songs.length - 1) ? songs[player.currentSongInternalID + 1]['song.internal.id'] : player.currentSong),
            play: true, name: (player.currentSongInternalID < (songs.length - 1) ? songs[player.currentSongInternalID + 1]['song.name'] + ' - ' + songs[player.currentSongInternalID + 1]['song.singer'] : player.name),
            currentSongInternalID: (player.currentSongInternalID < (songs.length - 1) ? player.currentSongInternalID + 1 : player.currentSongInternalID),
            ext: player.currentSongInternalID < (songs.length - 1) ? songs[player.currentSongInternalID + 1]['ext'] : songs[songs.length - 1].ext
        }))
        document.getElementById(player.currentSong).currentTime = 0
        if (player.currentSongInternalID < (songs.length - 1)) document.getElementById(player.currentSong).src = `${SERVER}/internal/usersMusic/${songs[player.currentSongInternalID]['song.internal.id']}.${songs[player.currentSongInternalID].ext}`
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
    if (!preloaded) return null
    else return <m.div initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.5 }}>
        <section
            className="App" style={{ backgroundImage: 'radial-gradient( circle 311px at 8.6% 27.9%,  rgba(62,147,252,0.57) 12.9%, rgba(239,183,192,0.44) 91.2% )' }}>
            {error ? <div className="error-window">
                <BiErrorCircle size={25} color="red" /><p className="error-window-text">{error}</p>
            </div> : ''}
            <Helmet>
                <title>{player.play ? player.name : 'Музыка'}</title>
                <link rel="apple-touch-icon" href={user?.avatar} />
                <link rel="shortcut icon" href={user?.avatar} />
            </Helmet>
            <span className="back-button" onClick={() => navigate('/')} >&lt; Назад</span>
            <section>
                <div className="songs-stats">
                    <h1>Моя музыка</h1>
                    <h4>Всего песен: {user?.added}</h4>
                </div>
                <div className="player-functions">
                    {player.currentSong ?
                        <div>
                            <div style={{ textAlign: "center", marginBottom: 10 }}>
                                {player.currentSong ? player.name : "Не исполняется"}
                            </div>
                            <div className="song-controls">
                                <div>
                                    <TbPlayerTrackPrev size={25} color="#896DDF" onClick={() => playPrev()} />
                                </div>
                                <div>
                                    {player.play ? <PiPauseDuotone size={25} color="#896DDF" onClick={() => {
                                        setPLayer(prevState => ({
                                            ...prevState, play: false
                                        }))
                                        document.getElementById(player.currentSong).pause()
                                    }} /> :
                                        <PiPlayFill size={25} color="#896DDF" onClick={() => {
                                            setPLayer(prevState => ({
                                                ...prevState, play: true
                                            }))
                                            document.getElementById(player.currentSong).play()
                                        }} />}
                                </div>
                                <div>
                                    <TbPlayerTrackNext size={25} color="#896DDF" onClick={() => playNext()} />
                                </div>
                            </div>
                            <input style={{ width: 450, maxWidth: '95%' }} min={0} onChange={e => {
                                document.getElementById(player.currentSong).currentTime += (e.target.value - document.getElementById(player.currentSong).currentTime)
                            }} max={Number(document.getElementById(player.currentSong)?.duration)} value={Number(document.getElementById(player.currentSong).currentTime)} type="range" />
                            <div className="line-end">
                                <p style={{ width: 50, textAlign: "center" }}>
                                    {Math.floor(document.getElementById(player.currentSong)?.currentTime / 60)}:
                                    {(Math.trunc(document.getElementById(player.currentSong)?.currentTime -
                                        Math.floor(document.getElementById(player.currentSong)?.currentTime / 60) * 60)) < 10
                                        ? "0" + (Math.trunc(document.getElementById(player.currentSong)?.currentTime -
                                            Math.floor(document.getElementById(player.currentSong)?.currentTime / 60) * 60)) :
                                        (Math.trunc(document.getElementById(player.currentSong)?.currentTime - Math.floor(document.getElementById(player.currentSong)?.currentTime / 60) * 60))}
                                </p>
                                <p style={{ width: 50, textAlign: "center" }}>
                                    {Math.floor(document.getElementById(player.currentSong)?.duration / 60)}:
                                    {Math.trunc(document.getElementById(player.currentSong)?.duration - Math.floor(document.getElementById(player.currentSong)?.duration / 60) * 60) < 10
                                        ? "0" + (Math.trunc(document.getElementById(player.currentSong)?.duration -
                                            Math.floor(document.getElementById(player.currentSong)?.duration / 60) * 60)) :
                                        (Math.trunc(document.getElementById(player.currentSong)?.duration - Math.floor(document.getElementById(player.currentSong)?.duration / 60) * 60))}
                                </p>
                            </div>
                        </div> :
                        <div>
                            <div style={{ textAlign: "center", marginBottom: 10 }}>
                                {player.currentSong ? player.name : "Не исполняется"}
                            </div>
                            <div className="song-controls">
                                <div>
                                    <TbPlayerTrackPrev size={25} color="#896DDF" />
                                </div>
                                <div>
                                    {player.play ? <PiPauseDuotone size={25} color="#896DDF" onClick={() => {

                                    }} /> :
                                        <PiPlayFill size={25} color="#896DDF" />}
                                </div>
                                <div>
                                    <TbPlayerTrackNext size={25} color="#896DDF" />
                                </div>
                            </div>
                            <input style={{ width: 450, maxWidth: '95%' }} min={0} max={0} type="range" />
                            <div className="line-end">
                                <p style={{ width: 50, textAlign: "center" }}>
                                    -
                                </p>
                                <p style={{ width: 50, textAlign: "center" }}>
                                    -
                                </p>
                            </div>
                        </div>}
                </div>
                <div className="column-center">
                    {songs?.length > 0 ? songs.map(el => {
                        return <article key={el['song.internal.id']} className="song-box column-center"
                            onClick={() => {
                                if (player.play && player.currentSong !== el['song.internal.id']) {
                                    document.getElementById(player.currentSong).pause()
                                    document.getElementById(player.currentSong).currentTime = 0
                                }
                                setPLayer(prevState => ({
                                    ...prevState, currentSong: el['song.internal.id'],
                                    play: true, name: el['song.name'] + ' - ' + el['song.singer'],
                                    currentSongInternalID: songs?.findIndex(function (item, i) {
                                        return item['song.internal.id'] === el['song.internal.id']
                                    }), ext: el['song.extension']
                                }))
                            }}>
                            <audio crossOrigin="anonymos" id={el['song.internal.id']} preload="metadata" src={`${SERVER}/internal/usersMusic/${el['song.internal.id']}.${el['song.extension']}`} />
                            <div className="line-end max-width">
                                <div className="line-start">
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
                        </article>
                    }) : <p>Песни не найдены</p>}
                </div>
            </section>
        </section>
    </m.div>
}