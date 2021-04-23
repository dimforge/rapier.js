const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const dstRoot = args.shift(); // Destination directory
const srcRoot = args.shift(); // Source directory
const defines = args; // List of #defined names

if (!dstRoot) {
  throw Error("Output directory not specified!");
}

if (!srcRoot) {
  throw Error("Source directory not specified!");
}

function copy_files(dstDir, srcDir) {
  fs.readdir(srcDir, (err, files) => {
    if (err) {
      console.log(`Error reading directory ${srcDir}:`, err);
      process.exit(-1);
    }
    files.forEach((fname) => {
      const inPath = path.join(srcDir, fname);
      const outPath = path.join(dstDir, fname);
      const stats = fs.statSync(inPath);
      if (stats.isFile()) {
        const content = fs.readFileSync(inPath, 'utf8');
        const lines = content.split(/\r?\n/);
        const out = [];
        let ifNesting = 0;
        for (let i = 0, ct = lines.length; i < ct; i++) {
          const l = lines[i];
          // Match #if
          const m = /\/\/\s*#if\s+(\w+)/.exec(l);
          if (m) {
            if (!defines.includes(m[1])) {
              ifNesting += 1;
            }
            continue;
          }

          // Match #endif
          const m2 = /\/\/\s*#endif/.exec(l);
          if (m2) {
            if (ifNesting > 0) {
              ifNesting -= 1;
            }
            continue;
          }

          // Only output if not in a disabled block
          if (ifNesting === 0) {
            out.push(l);
          }
        }

        fs.writeFileSync(outPath, out.join('\n'), 'utf8');
        console.log(`Wrote: ${outPath}`);
      } else if (stats.isDirectory()) {
        // Recurse into subdir
        copy_files(path.join(dstDir, fname), inPath);
      }
    });
  });
}

copy_files(dstRoot, srcRoot);
