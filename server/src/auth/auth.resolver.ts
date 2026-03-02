import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User, { name: 'login' })
  login(@Args('name') name: string) {
    return this.authService.login(name);
  }
}
