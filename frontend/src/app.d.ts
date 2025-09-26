// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
interface User {
    id:string;
    username:string;
    email:string;
    password:string;
    profilePhoto:string;
    biography:string;
    followers:[];
    following:[];
    posts:[];
    private:boolean;
    adminLevel:number;
    created:string;
    createdAt:Date;
    status:boolean;
    verified:boolean
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
