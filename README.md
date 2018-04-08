# poker

## Installation ##
 - *MongoDB*
 - *NodeJS*
 - *Angular/cli*

1. in a root directory
    ```sh
    npm install
    ```
2. in a /client folder
    ```sh
    npm install
    ```

## Running ##
1. **run mongo db**

2. in a root directory
    ```sh
    node server.js
    ```
3. in a /client folder
    ```sh
    ng serve
    ```
4. in a browser open **http://localhost:4200**

## API ##
url - `http://localhost:8085/`

**Routes**
1. ``./routes/chat.js``

```sh
var io = require('socket.io')(server);
...
server.listen(4000);
```

 - `socket.on('room')`
 - `socket.on('disconnect')`
 - `socket.on('save-message')`
 - `socket.on('start-new-game')`
 - `socket.on('create-new-table')`
 - `socket.on('remove-table')`
 - `socket.on('update-table-game')`
 - `function getUsersCards(room, trump)`
 - `function getUserTrumps(data, trump, room)`
 - `getLowestTrump(userTrumps, room)`
 - `function updatePack(data)`
 
2. ``./routes/routes.js``

 - `post('/signup')` - for the Sign Up a new user
 - `post('/add_table')` - add a new table 
 - `post('/remove_table')` - remove table
 - `get('/table_list')` - receive table list
 - `get('/table_info')` - get table info
 - `get('/chairs_list')` - chairs for the table
 - `get('/card_list')` - all cards (52)
 - `post('/login')` - login user
 - `get('/dashboard')` - home page
 - `get('/role')` - check user role
 - `get('/user_info')` - get user info
 - `get('/get_user_name')` - get user name
 - `get('/games')` - get games (Poker, Дурак)
 - `get('/get_users_in_chat')` - get list users in room (table)
 - `get('/get_messages')` - get messages by chatId
 - `post('/add_user_to_chat')` - add user to the table when user choose a chair
 - `post('/chat/save_message')` - add new message to the chat
 - `post('/add_started_game')` - start a new game when table owner clicks on button "start new game"
 - `get('/get_started_game')` - check the game is started in this table
 - `get('/get_user_cards')` - get user cards by user
 - `post('/add_user_cards')` - add cards to each one user
 - `get('/get_user_cards_count')` - get count cards of every user for show hide side cards on table
 - `get('/get_pack')` - get pack cards
 - `post('/add_turn')` - add a new turn with params
 - `get('/get_turn')` - get a last turn by number
 - `get('/get_game_part')` - this is the biggest route for the find who should to turn next and what to have to do
 - `post('/add_game_part')` - add a new part game (когда отбой или игрок принял карты)
 - `get('/get_card_info')` - get card info
 - `get('/get_trash_count')` - get trash count
 - `post('/push_cards')` - add cards for users
 - `function getToken` - we are using token (jws token - pasport middleware)
 - `function updateGamePart(room, ended, endGame)` - update game part
 - `function decode(str, room) / encode(str, room)` - for security posts and gets to the API
 - `function distributionCards(data)` - distribute cards to users who need
 - `function getPack(room)` - get pack cards by roomId