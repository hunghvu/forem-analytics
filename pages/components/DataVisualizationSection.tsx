/**
 * @author Hung Vu
 */

// React
import { useEffect, useState } from "react";
import type { Dispatch, FC, SetStateAction } from "react";

// Utilities
import { format, parseISO } from "date-fns";
import { groupBy, meanBy, sumBy } from "lodash";
import removeOutLiers from "../../utils/RemoveOutliers";

// Components
import ByTagsSection from "./sub-section/ByTagsSection";
import ByPublishedTimeSection from "./sub-section/ByPublishedTimeSection";
import ByReadingTimeSection from "./sub-section/ByReadingTimeSection";
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Grid, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import RadioButtonField from "./inputs/RadioButtonField";
import TextInputField from "./inputs/TextInputField";

interface DataVisualizationSectionProps {
  articleList: any;
}

interface RawDataPoint {
  tagList: string[];
  commentsCount: number;
  positiveReactionsCount: number;
  publicReactionsCount: number; // Unused for now
  publishedAtHour: string;
  publishedAtDayOfWeek: string;
  readingTimeMinutes: number;
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
const getSumOfMetricByCriteria = (
  calculationMethod: "by-sum" | "by-mean",
  adjustedDataSet: any[],
  metricName: "commentsCount" | "positiveReactionsCount",
  criteria: any
): AnalysisResult[] => {
  let result: AnalysisResult[] = [];
  const grouped = groupBy(adjustedDataSet, criteria);
  for (const [group, articleStat] of Object.entries(grouped)) {
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
        publicReactionsCount: article["public_reactions_count"], // Unused for now
        publishedAtHour,
        publishedAtDayOfWeek,
        readingTimeMinutes: article["reading_time_minutes"],
      };
      data.push(rawDataPoint);
      articlesPerPage += 1;
    }
    articlesPerPage = 1;
    numberOfPages += 1;
  }
  return data;
};

