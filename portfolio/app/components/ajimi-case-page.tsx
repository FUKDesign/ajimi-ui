/* eslint-disable @next/next/no-img-element -- These are local game illustrations and local recorded demonstrations. */
import type { Metadata } from "next";
import type { Locale } from "../site-content";
import { withSiteSocialMetadata } from "../../lib/seo";
import copy from "../data/ajimi-case.json";
import { createElement } from "react";
import { preinit } from "react-dom";

const cover = "/ajimi/story/cover.webp";
const kitchen = "/ajimi/index.html";

export function ajimiMetadata(locale: Locale): Metadata {
  const title = "Ajimi / 味見 | Aidan McFarlane";
  const description = copy[locale].overview;
  const canonical = (locale === "en" ? "" : "/" + locale) + "/work/ajimi";
  return withSiteSocialMetadata({
    title, description,
    authors: [{name: "Aidan McFarlane"}],
    alternates: {canonical, languages: {en: "/work/ajimi", ja: "/ja/work/ajimi", ko: "/ko/work/ajimi"}},
    openGraph: {title, description, url: canonical, images: [cover]},
    twitter: {card: "summary_large_image", title, description, images: [cover]},
  }, locale);
}

export default function AjimiCasePage({locale}: {locale: Locale}) {
  preinit("/ajimi/story/story.css", { as: "style", precedence: "ajimi" });
  const text = copy[locale];
  return (
    <div id="top" className="aj-portfolio-case" lang={locale === "en" ? "en-GB" : locale}>
      <main id="main-content" className="aj-case" data-play-label={text.play} data-pause-label={text.pause} data-sound-on={text.soundOn} data-sound-off={text.soundOff}>
        <header className="aj-hero">
          <div className="aj-wrap aj-intro">
            <div className="aj-lead">
              <h1>Ajimi</h1><p className="aj-deck">{text.deck}</p>
              <a className="aj-action" href={kitchen}>{text.open}</a>
              <div className="aj-byline"><span>{text.byline}</span><span>2026</span></div>
            </div>
            <picture className="aj-cover"><img src={cover} width="880" height="660" alt={text.coverAlt} fetchPriority="high"/></picture>
          </div>
        </header>
        <div className="aj-wrap">
          <section className="aj-premise" aria-labelledby="aj-premise-title">
            <div className="aj-dishes">
              <div className="aj-dish"><img src="/ajimi/assets/hokkaido-plate.webp" alt="" width="160" height="160" loading="lazy"/><span>{text.sapporo}</span></div>
              <div className="aj-dish"><img src="/ajimi/assets/fukuoka-plate.webp" alt="" width="160" height="160" loading="lazy"/><span>{text.hakata}</span></div>
            </div>
            <div><h2 id="aj-premise-title">{text.premise}</h2><p>{text.premiseBody}</p></div>
          </section>
          <section className="aj-journey" aria-labelledby="aj-journey-title">
            <div className="aj-journey-head">
              <h2 id="aj-journey-title">{text.journey}</h2>
              <div className="aj-indicator" aria-hidden="true"><span className="aj-counter">1 / 3</span><span className="aj-track"><span/></span></div>
            </div>
            <div className="aj-stack">
              {text.chapters.map((chapter, index) => (
                <details className="aj-chapter" id={"aj-" + chapter.id} open key={chapter.id}>
                  <summary>
                    <span aria-hidden="true" className="aj-numeral">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{chapter.title}</h3><span className="aj-toggle" aria-hidden="true"/>
                  </summary>
                  <div className="aj-card-body">
                    <div className="aj-chapter-copy">{chapter.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
                    <div className="aj-demo">
                      <video width={chapter.media === "udon" ? 390 : 960} height={chapter.media === "udon" ? 780 : 720}
                        poster={"/ajimi/story/" + chapter.media + "-still.webp"} src={"/ajimi/media/" + chapter.media + ".mp4"}
                        aria-label={chapter.alt} muted playsInline loop controls preload="none"/>
                      <div className="aj-demo-controls"><button type="button" className="aj-play" hidden aria-pressed="false">{text.play}</button>{chapter.media === "udon" && <button type="button" className="aj-sound" hidden aria-pressed="false">{text.soundOn}</button>}<a href={"/ajimi/media/" + chapter.media + ".mp4"}>{text.fullSize}</a></div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
          <footer className="aj-end"><img src="/ajimi/assets/mark.svg" width="62" height="62" alt=""/>
            <div><h2>{text.end}</h2><a className="aj-text-link" href={kitchen}>{text.again}</a></div>
            <a className="aj-return" href={(locale === "en" ? "" : "/" + locale) + "/work"}>{text.back}</a>
          </footer>
        </div>
      </main>
      {createElement("ajimi-chapter-controls", {"aria-hidden": true})}
      <script type="module" src="/ajimi/story/portfolio.js" async/>
    </div>
  );
}
