import { Route, Routes } from "react-router-dom"
import Home from "./Screens/Home"
import Authorization from "./Screens/Authorization"
import Registration from "./Screens/Registration"
import Me from "./Screens/Me"
import Music from "./Screens/Music"
import Add from "./Screens/Add"
import Settings from "./Screens/Settings"

export default function App() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/authorization" element={<Authorization />} />
    <Route path="/signup" element={<Registration />} />
    <Route path="/confirm-signup" element={<Registration />} />
    <Route path="/me" element={<Me />} />
    <Route path="/music" element={<Music />} />
    <Route path="/add" element={<Add />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
}