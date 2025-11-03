const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server , {
    cors:{
        origin:"http://localhost:3000",
        methods:["GET" , "POST"],
        credentials:true,
}
})
io.on('connection', (socket) => {
    console.log("user connected", socket.id);
    socket.on("join-room" , (data)=>{
        console.log(data.room);
        socket.join(data.room)
    })
    socket.on("send-location" , ({latitude , longitude , roomname})=>{
        console.log("heelo" , longitude , latitude);
        socket.to(roomname).emit("receive-location" , ({latitude , longitude}))
    })
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
const port = 1890;
server.listen(port, () => {
    console.log(`Socket.IO server is running on port ${port}`);
});
