#![allow(non_snake_case)] // JS uses camelCase, so we will follow its convention for the generated bindings.


extern crate nalgebra as na;
#[cfg(feature = "dim2")]
extern crate rapier2d as rapier;
#[cfg(feature = "dim3")]
extern crate rapier3d as rapier;
#[macro_use]
extern crate serde;

pub mod dynamic;
pub mod geometry;
pub mod math;
pub mod world;
