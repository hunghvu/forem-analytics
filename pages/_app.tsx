// CSS
import "../styles/globals.css";

// Next
import type { AppProps } from "next/app";

// MUI library
import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@mui/material";
import type { ThemeOptions } from "@mui/material";
import { useEffect } from "react";

// Utilities
import TagManager from "react-gtm-module";

const themeOptions: ThemeOptions = responsiveFontSizes(
  createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minWidth: 155,
            textTransform: "none",
            fontFamily: "Segoe UI Semibold",
            fontSize: 16,
            fontWeight: 500,
            lineHeight: "24px",
          },
        },
      },
    },
    palette: {
      primary: {
        main: "#3b49df",
      },
      background: {
        default: "#f5f5f5",
      },
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Segoe UI Semibold",
        "Roboto",
        "Helvetica",
        " Arial",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Ubuntu",
        "Cantarell",
        "Fira Sans",
        "Droid Sans",
        "Helvetica Neue",
      ].join(","),
    },
    shape: {
      borderRadius: 6,
    },
  })
);

const gtm = {
  gtmId: process.env.PUBLIC_GTM_ID!,
};

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    TagManager.initialize(gtm);
  });
  return (
    <ThemeProvider theme={themeOptions}>
      {/* https://lifesaver.codes/answer/cannot-change-the-body-background-via-theme-configuration */}
      {/* https://stackoverflow.com/questions/59145165/change-root-background-color-with-material-ui-theme */}
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
