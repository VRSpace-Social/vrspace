import { getAuthCookie, getNotifications, getUserInfo, searchUser, seeOnlineFriends } from '../utils/vrcAPI';

async function main()
{
    /*
    const friendData = await seeOnlineFriends();
    console.log(friendData);
    const userData = await getUserInfo("usr_37a5ed4f-ea32-4d7a-9051-cb4883f5e8b0"); //IFritDemonGoat
    console.log(userData)
    const resp = await searchUser("Wynter 7");
    console.log(resp);
    */
    const resp2  = await getNotifications();
    console.log(resp2);
    
}

main();