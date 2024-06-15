const {
  addChat,
  getChatByParticipants,
  getChatById,
  getChatByParticipantId,
} = require("./chat_service");
const { log } = require("../helper/logger");
const { addNotification } = require("./notification_service");
const { addConversaton } = require("./conversation_service");
const Chat = require("../model/chat");
const { findById } = require("./user_service");

const socketIO = (io) => {
  // io.use((socket, next) => {
  //   const token = socket.handshake.headers.authorization;
  //   if (!token) {
  //     return next(new Error('Authentication error: Token not provided.'));
  //   }

  //   // Extract the token from the Authorization header
  //   const tokenParts = token.split(' ');
  //   const tokenValue = tokenParts[1];

  //   // Verify the token
  //   jwt.verify(tokenValue, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
  //     if (err) {
  //       console.error(err);
  //       return next(new Error('Authentication error: Invalid token.'));
  //     }
  //     // Attach the decoded token to the socket object for further use
  //     socket.decodedToken = decoded;
  //     next();
  //   });
  // });

  io.on("connection", (socket) => {
    console.log(`ID: ${socket.id} just connected`);

    socket.on("request-chat", async (data, callback) => {
      try {
        let chat;

        if (data?.participants?.length >= 2) {
          chat = await getChatByParticipants(data);

          if (chat) {
            callback({
              status: true,
              message: "Chat already exists",
              data: chat,
            });
          }

          chat = await addChat(data);

          if (chat) {
            callback({
              status: true,
              message: "Chat create successful",
              data: chat,
            });
          }

          console.log(chat);

          data.participants.forEach(async (participant) => {
            if (participant.toString() !== data.creator) {
              const userNotification = {
                message: "Request a new message in " + data?.name,
                receiver: participant,
                linkId: chat._id,
              };
              const userNewNotification = await addNotification(
                userNotification
              );
              const roomId = "user-notification::" + participant.toString();
              console.log(userNewNotification);
              io.emit(roomId, userNewNotification);
            }
            // const roomID = 'chat-notification::' + participant.toString();
            // io.emit(roomID, { status: "Success", message: "New chat created", data: null });
          });

          return;
        } else {
          log("socket error", "socket");
          callback({
            status: "Error",
            message: "Must provide at least 2 participants",
            data: null,
          });
        }
      } catch (error) {
        console.error("Error adding new chat:", error.message);
        callback({ status: "Error", message: error.message, data: null });
      }
    });

    socket.on("send-message", async (data, callback) => {
      try {
        data.messageType = "message";
        const conversation = await addConversaton(data);
        console.log(data.chat);

        const chat = await getChatById(data.chat);
        // const sender = await findById(data.sender);

        chat.participants.forEach(async (participant) => {
          if (participant.toString() !== data?.sender) {
            console.log(participant);
            const eventName = "receive-message::" + participant.toString();

            const eventData = {
              conversation,
            };
            io.emit(eventName, eventData);
          }
        });

        console.log(chat);

        await Chat.updateOne(
          { _id: data.chat },
          {
            $set: {
              lastMessage: {
                sender: data.sender,
                message: data.message,
              },
            },
          }
        );

        chat.participants.forEach(async (participant) => {
          const chatListforUser = await getChatByParticipantId({
            participants: participant,
          });

          console.log(chatListforUser);
          const roomId = "update-chatlist::" + participant.toString();
          io.emit(roomId, chatListforUser);
        });

        callback({
          status: "Success",
          message: "Message send successfully",
          data: data,
        });
      } catch (err) {
        log(err, "socket");
        console.error("Error adding new message:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`ID: ${socket.id} disconnected`);
    });
  });
};

module.exports = socketIO;
