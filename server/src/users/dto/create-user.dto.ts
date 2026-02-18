export class CreateUserDto {
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'MEMBER';
    country: 'INDIA' | 'AMERICA';
    payment?: string;
}
