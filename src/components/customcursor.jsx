import { useEffect, useRef, useState } from "react";

/**
 * MetaballCursor
 * -------------------------------------------------------------------------
 * A two-part liquid cursor for white/blue themed sites:
 *   - a small WHITE dot that tracks the pointer tightly
 *   - a medium BLUE ball that trails behind it with looser easing
 * An SVG "goo" filter merges the two into a single blob when they get
 * close, giving the classic metaball look.
 *
 * Adaptive behavior (the part that makes it feel alive):
 *   - Over BLUE regions of the page  -> white dot grows, blue ball shrinks
 *   - Over WHITE regions of the page -> blue ball grows, white dot shrinks
 *   - Hovering an interactive element -> both balls scale up together
 *   - Clicking -> quick squash for tactile feedback
 *
 * Drop <MetaballCursor /> once near the root of your app. It reads the
 * background color under the pointer every frame via elementFromPoint,
 * so it works on any section without extra markup - just make sure your
 * "blue" sections actually set a blue background-color (not just an
 * image) somewhere in their ancestor chain.
 */
export default function MetaballCursor() {
  const wrapRef = useRef(null);
  const dotRef = useRef(null);
  const ballRef = useRef(null);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const dot = dotRef.current;
    const ball = ballRef.current;
    const wrap = wrapRef.current;

    // Sizes (px)
    const DOT_SMALL = 9;
    const DOT_BIG = 17;
    const BALL_SMALL = 10;
    const BALL_BIG = 15;

    // Easing factors (0-1, higher = snappier)
    const BALL_POS_EASE = 0.05;
    const SIZE_EASE = 0.12;

    // Luminance below this = "blue/dark" area, above = "white/light" area
    const LUM_THRESHOLD = 0.6;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ballX = mouseX;
    let ballY = mouseY;

    let currentBallSize = BALL_SMALL;
    let currentDotSize = DOT_SMALL;

    let targetLum = 1;
    let hoverScale = 1;
    let pressScale = 1;

    let rafId;
    let visible = false;

    const showCursor = () => {
      if (!visible) {
        visible = true;
        wrap.style.opacity = "1";
      }
    };

    // Walk up the DOM from the point under the cursor until we find an
    // element with an actual background-color set, then convert that to
    // a 0-1 luminance value.
    const sampleLuminanceAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      let node = el;
      let colorStr = null;

      while (node && node !== document.documentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && !/rgba?\(0,\s*0,\s*0,\s*0\)/.test(bg) && bg !== "transparent") {
          colorStr = bg;
          break;
        }
        node = node.parentElement;
      }
      if (!colorStr) {
        colorStr = getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)";
      }
      const nums = colorStr.match(/[\d.]+/g);
      if (!nums) return 1;
      const [r, g, b] = nums.map(Number);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      showCursor();
      targetLum = sampleLuminanceAt(mouseX, mouseY);

      const hovered = document.elementFromPoint(mouseX, mouseY);
      hoverScale = hovered?.closest("[data-cursor-hover]") ? 1.4 : 1;
    };

    const handleMouseLeave = () => {
      wrap.style.opacity = "0";
      visible = false;
    };

    const handleMouseDown = () => (pressScale = 0.82);
    const handleMouseUp = () => (pressScale = 1);

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      ballX = lerp(ballX, mouseX, BALL_POS_EASE);
      ballY = lerp(ballY, mouseY, BALL_POS_EASE);

      const isBlueArea = targetLum < LUM_THRESHOLD;

      const targetDotSize = (isBlueArea ? DOT_BIG : DOT_SMALL) * hoverScale * pressScale;
      const targetBallSize = (isBlueArea ? BALL_SMALL : BALL_BIG) * hoverScale * pressScale;

      currentDotSize = lerp(currentDotSize, targetDotSize, SIZE_EASE);
      currentBallSize = lerp(currentBallSize, targetBallSize, SIZE_EASE);

      const isInteractive = hoverScale > 1.1 || pressScale < 1;

      dot.style.width = `${currentDotSize}px`;
      dot.style.height = `${currentDotSize}px`;
      dot.style.border = "none";
      dot.style.outline = "1.5px solid rgba(59,130,246,0.95)";
      dot.style.outlineOffset = "1.5px";
      dot.style.background = isInteractive
        ? "linear-gradient(120deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.95) 35%, rgba(191,219,254,0.95) 70%, rgba(255,255,255,0.98) 100%)"
        : "radial-gradient(circle at 30% 30%, #ffffff 0%, #f8fbff 45%, #dbeafe 100%)";
      dot.style.backgroundSize = isInteractive ? "220% 220%" : "100% 100%";
      dot.style.backgroundPosition = "center";
      dot.style.animation = isInteractive ? "cursor-shimmer 1.2s linear infinite" : "none";
      dot.style.boxShadow = isInteractive
        ? "0 0 0 1px rgba(255,255,255,0.95), 0 0 16px rgba(255,255,255,0.95), 0 0 28px rgba(37,99,235,0.35)"
        : "0 0 0 1px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.8), 0 0 22px rgba(37,99,235,0.2)";
      dot.style.transform = `translate3d(${mouseX - currentDotSize / 2}px, ${
        mouseY - currentDotSize / 2
      }px, 0)`;

      ball.style.width = `${currentBallSize}px`;
      ball.style.height = `${currentBallSize}px`;
      ball.style.border = "1px solid rgba(255,255,255,0.9)";
      ball.style.background = isInteractive
        ? "linear-gradient(120deg, rgba(191,219,254,0.95) 0%, rgba(59,130,246,0.98) 35%, rgba(37,99,235,1) 70%, rgba(191,219,254,0.95) 100%)"
        : "radial-gradient(circle at 30% 30%, #93c5fd 0%, #3b82f6 45%, #1d4ed8 100%)";
      ball.style.backgroundSize = isInteractive ? "220% 220%" : "100% 100%";
      ball.style.backgroundPosition = "center";
      ball.style.animation = isInteractive ? "cursor-shimmer 1.2s linear infinite" : "none";
      ball.style.boxShadow = isInteractive
        ? "0 0 0 1px rgba(255,255,255,0.8), 0 0 18px rgba(59,130,246,0.35), 0 0 34px rgba(255,255,255,0.2)"
        : "0 0 0 1px rgba(255,255,255,0.75), 0 0 12px rgba(59,130,246,0.24)";
      ball.style.transform = `translate3d(${ballX - currentBallSize / 2}px, ${
        ballY - currentBallSize / 2
      }px, 0)`;

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={wrapRef} className="mbc-wrap">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="mbc-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -12"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      <div className="mbc-goo-group">
        <div ref={ballRef} className="mbc-ball" />
      </div>
      <div ref={dotRef} className="mbc-dot" />

      <style>{`
        * { cursor: none !important; }

        .mbc-wrap {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .mbc-goo-group {
          position: absolute;
          inset: 0;
          filter: url(#mbc-goo);
        }

        @keyframes cursor-shimmer {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }

        .mbc-ball {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #93c5fd 0%, #3b82f6 45%, #1d4ed8 100%);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.75), 0 0 12px rgba(59,130,246,0.24);
          will-change: transform, width, height;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .mbc-dot {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffffff 0%, #f8fbff 45%, #dbeafe 100%);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.8), 0 0 22px rgba(37,99,235,0.2);
          border: none;
          outline: 1px solid rgba(37,99,235,0.95);
          outline-offset: 1px;
          will-change: transform, width, height;
          z-index: 2;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  DEMO PAGE — shows the cursor over a white section and a blue      *
 *  section, plus a few hoverable elements. Delete everything below   *
 *  this line and keep only MetaballCursor for your own app; just     *
 *  render <MetaballCursor /> once near the root (e.g. in App.jsx).   *
 * ------------------------------------------------------------------ */
export function CursorDemo() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: "'Söhne', Inter, system-ui, sans-serif" }}>
      <MetaballCursor />

      <section
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          color: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: 32,
        }}
      >
        <span style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3b82f6", fontWeight: 600 }}>
          White region
        </span>
        <h1 style={{ fontSize: 40, margin: 0, textAlign: "center", maxWidth: 560 }}>
          Move around — the blue ball grows here, the white dot shrinks
        </h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            data-cursor-hover
            onClick={() => setCount((c) => c + 1)}
            style={{
              padding: "14px 28px",
              borderRadius: 999,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Clicked {count} times
          </button>
          <button
            data-cursor-hover
            style={{
              padding: "14px 28px",
              borderRadius: 999,
              border: "1px solid #93c5fd",
              background: "transparent",
              color: "#1d4ed8",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Hover me too
          </button>
        </div>
      </section>

      <section
        style={{
          minHeight: "100vh",
          background: "#1d4ed8",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: 32,
        }}
      >
        <span style={{ fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "#bfdbfe", fontWeight: 600 }}>
          Blue region
        </span>
        <h1 style={{ fontSize: 40, margin: 0, textAlign: "center", maxWidth: 560 }}>
          In here the white dot grows and the blue ball shrinks
        </h1>
        <div
          data-cursor-hover
          style={{
            padding: "20px 32px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.3)",
            fontSize: 15,
          }}
        >
          This card is a hover target too — both balls scale up together
        </div>
      </section>
    </div>
  );
}