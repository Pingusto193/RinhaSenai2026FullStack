-- CreateTable
CREATE TABLE "Acao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Acao_pkey" PRIMARY KEY ("id")
);
