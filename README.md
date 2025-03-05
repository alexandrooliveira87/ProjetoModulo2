#  Sistema de Gestão de Movimentações

##  Sobre o Projeto

O **Sistema de Gestão de Movimentações** é uma API desenvolvida para o controle de movimentações de produtos entre filiais, garantindo rastreabilidade e otimização logística. A aplicação permite que filiais realizem transferências de produtos e motoristas acompanhem o status das movimentações.

##  Tecnologias Utilizadas

- **Node.js** e **Express** - Backend e API REST
- **TypeORM** - ORM para integração com o banco de dados
- **PostgreSQL** - Banco de dados relacional
- **TypeScript** - Tipagem estática para melhor manutenção do código
- **JWT (JSON Web Token)** - Autenticação de usuários
- **Insomnia** - Testes das requisições HTTP

##  Estrutura do Projeto

```plaintext
📦 Projeto
├── 📁 src
│   ├── 📁 controllers
│   ├── 📁 entities
│   ├── 📁 middlewares
│   ├── 📁 migrations
│   ├── 📁 routes
│   ├── 📁 utils
│   ├── data-source.ts
│   ├── server.ts
├── 📄 .env
├── 📄 package.json
├── 📄 README.md
```

##  Como Executar o Projeto

###  Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** (v16 ou superior)
- **PostgreSQL**
- **Git**
- **Insomnia** (opcional para testes de API)

###  Passos para Rodar a Aplicação

1. **Clone o repositório:**

```bash
git clone https://github.com/alexandrooliveira87/ProjetoModulo2.git
cd ProjetoModulo2
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configurar as variáveis de ambiente:** Crie um arquivo `.env` com as seguintes informações:

```plaintext
DATABASE_URL=postgres://usuario:senha@localhost:5432/seubanco
JWT_SECRET=sua_chave_secreta
```

4. **Executar as migrações:**

```bash
npm run typeorm migration:run -- -d src/data-source.ts
```

5. **Iniciar o servidor:**

```bash
npm run dev
```

A API estará rodando em [**http://localhost:3000**](http://localhost:3000)

##  Endpoints da API

### 🔹 Autenticação

- **POST** `/auth/login` → Autenticação de usuários.
- **POST** `/auth/register` → Cadastro de novos usuários.

### 🔹 Usuários

- **GET** `/users` → Listar todos os usuários (Apenas ADMIN).
- **PATCH** `/users/:id/status` → Atualizar status de um usuário (ADMIN).

### 🔹 Produtos

- **POST** `/products` → Cadastrar produto (Apenas FILIAL).
- **GET** `/products` → Listar todos os produtos cadastrados.

### 🔹 Movimentações

- **POST** `/movements/` → Criar movimentação de produto entre filiais.
- **GET** `/movements/` → Listar todas as movimentações (FILIAL e MOTORISTA).
- **PATCH** `/movements/:id/start` → Atualizar status para "IN\_PROGRESS" (MOTORISTA).
- **PATCH** `/movements/:id/end` → Finalizar movimentação e atualizar estoque (MOTORISTA).

##  Testando a API no Insomnia

1. Abra o **Insomnia**.
2. Crie um novo workspace e adicione as rotas acima.
3. Utilize **Bearer Token** para autenticação.
4. Faça chamadas para testar os endpoints.

##  Possíveis Melhorias

- Implementação de logs para auditoria.
- Criar um dashboard para visualização das movimentações.
- Melhorar controle de permissões com RBAC (Role-Based Access Control).
- Implementar cache para otimizar as consultas de produtos.

##  Contribuição

Fique à vontade para abrir **issues** ou enviar um **pull request** para melhorar este projeto!

##  Licença

Este projeto está sob a licença MIT.

