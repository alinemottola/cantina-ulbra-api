const express = require("express");
const produtosRoutes = require("./routes/produtosRoutes");
const pedidosRoutes = require("./routes/pedidosRoutes");
const relatoriosRoutes = require("./routes/relatoriosRoutes");

const app = express();

app.use(express.json());

app.use("/api/produtos", produtosRoutes);

app.use("/api/pedidos", pedidosRoutes);

app.use("/api/relatorios", relatoriosRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});