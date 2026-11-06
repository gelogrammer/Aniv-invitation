"use client";

import { useEffect, useRef, useState } from "react";
import { CHURCH, config, type Branch } from "@/lib/config";

// Everything is drawn in one 360×460 picture, so it scales the same on every phone
const ROUTE =
  "M 22 18 C 36 40, 60 68, 90 85 " +
  "C 170 75, 262 115, 270 205 " +
  "C 274 280, 170 260, 110 335";

const at = (time: string) => (time ? ` · ${time}` : "");

// Colors and fonts are set right on each shape (not via CSS classes) so the
// downloaded picture looks exactly like the page. CSS classes are only for animation.
const C = {
  wine: "#7a1f3d", gold: "#c9a35c", rose: "#e7a3b5", muted: "#8a6f78", ink: "#3b2a30",
  river: "#cfe6ef", riverText: "#7fa9ba", street: "#f0e2d6", tree: "#cfe3c4", treeEdge: "#b5d3a6",
};
type Fonts = { sans: string; serif: string };
const FALLBACK_FONTS: Fonts = { sans: "Inter, system-ui, sans-serif", serif: "'Playfair Display', Georgia, serif" };

const Pin = ({ x, y, n, last, delay, f }: { x: number; y: number; n: number; last?: boolean; delay: number; f: Fonts }) => (
  <g transform={`translate(${x} ${y})`}>
    <g className="rm-pin" style={{ animationDelay: `${delay}s` }}>
      <ellipse cx="0" cy="2" rx="9" ry="3" fill="rgba(74,16,36,.18)" />
      <path
        d="M0 0 C -5 -9 -15 -15 -15 -27 A 15 15 0 1 1 15 -27 C 15 -15 5 -9 0 0 Z"
        fill={last ? C.gold : C.wine}
        stroke="#fff"
        strokeWidth="2"
      />
      <circle cx="0" cy="-27" r="9.5" fill="#fff" />
      {last ? (
        <path d="M0 -22.5s-5.2-3.2-6.4-6.3c-.9-2.2.5-4.7 2.9-4.7 1.5 0 2.5.8 3.5 1.9 1-1.1 2-1.9 3.5-1.9 2.4 0 3.8 2.5 2.9 4.7C5.2-25.7 0-22.5 0-22.5z" fill={C.wine} />
      ) : (
        <text x="0" y="-23" textAnchor="middle" fontFamily={f.sans} fontWeight="700" fontSize="12" fill={C.wine}>{n}</text>
      )}
    </g>
  </g>
);

type StickerProps = { x: number; y: number; tilt: number; tape: string; when: string; what: string; where: string; delay: number; f: Fonts };

