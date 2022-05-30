use crate::dynamics::{RawImpulseJointSet, RawMultibodyJointSet, RawRigidBodySet};
use crate::geometry::{RawColliderSet, RawNarrowPhase};
use js_sys::Float32Array;
use palette::convert::IntoColorUnclamped;
use palette::rgb::Rgba;
use palette::Hsla;
use rapier::math::{Point, Real};
use rapier::pipeline::{DebugRenderBackend, DebugRenderObject, DebugRenderPipeline};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct RawDebugRenderPipeline {
    pub(crate) raw: DebugRenderPipeline,
    vertices: Vec<f32>,
    colors: Vec<f32>,
}

#[wasm_bindgen]
impl RawDebugRenderPipeline {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        RawDebugRenderPipeline {
            raw: DebugRenderPipeline::default(),
            vertices: vec![],
            colors: vec![],
        }
    }

    pub fn vertices(&self) -> Float32Array {
        let output = Float32Array::new_with_length(self.vertices.len() as u32);
        output.copy_from(&self.vertices);
        output
    }

    pub fn colors(&self) -> Float32Array {
        let output = Float32Array::new_with_length(self.colors.len() as u32);
        output.copy_from(&self.colors);
        output
    }

    pub fn render(
        &mut self,
        bodies: &RawRigidBodySet,
        colliders: &RawColliderSet,
        impulse_joints: &RawImpulseJointSet,
        multibody_joints: &RawMultibodyJointSet,
        narrow_phase: &RawNarrowPhase,
    ) {
        self.vertices.clear();
        self.colors.clear();
        let mut backend = CopyToBuffersBackend {
            vertices: &mut self.vertices,
            colors: &mut self.colors,
        };

        self.raw.render(
            &mut backend,
            &bodies.0,
            &colliders.0,
            &impulse_joints.0,
            &multibody_joints.0,
            &narrow_phase.0,
        )
    }
}

struct CopyToBuffersBackend<'a> {
    vertices: &'a mut Vec<f32>,
    colors: &'a mut Vec<f32>,
}

impl<'a> DebugRenderBackend for CopyToBuffersBackend<'a> {
    /// Draws a colored line.
    ///
    /// Note that this method can be called multiple time for the same `object`.
    fn draw_line(
        &mut self,
        _object: DebugRenderObject,
        a: Point<Real>,
        b: Point<Real>,
        color: [f32; 4],
    ) {
        self.vertices.extend_from_slice(a.coords.as_slice());
        self.vertices.extend_from_slice(b.coords.as_slice());

        // Convert to RGB which will be easier to handle in JS.
        let hsl = Hsla::new(color[0], color[1], color[2], color[3]);
        let rgb: Rgba = hsl.into_color_unclamped();
        self.colors.extend_from_slice(&[
            rgb.red, rgb.green, rgb.blue, rgb.alpha, rgb.red, rgb.green, rgb.blue, rgb.alpha,
        ]);
    }
}
