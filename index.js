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
    const auth_token = await axios({
        method: 'POST',
        baseURL: 'https://id.twitch.tv',
        url: '/oauth2/token',
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    })
    
    const games = await axios({
        method: 'POST',
        baseURL: 'https://api.igdb.com',
        url: '/v4/games',
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: 'Bearer ' + auth_token.data.access_token,
        },
        data: "fields name,genres.name,cover.image_id,rating,url,artworks.url; limit 50;"
    })

    res.send(JSON.stringify(games.data))
})

app.listen(process.env.PORT || 3000)
