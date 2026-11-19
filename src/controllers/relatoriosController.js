const db = require("../database/connection");

exports.vendasPorCategoria = async (req, res) => {
  try {
    const relatorio = await db("pedidos")
      .join("produtos", "pedidos.produto_id", "produtos.id")
      .select("produtos.categoria")
      .sum("pedidos.valor_total as total_vendido")
      .sum("pedidos.quantidade as quantidade_itens")
      .count("pedidos.id as total_pedidos")
      .groupBy("produtos.categoria");

    return res.status(200).json(relatorio);
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao gerar relatório" });
  }
};

exports.topProdutos = async (req, res) => {
  try {
    const relatorio = await db("pedidos")
      .join("produtos", "pedidos.produto_id", "produtos.id")
      .select("produtos.nome")
      .sum("pedidos.quantidade as quantidade_vendida")
      .sum("pedidos.valor_total as total_vendido")
      .groupBy("produtos.id", "produtos.nome")
      .orderBy("quantidade_vendida", "desc")
      .limit(5);

    return res.status(200).json(relatorio);
  } catch (erro) {
    return res.status(500).json({ erro: "Erro ao gerar relatório" });
  }
};

exports.faturamento = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({
        erro: "Informe data_inicio e data_fim"
      });
    }

    const dataValida = /^\d{4}-\d{2}-\d{2}$/;

    if (!dataValida.test(data_inicio) ||
        !dataValida.test(data_fim) ||
        !Number.isFinite(Date.parse(data_inicio)) ||
        !Number.isFinite(Date.parse(data_fim)) ||
        new Date(data_inicio).toISOString().slice(0, 10) !== data_inicio ||
        new Date(data_fim).toISOString().slice(0, 10) !== data_fim ||
        data_inicio > data_fim) {
      return res.status(400).json({ erro: "Período inválido" });
    }

    const resultado = await db("pedidos")
      .sum("valor_total as faturamento")
      .whereBetween("created_at", [
        `${data_inicio} 00:00:00`,
        `${data_fim} 23:59:59`
      ])
      .first();

    return res.status(200).json({
      data_inicio,
      data_fim,
      faturamento: resultado.faturamento || 0
    });
  } catch (erro) {
    return res.status(500).json({
      erro: "Erro ao calcular faturamento"
    });
  }
};