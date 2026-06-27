// public/data/songs.json をビルド前に検証する。
// 管理ツール(main.py)の _validate_songs と概念を揃える:
//   id一意 / 必須項目 / category・performers・streamType の列挙 / videoId形式 /
//   endSec > timestampSec / 同一動画での開始秒重複なし。
// 問題があれば一覧表示して exit 1（= prebuild / CI がビルドを止める）。
import { readFileSync } from 'node:fs';
import { z } from 'zod';

const PATH = 'public/data/songs.json';

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isHttpUrl = (v) => /^https?:\/\//.test(v);

const youtubeSchema = z.object({
  videoId: z.string().regex(VIDEO_ID, 'videoId は11文字の[A-Za-z0-9_-]である必要があります'),
  timestampSec: z.number().int().min(0).optional(),
  endSec: z.number().int().min(0).optional(),
  url: z.string().refine(isHttpUrl, 'url は http(s) で始まる必要があります').optional(),
});

const songSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  artist: z.string(),
  performers: z.array(z.enum(['水面まどか', '白砂あやね'])).min(1),
  category: z.enum(['uta_waku', 'cover', 'short']),
  streamType: z.enum(['solo', 'collab']).optional(),
  youtube: youtubeSchema,
  streamDate: z.string().regex(DATE, 'streamDate は YYYY-MM-DD 形式'),
  unit: z.string().optional(),
  streamTitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const rootSchema = z.object({
  version: z.union([z.string(), z.number()]).optional(),
  updatedAt: z.string().regex(DATE, 'updatedAt は YYYY-MM-DD 形式').optional(),
  songs: z.array(z.unknown()),
});

function main() {
  let raw;
  try {
    raw = JSON.parse(readFileSync(PATH, 'utf8'));
  } catch (e) {
    console.error(`✗ ${PATH} を読み込めません: ${e.message}`);
    process.exit(1);
  }

  const errors = [];

  const root = rootSchema.safeParse(raw);
  if (!root.success) {
    for (const issue of root.error.issues) errors.push(`root: ${issue.path.join('.')} ${issue.message}`);
  }

  const songs = Array.isArray(raw?.songs) ? raw.songs : [];
  const seenId = new Map();
  const seenVidTs = new Map();

  songs.forEach((s, i) => {
    const label = `songs[${i}] (${s?.id ?? '?'})`;
    const r = songSchema.safeParse(s);
    if (!r.success) {
      for (const issue of r.error.issues) errors.push(`${label}: ${issue.path.join('.')} ${issue.message}`);
      return; // 形が不正なら以降のクロスチェックはスキップ
    }
    const { timestampSec, endSec, videoId } = r.data.youtube;
    // endSec > timestampSec
    if (endSec != null && endSec <= (timestampSec ?? 0)) {
      errors.push(`${label}: endSec(${endSec}) は timestampSec(${timestampSec ?? 0}) より大きい必要があります`);
    }
    // id 一意
    if (seenId.has(s.id)) errors.push(`${label}: id が重複しています（songs[${seenId.get(s.id)}] と同じ）`);
    else seenId.set(s.id, i);
    // 同一動画での開始秒の重複
    const key = `${videoId}@${timestampSec ?? 0}`;
    if (seenVidTs.has(key)) errors.push(`${label}: 同一動画で開始秒が重複（${videoId} @${timestampSec ?? 0}s, songs[${seenVidTs.get(key)}] と同じ）`);
    else seenVidTs.set(key, i);
  });

  if (errors.length) {
    console.error(`✗ songs.json 検証で ${errors.length} 件の問題が見つかりました:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✓ songs.json OK（${songs.length} 曲）`);
}

main();
