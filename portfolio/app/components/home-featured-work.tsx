import Link from "next/link";
import type { CSSProperties } from "react";
import type { LocalizedPortfolioProject } from "../../lib/portfolio-data";
import { christmasCoverAlt, HOME_FEATURED_CURATION } from "../../lib/home-featured-curation";
import { projectHref, workHref } from "../../lib/routes";
import type { Locale } from "../site-content";
import { LocalizedPhrase } from "./localized-project-title";
import WorkThumbnail from "./work-thumbnail";
import UIIcon from "./ui-icon";
import thumbnailManifest from "../data/work-thumbnails.generated.json";
import type { WorkThumbnail as Thumbnail } from "../../lib/work-thumbnail-types";

const coverSizes = "auto, (max-width: 1099px) 46vw, (max-width: 1630px) 30vw, 484px";

// The first tile is the lead: full width on phones and tablets, two columns wide on desktop.
const leadCoverSizes = "auto, (max-width: 1099px) 92vw, (max-width: 1630px) 61vw, 992px";

const labels = {
  en: { title: "Selected projects", open: "View project", allWork: "View all {count} projects", search: "Search" },
  ja: { title: "主な制作実績", open: "実績を見る", allWork: "全{count}件を見る", search: "検索" },
  ko: { title: "주요 프로젝트", open: "프로젝트 보기", allWork: "전체 {count}개 프로젝트 보기", search: "검색" },
};

