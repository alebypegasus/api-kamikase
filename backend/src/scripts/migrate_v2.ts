import { db } from '../config/database';

async function run() {
    try {
        console.log('Running migrate_v2...');
        
        // Check if `parent_id` exists in `categorias`
        const [rowsP]: any = await db.execute("SHOW COLUMNS FROM categorias LIKE 'parent_id'");
        if (rowsP.length === 0) {
            await db.execute("ALTER TABLE categorias ADD COLUMN parent_id INT DEFAULT NULL");
            await db.execute("ALTER TABLE categorias ADD CONSTRAINT fk_categoria_parent FOREIGN KEY (parent_id) REFERENCES categorias(id) ON DELETE CASCADE");
            console.log('Added parent_id to categorias');
        } else {
            console.log('parent_id already exists in categorias');
        }

        console.log('Migration v2 completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

run();
