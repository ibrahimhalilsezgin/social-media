import { redirect } from '@sveltejs/kit';
import axios from 'axios';

export const load = async ({ locals, cookies }) => {
    if(!locals.user) return redirect(302, '/auth');
    const response = await axios({
        url:'http://localhost:3000/getSelfInfo',
        method:'get',
        headers:{
            Authorization: 'Bearer ' + cookies.get('token')
        }
    })
    return {        
        user: response.data
    };
};