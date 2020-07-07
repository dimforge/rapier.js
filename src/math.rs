use rapier::math::{Rotation as RRotation, Vector as RVector};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(transparent)]
#[derive(Copy, Clone)]
pub struct Rotation(pub(crate) RRotation<f32>);

#[wasm_bindgen]
#[cfg(feature = "dim3")]
impl Rotation {
    pub fn identity() -> Self {
        Self(RRotation::identity())
    }

    #[wasm_bindgen(getter)]
    pub fn x(&self) -> f32 {
        self.0.i
    }

    #[wasm_bindgen(getter)]
    pub fn y(&self) -> f32 {
        self.0.j
    }

    #[wasm_bindgen(getter)]
    pub fn z(&self) -> f32 {
        self.0.k
    }

    #[wasm_bindgen(getter)]
    pub fn w(&self) -> f32 {
        self.0.w
    }
}

#[wasm_bindgen]
#[repr(transparent)]
#[derive(Copy, Clone)]
pub struct Vector(pub(crate) RVector<f32>);

#[wasm_bindgen]
impl Vector {
    pub fn zero() -> Self {
        Self(RVector::zeros())
    }

    #[cfg(feature = "dim2")]
    #[wasm_bindgen(constructor)]
    pub fn new(x: f32, y: f32) -> Self {
        Self(RVector::new(x, y, z))
    }

    #[cfg(feature = "dim3")]
    #[wasm_bindgen(constructor)]
    pub fn new(x: f32, y: f32, z: f32) -> Self {
        Self(RVector::new(x, y, z))
    }

    #[wasm_bindgen(getter)]
    pub fn x(&self) -> f32 {
        self.0.x
    }

    #[wasm_bindgen(setter)]
    pub fn set_x(&mut self, x: f32) {
        self.0.x = x
    }

    #[wasm_bindgen(getter)]
    pub fn y(&self) -> f32 {
        self.0.y
    }

    #[wasm_bindgen(setter)]
    pub fn set_y(&mut self, y: f32) {
        self.0.y = y
    }

    #[cfg(feature = "dim3")]
    #[wasm_bindgen(getter)]
    pub fn z(&self) -> f32 {
        self.0.z
    }

    #[cfg(feature = "dim3")]
    #[wasm_bindgen(setter)]
    pub fn set_z(&mut self, z: f32) {
        self.0.z = z
    }

    pub fn xyz(&self) -> Self {
        Self(self.0.xyz())
    }

    pub fn yxz(&self) -> Self {
        Self(self.0.yxz())
    }

    pub fn zxy(&self) -> Self {
        Self(self.0.zxy())
    }

    pub fn xzy(&self) -> Self {
        Self(self.0.xzy())
    }

    pub fn yzx(&self) -> Self {
        Self(self.0.yzx())
    }

    pub fn zyx(&self) -> Self {
        Self(self.0.zyx())
    }
}
