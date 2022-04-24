/**
 * @author Hung Vu
 *
 * Footer of the page.
 */

// React
import type { FC } from "react";

// MUI library
import { Box } from "@mui/material";

const FooterSection: FC = () => {
  const year = new Date().getFullYear();
  return (
    <Box component="footer" style={{ backgroundColor: "#e5e5e5", padding: 48 }}>
      <Box style={{ fontSize: 14, display: "block", textAlign: "center" }}>
        <p>
          <span
            style={{
              fontFamily: "Segoe UI Semibold",
              fontWeight: 500,
            }}
          >
            <a href={"https://foremstats.hungvu.tech/"}>Forem Analytics</a>
          </span>{" "}
          - A simple analysis to catch the trend on <a href={"https://www.forem.com/"}>Forem-based social platforms</a>. Data is fetched from
          <a href={"https://developers.forem.com/api"}> public Forem API.</a>
        </p>
        <p>
          This is an unoffcial website that has no affiliation with the Forem organization and mentioned communities. The logos and trademarks belong
          to their respective owners.
        </p>
        <p>
          Inspired by "Forem article stats" dashboard. Made with ❤️ using <a href={"https://nextjs.org/"}>Next.js</a>,{" "}
          <a href={"https://mui.com/"}>MUI</a>, <a href={"https://nivo.rocks/"}>Nivo</a>, <a href={"https://react-hook-form.com/"}>React Hook Form</a>
          , <a href={"https://lodash.com/"}>Lodash</a>, and <a href={"https://date-fns.org/"}>date-fns</a>.
        </p>
        <p>
          © 2022 - {year} Hung Huu Vu. Follow me on <a href={"https://hungvu.tech/"}>my personal blog</a>, <a href={"https://dev.to/hunghvu"}>Dev</a>,
          and <a href={"https://github.com/hunghvu"}>GitHub</a>.
        </p>
      </Box>
    </Box>
  );
};

export default FooterSection;
