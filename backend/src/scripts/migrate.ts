import { db } from '../config/database';

async function run() {
    try {
        console.log('Running migrations...');
        
        // Check if `descricao` exists in `produtos`
        const [rowsP]: any = await db.execute("SHOW COLUMNS FROM produtos LIKE 'descricao'");
        if (rowsP.length === 0) {
            await db.execute("ALTER TABLE produtos ADD COLUMN descricao TEXT");
            console.log('Added descricao to produtos');
        }

        // Check if `desconto` exists in `vendas`
        const [rowsVD]: any = await db.execute("SHOW COLUMNS FROM vendas LIKE 'desconto'");
        if (rowsVD.length === 0) {
            await db.execute("ALTER TABLE vendas ADD COLUMN desconto DECIMAL(10,2) DEFAULT 0.00");
            console.log('Added desconto to vendas');
        }

        const [rowsVF]: any = await db.execute("SHOW COLUMNS FROM vendas LIKE 'forma_pagamento'");
        if (rowsVF.length === 0) {
            await db.execute("ALTER TABLE vendas ADD COLUMN forma_pagamento VARCHAR(50)");
            console.log('Added forma_pagamento to vendas');
        }

        const [rowsVP]: any = await db.execute("SHOW COLUMNS FROM vendas LIKE 'parcelas'");
        if (rowsVP.length === 0) {
            await db.execute("ALTER TABLE vendas ADD COLUMN parcelas INT DEFAULT 1");
            console.log('Added parcelas to vendas');
        }

        console.log('Migrations completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

run();
