const { withXcodeProject } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withWidgetIntents = (config) => {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const { projectName } = config.modRequest;
    
    const swiftFilePath = path.join(config.modRequest.projectRoot, "ios-widget", "DDTIntents.swift");
    const targetPath = "DDTIntents.swift";
    
    // Copy the file to the ios directory so Xcode can find it
    const destinationPath = path.join(config.modRequest.platformProjectRoot, targetPath);
    if (!fs.existsSync(path.dirname(destinationPath))) {
        fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    }
    fs.copyFileSync(swiftFilePath, destinationPath);

    // Add to Xcode
    const groupName = "Resources"; 
    const file = project.addFile(targetPath, groupName);
    
    // Find the Widget Target
    // expo-widgets usually names it "ExpoWidgets" or whatever is in app.json
    const widgetTargetName = "ExpoWidgetsTarget";
    const target = project.getTarget(widgetTargetName);
    
    if (target) {
      project.addToSourcesPbxGroup(file, target.uuid);
      console.log(`Added DDTIntents.swift to ${widgetTargetName}`);
    } else {
      console.warn(`Could not find target ${widgetTargetName} to add Swift Intents`);
    }

    return config;
  });
};

module.exports = withWidgetIntents;
