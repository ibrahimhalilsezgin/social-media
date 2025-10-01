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