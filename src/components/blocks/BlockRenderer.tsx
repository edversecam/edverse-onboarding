import { Block, blockQuizzes } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RichText } from "./RichText";
import { AccordionBlock } from "./AccordionBlock";
import { FlipCardBlock } from "./FlipCardBlock";
import { SlideBlock } from "./SlideBlock";
import { VideoBlock } from "./VideoBlock";
import { BlockBoundary } from "./BlockBoundary";
import { Quiz } from "@/components/quiz/Quiz";

function Heading({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <h3 className="mb-3 text-xl font-semibold text-foreground">{children}</h3>
  );
}

export function BlockRenderer({ block }: { block: Block }) {
  return (
    <BlockBoundary label={block.kind.replace("-", " ")}>
      {renderBlock(block)}
    </BlockBoundary>
  );
}

function renderBlock(block: Block) {
  switch (block.kind) {
    case "text":
      return (
        <section>
          <Heading>{block.heading}</Heading>
          <RichText text={block.body} className="text-[15px]" />
        </section>
      );

    case "text-image": {
      const right = block.imageSide !== "left";
      return (
        <section className="grid items-center gap-6 md:grid-cols-2">
          <div className={cn(right ? "md:order-1" : "md:order-2")}>
            <Heading>{block.heading}</Heading>
            <RichText text={block.body} className="text-[15px]" />
          </div>
          <div className={cn(right ? "md:order-2" : "md:order-1")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.imageUrl}
              alt={block.imageAlt ?? ""}
              className="h-full w-full rounded-xl border border-border object-cover shadow-[var(--shadow-card)]"
            />
          </div>
        </section>
      );
    }

    case "callout": {
      const tone = {
        info: "border-brand/30 bg-brand-tint",
        success: "border-success/30 bg-success-tint",
        warning: "border-warning/30 bg-[var(--warning-tint)]",
      }[block.tone];
      return (
        <aside className={cn("rounded-xl border p-4", tone)}>
          {block.title && (
            <p className="mb-1 text-sm font-semibold text-foreground">
              {block.title}
            </p>
          )}
          <RichText text={block.body} className="text-sm" />
        </aside>
      );
    }

    case "accordion":
      return (
        <section>
          <Heading>{block.heading}</Heading>
          <AccordionBlock block={block} />
        </section>
      );

    case "flip-card":
      return (
        <section>
          <Heading>{block.heading}</Heading>
          <FlipCardBlock block={block} />
        </section>
      );

    case "slide":
      return (
        <section>
          <Heading>{block.heading}</Heading>
          <SlideBlock block={block} />
        </section>
      );

    case "video":
      return (
        <section>
          <Heading>{block.heading}</Heading>
          <VideoBlock block={block} />
        </section>
      );

    case "knowledge-check":
      return (
        <section>
          <Heading>{block.heading}</Heading>
          <div className="space-y-6">
            {blockQuizzes(block).map((q) => (
              <Quiz key={q.id} quiz={q} />
            ))}
          </div>
        </section>
      );

    default:
      return null;
  }
}
