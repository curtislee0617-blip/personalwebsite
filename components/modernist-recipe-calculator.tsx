"use client";

import { useId, useState, type ReactNode } from "react";
import { normalizeNumericInputText } from "@/lib/numeric-input";

export type ModernistIngredient = { name: string; quantity: string; heading?: boolean };
export type ModernistRecipeStep = { number: number; text: string };
export type ModernistRecipeComponent = {
  name: string;
  nameSource?: string;
  sourceBand?: { top: number; bottom: number };
  ingredients: ModernistIngredient[];
  steps: ModernistRecipeStep[];
};

const FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const LEADING_QUANTITY = /^((?:\d+(?:\.\d+)?\s*)?[½¼¾⅓⅔⅛⅜⅝⅞]|\d+(?:\.\d+)?)/;
const PRESETS = [0.5, 1, 2, 3] as const;

function formatNumber(value: number) {
  if (Math.abs(value) >= 100) return String(Math.round(value));
  if (Math.abs(value) >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

function scaleQuantity(quantity: string, factor: number) {
  if (factor === 1 || !quantity) return quantity;
  const match = quantity.match(LEADING_QUANTITY);
  if (!match || !match[0]) return quantity;

  const fractionGlyph = match[1].match(/[½¼¾⅓⅔⅛⅜⅝⅞]/)?.[0];
  const wholeText = fractionGlyph ? match[1].replace(fractionGlyph, "").trim() : match[1];
  const whole = Number(wholeText || 0);
  const fraction = fractionGlyph ? FRACTIONS[fractionGlyph] : 0;
  const value = whole + fraction;
  if (!Number.isFinite(value) || value <= 0) return quantity;

  return `${formatNumber(value * factor)}${quantity.slice(match[0].length)}`;
}

function useRecipeScale() {
  const [factorText, setFactorText] = useState("1");
  const parsedFactor = Number.parseFloat(factorText);
  const factor = Number.isFinite(parsedFactor) && parsedFactor > 0 ? parsedFactor : 1;
  return { factor, factorText, setFactorText };
}

function ScaleControl({
  description,
  factor,
  factorText,
  inputId,
  label,
  setFactorText,
}: {
  description: string;
  factor: number;
  factorText: string;
  inputId: string;
  label: string;
  setFactorText: (value: string) => void;
}) {
  return (
    <div className="modernist-scale-control">
      <div>
        <label htmlFor={inputId}>{label}</label>
        <p>{description}</p>
      </div>
      <div className="modernist-scale-actions">
        <div className="modernist-scale-presets" aria-label="Recipe scale presets">
          {PRESETS.map((preset) => (
            <button
              aria-pressed={factor === preset}
              key={preset}
              onClick={() => setFactorText(String(preset))}
              type="button"
            >
              {preset}×
            </button>
          ))}
        </div>
        <div className="modernist-scale-input">
          <input
            aria-label="Custom recipe scale multiplier"
            id={inputId}
            inputMode="decimal"
            min="0.01"
            onChange={(event) => setFactorText(normalizeNumericInputText(event.currentTarget.value))}
            onFocus={(event) => event.currentTarget.select()}
            step="0.1"
            type="number"
            value={factorText}
          />
          <span>×</span>
        </div>
      </div>
    </div>
  );
}

export function ModernistRecipeCalculator({
  components,
  ingredients,
  renderText,
  steps,
}: {
  components?: ModernistRecipeComponent[];
  ingredients: ModernistIngredient[];
  renderText?: (text: string) => ReactNode;
  steps: string[];
}) {
  const inputId = useId();
  const { factor, factorText, setFactorText } = useRecipeScale();
  const recipeComponents = components?.length
    ? components
    : [{
        name: "Recipe",
        ingredients,
        steps: steps.map((text, index) => ({ number: index + 1, text })),
      }];

  return (
    <div className="modernist-recipe-body">
      <ScaleControl
        description="Adjusts ingredient quantities only."
        factor={factor}
        factorText={factorText}
        inputId={inputId}
        label="Scale recipe"
        setFactorText={setFactorText}
      />

      <div className="modernist-components">
        {recipeComponents.map((component, componentIndex) => (
          <section className="modernist-component" key={`${component.name}-${componentIndex}`}>
            <div className="modernist-component-heading">
              <p>{renderText ? renderText(component.name) : component.name}</p>
              <span>Component {componentIndex + 1}</span>
            </div>
            <div className="modernist-component-grid">
              <div>
                <p className="modernist-section-label">Ingredients</p>
                <dl className="modernist-ingredients">
                  {component.ingredients.map((ingredient, ingredientIndex) => (
                    <div
                      className={ingredient.heading ? "is-heading" : undefined}
                      key={`${ingredient.name}-${ingredientIndex}`}
                    >
                      <dt>{renderText ? renderText(ingredient.name) : ingredient.name}</dt>
                      <dd>{ingredient.heading ? "" : scaleQuantity(ingredient.quantity, factor) || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <p className="modernist-section-label">Method for this component</p>
                {component.steps.length > 0 ? (
                  <ol className="modernist-method">
                    {component.steps.map((step) => (
                      <li key={`${step.number}-${step.text}`}>
                        <span>{step.number}</span>
                        <p>{renderText ? renderText(step.text) : step.text}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="modernist-component-empty">No separate method is printed for this ingredient band.</p>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
