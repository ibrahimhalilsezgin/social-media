import axios from 'axios';

export const load = async ({ locals, cookies }) => {

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