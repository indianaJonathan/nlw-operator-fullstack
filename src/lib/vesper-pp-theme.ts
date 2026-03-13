import type { ThemeRegistrationRaw } from "shiki";

/**
 * Vesper++ theme for shiki.
 *
 * Converted from the VSCode extension "Obstinate.vesper-pp" (v2.0.0).
 * A more colorized fork of Vesper by raunofreiberg — adds pink/magenta
 * keywords, green constants, and red module names.
 *
 * @see https://marketplace.visualstudio.com/items?itemName=Obstinate.vesper-pp
 */
const vesperPP: ThemeRegistrationRaw = {
  name: "vesper-pp",
  type: "dark",
  colors: {
    "editor.background": "#101010",
    "editor.foreground": "#FFF",
    "editor.selectionBackground": "#FFFFFF25",
    "editor.selectionHighlightBackground": "#FFFFFF25",
    "editorLineNumber.foreground": "#505050",
    "editorWidget.background": "#101010",
    "editorWarning.foreground": "#FFC799",
    "editorError.foreground": "#FF8080",
    "editorOverviewRuler.border": "#101010",
    "editorGutter.addedBackground": "#99FFE4",
    "editorGutter.deletedBackground": "#FF8080",
    "editorGutter.modifiedBackground": "#FFC799",
    "editorHoverWidget.background": "#161616",
    "editorHoverWidget.border": "#282828",
    "editorBracketHighlight.foreground1": "#A0A0A0",
    "editorBracketHighlight.foreground2": "#A0A0A0",
    "editorBracketHighlight.foreground3": "#A0A0A0",
    "editorBracketHighlight.foreground4": "#A0A0A0",
    "editorBracketHighlight.foreground5": "#A0A0A0",
    "editorBracketHighlight.foreground6": "#A0A0A0",
    "editorBracketHighlight.unexpectedBracket.foreground": "#FF8080",
    focusBorder: "#FFC799",
    "input.background": "#1C1C1C",
  },
  tokenColors: [
    {
      name: "Comment",
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#595959" },
    },
    {
      name: "Variables",
      scope: [
        "variable",
        "string constant.other.placeholder",
        "entity.name.tag",
      ],
      settings: { foreground: "#FFF" },
    },
    {
      name: "Colors",
      scope: ["constant.other.color"],
      settings: { foreground: "#FFF" },
    },
    {
      name: "Invalid",
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: "#FF8080" },
    },
    {
      name: "Keyword, Storage",
      scope: ["keyword", "storage.modifier"],
      settings: { foreground: "#FBADFF" },
    },
    {
      name: "Operator, Misc",
      scope: [
        "keyword.control",
        "constant.other.color",
        "punctuation.separator.inheritance.php",
        "punctuation.definition.tag.html",
        "punctuation.definition.tag.begin.html",
        "punctuation.definition.tag.end.html",
        "punctuation.section.embedded",
        "keyword.other.template",
        "keyword.other.rust",
        "keyword.other.fn.rust",
        "keyword.other.substitution",
        "storage.type",
      ],
      settings: { foreground: "#FBADFF" },
    },
    {
      name: "Tag",
      scope: ["entity.name.tag", "meta.tag.sgml", "markup.deleted.git_gutter"],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Function, Special Method",
      scope: [
        "entity.name.function",
        "variable.function",
        "support.function",
        "keyword.other.special-method",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Block Level Variables",
      scope: ["meta.block variable.other"],
      settings: { foreground: "#FFF" },
    },
    {
      name: "Other Variable, String Link",
      scope: ["support.other.variable", "string.other.link"],
      settings: { foreground: "#FFF" },
    },
    {
      name: "Number, Constant, Function Argument, Tag Attribute, Embedded",
      scope: [
        "constant.numeric",
        "support.constant",
        "constant.character",
        "constant.escape",
        "keyword.other.unit",
        "keyword.other",
        "constant.language.boolean",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "String, Symbols, Inherited Class",
      scope: [
        "string",
        "constant.other.symbol",
        "constant.other.key",
        "keyword.other.fn.rust",
        "meta.group.braces.curly constant.other.object.key.js string.unquoted.label.js",
      ],
      settings: { foreground: "#99FFE4" },
    },
    {
      name: "Class, Support",
      scope: [
        "entity.name",
        "support.type",
        "support.class",
        "support.other.namespace.use.php",
        "meta.use.php",
        "support.other.namespace.php",
        "markup.changed.git_gutter",
        "support.type.sys-types",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "CSS Class and Support",
      scope: [
        "source.css support.type.property-name",
        "source.sass support.type.property-name",
        "source.scss support.type.property-name",
        "source.less support.type.property-name",
        "source.stylus support.type.property-name",
        "source.postcss support.type.property-name",
        "support.type.vendored.property-name.css",
        "source.css.scss entity.name.tag",
        "variable.parameter.keyframe-list.css",
        "meta.property-name.css",
        "variable.parameter.url.scss",
        "meta.property-value.scss",
        "meta.property-value.css",
      ],
      settings: { foreground: "#FFF" },
    },
    {
      name: "Sub-methods",
      scope: [
        "entity.name.module.js",
        "variable.import.parameter.js",
        "variable.other.class.js",
      ],
      settings: { foreground: "#FF8080" },
    },
    {
      name: "Variable immutable",
      scope: ["variable.other.constant"],
      settings: { foreground: "#99FFE4" },
    },
    {
      name: "Language methods",
      scope: ["variable.language"],
      settings: { foreground: "#FFF" },
    },
    {
      name: "entity.name.method.js",
      scope: ["entity.name.method.js"],
      settings: { foreground: "#FFF" },
    },
    {
      name: "meta.method.js",
      scope: [
        "meta.class-method.js entity.name.function.js",
        "variable.function.constructor",
      ],
      settings: { foreground: "#FFF" },
    },
    {
      name: "Attributes",
      scope: [
        "entity.other.attribute-name",
        "meta.property-list.scss",
        "meta.attribute-selector.scss",
        "meta.property-value.css",
        "entity.other.keyframe-offset.css",
        "meta.selector.css",
        "entity.name.tag.reference.scss",
        "entity.name.tag.nesting.css",
        "punctuation.separator.key-value.css",
      ],
      settings: { foreground: "#FFF" },
    },
    {
      name: "HTML Attributes",
      scope: [
        "text.html.basic entity.other.attribute-name.html",
        "text.html.basic entity.other.attribute-name",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "CSS Classes",
      scope: [
        "entity.other.attribute-name.class",
        "entity.other.attribute-name.id",
        "meta.attribute-selector.scss",
        "variable.parameter.misc.css",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "CSS ID's",
      scope: ["source.sass keyword.control", "meta.attribute-selector.scss"],
      settings: { foreground: "#99FFE4" },
    },
    {
      name: "Inserted",
      scope: ["markup.inserted"],
      settings: { foreground: "#99FFE4" },
    },
    {
      name: "Deleted",
      scope: ["markup.deleted"],
      settings: { foreground: "#FF8080" },
    },
    {
      name: "Changed",
      scope: ["markup.changed"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Regular Expressions",
      scope: ["string.regexp"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "Escape Characters",
      scope: ["constant.character.escape"],
      settings: { foreground: "#A0A0A0" },
    },
    {
      name: "URL",
      scope: ["*url*", "*link*", "*uri*"],
      settings: { fontStyle: "underline" },
    },
    {
      name: "Decorators",
      scope: [
        "tag.decorator.js entity.name.tag.js",
        "tag.decorator.js punctuation.definition.tag.js",
      ],
      settings: { foreground: "#FFF" },
    },
    {
      name: "ES7 Bind Operator",
      scope: [
        "source.js constant.other.object.key.js string.unquoted.label.js",
      ],
      settings: { fontStyle: "italic", foreground: "#FF8080" },
    },
    {
      name: "JSON Key",
      scope: [
        "source.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Markdown - Plain",
      scope: [
        "text.html.markdown",
        "punctuation.definition.list_item.markdown",
      ],
      settings: { foreground: "#FFF" },
    },
    {
      name: "Markdown - Heading",
      scope: [
        "markdown.heading",
        "markup.heading | markup.heading entity.name",
        "markup.heading.markdown punctuation.definition.heading.markdown",
        "markup.heading",
        "markup.inserted.git_gutter",
      ],
      settings: { foreground: "#FFC799" },
    },
    {
      name: "Markup - Italic",
      scope: ["markup.italic"],
      settings: { fontStyle: "italic", foreground: "#FFF" },
    },
    {
      name: "Markup - Bold",
      scope: ["markup.bold", "markup.bold string"],
      settings: { fontStyle: "bold", foreground: "#FFF" },
    },
    {
      name: "Markup - Quote",
      scope: ["markup.quote"],
      settings: { foreground: "#99FFE4" },
    },
  ],
};

export { vesperPP };
