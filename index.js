require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToMongoose = require('./db');
const routes = require("./routes/index");
const cookieParser = require('cookie-parser');
const http = require("http");
const socketIO = require("socket.io");
const { isUserOnline, updateSocketId, getUserNameBySocket } = require('./controllers/auth');
const { addMessage } = require('./controllers/message');

connectToMongoose();

const app = express();
const port = process.env.PORT || 8001;

app.use(cors({
  origin: '*',
  // origin: 'http://127.0.0.1:5500',
  methods: 'GET,POST',
  credentials: true,
}));

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser());

app.use('/api/', routes);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });



const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  socket.on("user-connect", async ({ userName }) => {
    try { await isUserOnline({ userName, is: true }); } catch (error) { console.log("catch error line 51 of index.js") }
    try { await updateSocketId({ userName, is: socket.id }); } catch (error) { console.log("catch error line 52 of index.js") }
    socket.broadcast.emit("user-online", { userName });
  });

  socket.on("addTextMessage", async ({ inputValue, from, to, fileType }) => {
    const msg = await addMessage(inputValue, from, to, fileType, "")
    let userName, toUserName;
    // console.log(msg);
    socket.emit("updateTextMessage", { msg })
    try { userName = await getUserNameBySocket({ "id": from }); } catch (error) { console.log("catch error line 61 of index.js") }
    try { toUserName = await getUserNameBySocket({ "id": to }); } catch (error) { console.log("catch error line 61 of index.js") }
    console.log("61 -> ", userName,toUserName);
    socket.broadcast.emit("textMessageReceive", { userName, toUserName, msg });
  });

  socket.on("addImageMessage", async ({fileUrl, from, to, fileType }) => {
    const msg = await addMessage("", from, to, fileType, fileUrl)
    let userName, toUserName;
    // console.log(msg);
    socket.emit("updateImageMessage", { msg })
    try { userName = await getUserNameBySocket({ "id": from }); } catch (error) { console.log("catch error line 61 of index.js") }
    try { toUserName = await getUserNameBySocket({ "id": to }); } catch (error) { console.log("catch error line 61 of index.js") }
    console.log("61 -> ", userName,toUserName);
    socket.broadcast.emit("imageMessageReceive", { userName, toUserName, msg });
  });

  socket.on("disconnect", async () => {
    try { await isUserOnline({ userName, is: false }); } catch (error) { console.log("catch error line 50 of index.js") }
    socket.broadcast.emit("user-disconnect", {  });
  });



});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})