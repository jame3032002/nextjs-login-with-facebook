const express = require('express')
const next = require('next')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const cookieSession = require('cookie-session')

require('dotenv').config()

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

passport.use(
  new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL
  }, (accessToken, refreshToken, profile, done) => {
    done(null, profile)
  })
)

const port = process.env.port || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()

    server.use(
      cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [process.env.KEY_SESSION]
      })
    )

    server.use(passport.initialize())
    server.use(passport.session())

    server.get('/profile', (req, res) => {
      res.send(req.user)
    })

    server.get('/user', (req, res) => {
      app.render(req, res, '/user', req.user)
    })

    server.get('/logout', (req, res) => {
      req.logout()
    })

    server.get('/auth/facebook', passport.authenticate('facebook'))

    server.get('/auth/facebook/callback', passport.authenticate('facebook', {
      successRedirect: '/profile'
    }))

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
