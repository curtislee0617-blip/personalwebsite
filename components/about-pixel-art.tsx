export function AboutPixelArt() {
  return (
    <section className="about-pixel-art" aria-label="Animated pixel art for chemical engineering, food science, and kitchens">
      <article className="about-pixel-card about-pixel-card-engine">
        <div className="about-pixel-scene about-engine-scene" aria-hidden="true">
          <span className="about-engine-bench" />
          <span className="about-engine-flywheel">
            <span />
            <i />
          </span>
          <span className="about-engine-crank" />
          <span className="about-engine-linkage" />
          <span className="about-engine-cylinder about-engine-cylinder-hot" />
          <span className="about-engine-cylinder about-engine-cylinder-cold" />
          <span className="about-engine-piston about-engine-piston-hot" />
          <span className="about-engine-piston about-engine-piston-cold" />
          <span className="about-engine-tube about-engine-tube-top" />
          <span className="about-engine-tube about-engine-tube-bottom" />
          <span className="about-engine-flame about-engine-flame-one" />
          <span className="about-engine-flame about-engine-flame-two" />
          <span className="about-engine-air about-engine-air-hot about-engine-air-one" />
          <span className="about-engine-air about-engine-air-hot about-engine-air-two" />
          <span className="about-engine-air about-engine-air-cold about-engine-air-three" />
          <span className="about-engine-air about-engine-air-cold about-engine-air-four" />
        </div>
        <div>
          <p>Chemical engineering</p>
          <h2>Heat, flow, and moving parts</h2>
        </div>
      </article>

      <article className="about-pixel-card about-pixel-card-pan">
        <div className="about-pixel-scene about-pan-scene" aria-hidden="true">
          <span className="about-kitchen-counter" />
          <span className="about-pan-flame about-pan-flame-one" />
          <span className="about-pan-flame about-pan-flame-two" />
          <span className="about-pan-flame about-pan-flame-three" />
          <span className="about-pan-skillet">
            <span />
          </span>
          <span className="about-pan-food about-pan-food-one" />
          <span className="about-pan-food about-pan-food-two" />
          <span className="about-pan-food about-pan-food-three" />
          <span className="about-pan-steam about-pan-steam-one" />
          <span className="about-pan-steam about-pan-steam-two" />
        </div>
        <div>
          <p>Food science</p>
          <h2>Pan, flame, Maillard chaos</h2>
        </div>
      </article>

      <article className="about-pixel-card about-pixel-card-brigade">
        <div className="about-pixel-scene about-brigade-scene" aria-hidden="true">
          <span className="about-brigade-wall" />
          <span className="about-brigade-rail" />
          <span className="about-brigade-pot about-brigade-pot-one" />
          <span className="about-brigade-pot about-brigade-pot-two" />
          <span className="about-brigade-pass" />
          <span className="about-brigade-chef about-brigade-chef-one">
            <i />
          </span>
          <span className="about-brigade-chef about-brigade-chef-two">
            <i />
          </span>
          <span className="about-brigade-chef about-brigade-chef-three">
            <i />
          </span>
          <span className="about-brigade-plate about-brigade-plate-one" />
          <span className="about-brigade-plate about-brigade-plate-two" />
          <span className="about-brigade-ticket about-brigade-ticket-one" />
          <span className="about-brigade-ticket about-brigade-ticket-two" />
          <span className="about-brigade-ticket about-brigade-ticket-three" />
        </div>
        <div>
          <p>French brigade</p>
          <h2>Stations, tickets, service</h2>
        </div>
      </article>
    </section>
  );
}