const Sticker = ({ x, y, tilt, tape, when, what, where, delay, f }: StickerProps) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt} 85 29)`}>
    <g className="rm-sticker" style={{ animationDelay: `${delay}s` }}>
      <rect x="2" y="4" width="170" height="58" rx="12" fill="rgba(74,16,36,.10)" />
      <rect width="170" height="58" rx="12" fill="#fff" stroke="#f1d3dc" strokeWidth="1.5" />
      <rect x="65" y="-7" width="40" height="13" rx="2" fill={tape} opacity=".75" transform="rotate(-4 85 0)" />
      <text x="85" y="19" textAnchor="middle" fontFamily={f.sans} fontWeight="600" fontSize="8.5" letterSpacing="1.2" fill={C.muted}>{when}</text>
      <text x="85" y="37" textAnchor="middle" fontFamily={f.serif} fontWeight="700" fontSize="14" fill={C.wine}>{what}</text>
      <text x="85" y="51" textAnchor="middle" fontFamily={f.serif} fontStyle="italic" fontSize="9.5" fill={C.ink}>{where}</text>
    </g>
  </g>
);

export default function RouteMap({ branch }: { branch: Branch }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [f, setFonts] = useState<Fonts>(FALLBACK_FONTS);

  // Use the exact font names the page loaded, so the picture matches
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const sans = css.getPropertyValue("--font-sans").trim();
    const serif = css.getPropertyValue("--font-serif").trim();
    setFonts({ sans: sans || FALLBACK_FONTS.sans, serif: serif || FALLBACK_FONTS.serif });
  }, []);

  const download = async () => {
    const el = cardRef.current;
    if (!el || saving) return;
    setSaving(true);
    el.classList.add("capturing"); // freeze animations at their finished state
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(el, { pixelRatio: 3, cacheBust: true, backgroundColor: "#fffaf6" });
      const a = document.createElement("a");
      a.href = url;
      a.download = "our-love-route.png";
      a.click();
      setSaved(true);
    } catch {
      alert("Sorry, couldn't save the picture. Try taking a screenshot instead ♥");
    } finally {
      el.classList.remove("capturing");
      setSaving(false);
    }
  };

  return (
    <>
      <div className="route-map" ref={cardRef}>
        <div className="rm-head">
          <span className="label">Our love route</span>
          <span className="rm-sub">3 stops · 1 weekend · 1 year of us</span>
        </div>

        <div className="rm-canvas">
          <svg viewBox="0 0 360 460" role="img" aria-label="Map of our three dates: cake making on December 5, church on December 6, and dinner on December 7">
            <defs>
              <mask id="rm-draw">
                <path d={ROUTE} className="rm-draw" pathLength={1} fill="none" stroke="#fff" strokeWidth="10" strokeDasharray="1" strokeDashoffset="0" />
              </mask>
            </defs>

            {/* scenery */}
            <path fill="none" stroke={C.river} strokeWidth="22" strokeLinecap="round" d="M -10 260 C 60 284, 110 238, 180 262 S 300 294, 370 274" />
            <text x="24" y="296" transform="rotate(6 24 296)" fontFamily={f.serif} fontStyle="italic" fontSize="9" letterSpacing=".7" fill={C.riverText}>Pasig River</text>
            <g fill="none" stroke={C.street} strokeWidth="7" strokeLinecap="round">
              <path d="M 0 144 L 360 164" />
              <path d="M 222 0 L 196 460" />
              <path d="M 0 394 L 360 368" />
            </g>
            {[[40, 420], [62, 406], [30, 170], [318, 128], [338, 110], [210, 430], [44, 120], [336, 314]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 2 ? 7 : 9} fill={C.tree} stroke={C.treeEdge} strokeWidth="1.5" />
            ))}
            {[[180, 450], [20, 300], [300, 34], [340, 228], [304, 168]].map(([x, y], i) => (
              <text key={i} x={x} y={y} fontSize="12" fill={C.rose} opacity=".8">♥</text>
            ))}
            <g transform="translate(250 312)" fill="#fff" opacity=".9">
              <circle cx="0" cy="0" r="9" /><circle cx="11" cy="-4" r="11" /><circle cx="23" cy="0" r="8" />
            </g>

            {/* compass */}
            <g transform="translate(326 420)">
              <circle r="20" fill="#fff" stroke={C.gold} strokeWidth="1.5" />
              <path d="M0 -15 L5 0 L0 15 L-5 0 Z" fill="#e6d3b0" />
              <path d="M0 -15 L5 0 L-5 0 Z" fill={C.wine} />
              <text y="-24" textAnchor="middle" fontFamily={f.sans} fontWeight="600" fontSize="9" fill={C.wine}>N</text>
            </g>

            {/* the route */}
            <path d={ROUTE} mask="url(#rm-draw)" fill="none" stroke={C.wine} strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
            <circle cx="22" cy="18" r="5" fill="#fff" stroke={C.wine} strokeWidth="2.5" />
            <text x="32" y="23" fontFamily={f.serif} fontStyle="italic" fontSize="11" fill={C.wine}>start ♥</text>

            <Sticker x={118} y={14} tilt={-2} tape="#e7a3b5" delay={0.8} f={f}
              when={`SAT · DEC 5${at(config.cakeTime)}`} what="Bake our cake 🎂" where={`IDIM DIY · ${branch.mall}`} />
            <Sticker x={78} y={180} tilt={2} tape="#c9a35c" delay={1.25} f={f}
              when={`SUN · DEC 6${at(config.churchTime)}`} what="Time with God 🙏" where={CHURCH.address.split(",")[0]} />
            <Sticker x={140} y={332} tilt={-1.5} tape="#e7a3b5" delay={1.7} f={f}
              when={`MON · DEC 7${at(config.dinnerTime)}`} what="Anniversary dinner 🍷" where="Seoul Sky · Eastwood" />

            <Pin x={90} y={85} n={1} delay={0.6} f={f} />
            <Pin x={270} y={205} n={2} delay={1.05} f={f} />
            <Pin x={110} y={335} n={3} last delay={1.5} f={f} />
          </svg>
        </div>

        <div className="rm-sign">{config.from} <span>♥</span> {config.herName} · December 2026</div>
      </div>

      <button className="btn" onClick={download} disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved! Download again ↓" : "Download our love route ↓"}
      </button>
    </>
  );
}
