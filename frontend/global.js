const socket = new WebSocket("http://10.0.0.206:5500/socket/alert");

socket.addEventListener("open", () => {
  console.log("WebSocket connection established");
});

socket.addEventListener("close", () => {
  socket.send("WebSocket connection closed");
});

export { socket };
