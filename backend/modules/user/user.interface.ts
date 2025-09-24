export interface User {
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
