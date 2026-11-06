"use client";

import { useEffect, useRef, useState } from "react";
import { burstHearts } from "./FloatingHearts";
import Reveal from "./Reveal";
import MapPin from "./MapPin";
import Polaroids from "./Polaroids";
import RouteMap from "./RouteMap";
import {
  BRANCHES,
  CHURCH,
  SEOUL_SKY,
  SUGGESTED_BRANCH,
  config,
  findBranch,
} from "@/lib/config";

const STORAGE_KEY = "aniv-branch";

const store = {
  get: () => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } },
  set: (v: string) => { try { localStorage.setItem(STORAGE_KEY, v); } catch {} },
  clear: () => { try { localStorage.removeItem(STORAGE_KEY); } catch {} },
};

const at = (time: string) => (time ? ` · ${time}` : "");

export default function DatePicker({ active }: { active: boolean }) {
  const [picked, setPicked] = useState<string>(SUGGESTED_BRANCH);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const justConfirmed = useRef(false);

  // Restore an earlier answer
  useEffect(() => {
    const saved = store.get();
    if (findBranch(saved)) {
      setPicked(saved!);
      setConfirmed(saved);
    }
  }, []);

  useEffect(() => {
    if (confirmed && justConfirmed.current) {
      justConfirmed.current = false;
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [confirmed]);

  const confirm = () => {
    store.set(picked);
    justConfirmed.current = true;
    setConfirmed(picked);
    burstHearts();
  };

  const change = () => {
    store.clear();
    setConfirmed(null);
  };

  const branch = findBranch(picked) ?? BRANCHES[0];
  const done = confirmed ? findBranch(confirmed) : undefined;

  if (done) {
    return (
      <Reveal active={active}>
        <div ref={topRef} />
        <div className="yay">
          <div className="script">It&apos;s a date!</div>
          <p>Three dates, one weekend, all for us. I can&apos;t wait.</p>
        </div>
        <RouteMap branch={done} />
        <button className="small-link" onClick={change}>Change the branch</button>
        <Polaroids />
      </Reveal>
    );
  }

  return (
    <>
    <Reveal active={active}>
      <div ref={topRef} />
      <div className="label">Date one · Saturday, December 5{at(config.cakeTime)}</div>
      <div className="title">Let&apos;s bake our anniversary cake 🎂</div>
      <p className="lead">
        Come with me to <b>IDIM DIY Bakery</b> and we&apos;ll make our cake together.
        I&apos;m thinking Pasay, but you pick the branch.
      </p>
      <div className="choices" role="radiogroup" aria-label="IDIM DIY Bakery branch">
        {BRANCHES.map((b) => (
          <button
            key={b.key}
            role="radio"
            aria-checked={picked === b.key}
            className={`choice ${picked === b.key ? "selected" : ""}`}
            onClick={() => setPicked(b.key)}
          >
            <div className="ic" aria-hidden="true">📍</div>
            <div>
              <h4>
                {b.mall}
                {b.key === SUGGESTED_BRANCH && <em className="pick">My pick</em>}
              </h4>
              <span>{b.address}, {b.city}</span>
            </div>
            <div className="check" aria-hidden="true">✓</div>
          </button>
        ))}
      </div>
      <MapPin title={`IDIM DIY Bakery, ${branch.mall}`} embed={branch.embed} link={branch.link} />
    </Reveal>

    <Reveal active={active}>
      <div className="label">Date two · Sunday, December 6{at(config.churchTime)}</div>
      <div className="title">Time with God 🙏</div>
      <p className="quote">&ldquo;Balik tayo kung saan mo ako sinagot.&rdquo;</p>
      <div className="venue">
        <div className="emoji" aria-hidden="true">⛪</div>
        <div className="tag">Where you said yes</div>
        <h3>{CHURCH.name}</h3>
        <div className="where">{CHURCH.address}</div>
        <p>
          Before we celebrate, let&apos;s thank Him for us. Same place it all started, one year later.
        </p>
        <MapPin title={CHURCH.name} embed={CHURCH.embed} link={CHURCH.link} />
      </div>
    </Reveal>

    <Reveal active={active}>
      <div className="label">Date three · Monday, December 7{at(config.dinnerTime)}</div>
      <div className="title">Our anniversary dinner 🍷</div>
      <div className="venue">
        <div className="emoji" aria-hidden="true">🌃</div>
        <div className="tag">Already booked</div>
        <h3>{SEOUL_SKY.name}</h3>
        <div className="where">{SEOUL_SKY.address}</div>
        <p>
          Korean dinner with a view of the city lights, just the two of us. No need to choose
          this one. It&apos;s all set.
        </p>
        <MapPin title={SEOUL_SKY.name} embed={SEOUL_SKY.embed} link={SEOUL_SKY.link} />
      </div>
      <button className="btn" onClick={confirm}>
        Yes, it&apos;s a date ♥
      </button>
    </Reveal>
    </>
  );
}
