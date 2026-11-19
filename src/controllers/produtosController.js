const db = require("../database/connection");

exports.listar = async (req, res) => {
  try {
    const { categoria, ativo } = req.query;

    const consulta = db("produtos");

    if (categoria) {
      consulta.where("categoria", categoria);
    }

    if (ativo !== undefined) {
      if (ativo !== "true" && ativo !== "false") {
        return res.status(400).json({ erro: "Filtro ativo inválido" });
      }

      consulta.where("ativo", ativo === "true");
    }

    const produtos = await consulta.select("*");

    return res.status(200).json(produtos);
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao listar produtos" });
  }
};


exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await db("produtos")
      .where("id", id)
      .first();

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    return res.status(200).json(produto);
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao buscar produto" });
  }
};


exports.criar = async (req, res) => {
  try {
    const { nome, categoria, preco, estoque } = req.body;

    if (!nome || !categoria || preco === undefined || estoque === undefined) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios" });
    }

    if (typeof nome !== "string" || !nome.trim() ||
        nome.length > 80 || typeof categoria !== "string" ||
        !categoria.trim() || categoria.length > 30 ||
        typeof preco !== "number" || !Number.isFinite(preco) ||
        preco < 0 || typeof estoque !== "number" ||
        !Number.isInteger(estoque) || estoque < 0) {
      return res.status(400).json({ erro: "Dados do produto inválidos" });
    }

    const existente = await db("produtos").where("nome", nome).first();

    if (existente) {
      return res.status(409).json({ erro: "Produto já cadastrado" });
    }

    const [id] = await db("produtos").insert({
      nome, categoria, preco, estoque
    });

    return res.status(201).json({
      id, nome, categoria, preco, estoque, ativo: true
    });
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao cadastrar produto" });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, categoria, preco, estoque, ativo } = req.body;

    const produto = await db("produtos").where("id", id).first();

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    if (nome !== undefined && (typeof nome !== "string" || !nome.trim() || nome.length > 80)) {
      return res.status(400).json({ erro: "Nome inválido" });
    }

    if (categoria !== undefined && (typeof categoria !== "string" || !categoria.trim() || categoria.length > 30)) {
      return res.status(400).json({ erro: "Categoria inválida" });
    }

    if (preco !== undefined && (typeof preco !== "number" || !Number.isFinite(preco) || preco < 0)) {
      return res.status(400).json({ erro: "Preço inválido" });
    }

    if (estoque !== undefined && (!Number.isInteger(estoque) || estoque < 0)) {
      return res.status(400).json({ erro: "Estoque inválido" });
    }

    if (ativo !== undefined && typeof ativo !== "boolean") {
      return res.status(400).json({ erro: "Campo ativo inválido" });
    }

    if (nome !== undefined) {
      const existente = await db("produtos")
        .where("nome", nome)
        .whereNot("id", id)
        .first();

      if (existente) {
        return res.status(409).json({ erro: "Produto já cadastrado" });
      }
    }

    const dados = {};

    if (nome !== undefined) dados.nome = nome;
    if (categoria !== undefined) dados.categoria = categoria;
    if (preco !== undefined) dados.preco = preco;
    if (estoque !== undefined) dados.estoque = estoque;
    if (ativo !== undefined) dados.ativo = ativo;

    await db("produtos").where("id", id).update(dados);

    const atualizado = await db("produtos").where("id", id).first();

    return res.status(200).json(atualizado);
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao atualizar produto" });
  }
};

exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await db("produtos")
      .where("id", id)
      .first();

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const pedido = await db("pedidos")
      .where("produto_id", id)
      .first();

    if (pedido) {
      return res.status(409).json({
        erro: "Produto possui pedidos e não pode ser excluído"
      });
    }

    await db("produtos").where("id", id).del();

    return res.status(204).send();
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao excluir produto" });
  }
};