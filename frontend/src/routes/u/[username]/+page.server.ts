import axios from 'axios';

export const load = async ({ locals, params, cookies }) => {
  
  let user;
  let u;

  const token = cookies.get('token');
  if (token) {
    try {
      const response = await axios.get('https://backend.ibo.rocks/getSelfInfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      u = response.data;
    } catch (e) {
      console.log(e);
    }
  }

  try {
    if(locals.user) {
      const response = await axios.get('https://backend.ibo.rocks/getUserFromUsername', {
        data: { username: params.username }, 
        headers:{
          Authorization: 'Bearer ' + cookies.get('token')
        }
      });
      console.log('kullanıcı var ', locals.user.username);
      console.log(response.data)
    user = response.data;
    } else {
      const response = await axios.get('https://backend.ibo.rocks/getUserFromUsername', {
        data: { username: params.username }, 

      });
      console.log('kullanıcı yok');
    user = response.data;
    }
  } catch (e) {
      console.log(e);

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
