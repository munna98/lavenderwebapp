-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PO', 'QUOTATION');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'SENT', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'PO',
    "number" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "supplierId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "notes" TEXT,
    "snapshotSupplierName" TEXT,
    "snapshotSupplierAddress" TEXT,
    "snapshotSupplierEmail" TEXT,
    "snapshotSupplierPhone" TEXT,
    "snapshotSupplierTaxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_items" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" DECIMAL(12,4) NOT NULL,
    "rate" DECIMAL(12,4) NOT NULL,
    "taxPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "document_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "po_sequence" (
    "name" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "po_sequence_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "documents_number_key" ON "documents"("number");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_items" ADD CONSTRAINT "document_items_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
