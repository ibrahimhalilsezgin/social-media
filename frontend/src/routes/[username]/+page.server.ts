import axios from 'axios';
import { getCookie } from '../../utils/cookies.util.js';

export const load = async ({ locals, params, cookies }) => {
  let user;
  let u;

  const token = cookies.get('token');
  if (token) {
    try {
      const response = await axios.get('http://localhost:3000/getSelfInfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      u = response.data;
    } catch (e) {
    }
  }

  try {
    if(locals.user) {
      const response = await axios.get('http://localhost:3000/getUserFromUsername', {
        data: { username: params.username }, 
        headers:{
          Authorization: 'Bearer ' + cookies.get('token')
        }
      });
      console.log('kullanıcı var ', locals.user.username);
      console.log(response.data)
    user = response.data;
    } else {
      const response = await axios.get('http://localhost:3000/getUserFromUsername', {
        data: { username: params.username }, 

      });
      console.log('kullanıcı yok');
    user = response.data;
    }
  } catch (e) {
  }

  if (!locals.user) {
    return {
      usr: null,
      user,
    };
  }

  return {
    usr: locals.user,
    user,
    extUser: u || null
  };
};
