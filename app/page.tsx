"use client";

import { useState } from "react";
import Envelope from "@/components/Envelope";
import FloatingHearts, { burstHearts } from "@/components/FloatingHearts";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import DatePicker from "@/components/DatePicker";
import MusicButton from "@/components/MusicButton";
import { config } from "@/lib/config";

export default function Home() {
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    setOpened(true);
    burstHearts();
  };

  return (
    <>
      <FloatingHearts />
      <Envelope gone={opened} onOpen={handleOpen} />
      <MusicButton />

      <main>
        <Reveal active={opened} className="hero">
          
          <h1 className="script">One Year</h1>
          <h2>of loving you</h2>
          <div className="divider" />
        </Reveal>

        <Reveal active={opened}>
          <div className="note">
            {config.herName},
            <br /><br />
            A year ago, I got lucky. I found someone who loves me, supports me in everything I do,
            and stays by my side through all my ups and downs.
            Thank you for believing in me, even when I don&apos;t believe in myself.
            <br /><br />
            Even now, I still can&apos;t wait to see you every single day,
            kahit magkasama na tayo sa iisang bubong.
            <br /><br />
            <strong>Happy anniversary, my love!</strong>
            <span className="sig">— {config.from}</span>
          </div>
        </Reveal>

        <Reveal active={opened}>
          <div className="label">Save the dates</div>
          <div className="date-card">
            <div className="dates">
              <div>
                <div className="day">Saturday</div>
                <div className="big">Dec 5</div>
                <div className="what">DIY cake 🎂</div>
              </div>
              <div>
                <div className="day">Sunday</div>
                <div className="big">Dec 6</div>
                <div className="what">Church 🙏</div>
              </div>
              <div>
                <div className="day">Monday</div>
                <div className="big">Dec 7</div>
                <div className="what">Dinner 🍷</div>
              </div>
            </div>
          
            <Countdown to={config.cakeDate} />
          </div>
        </Reveal>

        <DatePicker active={opened} />
      </main>

      <footer>Made with love, for you ♥</footer>
    </>
  );
}
