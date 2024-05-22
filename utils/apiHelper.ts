import type { LimitedUser } from "vrchat";
import { seeOnlineFriends, getInstanceInfo, getUserInfo } from "./vrcAPI";
import type { FriendOnlineData } from "../interfaces/apiHelper";

const instaceType = {
    "public": "Public",
    "hidden": "Friends+",
    "friends": "Friends",
    "private": "Invite/Invite+",
    "group": "Group"
};

async function getOnlineFriends() {
    const friendsDataToSend: FriendOnlineData[] = [];
    let friends: LimitedUser[] | undefined = await seeOnlineFriends();
    if (friends) {
        console.log("location | displayName | status")
        // Rest of the code
        for (let friend of friends) {
            console.log(friend.location + " | " + friend.displayName + " | " + friend.status)
            if (friend.location?.substring(0, 5) === "wrld_") {
                let instanceData = await getInstanceInfo(friend.location.split(":")[0], friend.location.split(":")[1]);
                if (instanceData) {
                    friendsDataToSend.push({
                        worldImageUrl: instanceData.world.imageUrl,
                        username: friend.displayName,
                        worldName: instanceData.world.name,
                        instanceType: instaceType[instanceData.type] + " Instance",
                        players: instanceData.n_users,
                        maxPlayers: instanceData.capacity,
                        instanceId: friend.location,
                    });
                }
            } else {
                let userData = await getUserInfo(friend.id);
                if (userData?.state === "active") {
                    friendsDataToSend.push({
                        worldImageUrl: null,
                        worldName: "",
                        username: friend.displayName,
                        instanceType: "Is online on VRChat Website/API",
                        players: 0,
                        maxPlayers: 0,
                    });
                } else if (friend.location === "private") {
                    friendsDataToSend.push({
                        worldImageUrl: null,
                        username: friend.displayName,
                        worldName: "Private World",
                        instanceType: "Private Instance",
                        players: 0,
                        maxPlayers: 0,
                    });
                }

            }
        }
        console.log("Done getting online friends data");
    }
    return friendsDataToSend;
}


export { getOnlineFriends };