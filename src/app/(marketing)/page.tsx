import { Button } from "flowbite-react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="landing-page">
      <header className="public-header">
        <Brand />
        <Button color="light" outline href="/demo">
          Explore the demo <span aria-hidden="true">↗</span>
        </Button>
      </header>
      <main id="main-content" className="landing-main">
        <section className="landing-hero">
          <div className="landing-copy">
            <Badge tone="accent">For people. For possibilities.</Badge>
            <h1>
              A clearer path
              <br />
              to your <span>next chapter.</span>
            </h1>
            <p>
              Bring candidates and their teams into one shared space. Less
              chasing updates. More moving forward, together.
            </p>
            <Button color="dark" href="/demo">
              Step inside the demo <span aria-hidden="true">↗</span>
            </Button>
            <span className="landing-footnote">
              A development preview. No account needed.
            </span>
          </div>
          <div className="landing-art" aria-hidden="true">
            <span className="landing-orbit" />
            <span className="landing-orbit landing-orbit-inner" />
            <div className="art-word">
              NEXT
              <br />
              <span>STARTS</span>
              <br />
              HERE<span className="art-arrow">↗</span>
            </div>
            <span className="art-tag">
              A little direction. A lot of possibility.
            </span>
          </div>
        </section>
        <section
          className="landing-perspectives"
          aria-labelledby="perspectives-heading"
        >
          <div>
            <p className="eyebrow">CONNECTED BY DESIGN</p>
            <h2 id="perspectives-heading">
              Different perspectives.
              <br />A shared direction.
            </h2>
          </div>
          <p>
            A candidate's next step. A team's shared focus. A platform that
            brings the journey together. We're building the workflows one
            thoughtful step at a time.
          </p>
          <Button color="light" href="/demo">
            Find your perspective ↗
          </Button>
        </section>
      </main>
      <footer className="public-footer">
        <span>Job Finder © 2026</span>
        <span>Workspace foundation · Mock workflows in progress</span>
      </footer>
    </div>
  );
}
