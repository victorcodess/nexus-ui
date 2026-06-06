import { readFile } from "fs/promises";
import { join } from "path";

export const OG_FONT_FAMILY = "Geist";

const GEIST_SANS_DIR = join(
  process.cwd(),
  "node_modules/geist/dist/fonts/geist-sans",
);

export type OgFont = {
  name: typeof OG_FONT_FAMILY;
  data: ArrayBuffer;
  style: "normal";
  weight: 400 | 500;
};

export async function loadOgFonts(): Promise<OgFont[]> {
  const [regular, medium] = await Promise.all([
    readFile(join(GEIST_SANS_DIR, "Geist-Regular.ttf")),
    readFile(join(GEIST_SANS_DIR, "Geist-Medium.ttf")),
  ]);

  return [
    {
      name: OG_FONT_FAMILY,
      data: regular.buffer.slice(
        regular.byteOffset,
        regular.byteOffset + regular.byteLength,
      ),
      style: "normal",
      weight: 400,
    },
    {
      name: OG_FONT_FAMILY,
      data: medium.buffer.slice(
        medium.byteOffset,
        medium.byteOffset + medium.byteLength,
      ),
      style: "normal",
      weight: 500,
    },
  ];
}
