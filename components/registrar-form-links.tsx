const forms = [
  { title: "Registration forms", detail: "Add, drop, section, unit, audit, and course-conflict requests.", href: "https://registrar.caltech.edu/forms#registration-forms" },
  { title: "Option & minor forms", detail: "Change-option, double-option, minor, and curriculum petitions.", href: "https://registrar.caltech.edu/forms#option-and-minor-forms" },
  { title: "UASH petitions", detail: "Late add/drop, overload, underload, grade, and reinstatement petitions.", href: "https://registrar.caltech.edu/forms#uash-petitions" },
];

export function RegistrarFormLinks() {
  return (
    <section className="registrar-form-links" aria-labelledby="registrar-forms-heading">
      <div>
        <p className="course-schedule-eyebrow">Registrar</p>
        <h2 id="registrar-forms-heading">Student forms</h2>
      </div>
      <div className="registrar-form-link-list">
        {forms.map((form) => (
          <a href={form.href} key={form.title} rel="noreferrer" target="_blank">
            <span>
              <strong>{form.title}</strong>
              <small>{form.detail}</small>
            </span>
            <b aria-hidden="true">↗</b>
          </a>
        ))}
      </div>
    </section>
  );
}
