import axios from 'axios';

export const load = async ({ locals, params, cookies }) => {
  let user;
  let u;

  // Token varsa self info çek
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
      console.log('getSelfInfo error:', e.message);
    }
  }

  try {
    const response = await axios.get('http://localhost:3000/getUserFromUsername', {
      data: { username: params.username }, // GET için params kullan
    });
    user = response.data;
  } catch (e) {
    console.log('getUserFromUsername error:', e.message);
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
    extUser: u || null,
  };
};
