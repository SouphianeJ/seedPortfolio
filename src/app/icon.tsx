import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background:
            "linear-gradient(135deg, rgba(59,130,246,1) 0%, rgba(56,189,248,1) 50%, rgba(16,185,129,1) 100%)",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          letterSpacing: "-0.03em",
        }}
      >
        SP
      </div>
    ),
  );
}
