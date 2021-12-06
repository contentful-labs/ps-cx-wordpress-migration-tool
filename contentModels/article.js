module.exports = function (migration) {
  const article = migration
    .createContentType("article")
    .name("Article")
    .description("")
    .displayField("name");
  article
    .createField("name")
    .name("Name")
    .type("Symbol")
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);
  article
    .createField("id")
    .name("Id")
    .type("Symbol")
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);

  article
    .createField("content")
    .name("Content")
    .type("RichText")
    .localized(false)

  article
    .createField("publishedDate")
    .name("Published Date")
    .type("Date")
    .localized(false)
    .required(false)
    .validations([])
    .disabled(false)
    .omitted(false);
  article.changeFieldControl("name", "builtin", "singleLine", {});
  article.changeFieldControl("id", "builtin", "singleLine", {});
  article.changeFieldControl("content", "builtin", "richTextEditor", {});
  article.changeFieldControl("publishedDate", "builtin", "datePicker", {});
};
