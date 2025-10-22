import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import axios from 'axios';

export const load = async ({ locals, cookies }) => {
    try {
        const response =  await axios({
            method:'get',
            url: `${PUBLIC_BACKEND_URL}/admin/`,
            headers:{
                Authorization: 'Bearer ' + cookies.get('token')
            }
        });
        if(response.status == 200) {
            return {
                info: response.data,
                user: locals.user
            }
            
        }
    } catch (err) {
        redirect(303, '/');
    }
}; 