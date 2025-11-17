import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { userId: string; role: string }) {
    this.connectedClients.set(client.id, payload.userId);
    console.log(`Utilisateur ${payload.userId} (${payload.role}) enregistré`);
  }

  @SubscribeMessage('sale-created')
  handleSaleCreated(client: Socket, payload: any) {
    this.server.emit('sale-update', payload);
  }

  @SubscribeMessage('product-updated')
  handleProductUpdated(client: Socket, payload: any) {
    this.server.emit('product-update', payload);
  }

  @SubscribeMessage('stock-alert')
  handleStockAlert(client: Socket, payload: any) {
    this.server.emit('stock-alert', payload);
  }

  notifyNewSale(sale: any) {
    this.server.emit('new-sale', sale);
  }

  notifyProductUpdate(product: any) {
    this.server.emit('product-updated', product);
  }

  notifyLowStock(product: any) {
    this.server.emit('low-stock-alert', product);
  }

  // Notifications pour les demandes de suppression
  notifyNewDeletionRequest(request: any) {
    this.server.emit('new-deletion-request', request);
  }

  notifyDeletionRequestApproved(request: any) {
    this.server.emit('deletion-request-approved', request);
  }

  notifyDeletionRequestRejected(request: any) {
    this.server.emit('deletion-request-rejected', request);
  }
}
