import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import axios from 'axios';

export const load = async ({ locals, cookies, params }) => {
    if(!locals.user) return redirect(302, '/auth');
    const response = await axios({
        url: `${PUBLIC_BACKEND_URL}/conversations/getChat/${params.username}/${params.id}`,
        method:'get',
        headers:{
            Authorization: 'Bearer ' + cookies.get('token')
        }
    });

    return {        
        conversations: response.data,
        user: locals.user
    };
};