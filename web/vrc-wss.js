let authCookie = "AUTH_COOKIE_HERE"
let url = "wss://pipeline.vrchat.cloud/?authToken="+authCookie;
const webSocket = new WebSocket(url);
webSocket.onopen = function (event) {
    console.log("Connected to WebSocket server");
    };
webSocket.onmessage = function (event) {
    console.log(event.data);
    };
webSocket.onclose = function (event) {
    console.log("Disconnected from WebSocket server");
    };
