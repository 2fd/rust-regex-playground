use crate::utils::{error, option, result, ToJs};
use crate::{array, object, set};
use regex;
use regex_syntax::{hir, Parser};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[wasm_bindgen]
pub struct RRegExp {
  regex: regex::Regex,
}

#[wasm_bindgen]
impl RRegExp {
  #[wasm_bindgen(constructor)]
  pub fn new(re: &str) -> Result<RRegExp, JsValue> {
    match regex::Regex::new(re) {
      Err(e) => Err(error(e)),
      Ok(regex) => Ok(RRegExp { regex }),
    }
  }

  pub fn is_match(&self, text: &str) -> bool {
    self.regex.is_match(text)
  }

  pub fn is_match_at(&self, text: &str, start: usize) -> bool {
    self.regex.is_match_at(text, start)
  }

  pub fn find(&self, text: &str) -> JsValue {
    option(self.regex.find(text))
  }

  pub fn find_at(&self, text: &str, start: usize) -> JsValue {
    option(self.regex.find_at(text, start))
  }

  pub fn find_all(&self, text: &str) -> JsValue {
    let matches: Vec<regex::Match> = self.regex.find_iter(text).collect();
    matches.to_js()
  }

  pub fn replace(&self, text: &str, rep: &str) -> String {
    self.regex.replace(text, rep).into_owned()
  }

  pub fn replacen(&self, text: &str, limit: usize, rep: &str) -> String {
    self.regex.replacen(text, limit, rep).into_owned()
  }

  pub fn replace_all(&self, text: &str, rep: &str) -> String {
    self.regex.replace_all(text, rep).into_owned()
  }

  pub fn split(&self, text: &str) -> JsValue {
    let splits: Vec<String> = self.regex.split(text).map(|s| s.to_string()).collect();
    splits.to_js()
  }

  pub fn splitn(&self, text: &str, limit: usize) -> JsValue {
    let splits: Vec<String> = self
      .regex
      .splitn(text, limit)
      .map(|s| s.to_string())
      .collect();
    splits.to_js()
  }

  pub fn syntax(&self) -> JsValue {
    let mut parser = Parser::new();
    result(parser.parse(self.regex.as_str()))
  }
}

impl ToJs for hir::Hir {
  fn to_js(&self) -> JsValue {
    object!("@type" => "struct", "@name" => "regex_syntax::hir::Hir", "kind" => self.kind().to_js())
  }
}

impl ToJs for hir::HirKind {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "enum", "@name" => "regex_syntax::hir::HirKind");
    match self {
      hir::HirKind::Empty => set!(&current, "@variant" => "Empty"),
      hir::HirKind::Literal(l) => set!(&current, "@variant" => "Literal", "value" => l.to_js()),
      hir::HirKind::Class(c) => set!(&current, "@variant" => "Class", "value" => c.to_js()),
      hir::HirKind::Anchor(a) => set!(&current, "@variant" => "Anchor", "value" => a.to_js()),
      hir::HirKind::WordBoundary(w) => {
        set!(&current, "@variant" => "WordBoundary", "value" => w.to_js())
      }
      hir::HirKind::Repetition(r) => {
        set!(&current, "@variant" => "Repetition", "value" => r.to_js())
      }
      hir::HirKind::Group(g) => set!(&current, "@variant" => "Group", "value" => g.to_js()),
      hir::HirKind::Concat(c) => set!(&current, "@variant" => "Concat", "value" => c.to_js()),
      hir::HirKind::Alternation(c) => {
        set!(&current, "@variant" => "Alternation", "value" => c.to_js())
      }
    };
    current
  }
}

impl ToJs for hir::Literal {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "enum", "@name" => "regex_syntax::hir::Literal");
    match self {
      hir::Literal::Unicode(unicode) => {
        set!(&current, "@variant" => "Unicode", "value" => unicode.to_string())
      }
      hir::Literal::Byte(byte) => {
        set!(&current,  "@variant" => "Byte", "value" => byte.to_owned() as i32)
      }
    };
    current
  }
}

impl ToJs for hir::Class {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "enum", "@name" => "regex_syntax::hir::Class");
    match self {
      hir::Class::Unicode(unicode) => {
        set!(&current, "@variant" => "Unicode", "value" => unicode.to_js())
      }
      hir::Class::Bytes(byte) => set!(&current, "@variant" => "Bytes", "value" => byte.to_js()),
    };
    current
  }
}

impl ToJs for hir::ClassUnicode {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "struct", "@name" => "regex_syntax::hir::ClassUnicode");
    let ranges: Vec<hir::ClassUnicodeRange> = self.ranges().iter().map(|c| c.to_owned()).collect();
    set!(&current, "ranges" => ranges.to_js());
    current
  }
}

