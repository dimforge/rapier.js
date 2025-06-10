use std::{
    error::Error,
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
};

use clap::Parser;
use clap_derive::Parser;
use serde::{Deserialize, Serialize};
use tera::{Context, Tera};

/// Simple program to greet a person
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
pub struct Args {
    #[arg(short, long, value_name = "FILE")]
    config_path: PathBuf,
}

#[derive(Deserialize, Serialize)]
/// Values to use when creating the new build folder.
pub struct BuildValues {
    /// Only the number of dimensions (1 or 2), as sometimes it will be prefixed by "dim" and sometimes post-fixed by "d".
    pub dim: String,
    /// Rust name of the additional features to enable in the project, they should correspond to features from Cargo.toml(.tera).
    pub additional_features: Vec<String>,
    pub target_dir: PathBuf,
    pub template_dir: PathBuf,
    pub additional_rust_flags: String,
    pub additional_wasm_opt_flags: Vec<String>,
    pub js_package_name: String,
    /// To remove text blocks present in non-rust files bounded by `#if CONDITION ... #endif`
    pub conditional_compilation_to_remove: Vec<String>,
}

impl BuildValues {
    pub fn new(args: Args) -> Self {
        let f = File::open(args.config_path).expect("Failed opening file");
        let config: Self = match serde_json::from_reader(f) {
            Ok(x) => x,
            Err(e) => {
                println!("Failed to load config: {}", e);

                std::process::exit(1);
            }
        };
        config
    }
}

fn main() {
    let args = Args::parse();
    //dbg!(&args);

    let build_values = BuildValues::new(args);
    println!(
        "RON:\n{}\n",
        serde_json::to_string_pretty(&build_values).unwrap()
    );
    copy_top_level_files_in_directory(&build_values.template_dir, &build_values.target_dir)
        .unwrap_or_else(|_| {
            eprintln!(
                "Failed to copy {:?} into {:?}",
                &build_values.template_dir, &build_values.target_dir
            );
        });
    process_templates(&build_values).expect("Failed to process templates");
}

fn copy_top_level_files_in_directory(
    src: impl AsRef<Path>,
    dest: impl AsRef<std::ffi::OsStr>,
) -> std::io::Result<()> {
    let src = src.as_ref();
    let dest = Path::new(&dest);
    if dest.exists() {
        fs::remove_dir_all(&dest)?;
    }
    fs::create_dir_all(&dest)?;

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        let dest_path = dest.join(path.file_name().unwrap());

        if !path.is_dir() {
            fs::copy(&path, &dest_path)?;
        }
    }
    Ok(())
}

/// Process all tera templates in the target directory:
/// - Remove the extension
/// - Render the templates to
///
fn process_templates(build_values: &BuildValues) -> std::io::Result<()> {
    let target_dir = build_values.target_dir.clone();

    let mut context = Context::new();
    context.insert("dimension", &build_values.dim);
    context.insert("additional_features", &build_values.additional_features);
    context.insert("additional_rust_flags", &build_values.additional_rust_flags);
    context.insert(
        "additional_wasm_opt_flags",
        &build_values.additional_wasm_opt_flags,
    );
    context.insert("js_package_name", &build_values.js_package_name);
    context.insert(
        "conditional_compilation_to_remove",
        &build_values.conditional_compilation_to_remove,
    );

    let tera = match Tera::new(target_dir.join("**/*.tera").to_str().unwrap()) {
        Ok(t) => t,
        Err(e) => {
            eprintln!("Parsing error(s): {}", e);
            ::std::process::exit(1);
        }
    };
    dbg!(tera.templates.keys(), &context);
    for entry in fs::read_dir(dbg!(target_dir))? {
        let entry = entry?;
        let path = entry.path();
        // For tera templates, remove extension.
        if path.extension() == Some(std::ffi::OsStr::new("tera")) {
            let mut i = path.iter();

            // Get path from target directory
            for _ in i
                .by_ref()
                .take_while(|c| *c != build_values.target_dir.file_name().unwrap())
            {}
            let path_template = i.as_path();
            match tera.render(path_template.to_str().unwrap(), &context) {
                Ok(s) => {
                    let old_path = path.clone();
                    let new_path = path.with_extension("");
                    let mut file = File::create(path.parent().unwrap().join(new_path))?;
                    file.write_all(s.as_bytes())?;
                    std::fs::remove_file(old_path)?;
                }
                Err(e) => {
                    eprintln!("Error: {}", e);
                    let mut cause = e.source();
                    while let Some(e) = cause {
                        eprintln!("Reason: {}", e);
                        cause = e.source();
                    }
                }
            };
        }
    }

    Ok(())
}
