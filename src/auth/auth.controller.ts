import { Controller, Post, Body, UseGuards, Request, Ip } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur', description: 'Authentifie un utilisateur et retourne un token JWT.' })
  @ApiResponse({ status: 200, description: 'Connexion réussie. Retourne le token JWT et les infos utilisateur.' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects.' })
  @ApiBody({ type: LoginDto })
  async login(@Request() req, @Body() body: any, @Ip() ipAddress: string) {
    const userAgent = req.headers['user-agent'] || '';

    // Extract optional geolocation data from body
    const sessionData = {
      ipAddress,
      userAgent,
      latitude: body.latitude,
      longitude: body.longitude,
      city: body.city,
      country: body.country,
      location: body.location,
    };

    return this.authService.login(req.user, sessionData);
  }

  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur', description: 'Crée un nouveau compte utilisateur dans le système.' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès. Retourne le token JWT.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 409, description: 'Username ou email déjà utilisé.' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password,
      createUserDto.fullName,
      createUserDto.role,
      createUserDto.permissions,
      createUserDto.isSuperAdmin,
    );
  }
}
