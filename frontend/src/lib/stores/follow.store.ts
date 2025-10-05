import axios from "axios";
import { getCookie } from "$lib/utils/cookies.util";

export let error = {
    status:false,
    message:''
}


export const acceptRequest = async (username:string) => {
    console.log(username)
    try {
        const response = await axios({
            url:`http://localhost:3000/acceptFollowRequest`,
            method:'post',
            data:{
                username: username
            },
            headers:{
                Authorization: 'Bearer ' + getCookie('token')
            }
        });

        if(response.status == 200) {
            window.location.reload()
        }
    } catch(err:any) {
        error = {
            status: true,
            message: err.response.data
        }

        setTimeout(() => {
            error.status = false
        }, 3400)
    }
}

export const declineRequest = async (username:string) => {
    try {
        const response = await axios({
            url:`http://localhost:3000/declineFollowRequest`,
            method:'post',
            data:{
                username: username
            },
            headers:{
                Authorization: 'Bearer ' + getCookie('token')
            }
        });

        if(response.status == 200) {
            window.location.reload()
        }
    } catch(err:any) {
        error = {
            status: true,
            message: err.response.data
        }

        setTimeout(() => {
            error.status = false
        }, 3400)
    }
}