//! # Rapier
//! Fast and deterministic WASM physics engine.

#![allow(non_snake_case)] // JS uses camelCase, so we will follow its convention for the generated bindings.
                          // #![deny(missing_docs)]

extern crate nalgebra as na;
#[cfg(feature = "dim2")]
extern crate rapier2d as rapier;
#[cfg(feature = "dim3")]
extern crate rapier3d as rapier;
#[macro_use]
extern crate serde;

#[wasm_bindgen::prelude::wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

pub mod dynamics;
pub mod geometry;
pub mod math;
pub mod pipeline;
pub mod utils;

pub mod libm {
    use wasm_bindgen::prelude::wasm_bindgen;

    #[wasm_bindgen]
    pub fn acoshf(x: f32) -> f32 {
        libm::acoshf(x)
    }
    #[wasm_bindgen]
    pub fn asinf(x: f32) -> f32 {
        libm::asinf(x)
    }
    #[wasm_bindgen]
    pub fn asinhf(x: f32) -> f32 {
        libm::asinhf(x)
    }
    #[wasm_bindgen]
    pub fn atan2f(y: f32, x: f32) -> f32 {
        libm::atan2f(y, x)
    }
    #[wasm_bindgen]
    pub fn atanf(x: f32) -> f32 {
        libm::atanf(x)
    }
    #[wasm_bindgen]
    pub fn atanhf(x: f32) -> f32 {
        libm::atanhf(x)
    }
    #[wasm_bindgen]
    pub fn cbrtf(x: f32) -> f32 {
        libm::cbrtf(x)
    }
    #[wasm_bindgen]
    pub fn ceilf(x: f32) -> f32 {
        libm::ceilf(x)
    }
    // #[wasm_bindgen]
    // pub fn copysignf(x: f32) -> f32 {
    //     libm::copysignf(x)
    // }
    #[wasm_bindgen]
    pub fn cosf(x: f32) -> f32 {
        libm::cosf(x)
    }
    #[wasm_bindgen]
    pub fn coshf(x: f32) -> f32 {
        libm::coshf(x)
    }
    #[wasm_bindgen]
    pub fn exp2f(x: f32) -> f32 {
        libm::exp2f(x)
    }
    #[wasm_bindgen]
    pub fn exp10f(x: f32) -> f32 {
        libm::exp10f(x)
    }
    #[wasm_bindgen]
    pub fn expf(x: f32) -> f32 {
        libm::expf(x)
    }
    #[wasm_bindgen]
    pub fn expm1f(x: f32) -> f32 {
        libm::expm1f(x)
    }
    #[wasm_bindgen]
    pub fn fabsf(x: f32) -> f32 {
        libm::fabsf(x)
    }
    // #[wasm_bindgen]
    // pub fn fdimf(x: f32) -> f32 {
    //     libm::fdimf(x)
    // }
    #[wasm_bindgen]
    pub fn floorf(x: f32) -> f32 {
        libm::floorf(x)
    }
    // #[wasm_bindgen]
    // pub fn fmaf(x: f32) -> f32 {
    //     libm::fmaf(x)
    // }
    // #[wasm_bindgen]
    // pub fn fmaxf(x: f32) -> f32 {
    //     libm::fmaxf(x)
    // }
    // #[wasm_bindgen]
    // pub fn fminf(x: f32) -> f32 {
    //     libm::fminf(x)
    // }
    #[wasm_bindgen]
    pub fn fmodf(x: f32, y: f32) -> f32 {
        libm::fmodf(x, y)
    }
    // #[wasm_bindgen]
    // pub fn frexpf(x: f32, y: f32) -> f32 {
    //     libm::frexpf(x, y)
    // }
    #[wasm_bindgen]
    pub fn hypotf(x: f32, y: f32) -> f32 {
        libm::hypotf(x, y)
    }
    // #[wasm_bindgen]
    // pub fn ilogbf(x: f32) -> f32 {
    //     libm::ilogbf(x)
    // }
    // #[wasm_bindgen]
    // pub fn j0f(x: f32) -> f32 {
    //     libm::j0f(x)
    // }
    // #[wasm_bindgen]
    // pub fn j1f(x: f32) -> f32 {
    //     libm::j1f(x)
    // }
    // #[wasm_bindgen]
    // pub fn jnf(x: f32) -> f32 {
    //     libm::jnf(x)
    // }
    // #[wasm_bindgen]
    // pub fn ldexpf(x: f32) -> f32 {
    //     libm::ldexpf(x)
    // }
    // #[wasm_bindgen]
    // pub fn lgammaf(x: f32) -> f32 {
    //     libm::lgammaf(x)
    // }
    // #[wasm_bindgen]
    // pub fn lgammaf_r(x: f32) -> f32 {
    //     libm::lgammaf_r(x)
    // }
    // #[wasm_bindgen]
    // pub fn log1pf(x: f32) -> f32 {
    //     libm::log1pf(x)
    // }
    #[wasm_bindgen]
    pub fn log2f(x: f32) -> f32 {
        libm::log2f(x)
    }
    #[wasm_bindgen]
    pub fn log10f(x: f32) -> f32 {
        libm::log10f(x)
    }
    #[wasm_bindgen]
    pub fn logf(x: f32) -> f32 {
        libm::logf(x)
    }
    // #[wasm_bindgen]
    // pub fn modf(x: f32, y: f32) -> f32 {
    //     libm::modf(x, y)
    // }
    // #[wasm_bindgen]
    // pub fn modff(x: f32, y: f32) -> f32 {
    //     libm::modff(x, y)
    // }
    // #[wasm_bindgen]
    // pub fn nextafterf(x: f32, y: f32) -> f32 {
    //     libm::nextafterf(x, y)
    // }
    #[wasm_bindgen]
    pub fn powf(x: f32, y: f32) -> f32 {
        libm::powf(x, y)
    }
    // #[wasm_bindgen]
    // pub fn remainderf(x: f32, y: f32) -> f32 {
    //     libm::remainderf(x, y)
    // }
    // #[wasm_bindgen]
    // pub fn roundf(x: f32) -> f32 {
    //     libm::roundf(x)
    // }
    // #[wasm_bindgen]
    // pub fn scalbnf(x: f32) -> f32 {
    //     libm::scalbnf(x)
    // }
    // #[wasm_bindgen]
    // pub fn sincosf(x: f32) -> f32 {
    //     libm::sincosf(x)
    // }
    #[wasm_bindgen]
    pub fn sinf(x: f32) -> f32 {
        libm::sinf(x)
    }
    #[wasm_bindgen]
    pub fn sinhf(x: f32) -> f32 {
        libm::sinhf(x)
    }
    #[wasm_bindgen]
    pub fn sqrtf(x: f32) -> f32 {
        libm::sqrtf(x)
    }
    #[wasm_bindgen]
    pub fn tanf(x: f32) -> f32 {
        libm::tanf(x)
    }
    #[wasm_bindgen]
    pub fn tanhf(x: f32) -> f32 {
        libm::tanhf(x)
    }
    // #[wasm_bindgen]
    // pub fn tgammaf(x: f32) -> f32 {
    //     libm::tgammaf(x)
    // }
    // #[wasm_bindgen]
    // pub fn truncf(x: f32) -> f32 {
    //     libm::truncf(x)
    // }
    // #[wasm_bindgen]
    // pub fn y0f(x: f32) -> f32 {
    //     libm::y0f(x)
    // }
    // #[wasm_bindgen]
    // pub fn y1f(x: f32) -> f32 {
    //     libm::y1f(x)
    // }
    // #[wasm_bindgen]
    // pub fn ynf(x: f32) -> f32 {
    //     libm::ynf(x)
    // }
}
