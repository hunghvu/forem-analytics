/// <reference types="cypress" />

/**
 * @author Hung Vu
 * 
 * Test article fetching capabilities.
 */
import fetchPublishedArticlesSortedByPublishDate from "../../utils/FetchArticles";

interface Community {
  label: string;
  communityUrl: string;
  iconUrl: string;
}

const availableCommunities: Community[] = [
  {
    label: "Dev",
    communityUrl: "https://dev.to/",
    iconUrl: "/dev.svg",
  },
  {
    label: "CodeNewbie",
    communityUrl: "https://community.codenewbie.org/",
    iconUrl: "/codenewbie.webp",
  },
  {
    label: "Forem Creators and Builders",
    communityUrl: "https://forem.dev/",
    iconUrl: "/forem.webp",
  },
  {
    label: "Web Monetization",
    communityUrl: "https://community.webmonetization.org/",
    iconUrl: "/web-monetization.webp",
  },
  {
    label: "The Relicans",
    communityUrl: "https://www.therelicans.com/",
    iconUrl: "/the-relicans.webp",
  },
  {
    label: "COSS",
    communityUrl: "https://www.coss.community/",
    iconUrl: "/coss.webp",
  },
  {
    label: "MetaPunk",
    communityUrl: "https://www.metapunk.to/",
    iconUrl: "/metapunk.png",
  },
  {
    label: "Wasm Builders",
    communityUrl: "https://www.wasm.builders/",
    iconUrl: "/wasm.svg",
  },
  {
    label: "The Community Club",
    communityUrl: "https://the.community.club/",
    iconUrl: "/the-community-club.webp",
  },
  {
    label: "This MMA Life",
    communityUrl: "https://www.thismmalife.com/",
    iconUrl: "/this-mma-life.png",
  },
  {
    label: "VSCodeTips",
    communityUrl: "https://community.vscodetips.com/",
    iconUrl: "/vscodetips.svg",
  },
  {
    label: "FlowState",
    communityUrl: "https://www.flowstate.to/",
    iconUrl: "/flowstate.png",
  },
  {
    label: "AWS Newbie Tips",
    communityUrl: "https://aws.newbie.tips/",
    iconUrl: "/aws-newbie-tips.webp",
  },
  {
    label: "1Vibe",
    communityUrl: "https://www.1vibe.com/",
    iconUrl: "/1vibe.png",
  },
  {
    label: "Development Hackers",
    communityUrl: "https://www.developmenthackers.com/",
    iconUrl: "/development-hackers.png",
  },
  {
    label: "Forest",
    communityUrl: "https://www.joinforest.com/",
    iconUrl: "", // No Icon
  },
  {
    label: "Meland",
    communityUrl: "https://forum.meland.ai/",
    iconUrl: "", // No icon
  },
];

// TODO: May use fixtures instead of real 3rd-party request later on?
describe("Fetch published articles sorted by publish date", () => {
  it("should return a 2D array [articlePage][articleNumber]", () => {
    availableCommunities.forEach(async (community) => {
      const articles = await fetchPublishedArticlesSortedByPublishDate(community.communityUrl, "2", "2");
      if (articles) {
        expect(articles[0].length).to.equal(2);
        expect(articles[1].length).to.equal(2);
      }
    });
  });
});
