import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  createMuiTheme,
  useMediaQuery,
  CssBaseline,
  ThemeProvider,
  makeStyles,
  Theme,
  Box,
  Typography,
  Fab,
  DialogTitle,
  MenuItem,
  Dialog,
  FormControlLabel,
  Switch,
  Menu,
  Select
} from "@material-ui/core";
import {
  MoreVert,
  Settings,
  RotateLeft,
  Palette,
  Brightness3,
  Info,
  PaletteOutlined,
  InfoOutlined,
  Brightness7
} from "@material-ui/icons";

import "./styles.css";

const BOOP_SRC = "/boop.mp3";
const WARNING_SECONDS = 10;
const SET_SECONDS = 210;
const JAD_SECONDS = 105;

const RED_COLOR = "#A225224D";
const GREEN_COLOR = "#C0D68466";

const SHOW_HINTS_KEY = "SHOW_HINTS_KEY";
const CHANGE_COLORS_KEY = "CHANGE_COLORS_KEY";
const PALETTE_TYPE_KEY = "PALETTE_TYPE_KEY";

enum PaletteType {
  DarkMode = "darkMode",
  LightMode = "lightMode",
  DeviceMode = "deviceMode"
}

const isEnum = <E extends any>(
  value: unknown,
  matchingEnum: Record<string, E>
): value is E =>
  Object.keys(matchingEnum).some((key) => matchingEnum[key] === value);
const getHelperText = (step: number) => {
  switch (step) {
    case 0: {
      return "Click anywhere to start timer. (Once first set spawns)";
    }
    case 1: {
      return "Click anywhere to pause timer. (Once Zuk is under 600 HP)";
    }
    case 2: {
      return "Click anywhere to start Jad. (Once Zuk is under 480 HP)";
    }
    default: {
      return "Good luck!";
    }
  }
};

const useStyles = makeStyles((theme: Theme) => ({
  timerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },
  warning: {
    animation: "0.5s alternate 0s infinite ease pulse",
    color: theme.palette.error.light
  },
  paused: {
    color: theme.palette.grey[500]
  },
  timer: {
    userSelect: "none"
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%"
  },
  fab: {
    position: "absolute",
    bottom: 10,
    right: 10
  },
  menuItemText: {
    marginLeft: 10
  },
  settingsContainer: {
    padding: "0 10px 10px"
  },
  settingsIcon: {
    margin: "8px 10px 8px 0"
  },
  settingsItem: {
    display: "flex"
  }
}));

