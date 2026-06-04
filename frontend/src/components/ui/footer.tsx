"use client";

import { DIcons } from "dicons";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center rounded-full border border-dotted border-muted bg-background/50 backdrop-blur-sm p-1">
        <button
          onClick={() => setTheme("light")}
          className={`mr-1 rounded-full p-2 transition-all duration-300 ${
            theme === "light" ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted"
          }`}
        >
          <DIcons.Sun className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Light Mode</span>
        </button>

        <button 
          type="button" 
          onClick={handleScrollTop} 
          className="mx-2 hover:scale-125 transition-transform duration-300 text-muted-foreground hover:text-primary"
        >
          <DIcons.ArrowUp className="h-4 w-4" />
          <span className="sr-only">Top</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`ml-1 rounded-full p-2 transition-all duration-300 ${
            theme === "dark" ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted"
          }`}
        >
          <DIcons.Moon className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Dark Mode</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;
