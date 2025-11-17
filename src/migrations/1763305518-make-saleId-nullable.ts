import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeSaleIdNullable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la contrainte de clé étrangère
    await queryRunner.query(`ALTER TABLE "deletion_requests" DROP CONSTRAINT IF EXISTS "FK_9c8c62fa30696d0fafce055b2d0"`);
    
    // Rendre la colonne nullable
    await queryRunner.query(`ALTER TABLE "deletion_requests" ALTER COLUMN "saleId" DROP NOT NULL`);
    
    // Recréer la contrainte de clé étrangère avec ON DELETE SET NULL
    await queryRunner.query(`
      ALTER TABLE "deletion_requests" 
      ADD CONSTRAINT "FK_9c8c62fa30696d0fafce055b2d0" 
      FOREIGN KEY ("saleId") 
      REFERENCES "sales"("id") 
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la contrainte de clé étrangère
    await queryRunner.query(`ALTER TABLE "deletion_requests" DROP CONSTRAINT IF EXISTS "FK_9c8c62fa30696d0fafce055b2d0"`);
    
    // Remettre NOT NULL
    await queryRunner.query(`ALTER TABLE "deletion_requests" ALTER COLUMN "saleId" SET NOT NULL`);
    
    // Recréer la contrainte de clé étrangère originale
    await queryRunner.query(`
      ALTER TABLE "deletion_requests" 
      ADD CONSTRAINT "FK_9c8c62fa30696d0fafce055b2d0" 
      FOREIGN KEY ("saleId") 
      REFERENCES "sales"("id")
    `);
  }
}
