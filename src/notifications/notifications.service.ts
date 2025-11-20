import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    // Vérifier si une notification similaire existe déjà pour ce produit
    if (createNotificationDto.productId) {
      const existingNotification = await this.notificationRepository.findOne({
        where: {
          productId: createNotificationDto.productId,
          type: NotificationType.WARNING,
          read: false
        }
      });

      // Si une notification non lue existe déjà pour ce produit, ne pas créer de doublon
      if (existingNotification) {
        return existingNotification;
      }
    }

    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findUnread(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { read: false },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.read = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationRepository.update(
      { read: false },
      { read: true }
    );
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async cleanOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
      read: true
    });
  }
}
