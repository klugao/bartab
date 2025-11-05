import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNegativeBalanceSinceToCustomer1730840000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna email (não mais utilizada)
    await queryRunner.dropColumn('customers', 'email');
    
    // Adicionar coluna negative_balance_since
    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'negative_balance_since',
        type: 'timestamptz',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter: remover negative_balance_since
    await queryRunner.dropColumn('customers', 'negative_balance_since');
    
    // Reverter: adicionar email de volta
    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }
}

