import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

function getScoreColor(score: number): string {
  if (score <= 3) return "#EF4444";
  if (score <= 6) return "#F59E0B";
  return "#10B981";
}

function getVerdictColor(verdict: string): string {
  if (verdict.includes("serious") || verdict.includes("critical"))
    return "#EF4444";
  if (verdict.includes("warning") || verdict.includes("needs_work"))
    return "#F59E0B";
  return "#10B981";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const score = Number(searchParams.get("score") ?? "3.5");
  const verdict = searchParams.get("verdict") ?? "needs_serious_help";
  const lang = searchParams.get("lang") ?? "javascript";
  const lines = searchParams.get("lines") ?? "7";
  const roast =
    searchParams.get("roast") ??
    "this code was written during a power outage...";

  const scoreColor = getScoreColor(score);
  const verdictColor = getVerdictColor(verdict);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        backgroundColor: "#0A0A0A",
        border: "1px solid #2A2A2A",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          width: "100%",
          height: "100%",
          padding: 64,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "monospace",
          }}
        >
          <span style={{ color: "#10B981", fontSize: 24, fontWeight: 700 }}>
            {">"}
          </span>
          <span style={{ color: "#FAFAFA", fontSize: 20, fontWeight: 500 }}>
            devroast
          </span>
        </div>

        {/* Score */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            fontFamily: "monospace",
          }}
        >
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
              color: "#4B5563",
              fontSize: 56,
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            /10
          </span>
        </div>

        {/* Verdict */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: verdictColor,
            }}
          />
          <span
            style={{
              color: verdictColor,
              fontSize: 20,
              fontFamily: "monospace",
            }}
          >
            {verdict}
          </span>
        </div>

        {/* Language info */}
        <span
          style={{
            color: "#4B5563",
            fontSize: 16,
            fontFamily: "monospace",
          }}
        >
          lang: {lang} · {lines} lines
        </span>

        {/* Roast quote */}
        <span
          style={{
            color: "#FAFAFA",
            fontSize: 22,
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: "80%",
          }}
        >
          &ldquo;{roast}&rdquo;
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
