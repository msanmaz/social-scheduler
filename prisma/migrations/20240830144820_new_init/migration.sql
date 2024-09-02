/*
  Warnings:

  - The primary key for the `InstagramAuth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TwitterAuth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `tokenExpiry` on table `InstagramAuth` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `InstagramAuth` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshToken` on table `TwitterAuth` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokenExpiry` on table `TwitterAuth` required. This step will fail if there are existing NULL values in that column.
  - Made the column `screenName` on table `TwitterAuth` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "InstagramAuth" DROP CONSTRAINT "InstagramAuth_userId_fkey";

-- DropForeignKey
ALTER TABLE "TwitterAuth" DROP CONSTRAINT "TwitterAuth_userId_fkey";

-- AlterTable
ALTER TABLE "InstagramAuth" DROP CONSTRAINT "InstagramAuth_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "tokenExpiry" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL,
ADD CONSTRAINT "InstagramAuth_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "InstagramAuth_id_seq";

-- AlterTable
ALTER TABLE "TwitterAuth" DROP CONSTRAINT "TwitterAuth_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "refreshToken" SET NOT NULL,
ALTER COLUMN "tokenExpiry" SET NOT NULL,
ALTER COLUMN "screenName" SET NOT NULL,
ADD CONSTRAINT "TwitterAuth_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TwitterAuth_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "ScheduledPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "platform" TEXT NOT NULL,
    "scheduleTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TwitterAuth" ADD CONSTRAINT "TwitterAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramAuth" ADD CONSTRAINT "InstagramAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPost" ADD CONSTRAINT "ScheduledPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
