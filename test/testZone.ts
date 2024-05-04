import { getAuthCookie, getNotifications, getUserInfo, searchUser } from '../utils/vrcAPI';

async function main()
{
    /*
    const resp = await searchUser("Wynter 7");
    console.log(resp);
    */
    const resp2  = await getNotifications();
    console.log(resp2);
    
}

main();