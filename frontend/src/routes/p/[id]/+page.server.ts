import { PUBLIC_BACKEND_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import axios from 'axios';


export const load = async ({ locals, params, cookies }) => {
    const token = cookies.get('token');
    try {
        const response = await axios({
            url: `${PUBLIC_BACKEND_URL}/posts/postPage/`,
            method:'post',
            data:{
                id: params.id
            },
            headers: {
                Authorization: 'Bearer ' + token ? token : '' 
            }
        });
        console.log(response.data)
        if(response.status == 200) {
            console.log(response.data)
            if(locals.user) {
                return {
                    post: response.data,
                };
            }
            return {
                post: response.data,
                user: locals.user

            };
        }
    } catch (error) {
        console.log(error.response.data)

        if(error.response.status == 403) return redirect(302, '/auth');
        // if(error.response.status == 404) return redirect(302, '/')
    }
};
