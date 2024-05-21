export interface FriendOnlineData {
    username: string,
    worldName: string,
    worldId?: string,
    instanceId?: string
    instanceType: string
    players?: number
    maxPlayers?: number
    worldImageUrl: string
}


export interface VRSpaceVRCUserAvatar {
    fileId: string;
    ownerId: string;
    avatarName: string;
    avatarImageUrl: string;
    vrcData: AxiosResponse;
}