"use client";

import {
  Citation,
  CitationContent,
  CitationItem,
  parseCitationUrl,
  CitationTrigger,
  resolveCitationSource,
} from "@/components/nexus-ui/citation";

const SOURCE = {
  url: "https://github.com/victorcodess/nexus-ui",
  title: "victorcodess/nexus-ui",
  description: "Beautiful, customizable components for modern AI experiences.",
};

const resolved = resolveCitationSource(SOURCE);
const hostname = parseCitationUrl(SOURCE.url).hostname;

function CitationTriggerVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Citation citations={[SOURCE]}>
        <CitationTrigger showSiteName={false} />
        <CitationContent>
          <CitationItem />
        </CitationContent>
      </Citation>

      <Citation citations={[SOURCE]}>
        <CitationTrigger showFavicon={false} label="2" />
        <CitationContent>
          <CitationItem />
        </CitationContent>
      </Citation>

      <Citation citations={[SOURCE]}>
        <CitationTrigger showFavicon={false} label={hostname} />
        <CitationContent>
          <CitationItem />
        </CitationContent>
      </Citation>

      <Citation citations={[SOURCE]}>
        <CitationTrigger showFavicon={false} label={resolved.siteName} />
        <CitationContent>
          <CitationItem />
        </CitationContent>
      </Citation>
    </div>
  );
}

export default CitationTriggerVariants;
