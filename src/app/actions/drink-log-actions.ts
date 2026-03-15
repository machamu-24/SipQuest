"use server";

import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { DrinkType, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDrinkType } from "@/lib/drink-types";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const UPLOADS_ROOT = path.resolve(process.cwd(), "public/uploads");

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Invalid date format.");
  }

  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date.");
  }

  return parsed;
}

function parseLogPayload(formData: FormData): {
  drankAt: Date;
  drinkType: DrinkType;
  brandName: string;
  origin: string | null;
  tasteNote: string | null;
} {
  const drankAtRaw = normalizeText(formData.get("drankAt"));
  const typeRaw = normalizeText(formData.get("drinkType"));
  const brandName = normalizeText(formData.get("brandName"));
  const origin = normalizeText(formData.get("origin"));
  const tasteNote = normalizeText(formData.get("tasteNote"));

  if (!drankAtRaw) {
    throw new Error("Date is required.");
  }

  if (!isDrinkType(typeRaw)) {
    throw new Error("Drink type is invalid.");
  }

  if (!brandName) {
    throw new Error("Brand name is required.");
  }

  return {
    drankAt: parseDate(drankAtRaw),
    drinkType: typeRaw,
    brandName,
    origin: origin || null,
    tasteNote: tasteNote || null,
  };
}

function getSafeExtension(file: File): string {
  const nameExt = path.extname(file.name).toLowerCase();
  if (/^\.[a-z0-9]{1,5}$/.test(nameExt)) {
    return nameExt;
  }

  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif",
  };

  return mimeToExt[file.type] ?? ".jpg";
}

async function savePhoto(
  fileEntry: FormDataEntryValue | null,
): Promise<Prisma.DrinkPhotoCreateWithoutDrinkLogInput | null> {
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return null;
  }

  if (!fileEntry.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  if (fileEntry.size > MAX_IMAGE_SIZE) {
    throw new Error("Image size must be 10MB or less.");
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = getSafeExtension(fileEntry);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;

  const relativeDirectory = path.posix.join("uploads", year, month);
  const absoluteDirectory = path.resolve(UPLOADS_ROOT, year, month);
  const absolutePath = path.resolve(absoluteDirectory, fileName);

  if (!absolutePath.startsWith(UPLOADS_ROOT)) {
    throw new Error("Invalid file path.");
  }

  await mkdir(absoluteDirectory, { recursive: true });
  const arrayBuffer = await fileEntry.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(arrayBuffer));

  return {
    storagePath: `/${path.posix.join(relativeDirectory, fileName)}`,
    mimeType: fileEntry.type,
    fileSize: fileEntry.size,
  };
}

async function removePhotoFiles(storagePaths: string[]): Promise<void> {
  await Promise.all(
    storagePaths.map(async (storagePath) => {
      const safePath = storagePath.replace(/^\/+/, "");
      const absolutePath = path.resolve(process.cwd(), "public", safePath);

      if (!absolutePath.startsWith(UPLOADS_ROOT)) {
        return;
      }

      try {
        await rm(absolutePath, { force: true });
      } catch {
        // Ignore cleanup errors to avoid blocking deletion.
      }
    }),
  );
}

export async function createDrinkLog(formData: FormData): Promise<void> {
  const payload = parseLogPayload(formData);
  const photo = await savePhoto(formData.get("photo"));

  const created = await prisma.drinkLog.create({
    data: {
      ...payload,
      photos: photo
        ? {
            create: photo,
          }
        : undefined,
    },
  });

  revalidatePath("/");
  redirect(`/logs/${created.id}`);
}

export async function updateDrinkLog(formData: FormData): Promise<void> {
  const id = normalizeText(formData.get("id"));
  if (!id) {
    throw new Error("Log id is required.");
  }

  const payload = parseLogPayload(formData);
  const photo = await savePhoto(formData.get("photo"));

  await prisma.drinkLog.update({
    where: { id },
    data: {
      ...payload,
      photos: photo
        ? {
            create: photo,
          }
        : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath(`/logs/${id}`);
  redirect(`/logs/${id}`);
}

export async function deleteDrinkLog(formData: FormData): Promise<void> {
  const id = normalizeText(formData.get("id"));
  if (!id) {
    throw new Error("Log id is required.");
  }

  const existing = await prisma.drinkLog.findUnique({
    where: { id },
    include: { photos: true },
  });

  if (!existing) {
    redirect("/");
  }

  await prisma.drinkLog.delete({ where: { id } });
  await removePhotoFiles(existing.photos.map((photo) => photo.storagePath));

  revalidatePath("/");
  redirect("/");
}
