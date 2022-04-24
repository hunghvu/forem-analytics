/**
 * @author Hung Vu
 */

// React
import { useEffect, useState } from "react";
import type { Dispatch, FC, SetStateAction } from "react";

// MUI library
import { Grid, Button, Paper } from "@mui/material";

// Utilities
import { format, parseISO } from "date-fns";
import { countBy, groupBy, meanBy, sumBy } from "lodash";
import type { Dictionary } from "lodash";
import removeOutLiers from "../../utils/RemoveOutliers";

// Components
import ByTagsSection from "./sub-section/ByTagsSection";
import ByPublishedTimeSection from "./sub-section/ByPublishedTimeSection";
import ByReadingTimeSection from "./sub-section/ByReadingTimeSection";
import { useForm } from "react-hook-form";
import RadioButtonField from "./inputs/RadioButtonField";
import TextInputField from "./inputs/TextInputField";
import ByUsersSection from "./sub-section/ByUsersSection";

interface DataVisualizationSectionProps {
  articleList: any;
}

interface RawDataPoint {
  tagList: string[];
  commentsCount: number;
  positiveReactionsCount: number;
  publishedAtHour: string;
  publishedAtDayOfWeek: string;
  readingTimeMinutes: number;
  user: {
    name: string | undefined | null; // Not used for now
    userName: string | undefined | null;
    twitterUsername: string | undefined | null;
    githubUsername: string | undefined | null;
    websiteUrl: string | undefined | null;
    profileImage: string | undefined | null; // Not used for now
    profileImage90: string | undefined | null; // Not used for now
  };
}

export interface AnalysisResult {
  group: string;
  metric: number;
}

/**
 * For a given criteria, e.g., group by time slot, or group by reading time, return sum of comments and reactions.
 * The results can differ based on a given data set. For example, a data set with comments count outliers removed
 * is different than a data set with reactions count outliers removed.
 *
 * @param adjustedDataSet Data set with outliers removed
 * @param metricName "commentsCount" or "positiveReactionsCount"
 * @param criteria To perform "group by"
 * @returns  comments and reactions
 */
const calculationByCriteria = (
  calculationMethod: "by-sum" | "by-mean",
  minSampleSize: number,
  adjustedDataSet: any[],
  metricName: "commentsCount" | "positiveReactionsCount",
  criteria: any
): AnalysisResult[] => {
  let result: AnalysisResult[] = [];
  let counted = countBy(adjustedDataSet, criteria);
  const grouped = groupBy(adjustedDataSet, criteria);

  // Remove some records if sample size is not significant
  const sampleSizeAdjustedGrouped: Dictionary<any[]> = {};
  Object.keys(counted).forEach((key) => {
    if (counted[key] >= minSampleSize) {
      sampleSizeAdjustedGrouped[key] = grouped[key];
    }
  });

  for (const [group, articleStat] of Object.entries(sampleSizeAdjustedGrouped)) {
    let calculated = 0;
    if (calculationMethod === "by-sum") {
      calculated = sumBy(articleStat, (adjustedDataPoint) => adjustedDataPoint[metricName]);
    } else if (calculationMethod === "by-mean") {
      calculated = meanBy(articleStat, (adjustedDataPoint) => adjustedDataPoint[metricName]);
    }
    result.push({
      group,
      metric: parseFloat(calculated.toFixed(2)),
    });
  }
  return result;
};

const prepareData = (articleList: any[]): RawDataPoint[] => {
  let numberOfPages = 0;
  let articlesPerPage = 0;
  let data: RawDataPoint[] = [];
  while (articleList[numberOfPages]) {
    while (articleList[numberOfPages][articlesPerPage]) {
      let article = articleList[numberOfPages][articlesPerPage];
      // Parse ISO date to local browser timezone
      let publishedAtDate = parseISO(article["published_at"]);
      let publishedAtHour = format(publishedAtDate, "HH");
      let publishedAtDayOfWeek = format(publishedAtDate, "ccc");

      let rawDataPoint: RawDataPoint = {
        tagList: article["tag_list"],
        commentsCount: article["comments_count"],
        positiveReactionsCount: article["positive_reactions_count"],
        publishedAtHour,
        publishedAtDayOfWeek,
        readingTimeMinutes: article["reading_time_minutes"],
        user: article["user"],
      };
      data.push(rawDataPoint);
      articlesPerPage += 1;
    }
    articlesPerPage = 0;
    numberOfPages += 1;
  }
  return data;
};