export default function HomeFeaturedWork({ locale, projects, totalProjectCount }: {
  locale: Locale;
  projects: LocalizedPortfolioProject[];
  totalProjectCount: number;
}) {
  const copy = labels[locale];
  const fukuokaTitle = { en: "Fukuoka travel branding", ja: "福岡の旅を伝えるデザイン", ko: "후쿠오카 여행 브랜딩" }[locale];
  const thumbnails = thumbnailManifest as Record<string, Thumbnail>;
  // Ajimi has its own playable route, so its tile is written here instead of coming from the project data.
  const ajimi = {
    title: { en: "Ajimi, a Japanese lesson you cook", ja: "料理で学ぶ日本語アプリ「味見」", ko: "요리로 배우는 일본어 앱 ‘아지미’" }[locale],
    role: { en: "Product design, UI & build", ja: "プロダクトデザイン・UI・開発", ko: "프로덕트 디자인·UI·개발" }[locale],
    alt: { en: "A clay bowl of Sanuki udon on patterned cloth, with Mochi the taster beside it.", ja: "柄入りの布に置かれた粘土の讃岐うどんと、味見役のおもち。", ko: "무늬가 있는 천 위의 점토 사누키 우동과 맛을 보는 모치." }[locale],
    href: locale === "en" ? "/work/ajimi" : `/${locale}/work/ajimi`,
    thumbnail: { source: "/ajimi/story/home.webp", scene: "artwork", slides: [{ src: "/ajimi/story/home.webp", width: 1200, height: 1200, srcSet: "/ajimi/story/home.webp 1200w" }] } as Thumbnail,
  };
  return (
    <section id="work" className="home-featured-work home-work-folio" aria-labelledby="home-featured-work-title" data-work-gallery>
      <div className="home-featured-stage">
      <header className="home-featured-work-heading" data-motion-reveal="section-heading">
        <h2 id="home-featured-work-title"><LocalizedPhrase locale={locale} text={copy.title} /></h2>
        <Link className="button button-secondary studio-search-button" href={`${workHref(locale)}#project-search-input`} prefetch={false}>
          <UIIcon name="search" size={18} /><span>{copy.search}</span>
        </Link>
      </header>
      <div className="home-case-grid" data-kinetic-cluster="folio" data-kinetic-strength="0.6">
        <article className="home-case-card" data-home-project="fukuoka-branding" data-project-id="fukuoka-branding" data-motion-reveal="project" style={{ '--art-ratio': 1 } as CSSProperties}>
          <Link className="home-case-media folio-glass-link" data-caption-host data-kinetic-card data-holographic data-media-count="1" href={locale === "en" ? "/ai-motion" : `/${locale}/ai-motion`} prefetch={false} aria-label={`${copy.open}: ${fukuokaTitle}`} aria-describedby="fukuoka-cover-role">
            <div className="home-case-media-frame folio-glass-frame" data-media-fit="mockup" data-media-orientation="square" style={{aspectRatio:"1 / 1"}}>
              <WorkThumbnail presentation={thumbnails["fukuoka-branding"]} alt={christmasCoverAlt[locale]} sizes={leadCoverSizes} />
              <span className="glass-reflection folio-reflection" aria-hidden="true" />
              <div className="home-case-caption project-cover-caption folio-glass-caption"><header className="home-case-card-heading"><h3>{fukuokaTitle}</h3></header><div className="home-case-story"><div className="home-case-outcome"><p id="fukuoka-cover-role">{{en:"Personal project · Motion & stickers",ja:"個人制作 · モーション・ステッカー",ko:"개인 프로젝트 · 모션·스티커"}[locale]}</p></div></div></div>
            </div>
          </Link>
        </article>
        <article className="home-case-card" data-home-project="ajimi" data-project-id="ajimi" data-motion-reveal="project" data-motion-order={1} style={{ '--art-ratio': 1 } as CSSProperties}>
          <Link className="home-case-media folio-glass-link" data-caption-host data-kinetic-card data-holographic data-media-count="1" href={ajimi.href} prefetch={false}
            aria-label={`${copy.open}: ${ajimi.title}`} aria-describedby="cover-role-ajimi">
            <div className="home-case-media-frame folio-glass-frame" data-media-fit="mockup" data-media-orientation="square" style={{ aspectRatio: "1 / 1" }}>
              <WorkThumbnail presentation={ajimi.thumbnail} alt={ajimi.alt} sizes={coverSizes} />
              <span className="glass-reflection folio-reflection" aria-hidden="true" />
              <div className="home-case-caption project-cover-caption folio-glass-caption">
                <header className="home-case-card-heading"><h3>{ajimi.title}</h3></header>
                <div className="home-case-story"><div className="home-case-outcome"><p id="cover-role-ajimi">{ajimi.role}</p></div></div>
              </div>
            </div>
          </Link>
        </article>
        {projects.map((project, index) => {
          const art = HOME_FEATURED_CURATION[project.id];
          return (
            <article key={project.id} className="home-case-card" data-home-project={project.id} data-project-id={project.id}
              data-motion-reveal="project" data-motion-order={(index + 2) % 3} style={{ '--art-ratio': 1 } as CSSProperties}>
              <Link className="home-case-media folio-glass-link" data-caption-host data-kinetic-card data-holographic data-media-count="1" href={projectHref(locale, project.slug)} prefetch={false}
                aria-label={`${copy.open}: ${art.title[locale]}`} aria-describedby={`cover-role-${project.id}`}>
                <div className="home-case-media-frame folio-glass-frame" data-media-fit="mockup"
                  data-media-orientation="square"
                  style={{ aspectRatio: "1 / 1" }}>
                  <WorkThumbnail presentation={thumbnails[project.id === "juniper" ? "juniper-home" : project.id] ?? thumbnails[project.id]} alt={art.alt[locale]} sizes={coverSizes} />
                  <span className="glass-reflection folio-reflection" aria-hidden="true" />
                  <div className="home-case-caption project-cover-caption folio-glass-caption">
                    <header className="home-case-card-heading"><h3>{art.title[locale]}</h3></header>
                    <div className="home-case-story"><div className="home-case-outcome"><p id={`cover-role-${project.id}`}>{art.role[locale]}</p></div></div>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      <div className="home-all-work-cta"><Link className="button button-primary" href={workHref(locale)} prefetch={false}
        data-analytics-event="project_navigation" data-analytics-action="home_all_work" data-analytics-source="home_selected_work">
        {copy.allWork.replace('{count}', String(totalProjectCount + 1))}
      </Link></div>
      </div>
    </section>
  );
}
