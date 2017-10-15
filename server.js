const express = require('express')
const next = require('next')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

require('dotenv').config()

passport.use(
  new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {
    console.log(profile)
  })
)

const port = process.env.port || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()

    server.get('/auth/facebook', passport.authenticate('facebook'))

    server.get('*', (req, res) => {
      return handle(req, res)
    })
    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
