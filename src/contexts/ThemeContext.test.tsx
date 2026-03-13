import { ThemeProvider } from "./ThemeContext";
import { useTheme } from "./useTheme";

const App = () => {
  const { mode, resolvedTheme, cycleMode } = useTheme();

  return (
    <div className={`app ${resolvedTheme}`}>
      <span>Mode: {mode}</span>
      <button onClick={cycleMode}>Cycle Theme</button>
    </div>
  );
};

const WrappedApp = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default WrappedApp;
