export function InstagramPostEmbed({ postId, title }: { postId: string; title: string }) {
  return (
    <section className="recipe-instagram-section">
      <p className="eyebrow">Original Instagram post</p>
      <div className="recipe-instagram-frame">
        <iframe
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          loading="lazy"
          src={`https://www.instagram.com/p/${encodeURIComponent(postId)}/embed/captioned/`}
          title={`${title} on Instagram`}
        />
      </div>
    </section>
  );
}
