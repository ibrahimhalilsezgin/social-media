import { writable, type Writable } from "svelte/store";

export interface Post {
    id:string;
    account_id:string;
    description:string;
    filename:string;
    created:string;
    likes:[{
        username:string;
    }];
    comments:[{
        username:string;
        content:string;
        likes:[{
            username:string;
        }]
    }]
    
};

export const selectedPost: Writable<null> = writable(null);
export let showPostModal: Writable<boolean> = writable(false);
export let showLikesModal: Writable<boolean> = writable(false);
export let comment:Writable<string> = writable('');
