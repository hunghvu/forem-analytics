/**
 * @author Hung Vu
 */

// React
import type { FC } from "react";

// MUI library
import { Button, Grid, TextField } from "@mui/material";

// Utilities
import { useForm, SubmitHandler } from "react-hook-form";

// Components
import AutocompleteField from "./inputs/AutocompleteField";

interface FormInputs {
  community: { label: string; communityUrl: string; iconUrl: string } | null;
  numberOfPages: number | null;
  articlesPerPage: number | null;
  zScore: number | null;
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

const QueryOptionsSection: FC = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      community: null,
      numberOfPages: null,
      articlesPerPage: null,
      zScore: null,
    },
  });
  const onSubmit: SubmitHandler<FormInputs> = (data) => console.log(data);

  return (
    // Using Grid inside a box breaks the layout for some reasons?
    <Grid container justifyContent="space-evenly" alignItems="center" direction="row" component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid item xs={12} md={4}>
        <AutocompleteField name={"community"} control={control} options={availableCommunities} label={"Your favorite community ❤️"} errors={errors} />
      </Grid>
      {/* <Grid item xs={12} md={4}>
        <AutocompleteField name={"url"} control={control} options={availableCommunities} label={"Your favorite community ❤️"} errors={errors} />
      </Grid> */}
      <Grid item xs={12} md={4}>
        <Button type="submit">Submit</Button>
      </Grid>
    </Grid>
  );
};

export default QueryOptionsSection;