export default function App() {
  const deviceDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const classes = useStyles();

  const [seconds, setSeconds] = useState(SET_SECONDS);
  const [intervalId, setIntervalId] = useState<number>();
  const [step, setStep] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [changeColors, setChangeColors] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [paletteType, setPaletteType] = useState<PaletteType>(
    PaletteType.DeviceMode
  );

  const fabRef = useRef<HTMLButtonElement | null>(null);

  const audio = useMemo(() => new Audio(BOOP_SRC), []);
  const paused = useMemo(() => typeof intervalId !== "number", [intervalId]);
  const helperText = useMemo(() => getHelperText(step), [step]);
  const isDarkMode = useMemo(
    () =>
      paletteType === PaletteType.DeviceMode
        ? deviceDarkMode
        : paletteType === PaletteType.DarkMode,
    [paletteType, deviceDarkMode]
  );
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: isDarkMode ? "dark" : "light"
        }
      }),
    [isDarkMode]
  );

  useEffect(() => {
    if (seconds <= WARNING_SECONDS && !paused) {
      audio.playbackRate = seconds === 1 ? 0.2 : 1;
      audio.play();
    }
  }, [audio, seconds, paused]);
  useEffect(() => {
    setChangeColors(
      Boolean(JSON.parse(localStorage.getItem(CHANGE_COLORS_KEY) ?? "true"))
    );
    setShowHints(
      Boolean(JSON.parse(localStorage.getItem(SHOW_HINTS_KEY) ?? "true"))
    );
    const paletteValue = JSON.parse(
      localStorage.getItem(PALETTE_TYPE_KEY) ?? "null"
    );
    setPaletteType(
      isEnum(paletteValue, PaletteType) ? paletteValue : PaletteType.DeviceMode
    );
  }, [setChangeColors, setShowHints, setPaletteType]);

  const openMenu = useCallback(() => setIsMenuOpen(true), [setIsMenuOpen]);
  const closeMenu = useCallback(() => setIsMenuOpen(false), [setIsMenuOpen]);
  const openDialog = useCallback(() => {
    closeMenu();
    setIsDialogOpen(true);
  }, [closeMenu, setIsDialogOpen]);
  const closeDialog = useCallback(() => setIsDialogOpen(false), [
    setIsDialogOpen
  ]);
  const play = React.useCallback(() => {
    if (typeof intervalId !== "number") {
      setIntervalId(
        window.setInterval(
          () => setSeconds((s) => (s - 1 === 0 ? SET_SECONDS : s - 1)),
          1000
        )
      );
    }
  }, [setIntervalId, intervalId]);
  const pause = useCallback(() => {
    clearInterval(intervalId);
    setIntervalId(undefined);
  }, [intervalId]);
  const startJad = useCallback(() => {
    setSeconds((s) => s + JAD_SECONDS);
    play();
  }, [play]);
  const reset = useCallback(() => {
    pause();
    setSeconds(SET_SECONDS);
    closeMenu();
    setStep(0);
  }, [pause, setSeconds, closeMenu, setStep]);
  const handleClick = useCallback(() => {
    switch (step) {
      case 0: {
        play();
        break;
      }
      case 1: {
        pause();
        break;
      }
      case 2: {
        startJad();
        break;
      }
      default: {
        return;
      }
    }
    setStep((s) => s + 1);
  }, [step, setStep, play, pause, startJad]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        className={classes.container}
        onMouseDown={handleClick}
        color="primary"
        style={{
          background: changeColors
            ? step === 1
              ? GREEN_COLOR
              : step >= 3
              ? RED_COLOR
              : undefined
            : undefined,
          cursor: step < 3 ? "pointer" : undefined
        }}
      >
        <Typography
          variant="h1"
          className={`${classes.timer} ${
            seconds <= WARNING_SECONDS ? classes.warning : ""
          }`}
          style={{ opacity: paused ? 0.6 : 1 }}
        >
          {new Date(seconds * 1000).toISOString().substr(15, 4)}
        </Typography>
        {showHints && (
          <Typography style={{ opacity: 0.6, userSelect: "none" }}>
            {helperText}
          </Typography>
        )}
      </Box>
      <Fab className={classes.fab} size="small" ref={fabRef} onClick={openMenu}>
        <MoreVert />
      </Fab>
      <Menu
        anchorEl={fabRef.current}
        keepMounted
        open={isMenuOpen}
        onClose={closeMenu}
      >
        <MenuItem onClick={openDialog}>
          <Settings />
          <Typography className={classes.menuItemText}>
            Change Settings
          </Typography>
        </MenuItem>
        <MenuItem onClick={reset}>
          <RotateLeft />
          <Typography className={classes.menuItemText}>Reset Timer</Typography>
        </MenuItem>
      </Menu>
      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>Settings</DialogTitle>
        <Box className={classes.settingsContainer}>
          <Box className={classes.settingsItem}>
            {isDarkMode ? (
              <Brightness3 className={classes.settingsIcon} />
            ) : (
              <Brightness7 className={classes.settingsIcon} />
            )}
            <Select
              value={paletteType}
              onChange={({ target }) => {
                const { value } = target;
                if (isEnum(value, PaletteType)) {
                  localStorage.setItem(PALETTE_TYPE_KEY, JSON.stringify(value));
                  setPaletteType(value);
                }
              }}
            >
              <MenuItem value={PaletteType.DeviceMode}>Device Mode</MenuItem>
              <MenuItem value={PaletteType.DarkMode}>Dark Mode</MenuItem>
              <MenuItem value={PaletteType.LightMode}>Light Mode</MenuItem>
            </Select>
          </Box>
          <Box className={classes.settingsItem}>
            {changeColors ? (
              <Palette className={classes.settingsIcon} />
            ) : (
              <PaletteOutlined className={classes.settingsIcon} />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={changeColors}
                  onChange={({ target }) => {
                    const { checked } = target;
                    localStorage.setItem(
                      CHANGE_COLORS_KEY,
                      JSON.stringify(checked)
                    );
                    setChangeColors(checked);
                  }}
                />
              }
              label="Change Background Color"
            />
          </Box>
          <Box className={classes.settingsItem}>
            {showHints ? (
              <Info className={classes.settingsIcon} />
            ) : (
              <InfoOutlined className={classes.settingsIcon} />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={showHints}
                  onChange={({ target }) => {
                    const { checked } = target;
                    localStorage.setItem(
                      SHOW_HINTS_KEY,
                      JSON.stringify(checked)
                    );
                    setShowHints(checked);
                  }}
                />
              }
              label="Show Hints"
            />
          </Box>
        </Box>
      </Dialog>
    </ThemeProvider>
  );
}
