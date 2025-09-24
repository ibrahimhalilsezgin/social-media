import axios from 'axios';

export const load = async ({ locals,params }) => {
    
    let user;
    try {
        const response = await axios({
            url:'http://localhost:3000/getUserFromUsername',
            method:'get',
            data:{
                username: params.username
            }
        });
        console.log(response.data)
        user = response.data
    } catch(e) {
        console.log(e.response.status)

    }

    
    return {        
        usr: locals.user,
        user: user
    };
};