export interface FriendOnlineData {
    username: string,
    worldName?: string,
    worldId?: string,
    instanceId?: string
    instanceType: string
    players?: number
    maxPlayers?: number
    worldImageUrl: string | null | undefined
}


export interface VRSpaceVRCUserAvatar {
    fileId: string;
    ownerId: string;
    avatarName: string;
    avatarImageUrl: string;
    vrcData: AxiosResponse;
}

export interface VRChatCookieFormat {
    key: string;
    value: string;
    maxAge: number;
    path: string;
    expires: Date;
    httpOnly: boolean;
    sameSite: string;
    domain?: string;
    hostOnly?: boolean;
    creation: Date;
}