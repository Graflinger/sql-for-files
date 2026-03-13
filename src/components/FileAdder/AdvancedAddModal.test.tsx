import React from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div>{/* Your app content */}</div>
    </ThemeProvider>
  );
};

export default App;
