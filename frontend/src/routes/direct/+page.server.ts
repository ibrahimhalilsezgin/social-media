import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import axios from 'axios';

export const load = async ({ locals, cookies, params }) => {
    if(!locals.user) return redirect(302, '/auth');
    const response = await axios({
        url: PUBLIC_BACKEND_URL + '/getSelfInfo',
        method:'get',
        headers:{
            Authorization: 'Bearer ' + cookies.get('token')
        }
    });
    const conversations = await axios({
        url: `${PUBLIC_BACKEND_URL}/conversations/getConversations`,
        method:'get',
        headers:{
            Authorization: 'Bearer ' + cookies.get('token')
        }
    })
    return {        
        user: response.data,
        conversations: conversations.data
    };
};