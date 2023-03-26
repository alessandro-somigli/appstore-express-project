// imports
import express from 'express'
import dotenv from 'dotenv'
import axios from 'axios'

// inits
dotenv.config()

const app = express()

// utils functions
const get_auth_token = async () => {
    return axios({
        method: 'POST',
        baseURL: 'https://id.twitch.tv',
        url: '/oauth2/token',
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    })
}

// middleware
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*'])
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.append('Access-Control-Allow-Headers', 'Content-Type')
    next()
});

// routes
app.get('/', (req, res) => {
    res.send('appstore server api, check /games, /apps, /books, /movies')
})

// /games
app.get('/games', async (req, res) => {
    const auth_token = await get_auth_token()

    const query = `
        fields 
            name,
            genres.name,
            cover.image_id,
            total_rating; 
            
        where cover!=null & 
            genres!=null & 
            total_rating!=null; 
            
        limit 50; 
            
        sort total_rating_count desc;
    `
    
    const games = await axios({
        method: 'POST',
        baseURL: 'https://api.igdb.com',
        url: '/v4/games',
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: 'Bearer ' + auth_token.data.access_token,
        },
        data: query
    })

    res.send(JSON.stringify(games.data))
})

app.get('/games/:id', async (req, res) => {
    const game_id = req.params.id
    const auth_token = await get_auth_token()

    const query = `
        fields name,
            version_title,
            storyline,
            summary,
            genres.name,
            themes.name,
            cover.image_id,
            screenshots.image_id,
            total_rating,
            total_rating_count;
            
        where id=${game_id};
    `

    const game = await axios({
        method: 'POST',
        baseURL: 'https://api.igdb.com',
        url: '/v4/games',
        headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: 'Bearer ' + auth_token.data.access_token,
        },
        data: query
    })

    res.send(JSON.stringify(game.data))
})

// /apps

// /books

// /movies

app.listen(process.env.PORT || 3000)