impl ToJs for hir::ClassUnicodeRange {
  fn to_js(&self) -> JsValue {
    object!(
      "@type" => "struct",
      "@name" => "regex_syntax::hir::ClassUnicodeRange",
      "start" => self.start().to_string(),
      "end" => self.end().to_string()
    )
  }
}

impl ToJs for hir::ClassBytes {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "struct", "@name" => "regex_syntax::hir::ClassBytes");
    let ranges: Vec<hir::ClassBytesRange> = self.ranges().iter().map(|c| c.to_owned()).collect();
    set!(&current, "ranges" => ranges.to_js());
    current
  }
}

impl ToJs for hir::ClassBytesRange {
  fn to_js(&self) -> JsValue {
    object!(
      "@type" => "struct",
      "@name" => "regex_syntax::hir::ClassBytesRange",
      "start" => self.start().to_owned() as i32,
      "end" => self.end().to_owned() as i32
    )
  }
}

impl ToJs for hir::Anchor {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "enum", "@name" => "regex_syntax::hir::Anchor");
    match self {
      hir::Anchor::StartLine => set!(&current, "@variant" => "StartLine"),
      hir::Anchor::EndLine => set!(&current, "@variant" => "EndLine"),
      hir::Anchor::StartText => set!(&current, "@variant" => "StartText"),
      hir::Anchor::EndText => set!(&current, "@variant" => "EndText"),
    };
    current
  }
}

impl ToJs for hir::WordBoundary {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "enum", "@name" => "regex_syntax::hir::WordBoundary");
    match self {
      hir::WordBoundary::Ascii => set!(&current, "@variant" => "Ascii"),
      hir::WordBoundary::AsciiNegate => set!(&current, "@variant" => "AsciiNegate"),
      hir::WordBoundary::Unicode => set!(&current, "@variant" => "Unicode"),
      hir::WordBoundary::UnicodeNegate => set!(&current, "@variant" => "UnicodeNegate"),
    };
    current
  }
}

impl ToJs for hir::Repetition {
  fn to_js(&self) -> JsValue {
    object!(
      "@type" => "struct",
      "@name" => "regex_syntax::hir::Repetition",
      "greedy" => self.greedy,
      "kind" => self.kind.to_js(),
      "hir" => self.hir.to_js()
    )
  }
}

impl ToJs for hir::RepetitionKind {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "enum", "@name" => "regex_syntax::hir::RepetitionKind");
    match self {
      hir::RepetitionKind::ZeroOrOne => set!(&current, "@variant" => "ZeroOrOne"),
      hir::RepetitionKind::ZeroOrMore => set!(&current, "@variant" => "ZeroOrMore"),
      hir::RepetitionKind::OneOrMore => set!(&current, "@variant" => "OneOrMore"),
      hir::RepetitionKind::Range(range) => {
        set!(&current, "@variant" => "Range", "value" => range.to_js())
      }
    };
    current
  }
}

impl ToJs for hir::RepetitionRange {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "enum", "@name" => "regex_syntax::hir::RepetitionRange");
    match self {
      hir::RepetitionRange::Exactly(val) => {
        set!(&current, "@variant" => "Exactly", "value" => val.to_owned() as f64)
      }
      hir::RepetitionRange::AtLeast(min) => {
        set!(&current, "@variant" => "AtLeast", "value" => min.to_owned() as f64)
      }
      hir::RepetitionRange::Bounded(min, max) => {
        set!(&current, "@variant" => "Bounded", "value" => array!(min.to_owned() as f64, max.to_owned() as f64))
      }
    };
    current
  }
}

impl ToJs for hir::Group {
  fn to_js(&self) -> JsValue {
    object!(
      "@type" => "struct",
      "@name" => "regex_syntax::hir::Group",
      "kind" => self.kind.to_js(),
      "hir" => self.hir.to_js()
    )
  }
}

impl ToJs for hir::GroupKind {
  fn to_js(&self) -> JsValue {
    let current = object!("@type" => "enum", "@name" => "regex_syntax::hir::GroupKind");
    match self {
      hir::GroupKind::CaptureIndex(index) => {
        set!(&current, "@variant" => "CaptureIndex", "index" => index.to_owned() as f64)
      }
      hir::GroupKind::CaptureName { name, index } => {
        set!(&current, "@variant" => "CaptureName", "index" => index.to_owned() as f64, "name" => name.to_owned())
      }
      hir::GroupKind::NonCapturing => set!(&current, "@variant" => "NonCapturing"),
    };
    current
  }
}

impl<'t> ToJs for regex::Match<'t> {
  fn to_js(&self) -> JsValue {
    object!(
      "@type" => "struct",
      "@name" => "regex::Match",
      "start" => self.start() as f64,
      "end" => self.end() as f64,
      "as_str" => self.as_str().to_owned().to_js()
    )
  }
}
