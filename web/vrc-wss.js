
async function getInstanceInfo() {
    //TODO: Implement this function
    const result = await fetch('http://localhost:3000/api/getInstanceInfo?worldId=' + worldId + '&instanceId=' + instanceId);
    return result.json();
}

async function getUserInfo(userID) {
    const result = await fetch('http://localhost:3000/api/getUserInfo?userID=' + userID);
    console.log(result)
    return result.json();
}

fetch('http://localhost:3000/api/getAuthCookie').then(async res => {
    const webSocket = new WebSocket("wss://pipeline.vrchat.cloud/?authToken=" + await res.text());
    webSocket.onopen = function () {
        console.log("Connected to WebSocket server");
    };
    webSocket.onmessage = async function (event) {
        if (event.data === 'reload') {
            setTimeout(() => {
                webSocket.close();
                self.location.reload();
            }, 300);
        }
        console.log(JSON.parse(event.data));
        switch (JSON.parse(event.data.toString()).type) {

            case "friend-active": {
                let jsonData = JSON.parse(JSON.parse(event.data.toString()).content).user;
                console.log(jsonData.displayName + " is now active (online on VRC Website or API)");
                break;
            }

            case "friend-offline": {
                let friendData = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId).catch(e => {
                    let errorResponse = JSON.parse(e.response?.data);
                    console.log(errorResponse);
                    console.log("[!!] ERROR on" + JSON.parse(event.data.toString()) + "\nError while trying to get friend data: \n" + e);
                    return undefined;
                });
                if (friendData === undefined) {
                    console.warn("Friend is not found");
                    break;
                }
                let friendUsername = friendData.displayName;
                console.log(friendUsername + " is pending offline");
                break;
            }

            case "friend-delete": {
                console.debug(event.data.toString());
                let friendData = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId).catch(e => {
                    console.log("[!!] ERROR on" + JSON.parse(event.data.toString()) + "\nError while trying to get friend data: \n" + e);
                    return undefined;
                });
                if (friendData === undefined) {
                    console.warn("Friend is not found");
                    break;
                }
                let friendUsername = friendData.displayName;
                console.log(friendUsername + " is no longer your friend");
                break;
            }

            case "friend-online": {
                let friendUsername = JSON.parse(JSON.parse(event.data.toString()).content).user.displayName;
                console.log(friendUsername + " is online on VRChat Client");
                break;
            }

            case "friend-location": {
                let jsonData = JSON.parse(JSON.parse(event.data.toString()).content);
                let location = jsonData.location;
                let travelingToLocation = jsonData.travelingToLocation;

                if (location === "traveling" && travelingToLocation !== "" && jsonData.worldId.substring(0, 5) === "wrld_") {
                    // User IS TRAVELING to instance
                    let worldId = jsonData.worldId;
                    let instanceId = jsonData.travelingToLocation.split(":")[1];
                    let instanceData = await getInstanceInfo(worldId, instanceId).catch(e => {
                        console.error("Error while trying to get instance data: " + e);
                        return undefined;
                    });
                    console.log("User (" + jsonData.user.displayName + ") is traveling to world: [" + instanceData?.world.name + "]");

                } else if (location !== "" && travelingToLocation === "" && location.substring(0, 5) === "wrld_") {
                    // User HAS TRAVELED to instance
                    let worldId = jsonData.worldId;
                    let instanceId = location.split(":")[1];
                    let instanceData = await getInstanceInfo(worldId, instanceId).catch(e => {
                        console.error("Error while trying to get instance data: " + e);
                        return undefined;
                    });
                    console.log("User (" + jsonData.user.displayName + ") has traveled to world: [" + instanceData?.world.name + "]");
                }
                else if (location === "private" && jsonData.worldId === "private" && travelingToLocation === "private") {
                    console.log("User (" + jsonData.user.displayName + ") is in a private instance (probably in a private world or in a private instance of a public world)");
                }
                else {
                    console.debug("PLEASE CHECK, NEEDS TO BE IMPLEMENTED");
                    console.log(jsonData);
                }
                break;
            }

            default: {
                try {
                    console.log(JSON.parse(event.data.toString()));
                } catch (e) {
                    console.error("Error while trying to parse message: " + e)
                    console.log(JSON.parse(event.data.toString()));
                }
            }

        }
    };
    webSocket.onclose = function () {
        console.log("Disconnected from WebSocket server");
    };
});
