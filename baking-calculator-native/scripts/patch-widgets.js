const fs = require("fs");
const path = require("path");

const generatorFile = path.join(__dirname, "../node_modules/expo-widgets/plugin/build/withWidgetSourceFiles.js");
const widgetSourceFile = path.join(__dirname, "../ios-widget/DDTWidget.swift");

if (!fs.existsSync(generatorFile)) {
  console.log("--- WIDGET PATCH SKIPPED: expo-widgets generator not found ---");
  process.exit(0);
}

if (!fs.existsSync(widgetSourceFile)) {
  console.error("--- WIDGET PATCH FAILED: Native widget source is missing ---");
  process.exit(1);
}

console.log("--- WIDGET PATCH STARTING: Syncing native widget source ---");

try {
  const swiftSource = fs.readFileSync(widgetSourceFile, "utf8");
  const replacement = `const widgetSwift = (widget) => ${JSON.stringify(swiftSource)};`;
  const generator = fs.readFileSync(generatorFile, "utf8");
  const regex = /const widgetSwift = \(widget\) => (?:"(?:\\.|[^"])*"|`[\s\S]*?`);/m;

  if (!regex.test(generator)) {
    console.error("--- WIDGET PATCH FAILED: Could not locate widget generator template ---");
    process.exit(1);
  }

  fs.writeFileSync(generatorFile, generator.replace(regex, replacement));
  console.log("--- WIDGET PATCH SUCCESS: Native widget source copied into generator ---");
} catch (error) {
  console.error("--- WIDGET PATCH ERROR:", error.message);
  process.exit(1);
}
