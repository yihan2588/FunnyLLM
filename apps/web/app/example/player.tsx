"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import recording from "./recording.json";

export function ExamplePlayer() {
  const [selected, setSelected] = useState(0);
  const [edits, setEdits] = useState<boolean[]>([]);
  const take = recording.takes[selected];
  const shortened = Boolean(edits[selected]);
  const caption = shortened ? take.shorter : take.caption;

  function toggleEdit() {
    setEdits(previous => {
      const next = [...previous];
      next[selected] = !previous[selected];
      return next;
    });
  }

  return <section className="example-player" aria-label="Recorded meme editor">
    <div>
      <h2>Pick a take</h2>
      <div className="example-choices" role="group" aria-label="Three recorded takes">
        {recording.takes.map((item, index) => <button type="button" key={item.image}
          aria-pressed={selected === index} onClick={() => setSelected(index)}>
          <Image src={'/catalog/' + item.image} alt="" width={100} height={74} />
          <span><small>Take {index + 1}</small><span>{edits[index] ? item.shorter : item.caption}</span></span>
        </button>)}
      </div>
    </div>
    <div className="example-workbench">
      <figure>
        <Image src={'/catalog/' + take.image} width={take.width} height={take.height}
          alt={take.alt} className="example-photo" />
        <figcaption aria-live="polite" aria-atomic="true">{caption}</figcaption>
      </figure>
      <div className="example-actions">
        <button type="button" className="cw-secondary" onClick={toggleEdit}>
          {shortened ? "Undo shorter edit" : "Make it shorter"}
        </button>
        <Link className="cw-primary" href="/lab?mode=thought">Make my own meme</Link>
      </div>
    </div>
  </section>;
}
