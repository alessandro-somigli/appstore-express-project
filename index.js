import express from 'express'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const app = express()

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*'])
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.append('Access-Control-Allow-Headers', 'Content-Type')
    next()
});

app.get('/', (req, res) => {
    res.send('appstore server api, check /games, /apps, /books, /movies')
})

app.get('/games', async (req, res) => {
    const response = await axios({
        method: 'GET',
        baseURL: 'http://api.steampowered.com',
        url: '/ISteamApps/GetAppList/v0002/?format=json'
    })

    res.send(JSON.stringify(response.data))
})

app.listen(process.env.PORT || 3000)



/*
app.get('/apps', (req, res) => {
    res.send('appstore server api, check /games, /apps, /books, /movies')
})

app.get('/books', (req, res) => {
    res.send('appstore server api, check /games, /apps, /books, /movies')
})

app.get('/movies', (req, res) => {
    res.send('appstore server api, check /games, /apps, /books, /movies')
})*/