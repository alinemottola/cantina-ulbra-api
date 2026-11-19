CANTINA ULBRA API

AUTORA: Aline Mottola

CURSO: Engenharia de Software

SOBRE O PROJETO: Cantina ULBRA API foi desenvolvido para a disciplina de Desenvolvimento Back-End. O objetivo é criar uma API para gerenciar produtos e pedidos de uma cantina, usando um banco de dados para armazenar as informações.

TECNOLOGIAS UTILIZADAS:

Node.js

Express

Knex.js

SQLite3

JavaScript

COMO INSTALAR E EXECUTAR:
Para executar o projeto é preciso ter o Node.js instalado.

1. Instalar dependências:
npm install

2. Criar as tabelas do banco de dados:
npx knex migrate:latest

3. Inserir os dados iniciais:
npx knex seed:run

4. Iniciar o servidor:
npm start

O servidor será iniciado na porta 3000.

FUNCIONALIDADES:

Gerenciamento de produtos.

Gerenciamento de pedidos dos alunos.

Controle automático de estoque.

Validação de produtos inativos.

Proteção contra vendas sem estoque suficiente.

Proteção contra exclusão de produtos com histórico de pedidos.

Relatórios de vendas e faturamento.

ENDPOINTS DA API

PRODUTOS
| Método | Rota | Descrição |
|---|---|---|
| GET | /api/produtos | Lista os produtos, com filtros opcionais|
| GET |api/produtos/:id | Busca um produto pelo ID |
| POST |api/produtos | Cadastra um produto |
| PUT |api/produtos/:id | Atualiza um produto |
| DELETE |api/produtos/:id | Exclui um produto sem pedidos vinculados|

PEDIDOS
| Método | Rota | Descrição |
|---|---|---|
| GET | /api/pedidos | Lista pedidos com filtros e paginação |
| GET | /api/pedidos/:id | Busca um pedido e o nome do produto |
| POST | /api/pedidos | Cria um pedido e diminui o estoque |
| DELETE | /api/pedidos/:id | Cancela um pedido e devolve o estoque |

RELATÓRIOS
| Método | Rota | Descrição |
|---|---|---|
| GET | /api/relatorios/vendas-por-categoria | Mostra as vendas agrupadas por categoria |
| GET | /api/relatorios/top-produtos | Mostra os 5 produtos mais vendidos |
| GET | /api/relatorios/faturamento | Calcula o faturamento entre duas datas |


EXEMPLOS DE REQUISIÇÕES E RESPOSTAS:

Os exemplos utilizam o endereço localhost:3000.

 1. Listar produtos
GET /api/produtos

Exemplo de resposta (200):

```json
[
  {
    "id": 1,
    "nome": "Coxinha",
    "categoria": "Salgados",
    "preco": 10,
    "estoque": 30,
    "ativo": 1
  }
]
```

2. Buscar produto pelo ID
GET /api/produtos/1

Exemplo de resposta (200):

```json
{
  "id": 1,
  "nome": "Coxinha",
  "categoria": "Salgados",
  "preco": 10,
  "estoque": 30,
  "ativo": 1
}
```

Se o produto não existir, retorna 404.

3. Cadastrar produto
POST /api/produtos

Corpo da requisição:

```json
{
  "nome": "Sanduíche",
  "categoria": "Salgados",
  "preco": 12,
  "estoque": 20
}
```

Exemplo de resposta (201):

```json
{
  "id": 7,
  "nome": "Sanduíche",
  "categoria": "Salgados",
  "preco": 12,
  "estoque": 20,
  "ativo": true
}
```

4. Atualizar produto
PUT /api/produtos/1

Corpo da requisição:

```json
{
  "preco": 11
}
```

Exemplo de resposta (200):

```json
{
  "id": 1,
  "nome": "Coxinha",
  "categoria": "Salgados",
  "preco": 11,
  "estoque": 30,
  "ativo": 1
}
```

 5. Excluir produto
DELETE /api/produtos/7

Resposta: 204 No Content, sem corpo.

Se existirem pedidos vinculados, retorna 409.

 6. Listar pedidos
GET /api/pedidos?limit=2&offset=0

Exemplo de resposta (200):

```json
[
  {
    "id": 1,
    "aluno_nome": "Ana",
    "produto_id": 1,
    "quantidade": 2,
    "valor_total": 16
  }
]
```

Também aceita o filtro aluno_nome.

7. Buscar pedido pelo ID
GET /api/pedidos/1

Exemplo de resposta (200):

```json
{
  "id": 1,
  "aluno_nome": "Ana",
  "produto_nome": "Coxinha",
  "quantidade": 2,
  "valor_total": 16
}
```

Se não existir, retorna 404.

8. Criar pedido
POST /api/pedidos

Corpo da requisição:

```json
{
  "aluno_nome": "Lucas",
  "produto_id": 6,
  "quantidade": 1
}
```

Exemplo de resposta (201):

```json
{
  "id": 6,
  "aluno_nome": "Lucas",
  "produto_id": 6,
  "quantidade": 1,
  "valor_total": 4
}
```

O valor total é calculado pela API.

9. Cancelar pedido
DELETE /api/pedidos/6

Resposta: 204 No Content, sem corpo.

A quantidade comprada é devolvida ao estoque.

 10. Vendas por categoria
GET /api/relatorios/vendas-por-categoria

Exemplo de resposta (200):

```json
[
  {
    "categoria": "Salgados",
    "total_vendido": 33,
    "quantidade_itens": 5,
    "total_pedidos": 3
  }
]
```

 11. Produtos mais vendidos
GET /api/relatorios/top-produtos

Exemplo de resposta (200):

```json
[
  {
    "nome": "Coxinha",
    "quantidade_vendida": 2,
    "total_vendido": 16
  }
]
```

 12. Faturamento por período
GET /api/relatorios/faturamento?data_inicio=2026-11-10&data_fim=2026-11-14

Exemplo de resposta (200):

```json
{
  "data_inicio": "2026-11-10",
  "data_fim": "2026-11-14",
  "faturamento": 58
}
```

TRANSAÇÕES DO KNEX

No projeto foi usado o método `db.transaction()` do Knex nas operações de criação e cancelamento de pedidos.

CRIAÇÃO DE PEDIDOS: 

Quando um aluno efetua uma compra, o sistema precisa registrar o pedido e diminuir a quantidade comprada do estoque.
Essas duas operações são realizadas dentro de uma transação.
Antes de registrar a compra, a API verifica se o produto existe, se está ativo e se tem estoque suficiente.

CANCELAMENTO DE PEDIDOS:

Quando um pedido é cancelado, o sistema devolve a quantidade comprada ao estoque e exclui o pedido.
Essas operações também são executadas dentro de uma transação.
Se ocorrer algum erro, a transação é desfeita, evitando inconssistências nos pedidos e estoque.

POR QUE FOI USADO TRANSAÇÕES?

As transações garantem a integridade dos dados, pois permitem que várias opções sejam realizadas como uma operação só.
Isso evita situações em que o estoque é alterado sem que o pedido seja registrado, ou em que um pedido seja excluído sem devolver os produtos ao estoque.