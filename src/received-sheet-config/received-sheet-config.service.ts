import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReceivedSheetConfigDto } from './dto/create-received-sheet-config.dto';
import { UpdateReceivedSheetConfigDto } from './dto/update-received-sheet-config.dto';
import { ReceivedSheetConfig } from './entities/received-sheet-config.entity';

@Injectable()
export class ReceivedSheetConfigService {
  constructor(
    @InjectRepository(ReceivedSheetConfig)
    private readonly configRepository: Repository<ReceivedSheetConfig>,
  ) {}

  async create(
    createDto: CreateReceivedSheetConfigDto,
  ): Promise<ReceivedSheetConfig> {
    const config = this.configRepository.create(createDto);
    return this.configRepository.save(config);
  }

  async findAll(): Promise<ReceivedSheetConfig[]> {
    return this.configRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ReceivedSheetConfig> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(
        `Configuration avec l'id ${id} introuvable`,
      );
    }
    return config;
  }

  async findActive(): Promise<ReceivedSheetConfig> {
    // Retourne la configuration la plus récente (il devrait y avoir qu'une seule)
    const configs = await this.configRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });
    const config = configs.length > 0 ? configs[0] : null;

    // Si aucune config n'existe, créer une config par défaut
    if (!config) {
      return this.create({
        showLogo: true,
        logoUrl: '',
        companyName: 'StockLite',
        companyAddress: 'Port-au-Prince, Haiti',
        companyPhone: '+509 1234-5678',
        companyEmail: 'contact@stocklite.com',
        taxId: 'NIF: 123456789',
        showProductDetails: true,
        showPaymentMethod: true,
        showTax: true,
        footerMessage: 'Merci de votre visite ! À bientôt.',
        fontSize: 12,
        paperWidth: 80,
        mobilePosName: 'POS Mobile 1',
        mobilePinCode: '',
        mobileEnabled: false,
        mobileAllowOffline: true,
        mobileAutoSync: true,
      });
    }

    return config;
  }

  async update(
    id: string,
    updateDto: UpdateReceivedSheetConfigDto,
  ): Promise<ReceivedSheetConfig> {
    const config = await this.findOne(id);
    Object.assign(config, updateDto);
    return this.configRepository.save(config);
  }

  async updateActive(
    updateDto: UpdateReceivedSheetConfigDto,
  ): Promise<ReceivedSheetConfig> {
    const config = await this.findActive();
    Object.assign(config, updateDto);
    return this.configRepository.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.configRepository.remove(config);
  }
}
