import { getPageImage, source } from "@/lib/source";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const revalidate = false;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(font: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  try {
    const css = await (await fetch(url)).text();
    const resource = css.match(
      /src: url\((.+)\) format\('(opentype|truetype)'\)/,
    )?.[1];
    if (!resource) return null;
    const response = await fetch(resource);
    if (!response.ok) return null;
    return response.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/docs/[...slug]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const assetsDir = join(process.cwd(), "public", "assets");
  const [svgRightWide] = await Promise.all([
    readFile(join(assetsDir, "og-bg-right-wide.svg"), "utf-8"),
  ]);

  const svgRightWideDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgRightWide).toString("base64")}`;

  const text = page.data.title;
  const [fontRegular, fontMedium] = await Promise.all([
    loadGoogleFont("Inter", 400, text),
    loadGoogleFont("Inter", 500, text),
  ]);
  const fonts = [
    fontRegular
      ? ({
          name: "Inter",
          data: fontRegular,
          style: "normal",
          weight: 400,
        } as const)
      : null,
    fontMedium
      ? ({
          name: "Inter",
          data: fontMedium,
          style: "normal",
          weight: 500,
        } as const)
      : null,
  ].filter((font): font is NonNullable<typeof font> => font !== null);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        backgroundColor: "#ffffff",
        position: "relative",
        paddingLeft: 100,
        paddingTop: 120,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={svgRightWideDataUrl}
        alt=""
        height={630}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          style={{
            marginBottom: 0,
          }}
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0 24C15.2548 24 24 15.2548 24 0C24 15.2548 32.7452 24 48 24C32.7452 24 24 32.7452 24 48C24 32.7452 15.2548 24 0 24Z"
            fill="#171717"
          />
        </svg>
        <h1
          style={{
            fontFamily: "Inter",
            fontSize: 48,
            fontWeight: 500,
            color: "#171717",
            marginTop: 44,
            marginBottom: 0,
            lineHeight: "54px",
            letterSpacing: "-1.2px",
            width: "380px",
            textAlign: "left",
          }}
        >
          {page.data.title}
        </h1>
        <p
          style={{
            fontSize: 20,
            color: "#737373",
            maxWidth: 380,
            textAlign: "left",
            lineHeight: "28px",
            marginTop: 8,
          }}
        >
          {page.data.description}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: -180,
          left: 100,
          right: 0,
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <p
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: "#737373",
          }}
        >
          nexus-ui.dev
        </p>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
