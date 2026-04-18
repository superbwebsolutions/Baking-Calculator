import ExpoModulesCore

public class DDTModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DDTModule")

    Function("getDDTState") { () -> [String: Any]? in
      let suiteName = "group.com.bakeit.utility"
      let key = "ddt_widget_state"
      guard let data = UserDefaults(suiteName: suiteName)?.data(forKey: key),
            let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
        return nil
      }
      return dict
    }

    Function("saveDDTState") { (state: [String: Any]) in
      let suiteName = "group.com.bakeit.utility"
      let key = "ddt_widget_state"
      if let data = try? JSONSerialization.data(withJSONObject: state) {
        UserDefaults(suiteName: suiteName)?.set(data, forKey: key)
        
        // Reload widgets
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
