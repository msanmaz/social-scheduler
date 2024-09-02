/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `TwitterAuth` table. All the data in the column will be lost.
  - You are about to drop the column `tokenExpiry` on the `TwitterAuth` table. All the data in the column will be lost.
  - Added the required column `accessTokenSecret` to the `TwitterAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TwitterAuth" DROP COLUMN "refreshToken",
DROP COLUMN "tokenExpiry",
ADD COLUMN     "accessTokenSecret" TEXT NOT NULL;
