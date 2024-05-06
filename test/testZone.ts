import { doLogin, doLogout, getAuthCookie, getNotifications, getUserInfo, searchUser, seeOnlineFriends } from '../utils/vrcAPI';

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
    const resp2  = await seeOnlineFriends();
    console.log(resp2);
    
    //const resp3 = await doLogout();
    //console.log(resp3);
}


async function main2()
{
    const resp = await doLogin().then(async () => {
        console.log("logged in"); 
    });
}

main();