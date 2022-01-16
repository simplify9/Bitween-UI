
interface IProfile{
    id?:string
    name?:string
    role?: UserRole
}

export type UserRole = 'Admin';

export default IProfile;
