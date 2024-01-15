const express = require('express')
const app = express()
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null

const intialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

intialize()

const convertObj = dbObj => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jersyNumber: dbObj.jersy_number,
    role: dbObj.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersdb = `
  SELECT *
  FROM cricket_team
  ORDER BY player_id;`
  const players = await db.all(getPlayersdb)
  response.send(
    players.map(eachPlayer => {
      return convertObj(eachPlayer)
    }),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jersyNumber, role} = playerDetails
  const addPlayerdb = `
  INSERT INTO
  cricket_team(playerName, jersyNumber, role)
  VALUES("${playerName}", ${jersyNumber}, "${role}");`
  const dbresponse = await db.run(addPlayerdb)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerdb = `
  SELECT *
  FROM cricket_team
  WHERE player_id = ${playerId}`
  const player = await db.get(getPlayerdb)
  response.send(convertObj(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jersyNumber, role} = playerDetails
  const updatePlayerdb = `
  UPDATE cricket_team
  SET
   playerName = "${playerName}"
   jersyNumber = ${jersyNumber}
   role = "${role}"
   WHERE playerId = ${playerId};`

  await db.run(updatePlayerdb)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerdb = `
  DELETE FROM cricket_team
  WHERE playerId = ${playerId};`
  await db.run(deletePlayerdb)
  response.send('Player Removed')
})

module.exports = app
