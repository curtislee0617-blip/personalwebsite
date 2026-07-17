import { Children, type ReactNode } from "react";

export function RecipeShelf({ children, label, layout = "default" }: { children: ReactNode; label: string; layout?: "default" | "grid" }) {
  return (
    <div
      aria-label={`${label} recipe collection`}
      className={`recipe-shelf${layout === "grid" ? " recipe-grid-shelf" : ""}`}
      role="region"
      tabIndex={0}
    >
      <ul className="recipe-shelf-track">
        {Children.map(children, (child) => (
          <li className="recipe-shelf-item">{child}</li>
        ))}
      </ul>
    </div>
  );
}
