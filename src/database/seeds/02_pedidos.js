exports.seed = async function(knex) {
  await knex("pedidos").del();

  await knex("pedidos").insert([
    {
      aluno_nome: "Ana",
      produto_id: 1,
      quantidade: 2,
      valor_total: 16.00,
      created_at: "2026-11-10 10:00:00",
      updated_at: "2026-11-10 10:00:00"
    },
    {
      aluno_nome: "Carlos",
      produto_id: 2,
      quantidade: 1,
      valor_total: 7.00,
      created_at: "2026-11-11 11:00:00",
      updated_at: "2026-11-11 11:00:00"
    },
    {
      aluno_nome: "Julia",
      produto_id: 4,
      quantidade: 3,
      valor_total: 18.00,
      created_at: "2026-11-12 12:00:00",
      updated_at: "2026-11-12 12:00:00"
    },
    {
      aluno_nome: "Pedro",
      produto_id: 3,
      quantidade: 2,
      valor_total: 10.00,
      created_at: "2026-11-13 13:00:00",
      updated_at: "2026-11-13 13:00:00"
    },
    {
      aluno_nome: "Mariana",
      produto_id: 5,
      quantidade: 1,
      valor_total: 7.00,
      created_at: "2026-11-14 14:00:00",
      updated_at: "2026-11-14 14:00:00"
    }
  ]);
};