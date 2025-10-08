<script>
    import { io } from "socket.io-client";
	import { getCookie } from "$lib/utils/cookies.util";
    import { browser } from "$app/environment";
	import { PUBLIC_BACKEND_URL } from "$env/static/public";
    
    if(getCookie('token')) {
        
        const socket = io(PUBLIC_BACKEND_URL, {
            auth: { token: getCookie('token') }
        });
        console.log(socket)


        if(browser) {
            socket.on("notification", (data) => {

                const notification = new Notification(data.title, {
                    body: data.content,
                    icon: data.image,
                })

                if(data.url) {
                    notification.onclick = (ev) => {
                        ev.preventDefault();
                        window.open(data.url)
                    }
                }
            });
            if("Notification" in window) {
                Notification.requestPermission().then(permission => {
                    if(permission === "granted") {
                        console.log('Bildirim izni verildi.!');
                    } else {
                        console.log('Bildirim izni reddedildi.')
                    }
                })
            } else {
                console.log('Tarayıcı bildirimleri desteklemiyor');
            }

        }

    
    }
    


</script>