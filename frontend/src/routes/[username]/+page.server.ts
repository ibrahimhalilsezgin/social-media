import axios from 'axios';

export const load = async ({ locals,params, cookies }) => {
    
    let user;
    const u = await axios({
        url:'http://localhost:3000/getSelfInfo',
        method:'GET',
        headers:{
            Authorization: 'Bearer ' + cookies.get('token')
        }
    })
    try {
        const response = await axios({
            url:'http://localhost:3000/getUserFromUsername',
            method:'get',
            data:{
                username: params.username
            }
        });
        
        user = response.data;
        
    } catch(e) {
        console.log(e)
    }   

    
    return {        
        usr: locals.user,
        user: user,
        extUser: u.data
        
    };
};