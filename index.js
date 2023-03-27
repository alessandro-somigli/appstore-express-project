// imports
import express, { query } from 'express'
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
            storyline,
            summary,
            involved_companies.company.name,
            involved_companies.company.url,
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
app.get('/books', async (req, res) => {
    const query = `?q=books
    &fields=title,
        key,
        author_name,
        first_publish_year,
        number_of_pages_median,
        ratings_average,
        ratings_count,
        currently_reading_count,
        already_read_count,
        cover_i,
        edition_key
    &sort=random
    &limit=50`

    const books = await axios({
        method: 'GET',
        baseURL: 'https://openlibrary.org',
        url: '/search.json' + query
    })

    res.send(JSON.stringify(books.data))
})

app.get('/books/:id', async (req, res) => {
    const book_id = req.params.id

    const query = `?bibkeys=OLID:${book_id}&jscmd=data&format=json`

    const book = await axios({
        method: 'GET',
        baseURL: 'https://openlibrary.org',
        url: "/api/books/" + query
    })

    res.send(JSON.stringify(book.data))
})


// images:
// https://covers.openlibrary.org/b/id/10865338-L.jpg

// /movies
app.get('/movies', async (req, res) => {
    const movies = await axios({
        method: 'GET',
        baseURL: 'https://api.themoviedb.org',
        url: `/3/trending/movie/day?api_key=${process.env.MOVIE_DB_API_KEY}`,
    })

    res.send(JSON.stringify(movies.data))
})

app.get('/movies/:id', async (req, res) => {
    const game_id = req.params.id

    const movie = await axios({
        method: 'GET',
        baseURL: 'https://api.themoviedb.org',
        url: `/3/movie/${game_id}?api_key=${process.env.MOVIE_DB_API_KEY}`,
    })

    res.send(JSON.stringify(movie.data))
})

app.listen(process.env.PORT || 3000)
