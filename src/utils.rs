use crate::{object, set};
use js_sys::{Array, Error};
use toml;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[allow(dead_code)]
pub fn set_panic_hook() {
  // When the `console_error_panic_hook` feature is enabled, we can call the
  // `set_panic_hook` function at least once during initialization, and then
  // we will get better error messages if our code ever panics.
  //
  // For more details see
  // https://github.com/rustwasm/console_error_panic_hook#readme
  #[cfg(feature = "console_error_panic_hook")]
  console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn get_metadata() -> JsValue {
  let obj = object!(
    "name" => env!("CARGO_PKG_NAME"),
    "version" => env!("CARGO_PKG_VERSION"),
    "authors" => env!("CARGO_PKG_AUTHORS")
    // ,
    // "description" => env!("CARGO_PKG_DESCRIPTION"),
    // "homepage" => env!("CARGO_PKG_HOMEPAGE"),
    // "repository" => env!("CARGO_PKG_REPOSITORY")
  );

  let cargo: toml::Value = toml::from_str(include_str!("../Cargo.toml")).unwrap();

  if let Some(pkg) = cargo.get("package") {
    if let Some(description) = pkg.get("description") {
      if let Some(value) = description.as_str() {
        set!(&obj, "description" => value);
      };
    };
    if let Some(homepage) = pkg.get("homepage") {
      if let Some(value) = homepage.as_str() {
        set!(&obj, "homepage" => value);
      };
    };
    if let Some(repository) = pkg.get("repository") {
      if let Some(value) = repository.as_str() {
        set!(&obj, "repository" => value);
      };
    };
  };

  if let Some(pkg) = cargo.get("dependencies") {
    if let Some(regex) = pkg.get("regex") {
      if let Some(value) = regex.as_str() {
        set!(&obj, "regex" => value);
      };
    };
    if let Some(regex_syntax) = pkg.get("regex-syntax") {
      if let Some(value) = regex_syntax.as_str() {
        set!(&obj, "regex-syntax" => value);
      };
    };
  };

  obj
}

pub trait ToJs {
  fn to_js(&self) -> JsValue;
}

pub fn error<E: ToString>(e: E) -> JsValue {
  let error_message = e.to_string();
  let error = Error::new(&error_message);
  JsValue::from(error)
}

pub fn result<V: ToJs, E: ToString>(r: Result<V, E>) -> JsValue {
  match r {
    Ok(v) => v.to_js(),
    Err(e) => error(e),
  }
}

pub fn option<V: ToJs>(val: Option<V>) -> JsValue {
  match val {
    Some(v) => v.to_js(),
    None => JsValue::NULL,
  }
}

impl ToJs for String {
  fn to_js(&self) -> JsValue {
    object!("@type" => "struct", "@name" => "std::string::String", "@value" => self)
  }
}

impl ToJs for Vec<JsValue> {
  fn to_js(&self) -> JsValue {
    let arr: Array = Array::new();
    for item in self {
      arr.push(&item);
    }
    JsValue::from(arr)
  }
}

impl<T: ToJs> ToJs for Vec<T> {
  fn to_js(&self) -> JsValue {
    let arr: Array = Array::new();
    for item in self {
      arr.push(&item.to_js());
    }
    JsValue::from(arr)
  }
}