const analyze = (
  data: RawDataPoint[],
  zScore: number,
  minSampleSize: number,
  calculationMethod: "by-sum" | "by-mean",
  setCommentsByPublishedTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByPublishedTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setCommentsByReadingTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByReadingTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setCommentsByTagsWithOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByTagsWithOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setCommentsCountByUsersWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsCountByUsersWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>
) => {
  // Remove outliers
  const commentsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "commentsCount", zScore) as RawDataPoint[];
  const reactionsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "positiveReactionsCount", zScore) as RawDataPoint[];

  const CommentsByPublishedTimeWithoutCommentsCountOutliers = calculationByCriteria(
    calculationMethod,
    minSampleSize,
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );
  setCommentsByPublishedTimeWithoutOutliers(CommentsByPublishedTimeWithoutCommentsCountOutliers);

  const ReactionsCountByPublishedTimeWithoutCommentsCountOutliers = calculationByCriteria(
    calculationMethod,
    minSampleSize,
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );
  setReactionsByPublishedTimeWithoutOutliers(ReactionsCountByPublishedTimeWithoutCommentsCountOutliers);

  const CommentsByReadingTimeWithoutOutliers = calculationByCriteria(
    calculationMethod,
    minSampleSize,
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setCommentsByReadingTimeWithoutOutliers(CommentsByReadingTimeWithoutOutliers);

  const ReactionsByReadingTimeWithoutOutliers = calculationByCriteria(
    calculationMethod,
    minSampleSize,
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setReactionsByReadingTimeWithoutOutliers(ReactionsByReadingTimeWithoutOutliers);

  const commentsCountBasedOnTags: { tag: string; commentsCount: number }[] = [];
  const reactionsCountBasedOnTags: { tag: string; positiveReactionsCount: number }[] = [];
  commentsCountOutliersRemoved.forEach((adjustedDataPoint) => {
    adjustedDataPoint.tagList.forEach((tag) => {
      commentsCountBasedOnTags.push({ tag, commentsCount: adjustedDataPoint.commentsCount });
    });
  });
  reactionsCountOutliersRemoved.forEach((adjustedDataPoint) => {
    adjustedDataPoint.tagList.forEach((tag) => {
      reactionsCountBasedOnTags.push({ tag, positiveReactionsCount: adjustedDataPoint.positiveReactionsCount });
    });
  });
  const commentsCountByTagsWithoutOutliers = calculationByCriteria(
    calculationMethod,
    minSampleSize,
    commentsCountBasedOnTags,
    "commentsCount",
    (item: { tag: string; commentsCount: number }) => item.tag
  );
  setCommentsByTagsWithOutliers(commentsCountByTagsWithoutOutliers);

  const reactionsCountByTagsWithoutOutliers = calculationByCriteria(
    calculationMethod,
    minSampleSize,
    reactionsCountBasedOnTags,
    "positiveReactionsCount",
    (item: { tag: string; reactionsCount: number }) => item.tag
  );
  setReactionsByTagsWithOutliers(reactionsCountByTagsWithoutOutliers);

  const commentsCountByUsersWithoutOutliers = calculationByCriteria(
    calculationMethod,
    minSampleSize,
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: { user: any; commentsCount: number }) =>
      `${item.user["name"]}, ${item.user["username"]}, ${item.user["twitter_username"]}, ${item.user["github_username"]}, ${item.user["website_url"]}, ${item.user["profile_image"]},  ${item.user["profile_image_90"]}`
  );
  setCommentsCountByUsersWithoutOutliers(commentsCountByUsersWithoutOutliers);

  const reactionsCountByUsersWithoutOutliers = calculationByCriteria(
    calculationMethod,
    minSampleSize,
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: { user: any; reactionsCount: number }) =>
      `${item.user["name"]}, ${item.user["username"]}, ${item.user["twitter_username"]}, ${item.user["github_username"]}, ${item.user["website_url"]}, ${item.user["profile_image"]},  ${item.user["profile_image_90"]}`
  );
  setReactionsCountByUsersWithoutOutliers(reactionsCountByUsersWithoutOutliers);
};

