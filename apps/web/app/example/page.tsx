import { SiteFooter, SiteHeader } from "@/app/site-header";
import { ExamplePlayer } from "./player";
import recording from "./recording.json";
import "./example.css";

export const metadata = { title: "Try a real example · FunnyLLM" };

export default function Example() {
  return <div className="cw-app">
    <SiteHeader />
    <main id="main-content" className="example-page">
      <header className="example-intro">
        <p>Recorded session · No sign-in needed</p>
        <h1>“{recording.premise}”</h1>
        <p>One thought, three memes. Pick a take and try a shorter punchline.</p>
      </header>
      <ExamplePlayer />
    </main>
    <SiteFooter />
  </div>;
}
