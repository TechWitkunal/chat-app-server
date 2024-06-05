require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToMongoose = require('./db');
const routes = require("./routes/index");
const cookieParser = require('cookie-parser');
const http = require("http");
const socketIO = require("socket.io");
const { isUserOnline, updateSocketId, getUserNameBySocket, getOnlineUsers } = require('./controllers/auth');
const { addMessage, addGroupMessage } = require('./controllers/message');
const Message = require('./models/Message');

connectToMongoose();

const app = express();
const port = process.env.PORT || 8001;

// app.use(cors({
//   origin: '*',
//   // origin: 'https://main--online-chat-app-0011.netlify.app',
//   methods: 'GET,POST',
//   credentials: true,
// }));

const allowedOrigins = ['https://main--online-chat-app-0011.netlify.app', 'https://main--online-chat-app-0012.netlify.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
  // console.log("new connection", socket.id);

  socket.on("user-connect", async ({ userName }) => {
    try { await updateSocketId({ userName, is: socket.id }); } catch (error) { console.log("catch error line 52 of index.js") }
    try { await isUserOnline({ socket: socket.id, userName, is: true }); } catch (error) { console.log("catch error line 51 of index.js") }
    socket.broadcast.emit("user-online", { userName });

    // socket.emit("onlineUser", () => {
      // const allOnlineUser;
    // })
  });

  socket.on("getOnlineUser", async() => {
    // let users;
    let onlineUserName;
    try { onlineUserName = await getOnlineUsers() } catch (error) { console.log("catch error line 51 of index.js") }
    socket.emit("recieveOnlineUser", ({ name: onlineUserName }))
  })

  socket.on("addTextMessage", async ({ inputValue, from, to, fileType }) => {
    const msg = await addMessage(inputValue, from, to, fileType, "")
    let userName, toUserName;
    socket.emit("updateTextMessage", { msg })
    try { userName = await getUserNameBySocket({ "id": from }); } catch (error) { console.log("catch error line 61 of index.js") }
    try { toUserName = await getUserNameBySocket({ "id": to }); } catch (error) { console.log("catch error line 61 of index.js") }
    socket.broadcast.emit("textMessageReceive", { userName, toUserName, msg });
  });

  socket.on("addImageMessage", async ({ fileUrl, from, to, fileType }) => {
    const msg = await addMessage("", from, to, fileType, fileUrl)
    let userName, toUserName;
    // console.log(msg);
    socket.emit("updateImageMessage", { msg })
    try { userName = await getUserNameBySocket({ "id": from }); } catch (error) { console.log("catch error line 61 of index.js") }
    try { toUserName = await getUserNameBySocket({ "id": to }); } catch (error) { console.log("catch error line 61 of index.js") }
    // console.log("61 -> ", userName,toUserName);
    socket.broadcast.emit("imageMessageReceive", { userName, toUserName, msg });
  });

  socket.on("addDocumentMessage", async ({ fileName, fileUrl, from, to, fileType }) => {
    const msg = await addMessage(fileName, from, to, fileType, fileUrl)
    let userName, toUserName;
    // console.log(msg);
    socket.emit("updateDocumentMessage", { msg })
    try { userName = await getUserNameBySocket({ "id": from }); } catch (error) { console.log("catch error line 61 of index.js") }
    try { toUserName = await getUserNameBySocket({ "id": to }); } catch (error) { console.log("catch error line 61 of index.js") }
    // console.log("61 -> ", userName,toUserName);
    socket.broadcast.emit("imageMessageReceive", { userName, toUserName, msg });
  });

  // socket.on("user-register", ({ user }) => {
  //   socket.broadcast.emit("userRegisterReceive", {user})
  //   console.log("NEW USER", user);
  // })

  // =========== FOR GROUPS ================== //
  socket.on("addGroupTextMessage", async ({inputValue, from, filetype, groupId }) => {
    const msg = await addGroupMessage(inputValue, from, filetype, "", groupId)
    // const msg = await addMessage(inputValue, from, to, fileType, "")
    // message, from, to, messageType, fileUrl
    let userName;
    socket.emit("updateGroupTextMessage", { msg })
    try { userName = await getUserNameBySocket({ "id": from }); } catch (error) { console.log("catch error line 61 of index.js") }
    console.log(userName, "<<--------username")
    // try { toUserName = await getUserNameBySocket({ "id": to }); } catch (error) { console.log("catch error line 61 of index.js") }
    socket.broadcast.emit("GroupTextMessageReceive", { userName, groupId, msg });
  });

//   async function deleteGroupMessage() {
//     try {
//         const deletedMessage = await Message.deleteMany({ "isInGroup": true });

//         if (deletedMessage) {
//             console.log('Deleted message:', deletedMessage);
//         } else {
//             console.log('No message found that meets the criteria.');
//         }
//     } catch (error) {
//         console.error('Error deleting message:', error);
//     }
// }

// deleteGroupMessage();



  socket.on("disconnect", async () => {
    let name;
    try { name = await isUserOnline({ socket: socket.id, is: false }); } catch (error) { console.log("catch error line 51 of index.js") }
    socket.broadcast.emit("userDisconnected", {name})
  })


});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})