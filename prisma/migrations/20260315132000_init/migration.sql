-- CreateTable
CREATE TABLE "DrinkLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drankAt" DATETIME NOT NULL,
    "drinkType" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "origin" TEXT,
    "tasteNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DrinkPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drinkLogId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DrinkPhoto_drinkLogId_fkey" FOREIGN KEY ("drinkLogId") REFERENCES "DrinkLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DrinkLog_drankAt_idx" ON "DrinkLog"("drankAt");

-- CreateIndex
CREATE INDEX "DrinkLog_drinkType_idx" ON "DrinkLog"("drinkType");

-- CreateIndex
CREATE INDEX "DrinkLog_brandName_idx" ON "DrinkLog"("brandName");

-- CreateIndex
CREATE INDEX "DrinkPhoto_drinkLogId_idx" ON "DrinkPhoto"("drinkLogId");

