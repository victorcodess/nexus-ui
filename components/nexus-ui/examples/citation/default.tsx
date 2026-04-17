import {
  Citation,
  CitationContent,
  CitationDescription,
  CitationItem,
  CitationSource,
  CitationTitle,
  CitationTrigger,
} from "@/components/nexus-ui/citation";

function CitationDefault() {
  return (
    <div>
      <Citation
        citation={{
          url: "https://en.wikipedia.org/wiki/List_of_African_countries_by_area",
          title: "List of African countries by area",
          description:
            "Africa is the second-largest continent in the world by area and population. Algeria has been the largest country in Africa and the Arab world since the division ...Read more",
        }}
      >
        <CitationTrigger />

        <CitationContent>
          <CitationItem>
            <CitationTitle />
            <CitationDescription />
            <CitationSource />
          </CitationItem>
        </CitationContent>
      </Citation>
    </div>
  );
}

export default CitationDefault;
