/**
 * @author Hung Vu
 */

// React
import type { Dispatch, FC, SetStateAction } from "react";

// MUI library
import { Button, Grid, Paper } from "@mui/material";

// Utilities
import { useForm } from "react-hook-form";

// Components
import AutocompleteField from "./inputs/AutocompleteField";
import TextInputField from "./inputs/TextInputField";
import fetchPublishedArticlesSortedByPublishDate from "../../utils/FetchArticles";

interface QueryOptionsSectionProps {
  setArticleList: Dispatch<SetStateAction<any>>;
}

interface FormInputs {
  community: { label: string; communityUrl: string; iconUrl: string } | null;
  numberOfPages: string | null;
  articlesPerPage: string | null;
}

const availableCommunities = [
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

const QueryOptionsSection: FC<QueryOptionsSectionProps> = ({ setArticleList }) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      community: null,
      numberOfPages: "",
      articlesPerPage: "",
    },
  });

  const flexRowCenter = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  return (
    <Paper
      elevation={2}
      style={{
        border: "1px",
        borderRadius: 16,
        padding: 20,
        margin: 20,
        minWidth: "90vw",
      }}
      component="fieldset"
    >
      <Grid
        container
        direction="row"
        spacing={4}
        component="form"
        onSubmit={handleSubmit(async (data) => {
          const articleList = await fetchPublishedArticlesSortedByPublishDate(
            data.community!.communityUrl!,
            data!.numberOfPages!,
            data!.articlesPerPage!
          );
          setArticleList(articleList);
        })}
        noValidate
      >
        <Grid item xs={12} md={4}>
          <AutocompleteField
            name={"community"}
            control={control}
            options={availableCommunities}
            label={"❤️ Your favorite community "}
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextInputField
            name={"numberOfPages"}
            control={control}
            label={"# pages per query (>=1)"}
            errors={errors}
            // Value as number seems to work only with type number input
            // which is not recommended in MUI
            rules={{ required: true, pattern: /^[1-9]{1}[0-9]*$/ }} // min is 1
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextInputField
            name={"articlesPerPage"}
            control={control}
            label={"# articles per page (30 - 99)"}
            errors={errors}
            // If the data set is too small, heat map disappears?
            rules={{ required: true, pattern: /^[3-9]{1}[0-9]{1}$/ }} // range is 100 - 1000
          />
        </Grid>
        <Grid item xs={6} style={flexRowCenter}>
          <Button
            variant="outlined"
            onClick={() => {
              reset({
                community: null,
                numberOfPages: "",
                articlesPerPage: "",
              });
            }}
          >
            Reset
          </Button>
        </Grid>
        <Grid item xs={6} style={flexRowCenter}>
          <Button variant="outlined" type="submit">
            Fetch articles
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default QueryOptionsSection;
