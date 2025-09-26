import { redirect } from '@sveltejs/kit';
import axios from 'axios';

export const load = async ({ locals, cookies }) => {
    if(!locals.user) redirect(302, '/auth')
    
    const token = cookies.get('token');

    
    const response = await axios({
        url:'http://localhost:3000/getFollowRequests',
        method:'get',
        headers:{
            Authorization: 'Bearer ' + token
        }
    })
    console.log(response.data)
    return {        
        user: locals.user,
        followRequests: response.data
    };
};