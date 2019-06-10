// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod rregex;
mod utils;

#[macro_export]
macro_rules! array {
    ($($val: expr), *) => {{
      let arr = js_sys::Array::new();
      $( arr.push(&wasm_bindgen::JsValue::from($val)); )*
      wasm_bindgen::JsValue::from(arr)
    }};
}

#[macro_export]
macro_rules! object {
    ($($key: expr => $value: expr), *) => {{
      let obj = wasm_bindgen::JsValue::from(js_sys::Object::new());
      $( js_sys::Reflect::set(&obj, &wasm_bindgen::JsValue::from($key), &wasm_bindgen::JsValue::from($value)).expect(&format!("property {} could not be set", $key)); )*
      obj
    }};
}

#[macro_export]
macro_rules! set {
    ($obj: expr, $($key: expr => $value: expr), *) => {{
      use js_sys::Reflect;
      $( Reflect::set($obj, &wasm_bindgen::JsValue::from($key), &wasm_bindgen::JsValue::from($value)).expect(&format!("property {} could not be set", $key)); )*
      $obj
    };}
}
