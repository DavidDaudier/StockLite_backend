import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletionRequest, DeletionRequestStatus } from './deletion-request.entity';
import { CreateDeletionRequestDto } from './dto/create-deletion-request.dto';
import { UpdateDeletionRequestDto } from './dto/update-deletion-request.dto';
import { Sale } from '../sales/sale.entity';
import { SaleItem } from '../sales/sale-item.entity';
import { ProductsService } from '../products/products.service';
import { SyncGateway } from '../sync/sync.gateway';

@Injectable()
export class DeletionRequestsService {
  private readonly EDIT_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(DeletionRequest)
    private deletionRequestRepository: Repository<DeletionRequest>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    private productsService: ProductsService,
    private syncGateway: SyncGateway,
  ) {}

  /**
   * Créer une nouvelle demande de suppression
   */
  async create(createDto: CreateDeletionRequestDto, userId: string, userFullName: string): Promise<DeletionRequest> {
    // Vérifier que la vente existe
    const sale = await this.saleRepository.findOne({
      where: { id: createDto.saleId },
      relations: ['seller'],
    });

    if (!sale) {
      throw new NotFoundException('Vente non trouvée');
    }

    // Vérifier qu'il n'existe pas déjà une demande en attente pour cette vente
    const existingRequest = await this.deletionRequestRepository.findOne({
      where: {
        saleId: createDto.saleId,
        status: DeletionRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Une demande de suppression est déjà en attente pour cette vente');
    }

    const deletionRequest = this.deletionRequestRepository.create({
      saleId: createDto.saleId,
      saleTicketNo: createDto.saleTicketNo,
      sellerId: userId,
      sellerName: userFullName || sale.seller.username,
      reasons: createDto.reasons,
      description: createDto.description,
      status: DeletionRequestStatus.PENDING,
    });

    const savedRequest = await this.deletionRequestRepository.save(deletionRequest);

    // Émettre l'événement WebSocket pour notifier les super admins
    this.syncGateway.notifyNewDeletionRequest(savedRequest);

    return savedRequest;
  }

  /**
   * Récupérer toutes les demandes (pour super admin)
   */
  async findAll(): Promise<DeletionRequest[]> {
    return await this.deletionRequestRepository.find({
      relations: ['sale', 'seller'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupérer les demandes d'un vendeur spécifique
   */
  async findBySeller(sellerId: string): Promise<DeletionRequest[]> {
    return await this.deletionRequestRepository.find({
      where: { sellerId },
      relations: ['sale'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupérer les demandes en attente
   */
  async findPending(): Promise<DeletionRequest[]> {
    return await this.deletionRequestRepository.find({
      where: { status: DeletionRequestStatus.PENDING },
      relations: ['sale', 'seller'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupérer une demande par ID
   */
  async findOne(id: string): Promise<DeletionRequest> {
    const request = await this.deletionRequestRepository.findOne({
      where: { id },
      relations: ['sale', 'seller'],
    });

    if (!request) {
      throw new NotFoundException('Demande non trouvée');
    }

    return request;
  }

  /**
   * Vérifier si une vente a une demande en attente
   */
  async hasPendingRequest(saleId: string): Promise<boolean> {
    const request = await this.deletionRequestRepository.findOne({
      where: {
        saleId,
        status: DeletionRequestStatus.PENDING,
      },
    });

    return !!request;
  }

  /**
   * Récupérer la demande en attente pour une vente
   */
  async getPendingRequestForSale(saleId: string): Promise<DeletionRequest | null> {
    return await this.deletionRequestRepository.findOne({
      where: {
        saleId,
        status: DeletionRequestStatus.PENDING,
      },
    });
  }

  /**
   * Mettre à jour une demande (par le vendeur, uniquement si < 5 min)
   */
  async update(id: string, reasons: string[], description: string, userId: string): Promise<DeletionRequest> {
    const request = await this.findOne(id);

    // Vérifier que c'est le vendeur qui a créé la demande
    if (request.sellerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette demande');
    }

    // Vérifier que la demande est en attente
    if (request.status !== DeletionRequestStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    // Vérifier le délai de modification (5 minutes)
    if (!this.canEdit(request)) {
      throw new BadRequestException('Le délai de modification (5 minutes) est dépassé');
    }

    request.reasons = reasons;
    request.description = description;

    return await this.deletionRequestRepository.save(request);
  }

  /**
   * Approuver une demande (super admin uniquement)
   */
  async approve(id: string, adminResponse?: string): Promise<DeletionRequest> {
    const request = await this.findOne(id);

    if (request.status !== DeletionRequestStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    // Sauvegarder le saleId avant de le mettre à null
    const saleIdToDelete = request.saleId;

    // Mettre à jour la demande AVANT de supprimer la vente
    // Mettre saleId à null pour éviter l'erreur de contrainte de clé étrangère
    request.status = DeletionRequestStatus.APPROVED;
    request.adminResponse = adminResponse || 'Demande approuvée et vente supprimée';
    request.adminResponseAt = new Date();
    request.saleId = null; // Important: libérer la contrainte FK
    await this.deletionRequestRepository.save(request);

    // IMPORTANT: Mettre à jour TOUTES les autres demandes qui pointent vers cette vente
    // pour éviter les erreurs de contrainte FK
    await this.deletionRequestRepository.update(
      { saleId: saleIdToDelete },
      { saleId: null }
    );

    // Supprimer la vente et restaurer le stock APRÈS avoir libéré toutes les FK
    await this.deleteSaleAndRestoreStock(saleIdToDelete);

    // Recharger la demande sans la relation 'sale' qui n'existe plus
    const updatedRequest = await this.deletionRequestRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    // Émettre l'événement WebSocket pour notifier le seller
    this.syncGateway.notifyDeletionRequestApproved(updatedRequest);
    return updatedRequest;
  }

  /**
   * Rejeter une demande (super admin uniquement)
   */
  async reject(id: string, adminResponse: string): Promise<DeletionRequest> {
    const request = await this.findOne(id);

    if (request.status !== DeletionRequestStatus.PENDING) {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }

    if (!adminResponse || adminResponse.trim() === '') {
      throw new BadRequestException('Une raison de rejet est obligatoire');
    }

    request.status = DeletionRequestStatus.REJECTED;
    request.adminResponse = adminResponse;
    request.adminResponseAt = new Date();

    const savedRequest = await this.deletionRequestRepository.save(request);

    // Émettre l'événement WebSocket pour notifier le seller
    this.syncGateway.notifyDeletionRequestRejected(savedRequest);

    return savedRequest;
  }

  /**
   * Vérifier si une demande peut encore être modifiée
   */
  canEdit(request: DeletionRequest): boolean {
    if (request.status !== DeletionRequestStatus.PENDING) {
      return false;
    }

    const now = new Date().getTime();
    const createdAt = new Date(request.createdAt).getTime();
    const timeDiff = now - createdAt;

    return timeDiff < this.EDIT_TIME_LIMIT;
  }

  /**
   * Supprimer la vente et restaurer le stock
   */
  private async deleteSaleAndRestoreStock(saleId: string): Promise<void> {
    // Récupérer la vente avec ses items
    const sale = await this.saleRepository.findOne({
      where: { id: saleId },
      relations: ['items'],
    });

    if (!sale) {
      throw new NotFoundException('Vente non trouvée');
    }

    // Restaurer le stock pour chaque item
    for (const item of sale.items) {
      await this.productsService.updateStock(item.productId, item.quantity);
    }

    // Supprimer les items de la vente
    await this.saleItemRepository.delete({ saleId });

    // Supprimer la vente
    await this.saleRepository.delete(saleId);
  }

  /**
   * Supprimer une demande (cascade delete si la vente est supprimée)
   */
  async remove(id: string): Promise<void> {
    const request = await this.findOne(id);
    await this.deletionRequestRepository.remove(request);
  }
}
