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

async function getOnlineFriends()
{
    const friendsDataToSend: FriendOnlineData[] = [];
    let friends: LimitedUser[] | undefined = await seeOnlineFriends();
    if (friends) {
        // Rest of the code
        for (let friend of friends) {
            if(friend.location?.substring(0, 5) === "wrld_") {
                let instanceData = await getInstanceInfo(friend.location.split(":")[0], friend.location.split(":")[1]);
                if(instanceData) {
                    friendsDataToSend.push({
                        worldImageUrl: instanceData.world.imageUrl,
                        username: friend.displayName,
                        worldName: instanceData.world.name,
                        instanceType: instaceType[instanceData.type] + " Instance",
                        players: instanceData.n_users,
                        maxPlayers: instanceData.capacity,
                    });
                }
            }
        }
        console.log("Done getting online friends data");
    }
    return friendsDataToSend;
}


export { getOnlineFriends };