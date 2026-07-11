import { Children, type ReactNode } from "react";

export function RecipeShelf({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div aria-label={`${label} recipe carousel`} className="recipe-shelf" role="region" tabIndex={0}>
      <ul className="recipe-shelf-track">
        {Children.map(children, (child) => (
          <li className="recipe-shelf-item">{child}</li>
        ))}
      </ul>
    </div>
  );
}
