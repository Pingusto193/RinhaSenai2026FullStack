
import "dotenv/config";
import express from 'express';
import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const app = express();
const port = 3000;
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

app.use(express.json());

app.get('/acoes', async (req, res) => {
  const acoes = await prisma.acao.findMany();
  res.send(acoes);
});

// app.post('/acoes', async (req, res) => {
//   const { nome: novoNome, codigo: novoCodigo, valor: novoValor } = req.body;
//   const acao = await prisma.acao.create({
//     data: {
//       nome: novoNome,
//       codigo: novoCodigo,
//       valor: novoValor
//     }
//   });
//   res.send(acao);
 
// });


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
