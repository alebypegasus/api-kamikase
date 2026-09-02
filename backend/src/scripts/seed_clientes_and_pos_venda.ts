import { db, closeDatabase } from '../config/database';
import { RowDataPacket } from 'mysql2';

async function seedClientesAndPosVenda() {
    console.log('🌱 Populando clientes de exemplo e acompanhamentos de Pós-Venda...');
    const conn = await db.getConnection();

    try {
        // Obter todos os usuários lojistas
        const [usuarios] = await conn.execute<RowDataPacket[]>('SELECT id, nome FROM usuarios WHERE is_admin = FALSE');

        const clientesModelos = [
            { nome: 'Carlos Eduardo Silveira', cpf: '112.334.556-78', tel: '(21) 98765-4321', email: 'carlos.silveira@email.com', end: 'Rua das Flores, 120 - Niterói' },
            { nome: 'Mariana Costa Ramos', cpf: '223.445.667-89', tel: '(21) 99123-4567', email: 'mariana.costa@email.com', end: 'Av. Jornalista Alberto Torres, 450 - Icaraí' },
            { nome: 'Fernando Albuquerque', cpf: '334.556.778-90', tel: '(21) 97654-3210', email: 'fernando.alb@email.com', end: 'Rua Coronel Moreira César, 210 - Niterói' },
            { nome: 'Juliana Mendes Rocha', cpf: '445.667.889-01', tel: '(21) 98877-6655', email: 'juliana.rocha@email.com', end: 'Av. das Américas, 3000 - Barra da Tijuca' },
            { nome: 'Roberto Dias Castro', cpf: '556.778.990-12', tel: '(21) 97112-2334', email: 'roberto.dias@email.com', end: 'Rua das Laranjeiras, 140 - Rio de Janeiro' }
        ];

        for (const user of usuarios) {
            // Inserir clientes para cada usuário se não houver
            const [existing] = await conn.execute<RowDataPacket[]>('SELECT id FROM clientes WHERE usuarios_id = ?', [user.id]);
            const clientIds: number[] = [];

            if (existing.length === 0) {
                for (const c of clientesModelos) {
                    const [res]: any = await conn.execute(
                        `INSERT INTO clientes (usuarios_id, nome, cpf_cnpj, telefone, email, endereco) VALUES (?, ?, ?, ?, ?, ?)`,
                        [user.id, c.nome, c.cpf, c.tel, c.email, c.end]
                    );
                    clientIds.push(res.insertId);
                }
            } else {
                existing.forEach(row => clientIds.push(row.id));
            }

            // Buscar vendas deste lojista
            const [vendas] = await conn.execute<RowDataPacket[]>('SELECT id, cliente_id, cliente_nome FROM vendas WHERE usuarios_id = ? ORDER BY id ASC', [user.id]);

            // Atualizar algumas vendas com clientes e gerar pos_venda
            const statuses = ['Satisfeito', 'Contatado', 'Pendente', 'Concluido', 'Troca/Garantia'];
            const observacoesExemplos = [
                'Cliente adorou a qualidade do produto e o atendimento rápido!',
                'Contato feito via WhatsApp. Cliente confirmou recebimento e está muito satisfeito.',
                'Aguardando contato de rotina de 7 dias pós-compra.',
                'Atendimento concluído com sucesso. Cliente fidelizado.',
                'Cliente solicitou suporte sobre garantia de fábrica. Dúvida esclarecida.'
            ];

            for (let i = 0; i < vendas.length; i++) {
                const venda = vendas[i];
                const clienteEscolhido = clientesModelos[i % clientesModelos.length];
                const clienteId = clientIds[i % clientIds.length];

                // Atualizar venda com nome do cliente
                await conn.execute(
                    'UPDATE vendas SET cliente_id = ?, cliente_nome = ? WHERE id = ?',
                    [clienteId, clienteEscolhido.nome, venda.id]
                );

                // Verificar se já existe pós-venda para esta venda
                const [pvExist] = await conn.execute<RowDataPacket[]>('SELECT id FROM pos_venda WHERE vendas_id = ?', [venda.id]);
                if (pvExist.length === 0) {
                    const status = statuses[i % statuses.length];
                    const satisfacao = status === 'Satisfeito' ? 5 : (status === 'Concluido' ? 4 : (status === 'Contatado' ? 4 : null));
                    const obs = observacoesExemplos[i % observacoesExemplos.length];

                    await conn.execute(
                        `INSERT INTO pos_venda (vendas_id, usuarios_id, cliente_id, status, satisfacao, observacoes, data_contato) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            venda.id,
                            user.id,
                            clienteId,
                            status,
                            satisfacao,
                            obs,
                            status !== 'Pendente' ? new Date() : null
                        ]
                    );
                }
            }
        }

        console.log('✅ Clientes e registros de Pós-Venda populados com sucesso!');
    } catch (err) {
        console.error('❌ Erro ao popular pós-venda:', err);
        throw err;
    } finally {
        conn.release();
        await closeDatabase();
    }
}

seedClientesAndPosVenda().catch(() => process.exit(1));
