import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../utils/api'

function useAuth() {
    const [authenticated, setAuthenticated] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (token) {
            api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`
            setAuthenticated(true)
        }
    }, [])

    async function login(user) {
        try {
            const { data } = await api.post('/user/login', user).then(response => response.data)

            authUser(data)
            return { type: 'success', msg: 'Login realizado com êxito.' }
        } catch (error) {
            return { type: 'error', msg: 'E-mail ou senha inválidos.' }
        }
    }

    function logout() {
        setAuthenticated(false)
        localStorage.removeItem('token')
        api.defaults.headers.Authorization = undefined
        navigate('/login')
    }

    function authUser({ token }) {
        localStorage.setItem('token', JSON.stringify(token))
        api.defaults.headers.Authorization = `Bearer ${token}`
        setAuthenticated(true)

        navigate('/participantes')
    }

    return { authenticated, login, logout }
}

export default useAuth