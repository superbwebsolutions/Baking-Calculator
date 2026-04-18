const { IOSConfig, withXcodeProject } = require("@expo/config-plugins");
const { findNativeTargetByName } = require("@expo/config-plugins/build/ios/Target");

const TARGET_NAME = "ExpoWidgetsTarget";
const DEPLOYMENT_TARGET = "17.0";

module.exports = function setWidgetDeploymentTarget(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;

    try {
      const [, target] = findNativeTargetByName(project, TARGET_NAME);
      const configurations = IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
        project,
        target.buildConfigurationList
      );

      for (const [, buildConfig] of configurations) {
        if (buildConfig?.buildSettings) {
          buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = DEPLOYMENT_TARGET;
        }
      }

      console.log(`Set deployment target to ${DEPLOYMENT_TARGET} for ${TARGET_NAME}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Unable to set deployment target for ${TARGET_NAME}: ${message}`);
    }

    return config;
  });
};
