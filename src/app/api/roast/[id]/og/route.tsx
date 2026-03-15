import { ImageResponse } from "@takumi-rs/image-response";
import { caller } from "@/trpc/server";

const COLORS = {
  bgPage: "#0A0A0A",
  textPrimary: "#FAFAFA",
  textTertiary: "#4B5563",
  accentGreen: "#10B981",
  accentRed: "#EF4444",
  accentAmber: "#F59E0B",
} as const;

function getScoreColor(score: number): string {
  if (score <= 3) return COLORS.accentRed;
  if (score <= 6) return COLORS.accentAmber;
  return COLORS.accentGreen;
}

type OgImageProps = {
  score: number;
  verdict: string;
  roast: string;
  language: string;
  lineCount: number;
};

function OgImage({ score, verdict, roast, language, lineCount }: OgImageProps) {
  const scoreColor = getScoreColor(score);

  return (
    <div
      tw="flex flex-col items-center justify-center w-full h-full"
      style={{
        backgroundColor: COLORS.bgPage,
        padding: 64,
        gap: 28,
        fontFamily: "Geist Mono",
      }}
    >
      {/* Logo row */}
      <div tw="flex items-center" style={{ gap: 8 }}>
        <span
          style={{
            color: COLORS.accentGreen,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {">"}
        </span>
        <span
          style={{
            color: COLORS.textPrimary,
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          devroast
        </span>
      </div>

      {/* Score row */}
      <div tw="flex items-end" style={{ gap: 4 }}>
        <span
          style={{
            color: scoreColor,
            fontSize: 160,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            color: COLORS.textTertiary,
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1,
          }}
        >
          /10
        </span>
      </div>

      {/* Verdict row */}
      <div tw="flex items-center" style={{ gap: 8 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: scoreColor,
          }}
        />
        <span
          style={{
            color: scoreColor,
            fontSize: 20,
            fontWeight: 400,
            fontFamily: "Geist Mono",
          }}
        >
          {verdict}
        </span>
      </div>

      {/* Lang info */}
      <span
        style={{
          color: COLORS.textTertiary,
          fontSize: 16,
          fontWeight: 400,
          fontFamily: "Geist Mono",
        }}
      >
        {`lang: ${language} · ${lineCount} lines`}
      </span>

      {/* Roast quote */}
      <span
        style={{
          color: COLORS.textPrimary,
          fontSize: 22,
          fontWeight: 400,
          lineHeight: 1.5,
          textAlign: "center",
          fontFamily: "Geist",
        }}
      >
        {`\u201C${roast}\u201D`}
      </span>
    </div>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await caller.submission.getById({ id });

  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    <OgImage
      score={result.score}
      verdict={result.verdict}
      roast={result.roast}
      language={result.language}
      lineCount={result.lineCount}
    />,
    {
      width: 1200,
      height: 630,
      format: "png",
    },
  );
}