const analyze = (
  data: RawDataPoint[],
  zScore: number,
  calculationMethod: "by-sum" | "by-mean",
  setCommentsByPublishedTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByPublishedTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setCommentsByReadingTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByReadingTimeWithoutOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setCommentsByTagsWithOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>,
  setReactionsByTagsWithOutliers: Dispatch<SetStateAction<AnalysisResult[] | undefined>>
) => {
  // Remove outliers
  const commentsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "commentsCount", zScore) as RawDataPoint[];
  const reactionsCountOutliersRemoved: RawDataPoint[] = removeOutLiers(data, "positiveReactionsCount", zScore) as RawDataPoint[];

  const CommentsByPublishedTimeWithoutCommentsCountOutliers = getSumOfMetricByCriteria(
    calculationMethod,
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );
  setCommentsByPublishedTimeWithoutOutliers(CommentsByPublishedTimeWithoutCommentsCountOutliers);

  const ReactionsCountByPublishedTimeWithoutCommentsCountOutliers = getSumOfMetricByCriteria(
    calculationMethod,
    reactionsCountOutliersRemoved,
    "positiveReactionsCount",
    (item: RawDataPoint) => `${item.publishedAtDayOfWeek} ${item.publishedAtHour}`
  );
  setReactionsByPublishedTimeWithoutOutliers(ReactionsCountByPublishedTimeWithoutCommentsCountOutliers);

  const CommentsByReadingTimeWithoutOutliers = getSumOfMetricByCriteria(
    calculationMethod,
    commentsCountOutliersRemoved,
    "commentsCount",
    (item: RawDataPoint) => item.readingTimeMinutes
  );
  setCommentsByReadingTimeWithoutOutliers(CommentsByReadingTimeWithoutOutliers);

  const ReactionsByReadingTimeWithoutOutliers = getSumOfMetricByCriteria(
    calculationMethod,
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
  const CommentsCountByTagsWithoutOutliers = getSumOfMetricByCriteria(
    calculationMethod,
    commentsCountBasedOnTags,
    "commentsCount",
    (item: { tag: string; commentsCount: number }) => item.tag
  );
  setCommentsByTagsWithOutliers(CommentsCountByTagsWithoutOutliers);

  const ReactionsCountByTagsWithoutOutliers = getSumOfMetricByCriteria(
    calculationMethod,
    reactionsCountBasedOnTags,
    "positiveReactionsCount",
    (item: { tag: string; reactionsCount: number }) => item.tag
  );
  setReactionsByTagsWithOutliers(ReactionsCountByTagsWithoutOutliers);
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
      zScore: "3.00",
    },
  });

  const [calculationMethod, setCalculationMethod] = useState("by-sum");
  const [zScore, setzScore] = useState<number>(3);

  // By published time
  const [commentsByPublishedTimeWithoutOutliers, setCommentsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [reactionsByPublishedTimeWithoutOutliers, setReactionsByPublishedTimeWithoutOutliers] = useState<AnalysisResult[]>();

  // By reading time
  const [commentsByReadingTimeWithoutOutliers, setCommentsByReadingTimeWithoutOutliers] = useState<AnalysisResult[]>();
  const [reactionsByReadingTimeWithoutOutliers, setReactionsByReadingTimeWithoutOutliers] = useState<AnalysisResult[]>();

  // By tags
  const [commentsByTagsWithoutOutliers, setCommentsByTagsWithoutOutliers] = useState<AnalysisResult[]>();
  const [reactionsByTagsWithoutOutliers, setReactionsByTagsWithoutOutliers] = useState<AnalysisResult[]>();

  // Analyze new article list upon changes
  useEffect(() => {
    if (articleList && articleList.length > 0) {
      const data = prepareData(articleList);

      analyze(
        data,
        zScore,
        calculationMethod as "by-sum" | "by-mean",
        setCommentsByPublishedTimeWithoutOutliers,
        setReactionsByPublishedTimeWithoutOutliers,
        setCommentsByReadingTimeWithoutOutliers,
        setReactionsByReadingTimeWithoutOutliers,
        setCommentsByTagsWithoutOutliers,
        setReactionsByTagsWithoutOutliers
      );
    }
  }, [articleList, calculationMethod, zScore]);

  return (
    <>
      <Grid
        container
        direction="row"
        spacing={4}
        component="form"
        onSubmit={handleSubmit((data) => {
          setCalculationMethod(data.calculationMethod!);
          setzScore(parseFloat(data.zScore!));
        })}
        noValidate
      >
        <Grid item>
          <RadioButtonField
            id={"calculation-method"}
            name={"calculationMethod"}
            control={control}
            label={"Calculation Method"}
            rules={{ required: true }}
            choices={[
              { choiceValue: "by-sum", choiceLabel: "By Sum" },
              { choiceValue: "by-mean", choiceLabel: "By mean" },
            ]}
          />
        </Grid>
        <Grid item>
          <TextInputField
            name={"zScore"}
            control={control}
            label={"Z-score (0.00 - 3.00)"}
            errors={errors}
            rules={{ required: true, pattern: /^3.00$|^[0-2]{1}[.][0-9]{2}$/ }} // range is 0.00 - 3.00
          />
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            onClick={() => {
              reset({
                calculationMethod: "by-sum",
                zScore: "3.00",
              });
            }}
          >
            Reset
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="outlined" type="submit">
            Submit
          </Button>
        </Grid>
      </Grid>

      <ByPublishedTimeSection
        commentsByPublishedTimeWithoutOutliers={commentsByPublishedTimeWithoutOutliers}
        reactionsByPublishedTimeWithoutOutliers={reactionsByPublishedTimeWithoutOutliers}
        zScore={zScore}
      />
      <ByReadingTimeSection
        commentsByReadingTimeWithoutOutliers={commentsByReadingTimeWithoutOutliers}
        reactionsByReadingTimeWithoutOutliers={reactionsByReadingTimeWithoutOutliers}
        zScore={zScore}
      />
      <ByTagsSection
        commentsByTagsWithoutOutliers={commentsByTagsWithoutOutliers}
        reactionsByTagsWithoutOutliers={reactionsByTagsWithoutOutliers}
        zScore={zScore}
      />
    </>
  );
};

export default DataVisualizationSection;
