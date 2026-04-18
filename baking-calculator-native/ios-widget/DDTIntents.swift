import AppIntents
import WidgetKit

struct DDTData: Codable {
    var desired: Double
    var room: Double
    var flour: Double
    var friction: Double
    var unit: String
    var target: Double
}

struct DDTManager {
    static let suiteName = "group.com.bakeit.utility"
    static let key = "ddt_widget_state"
    
    static func get() -> DDTData {
        guard let data = UserDefaults(suiteName: suiteName)?.data(forKey: key),
              let decoded = try? JSONDecoder().decode(DDTData.self, from: data) else {
            return DDTData(desired: 78, room: 72, flour: 72, friction: 24, unit: "F", target: 66)
        }
        return decoded
    }
    
    static func save(_ data: DDTData) {
        var mutableData = data
        mutableData.target = (mutableData.desired * 3) - (mutableData.room + mutableData.flour + mutableData.friction)
        
        if let encoded = try? JSONEncoder().encode(mutableData) {
            UserDefaults(suiteName: suiteName)?.set(encoded, forKey: key)
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}

// Intents
@available(iOS 17.0, *)
struct IncrementRoomIntent: AppIntent {
    static var title: LocalizedStringResource = "Increment Room Temp"
    
    func perform() async throws -> some IntentResult {
        var data = DDTManager.get()
        data.room += 1
        DDTManager.save(data)
        return .result()
    }
}

@available(iOS 17.0, *)
struct DecrementRoomIntent: AppIntent {
    static var title: LocalizedStringResource = "Decrement Room Temp"
    
    func perform() async throws -> some IntentResult {
        var data = DDTManager.get()
        data.room -= 1
        DDTManager.save(data)
        return .result()
    }
}

@available(iOS 17.0, *)
struct IncrementFlourIntent: AppIntent {
    static var title: LocalizedStringResource = "Increment Flour Temp"
    
    func perform() async throws -> some IntentResult {
        var data = DDTManager.get()
        data.flour += 1
        DDTManager.save(data)
        return .result()
    }
}

@available(iOS 17.0, *)
struct DecrementFlourIntent: AppIntent {
    static var title: LocalizedStringResource = "Decrement Flour Temp"
    
    func perform() async throws -> some IntentResult {
        var data = DDTManager.get()
        data.flour -= 1
        DDTManager.save(data)
        return .result()
    }
}

@available(iOS 17.0, *)
struct ToggleUnitIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Unit"
    
    func perform() async throws -> some IntentResult {
        var data = DDTManager.get()
        data.unit = (data.unit == "F") ? "C" : "F"
        DDTManager.save(data)
        return .result()
    }
}
