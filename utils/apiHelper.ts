import type { LimitedUser } from "vrchat";
import { seeOnlineFriends, getInstanceInfo, getUserInfo, searchUser } from "./vrcAPI";
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


async function searchUsers(query: string): Promise<FriendOnlineData[]> {
    console.log("DOING API CALL...")
    const friendsDataToSend: FriendOnlineData[] = [];
    let users: LimitedUser[] | undefined = await searchUser(query);
    if(users){
        for (let user of users) {
            if(user.isFriend === true){
                friendsDataToSend.push({
                    username: user.displayName,
                    worldImageUrl: user.profilePicOverride? user.profilePicOverride:  user.currentAvatarImageUrl,
                    instanceType: 'Private Instance',
                    instanceId: 'private',
                });
            }
        }
        console.log(friendsDataToSend)
        return friendsDataToSend;
    } else {
        return friendsDataToSend;

    }
}


export { getOnlineFriends, searchUsers };