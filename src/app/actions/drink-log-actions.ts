"use server";

import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { DrinkType, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDrinkType } from "@/lib/drink-types";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_BRAND_NAME_LENGTH = 100;
const MAX_ORIGIN_LENGTH = 100;
const MAX_TASTE_NOTE_LENGTH = 2000;
const UPLOADS_ROOT = path.resolve(process.cwd(), "public/uploads");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
]);

// ─────────────────────────────────────────────────────────────────────────────
// テキスト正規化
// ─────────────────────────────────────────────────────────────────────────────
function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// 日付パース（未来日チェック付き）
// ─────────────────────────────────────────────────────────────────────────────
function parseDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("日付の形式が正しくありません（YYYY-MM-DD）。");
  }

  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("無効な日付です。");
  }

  // 未来日チェック（翌日以降は不可）
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  if (parsed >= tomorrow) {
    throw new Error("未来の日付は記録できません。");
  }

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// フォームペイロードのパース・バリデーション
// ─────────────────────────────────────────────────────────────────────────────
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
    throw new Error("飲んだ日は必須です。");
  }

  if (!isDrinkType(typeRaw)) {
    throw new Error("酒類の選択が正しくありません。");
  }

  if (!brandName) {
    throw new Error("銘柄名は必須です。");
  }

  if (brandName.length > MAX_BRAND_NAME_LENGTH) {
    throw new Error(`銘柄名は${MAX_BRAND_NAME_LENGTH}文字以内で入力してください。`);
  }

  if (origin.length > MAX_ORIGIN_LENGTH) {
    throw new Error(`産地は${MAX_ORIGIN_LENGTH}文字以内で入力してください。`);
  }

  if (tasteNote.length > MAX_TASTE_NOTE_LENGTH) {
    throw new Error(`味メモは${MAX_TASTE_NOTE_LENGTH}文字以内で入力してください。`);
  }

  return {
    drankAt: parseDate(drankAtRaw),
    drinkType: typeRaw,
    brandName,
    origin: origin || null,
    tasteNote: tasteNote || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 安全な拡張子の取得
// ─────────────────────────────────────────────────────────────────────────────
function getSafeExtension(file: File): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "image/avif": ".avif",
  };

  // MIMEタイプから拡張子を優先決定（セキュリティ上、ファイル名拡張子より優先）
  if (mimeToExt[file.type]) {
    return mimeToExt[file.type];
  }

  const nameExt = path.extname(file.name).toLowerCase();
  if (/^\.[a-z0-9]{1,5}$/.test(nameExt)) {
    return nameExt;
  }

  return ".jpg";
}

// ─────────────────────────────────────────────────────────────────────────────
// 写真保存
// ─────────────────────────────────────────────────────────────────────────────
async function savePhoto(
  fileEntry: FormDataEntryValue | null,
): Promise<Prisma.DrinkPhotoCreateWithoutDrinkLogInput | null> {
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return null;
  }

  // MIMEタイプ検証（許可リスト方式）
  if (!ALLOWED_MIME_TYPES.has(fileEntry.type)) {
    throw new Error("画像ファイル（JPEG・PNG・WebP・GIF・HEIC・AVIF）のみアップロードできます。");
  }

  if (fileEntry.size > MAX_IMAGE_SIZE) {
    throw new Error("画像サイズは10MB以下にしてください。");
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = getSafeExtension(fileEntry);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;

  const relativeDirectory = path.posix.join("uploads", year, month);
  const absoluteDirectory = path.resolve(UPLOADS_ROOT, year, month);
  const absolutePath = path.resolve(absoluteDirectory, fileName);

  // パストラバーサル防止
  if (!absolutePath.startsWith(UPLOADS_ROOT)) {
    throw new Error("無効なファイルパスです。");
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

// ─────────────────────────────────────────────────────────────────────────────
// 写真ファイル削除
// ─────────────────────────────────────────────────────────────────────────────
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
        // クリーンアップエラーは無視（削除処理をブロックしない）
      }
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Server Actions
// ─────────────────────────────────────────────────────────────────────────────
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
    throw new Error("ログIDが見つかりません。");
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
    throw new Error("ログIDが見つかりません。");
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
