const db = require("../database/connection");


exports.listar = async (req, res) => {
  try {
    const { aluno_nome } = req.query;

    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);

    if (!Number.isInteger(limit) || limit < 1 ||
        !Number.isInteger(offset) || offset < 0) {
      return res.status(400).json({ erro: "Paginação inválida" });
    }

    const consulta = db("pedidos");

    if (aluno_nome) {
      consulta.where("aluno_nome", aluno_nome);
    }

    const pedidos = await consulta
      .select("*")
      .orderBy("id")
      .limit(limit)
      .offset(offset);

    return res.status(200).json(pedidos);
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao listar pedidos" });
  }
};


exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await db("pedidos")
      .join("produtos", "pedidos.produto_id", "produtos.id")
      .select(
        "pedidos.id",
        "pedidos.aluno_nome",
        "produtos.nome as produto_nome",
        "pedidos.quantidade",
        "pedidos.valor_total",
        "pedidos.created_at",
        "pedidos.updated_at"
      )
      .where("pedidos.id", id)
      .first();

    if (!pedido) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    return res.status(200).json(pedido);
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao buscar pedido" });
  }
};


exports.criar = async (req, res) => {
  try {
    const { aluno_nome, produto_id, quantidade } = req.body;

    if (typeof aluno_nome !== "string" || !aluno_nome.trim() ||
        aluno_nome.length > 100 ||
        !Number.isInteger(produto_id) || produto_id < 1 ||
        !Number.isInteger(quantidade) || quantidade < 1) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    const resultado = await db.transaction(async (trx) => {
      const produto = await trx("produtos")
        .where("id", produto_id)
        .first();

      if (!produto) {
        return { status: 404, erro: "Produto não encontrado" };
      }

      if (!produto.ativo) {
        return { status: 400, erro: "Produto inativo" };
      }

      if (produto.estoque < quantidade) {
        return { status: 409, erro: "Estoque insuficiente" };
      }

      const valor_total = Math.round(
        produto.preco * quantidade * 100
      ) / 100;

      const [id] = await trx("pedidos").insert({
        aluno_nome,
        produto_id,
        quantidade,
        valor_total
      });

      const atualizado = await trx("produtos")
        .where("id", produto_id)
        .where("estoque", ">=", quantidade)
        .decrement("estoque", quantidade);

      if (atualizado === 0) {
        throw new Error("Estoque alterado durante a compra");
      }

      return {
        status: 201,
        pedido: {
          id,
          aluno_nome,
          produto_id,
          quantidade,
          valor_total
        }
      };
    });

    if (resultado.erro) {
      return res.status(resultado.status).json({
        erro: resultado.erro
      });
    }

    return res.status(201).json(resultado.pedido);
  } catch (erro) {
    if (erro.message === "Estoque alterado durante a compra") {
      return res.status(409).json({ erro: "Estoque insuficiente" });
    }

    return res.status(500).json({ erro: "Erro ao criar pedido" });
  }
};


exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await db.transaction(async (trx) => {
      const pedido = await trx("pedidos")
        .where("id", id)
        .first();

      if (!pedido) {
        return false;
      }

      await trx("produtos")
        .where("id", pedido.produto_id)
        .increment("estoque", pedido.quantidade);

      await trx("pedidos")
        .where("id", id)
        .del();

      return true;
    });

    if (!resultado) {
      return res.status(404).json({ erro: "Pedido não encontrado" });
    }

    return res.status(204).send();
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao cancelar pedido" });
  }
};