const DataVisualizationSection: FC<DataVisualizationSectionProps> = ({ articleList }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      calculationMethod: "by-sum",
      zScore: "",
      minSampleSize: "",
    },
  });

  const [calculationMethod, setCalculationMethod] = useState("by-sum");
  const [zScore, setzScore] = useState<number>(3);
  const [minSampleSizePerGroup, setMinSampleSize] = useState<number>(0);
  const [totalSampleSize, setTotalSampleSize] = useState<number>(0);

  // By published time
  const [commentsByPublishedTimeWithoutOutliers, setCommentsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [reactionsByPublishedTimeWithoutOutliers, setReactionsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();

  // By reading time
  const [commentsByReadingTimeWithoutOutliers, setCommentsByReadingTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [reactionsByReadingTimeWithoutOutliers, setReactionsByReadingTimeWithoutOutliers] = useState<AnalysisResult[]>();

  // By tags
  const [commentsByTagsWithoutOutliers, setCommentsByTagsWithoutOutliers] = useState<AnalysisResult[]>();
  const [reactionsByTagsWithoutOutliers, setReactionsByTagsWithoutOutliers] = useState<AnalysisResult[]>();

  // By users
  const [commentsByUsersWithoutOutliers, setCommentsByUsersWithoutOutliers] = useState<AnalysisResult[]>();
  const [reactionsByUsersWithoutOutliers, setReactionsByUsersWithoutOutliers] = useState<AnalysisResult[]>();

  // Analyze new article list upon changes
  useEffect(() => {
    if (articleList && articleList.length > 0) {
      const data = prepareData(articleList);
      setTotalSampleSize(data.length);
      analyze(
        data,
        zScore,
        minSampleSizePerGroup,
        calculationMethod as "by-sum" | "by-mean",
        setCommentsByPublishedTimeWithoutOutliers,
        setReactionsByPublishedTimeWithoutOutliers,
        setCommentsByReadingTimeWithoutOutliers,
        setReactionsByReadingTimeWithoutOutliers,
        setCommentsByTagsWithoutOutliers,
        setReactionsByTagsWithoutOutliers,
        setCommentsByUsersWithoutOutliers,
        setReactionsByUsersWithoutOutliers
      );
    }
  }, [articleList, calculationMethod, zScore, minSampleSizePerGroup]);

  const flexRowCenter = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  return (
    <>
      <Paper
        elevation={2}
        style={{
          padding: 20,
          margin: 20,
          minWidth: "90vw",
        }}
        component="section"
      >
        <Grid
          container
          direction="row"
          spacing={4}
          component="form"
          onSubmit={handleSubmit((data) => {
            setCalculationMethod(data.calculationMethod!);
            setzScore(parseFloat(data.zScore!));
            setMinSampleSize(parseFloat(data.minSampleSize!));
          })}
          noValidate
        >
          <Grid item xs={12}>
            <header>
              <h2>Configuration ⚙️</h2>
            </header>
          </Grid>
          <Grid item xs={12} md={4} style={flexRowCenter}>
            <RadioButtonField
              id={"calculation-method"}
              name={"calculationMethod"}
              control={control}
              label={"Calculation Method"}
              rules={{ required: true }}
              choices={[
                { choiceValue: "by-sum", choiceLabel: "By Sum" },
                { choiceValue: "by-mean", choiceLabel: "By Mean" },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextInputField
              name={"zScore"}
              control={control}
              label={"Z-score (0.00 - 3.00)"}
              errors={errors}
              rules={{ required: true, pattern: /^3.00$|^[0-2]{1}[.][0-9]{2}$/ }} // range is 0.00 - 3.00
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextInputField
              name={"minSampleSize"}
              control={control}
              label={"Minimal sample size per group (>= 0)"}
              errors={errors}
              rules={{ required: true, pattern: /[0-9]*/ }} // range is 0.00 - 3.00
            />
          </Grid>
          <Grid item xs={6} style={flexRowCenter}>
            <Button
              variant="outlined"
              onClick={() => {
                reset({
                  calculationMethod: "by-sum",
                  zScore: "",
                  minSampleSize: "",
                });
              }}
            >
              Reset
            </Button>
          </Grid>
          <Grid item xs={6} style={flexRowCenter}>
            <Button variant="outlined" type="submit">
              Calculate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <ByPublishedTimeSection
        commentsByPublishedTimeWithoutOutliers={commentsByPublishedTimeWithoutOutliers}
        reactionsByPublishedTimeWithoutOutliers={reactionsByPublishedTimeWithoutOutliers}
        zScore={zScore}
        minSampleSizePerGroup={minSampleSizePerGroup}
        totalSampleSize={totalSampleSize}
      />
      <ByReadingTimeSection
        commentsByReadingTimeWithoutOutliers={commentsByReadingTimeWithoutOutliers}
        reactionsByReadingTimeWithoutOutliers={reactionsByReadingTimeWithoutOutliers}
        zScore={zScore}
        minSampleSizePerGroup={minSampleSizePerGroup}
        totalSampleSize={totalSampleSize}
      />
      <ByTagsSection
        commentsByTagsWithoutOutliers={commentsByTagsWithoutOutliers}
        reactionsByTagsWithoutOutliers={reactionsByTagsWithoutOutliers}
        zScore={zScore}
        minSampleSize={minSampleSizePerGroup}
        totalSampleSize={totalSampleSize}
      />
      <ByUsersSection
        commentsByUsersWithoutOutliers={commentsByUsersWithoutOutliers}
        reactionsByUsersWithoutOutliers={reactionsByUsersWithoutOutliers}
        zScore={zScore}
        minSampleSize={minSampleSizePerGroup}
        totalSampleSize={totalSampleSize}
      />
    </>
  );
};

export default DataVisualizationSection;
