// CSS
import "../styles/globals.css";

// Next
import type { AppProps } from "next/app";

// MUI library
import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@mui/material";
import type { ThemeOptions } from "@mui/material";

const themeOptions: ThemeOptions = responsiveFontSizes(
  createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minWidth: 140,
          },
        },
      },
    },
    palette: {
      primary: {
        main: "#3b49df",
      },
      secondary: {
        main: "#f50057",
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

function MyApp({ Component, pageProps }: AppProps) {
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
