import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Nom d\'utilisateur ou email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Set default permissions for sellers if not provided
    let permissions = createUserDto.permissions;
    if (createUserDto.role === 'seller' && !permissions) {
      permissions = {
        dashboard: true,
        pos: true,
        history: true,
        reports: true,
        profile: true
      };
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      permissions,
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'username', 'email', 'fullName', 'role', 'isActive', 'isSuperAdmin', 'permissions', 'createdAt', 'lastLoginAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'fullName', 'role', 'isActive', 'isSuperAdmin', 'permissions', 'createdAt', 'lastLoginAt'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    // Protect super admin
    if (user.isSuperAdmin) {
      // Prevent modification of isActive or isSuperAdmin fields
      delete updateData.isActive;
      delete updateData.isSuperAdmin;
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Log permissions reçues
    if (updateData.permissions) {
      console.log('Backend - Permissions reçues pour user', id, ':', JSON.stringify(updateData.permissions, null, 2));
    }

    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findOne(id);

    // Prevent deactivating super admin
    if (user.isSuperAdmin) {
      throw new BadRequestException('Impossible de désactiver le Super Admin');
    }

    await this.userRepository.update(id, { isActive: !user.isActive });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);

    // Prevent deleting super admin
    if (user.isSuperAdmin) {
      throw new BadRequestException('Impossible de supprimer le Super Admin');
    }

    // Vraie suppression de l'utilisateur
    await this.userRepository.delete(id);

    return { message: 'Utilisateur supprimé avec succès' };
  }

  async getStats(): Promise<any> {
    const users = await this.userRepository.find();

    const stats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      sellers: users.filter(u => u.role === 'seller').length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
    };

    return stats;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    // Récupérer l'utilisateur avec le mot de passe
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await this.userRepository.update(id, { password: hashedPassword });

    return { message: 'Mot de passe modifié avec succès' };
  }
}
