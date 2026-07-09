import { useEffect, useRef, useState } from "react";

const HOVER_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "[role='button']",
  "[tabindex]:not([tabindex='-1'])",
  "[data-cursor-hover]"
].join(", ");

const getInitialPointer = () => {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };
};

export default function CustomCursor() {
  const wrapRef = useRef(null);
  const dotRef = useRef(null);
  const ballRef = useRef(null);
  const frameRef = useRef(0);
  const pointerRef = useRef({
    targetX: getInitialPointer().x,
    targetY: getInitialPointer().y,
    ballX: getInitialPointer().x,
    ballY: getInitialPointer().y
  });

  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isBlueZone, setIsBlueZone] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine) and (min-width: 901px)");

    const syncEnabledState = () => {
      setEnabled(mediaQuery.matches);
    };

    syncEnabledState();
    mediaQuery.addEventListener("change", syncEnabledState);

    return () => {
      mediaQuery.removeEventListener("change", syncEnabledState);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mbc-enabled", enabled);

    return () => {
      document.body.classList.remove("mbc-enabled");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      cancelAnimationFrame(frameRef.current);
      return undefined;
    }

    const dot = dotRef.current;
    const ball = ballRef.current;
    const wrap = wrapRef.current;
    const pointer = pointerRef.current;

    const getLuminanceAtPoint = (clientX, clientY) => {
      const target = document.elementFromPoint(clientX, clientY);
      let node = target;

      while (node && node !== document.documentElement) {
        const backgroundColor = window.getComputedStyle(node).backgroundColor;
        const isTransparent =
          !backgroundColor ||
          backgroundColor === "transparent" ||
          /rgba?$0,\s*0,\s*0,\s*0$/.test(backgroundColor);

        if (!isTransparent) {
          const values = backgroundColor.match(/[\d.]+/g);
          if (!values) return 1;

          const [red, green, blue] = values.map(Number);
          return (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
        }

        node = node.parentElement;
      }

      return 1;
    };

    const updateContext = (clientX, clientY) => {
      pointer.targetX = clientX;
      pointer.targetY = clientY;

      const hoveredElement = document.elementFromPoint(clientX, clientY);
      setIsHovering(Boolean(hoveredElement?.closest(HOVER_SELECTOR)));
      setIsBlueZone(getLuminanceAtPoint(clientX, clientY) < 0.62);
    };

    const animate = () => {
      pointer.ballX += (pointer.targetX - pointer.ballX) * 0.1;
      pointer.ballY += (pointer.targetY - pointer.ballY) * 0.1;

      if (dot) {
        dot.style.transform = `translate3d(${pointer.targetX}px, ${pointer.targetY}px, 0) translate(-50%, -50%)`;
      }

      if (ball) {
        ball.style.transform = `translate3d(${pointer.ballX}px, ${pointer.ballY}px, 0) translate(-50%, -50%)`;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event) => {
      if (!wrap) return;
      setVisible(true);
      wrap.style.opacity = "1";
      updateContext(event.clientX, event.clientY);
    };

    const handlePointerEnter = (event) => {
      if (!wrap) return;
      setVisible(true);
      wrap.style.opacity = "1";
      updateContext(event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      if (!wrap) return;
      setVisible(false);
      setIsHovering(false);
      setIsPressed(false);
      wrap.style.opacity = "0";
    };

    const handlePointerDown = () => {
      setIsPressed(true);
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerenter", handlePointerEnter);
    document.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerenter", handlePointerEnter);
      document.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const wrapClassName = [
    "mbc-wrap",
    visible ? "is-visible" : "",
    isBlueZone ? "is-blue-zone" : "is-light-zone",
    isHovering ? "is-hovering" : "",
    isPressed ? "is-pressed" : ""
  ]
    .filter(Boolean)
    .join(" ");

    return (
    <>
      <div ref={wrapRef} className={wrapClassName} aria-hidden="true">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id="mbc-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 24 -11"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        <div className="mbc-goo-group">
          <div ref={ballRef} className="mbc-ball" />
          <div ref={dotRef} className="mbc-dot" />
        </div>
      </div>

      <style>{`
        body.mbc-enabled,
        body.mbc-enabled * {
          cursor: none !important;
        }

        @media (pointer: coarse), (max-width: 900px) {
          body.mbc-enabled,
          body.mbc-enabled * {
            cursor: auto !important;
          }

          .mbc-wrap {
            display: none !important;
          }
        }

        .mbc-wrap {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.18s ease;
        }

        .mbc-wrap.is-visible {
          opacity: 1;
        }

        .mbc-goo-group {
          position: absolute;
          inset: 0;
          filter: url(#mbc-goo);
        }

        .mbc-dot,
        .mbc-ball {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 999px;
          transform: translate3d(-50%, -50%, 0);
          will-change: transform, width, height, background, box-shadow;
          transition:
            width 220ms ease,
            height 220ms ease,
            background 220ms ease,
            box-shadow 220ms ease,
            opacity 220ms ease,
            filter 220ms ease;
        }

        .mbc-dot {
          width: 8px;
          height: 8px;
          z-index: 2;
          background: radial-gradient(circle at 30% 30%, #ffffff 0%, #f8fbff 48%, #dbeafe 100%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.92),
            0 0 10px rgba(255,255,255,0.72),
            0 0 16px rgba(37,99,235,0.16);
        }

        .mbc-ball {
          width: 24px;
          height: 24px;
          z-index: 1;
          background: radial-gradient(circle at 30% 30%, #93c5fd 0%, #3b82f6 46%, #1d4ed8 100%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.65),
            0 0 14px rgba(59,130,246,0.22),
            0 0 24px rgba(59,130,246,0.12);
        }

        .mbc-wrap.is-blue-zone .mbc-dot {
          width: 16px;
          height: 16px;
          background: radial-gradient(circle at 30% 30%, #ffffff 0%, #f7fbff 52%, #dbeafe 100%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.95),
            0 0 16px rgba(255,255,255,0.82),
            0 0 24px rgba(96,165,250,0.16);
        }

        .mbc-wrap.is-blue-zone .mbc-ball {
          width: 12px;
          height: 12px;
          background: radial-gradient(circle at 30% 30%, #7dd3fc 0%, #3b82f6 52%, #2563eb 100%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.45),
            0 0 12px rgba(59,130,246,0.2);
        }

        .mbc-wrap.is-light-zone .mbc-dot {
          width: 8px;
          height: 8px;
        }

        .mbc-wrap.is-light-zone .mbc-ball {
          width: 28px;
          height: 28px;
          background: radial-gradient(circle at 30% 30%, #93c5fd 0%, #2563eb 48%, #1d4ed8 100%);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.72),
            0 0 16px rgba(59,130,246,0.22),
            0 0 28px rgba(37,99,235,0.12);
        }

        .mbc-wrap.is-hovering .mbc-dot {
          width: 20px;
          height: 20px;
        }

        .mbc-wrap.is-hovering .mbc-ball {
          width: 36px;
          height: 36px;
        }
      `}</style>
    </>
  );
}