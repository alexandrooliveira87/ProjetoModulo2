CRIAÇÃO DO USUÁRIO ADMIN:POST http://localhost:3000/users/create-admin

{
  "name": "Novo Admin",
  "email": "novoadmin@email.com",
  "password": "senha456"
}

LOGIN PARA PEGAR O TOKEN 
POST: http://localhost:3000/login

{
  "email": "novoadmin@email.com",
  "password": "senha456"
}


 Requisição POST /users no Postman

Método: POST

URL: http://localhost:3000/users

Headers:
Key: Authorization
Value: Bearer <TOKEN_ADMIN>

Body (JSON):

{
  "name": "Filial Recife",
  "profile": "BRANCH",
  "email": "filialrecife@email.com",
  "password": "senha123",
  "document": "12.345.678/0001-99",
  "full_address": "Avenida Brasil, 123, Recife - PE"
}
