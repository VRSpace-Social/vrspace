import type {LimitedUser} from "vrchat";
import {seeOnlineFriends, getInstanceInfo, getUserInfo, searchUser } from "./vrcAPI.ts";
import type { FriendOnlineData } from "../interfaces/apiHelper";
import { LogManager } from "./logger";


// Logger Stuff
const debugType: string = 'error';
const logger: LogManager = new LogManager(debugType, 'VRS-MIDDLEWARE');

const instanceType = {
    "public": "Public",
    "hidden": "Friends+",
    "friends": "Friends",
    "private": "Invite/Invite+",
    "group": "Group"
};

async function getOnlineFriends() {
    logger.working("Getting online friends data...");
    const friendsDataToSend: FriendOnlineData[] = [];
    let friends: LimitedUser[] | undefined = await seeOnlineFriends();
    if (friends) {
        // Rest of the code
        for (let friend of friends) {
            if (friend.location?.substring(0, 5) === "wrld_") {
                let instanceData = await getInstanceInfo(friend.location.split(":")[0], friend.location.split(":")[1]);
                if (instanceData) {
                    friendsDataToSend.push({
                        worldImageUrl: instanceData.world.imageUrl,
                        username: friend.displayName,
                        worldName: instanceData.world.name,
                        instanceType: instanceType[instanceData.type] + " Instance",
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
                        worldName: "",
                        instanceType: "Private Instance",
                        players: 0,
                        maxPlayers: 0,
                    });
                }

            }
        }
        logger.success("Online friends data has been fetched successfully");
    }
    return friendsDataToSend;
}


async function searchUsers(query: string): Promise<FriendOnlineData[]> {
    logger.working("Searching for user: " + query + "...");
    const friendsDataToSend: FriendOnlineData[] = [];
    let users: LimitedUser[] | undefined = await searchUser(query);
    if(users){
        logger.info("Found " + users.length + " users, filtering online friends...")
        for (let user of users) {
            if(user.isFriend){
                logger.info("Found friend: " + user.displayName);
                friendsDataToSend.push({
                    username: user.displayName,
                    worldImageUrl: user.profilePicOverride? user.profilePicOverride:  user.currentAvatarImageUrl,
                    instanceType: 'Private Instance',
                    instanceId: 'private',
                });
            }
        }
        return friendsDataToSend;
    } else {
        return friendsDataToSend;
    }
}


export { getOnlineFriends, searchUsers };