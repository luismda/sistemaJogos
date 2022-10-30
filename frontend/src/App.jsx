import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { UserProvider } from './context/UserContext'
import Home from './components/pages/Home'
import Login from './components/pages/Login'
import Participantes from './components/pages/Participantes'
import Concurso from './components/pages/Concurso'
import ParticipantesConcurso from './components/pages/ParticipantesConcurso'

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path='/' element={ <Home /> } />
          <Route path='/login' element={ <Login /> } />
          <Route path='/participantes' element={ <Participantes /> } />
          <Route path='/mega-sena' element={ <Concurso title='Mega-sena' /> } />
          <Route path='/lotofacil' element={ <Concurso title='Lotofácil' /> } />
          <Route path='/mega-sena/participantes/:id' element={ <ParticipantesConcurso /> } />
          <Route path='/lotofacil/participantes/:id' element={ <ParticipantesConcurso /> } />
        </Routes>
      </UserProvider>
    </Router>
  )
}

export default App
