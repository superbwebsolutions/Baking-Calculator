import AppIntents
import SwiftUI
import WidgetKit

private let widgetAccentColor = Color(red: 1.0, green: 0.42, blue: 0.42)
private let cardColor = Color(red: 0.17, green: 0.17, blue: 0.19)
private let mutedCardColor = Color(red: 0.23, green: 0.23, blue: 0.25)
private let secondaryCardColor = Color(red: 0.14, green: 0.14, blue: 0.16)
private let textColor = Color.white
private let secondaryTextColor = Color(red: 0.78, green: 0.78, blue: 0.82)

private let toolTabs: [(id: String, label: String, icon: String)] = [
    ("convert", "Convert", "arrow.up.arrow.down"),
    ("recipe-scaler", "Scale", "chart.pie.fill"),
    ("oven", "Oven", "flame.fill"),
    ("bakers-math", "Baker %", "percent"),
    ("levain", "Levain", "testtube.2"),
    ("ddt", "DDT", "thermometer.medium"),
    ("yeast", "Yeast", "drop.fill")
]

private let yeastUnits = ["tsp", "tbsp", "g", "oz"]
private let convertUnits = ["cup", "tbsp", "tsp", "g", "oz"]
private let panShapes = ["round", "square", "rectangle", "loaf", "oval"]
private let convertIngredients: [(name: String, density: Double)] = [
    ("Flour", 120),
    ("Sugar", 198),
    ("Butter", 226),
    ("Water", 227),
    ("Salt", 273)
]

struct BakeWidgetData: Codable {
    var activeTool: String = "convert"
    var ddt: DDTState = DDTState()
    var yeast: YeastState = YeastState()
    var oven: OvenState = OvenState()
    var bakers: BakersState = BakersState()
    var levain: LevainState = LevainState()
    var scaler: ScalerState = ScalerState()
    var convert: ConvertState = ConvertState()
}

struct DDTState: Codable {
    var unit: String = "F"
    var mixingMethod: String = "machine"
    var desired: Double = 78
    var room: Double = 72
    var flour: Double = 72
    var friction: Double = 24
}

struct YeastState: Codable {
    var amount: Double = 2.25
    var inputType: String = "ady"
    var unit: String = "tsp"
    var format: String = "fraction"
}

struct OvenState: Codable {
    var tempF: Double = 350
}

struct BakersState: Codable {
    var weightUnit: String = "oz"
    var flour: Double = 35.27
    var water: Double = 26.46
    var salt: Double = 0.71
    var yeast: Double = 0.35
}

struct LevainState: Codable {
    var unit: String = "oz"
    var targetWeight: Double = 7
    var ratioStarter: Double = 1
    var ratioFlour: Double = 2
    var ratioWater: Double = 2
}

struct ScalerState: Codable {
    var mode: String = "servings"
    var panUnit: String = "in"
    var originalServings: Double = 4
    var newServings: Double = 8
    var originalShape: String = "round"
    var originalDim1: Double = 8
    var originalDim2: Double = 8
    var newShape: String = "square"
    var newDim1: Double = 9
    var newDim2: Double = 9
}

struct ConvertState: Codable {
    var amount: Double = 1
    var ingredientIndex: Int = 0
    var fromUnitIndex: Int = 0
    var toUnitIndex: Int = 3
}

struct WidgetManager {
    static let suiteName = "group.com.bakeit.utility"
    static let storageKey = "bake_widget_master_state"

    static func get() -> BakeWidgetData {
        let defaults = UserDefaults(suiteName: suiteName)
        if let data = defaults?.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode(BakeWidgetData.self, from: data) {
            return decoded
        }
        return BakeWidgetData()
    }

    static func save(_ data: BakeWidgetData) {
        let defaults = UserDefaults(suiteName: suiteName)
        if let encoded = try? JSONEncoder().encode(data) {
            defaults?.set(encoded, forKey: storageKey)
        }
        WidgetCenter.shared.reloadAllTimelines()
    }
}

@available(iOS 17.0, *)
struct SwitchToolIntent: AppIntent {
    static var title: LocalizedStringResource = "Switch Tool"

    @Parameter(title: "Tool ID") var toolId: String

    init() {}

    init(toolId: String) {
        self.toolId = toolId
    }

    func perform() async throws -> some IntentResult {
        var data = WidgetManager.get()
        data.activeTool = toolId
        WidgetManager.save(data)
        return .result()
    }
}

@available(iOS 17.0, *)
struct AdjustValueIntent: AppIntent {
    static var title: LocalizedStringResource = "Adjust Widget Value"

    @Parameter(title: "Tool") var tool: String
    @Parameter(title: "Field") var field: String
    @Parameter(title: "Delta") var delta: Double

    init() {}

    init(tool: String, field: String, delta: Double) {
        self.tool = tool
        self.field = field
        self.delta = delta
    }

    func perform() async throws -> some IntentResult {
        var data = WidgetManager.get()

        switch tool {
        case "ddt":
            adjustDDT(&data.ddt, field: field, delta: delta)
        case "yeast":
            adjustYeast(&data.yeast, field: field, delta: delta)
        case "oven":
            if field == "tempF" { data.oven.tempF += delta }
        case "bakers-math":
            adjustBakers(&data.bakers, field: field, delta: delta)
        case "levain":
            adjustLevain(&data.levain, field: field, delta: delta)
        case "recipe-scaler":
            adjustScaler(&data.scaler, field: field, delta: delta)
        case "convert":
            if field == "amount" {
                let fromUnit = convertUnits[safe: data.convert.fromUnitIndex] ?? "cup"
                if fromUnit == "g" {
                    data.convert.amount = adjustConvertAmountGram(data.convert.amount, delta: delta)
                } else {
                    data.convert.amount = max(0, rounded(data.convert.amount + delta))
                }
            }
        default:
            break
        }

        WidgetManager.save(data)
        return .result()
    }
}

@available(iOS 17.0, *)
struct ToggleOptionIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Widget Option"

    @Parameter(title: "Tool") var tool: String
    @Parameter(title: "Field") var field: String

    init() {}

    init(tool: String, field: String) {
        self.tool = tool
        self.field = field
    }

    func perform() async throws -> some IntentResult {
        var data = WidgetManager.get()

        switch tool {
        case "ddt":
            if field == "unit" {
                data.ddt = toggleDDTUnit(data.ddt)
            } else if field == "mixingMethod" {
                data.ddt.mixingMethod = data.ddt.mixingMethod == "machine" ? "hand" : "machine"
                data.ddt.friction = frictionPreset(unit: data.ddt.unit, mixingMethod: data.ddt.mixingMethod)
            }
        case "yeast":
            if field == "unit" {
                data.yeast.unit = cycle(value: data.yeast.unit, in: yeastUnits)
            } else if field == "format" {
                data.yeast.format = data.yeast.format == "fraction" ? "decimal" : "fraction"
            }
        case "bakers-math":
            if field == "weightUnit" {
                data.bakers = convertBakersUnit(data.bakers)
            }
        case "levain":
            if field == "unit" {
                data.levain = convertLevainUnit(data.levain)
            }
        case "recipe-scaler":
            if field == "mode" {
                data.scaler.mode = data.scaler.mode == "servings" ? "pan" : "servings"
            } else if field == "panUnit" {
                data.scaler = convertScalerUnit(data.scaler)
            } else if field == "originalShape" {
                data.scaler.originalShape = cycle(value: data.scaler.originalShape, in: panShapes)
            } else if field == "newShape" {
                data.scaler.newShape = cycle(value: data.scaler.newShape, in: panShapes)
            }
        case "convert":
            if field == "ingredient" {
                data.convert.ingredientIndex = (data.convert.ingredientIndex + 1) % convertIngredients.count
            } else if field == "fromUnit" {
                let oldIndex = data.convert.fromUnitIndex
                let oldUnit = convertUnits[safe: oldIndex] ?? "cup"
                let newIndex = (oldIndex + 1) % convertUnits.count
                let newUnit = convertUnits[safe: newIndex] ?? "cup"
                let density = convertIngredients[safe: data.convert.ingredientIndex]?.density ?? 120
                data.convert.amount = max(0, rounded(convertAmount(amount: data.convert.amount, fromUnit: oldUnit, toUnit: newUnit, density: density)))
                data.convert.fromUnitIndex = newIndex
            } else if field == "toUnit" {
                data.convert.toUnitIndex = (data.convert.toUnitIndex + 1) % convertUnits.count
            }
        default:
            break
        }

        WidgetManager.save(data)
        return .result()
    }
}

@available(iOS 17.0, *)
struct SetOptionIntent: AppIntent {
    static var title: LocalizedStringResource = "Set Widget Option"

    @Parameter(title: "Tool") var tool: String
    @Parameter(title: "Field") var field: String
    @Parameter(title: "Value") var value: String

    init() {}

    init(tool: String, field: String, value: String) {
        self.tool = tool
        self.field = field
        self.value = value
    }

    func perform() async throws -> some IntentResult {
        var data = WidgetManager.get()

        if tool == "yeast", field == "inputType" {
            data.yeast.inputType = value
        } else if tool == "oven", field == "tempF" {
            data.oven.tempF = Double(value) ?? data.oven.tempF
        }

        WidgetManager.save(data)
        return .result()
    }
}

struct BakeEntry: TimelineEntry {
    let date: Date
    let data: BakeWidgetData
}

struct BakeProvider: TimelineProvider {
    func placeholder(in context: Context) -> BakeEntry {
        BakeEntry(date: Date(), data: WidgetManager.get())
    }

    func getSnapshot(in context: Context, completion: @escaping (BakeEntry) -> Void) {
        completion(BakeEntry(date: Date(), data: WidgetManager.get()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<BakeEntry>) -> Void) {
        completion(Timeline(entries: [BakeEntry(date: Date(), data: WidgetManager.get())], policy: .atEnd))
    }
}

struct HubWidgetView: View {
    let entry: BakeEntry

    var body: some View {
        VStack(spacing: 0) {
            Group {
                switch entry.data.activeTool {
                case "ddt":
                    DDTToolView(state: entry.data.ddt)
                case "levain":
                    LevainToolView(state: entry.data.levain)
                case "yeast":
                    YeastToolView(state: entry.data.yeast)
                case "oven":
                    OvenToolView(state: entry.data.oven)
                case "bakers-math":
                    BakersToolView(state: entry.data.bakers)
                case "recipe-scaler":
                    ScalerToolView(state: entry.data.scaler)
                case "convert":
                    ConvertToolView(state: entry.data.convert)
                default:
                    Text("Select a tool")
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding(.horizontal, 14)
            .padding(.top, 14)
            .padding(.bottom, 12)

            ToolbarView(activeTool: entry.data.activeTool)
                .padding(.horizontal, 8)
                .padding(.top, 6)
                .padding(.bottom, 8)
                .background(secondaryCardColor)
        }
        .widgetBackground
    }
}

extension View {
    @ViewBuilder
    var widgetBackground: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            self.containerBackground(cardColor, for: .widget)
        } else {
            self.background(cardColor)
        }
    }
}

struct ToolbarView: View {
    let activeTool: String

    var body: some View {
        HStack(spacing: 2) {
            ForEach(toolTabs, id: \.id) { tool in
                ToolbarButton(tool: tool, isActive: activeTool == tool.id)
            }
        }
    }
}

struct ToolbarButton: View {
    let tool: (id: String, label: String, icon: String)
    let isActive: Bool

    private var labelContent: some View {
        VStack(spacing: 3) {
            ZStack {
                Circle()
                    .fill(isActive ? widgetAccentColor : Color.clear)
                    .frame(width: 28, height: 28)
                Image(systemName: tool.icon)
                    .font(.system(size: 13, weight: .semibold))
            }
            Text(tool.label)
                .font(.system(size: 8, weight: .bold))
                .lineLimit(1)
        }
        .foregroundStyle(isActive ? textColor : secondaryTextColor)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 4)
    }

    @ViewBuilder
    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            Button(intent: SwitchToolIntent(toolId: tool.id)) {
                labelContent
            }
            .buttonStyle(.plain)
        } else {
            labelContent
        }
    }
}

struct ToolHeader<Actions: View>: View {
    let title: String
    let subtitle: String?
    @ViewBuilder let actions: Actions

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            VStack(alignment: .leading, spacing: subtitle == nil ? 0 : 3) {
                Text(title)
                    .font(.system(size: 16, weight: .heavy))
                    .foregroundStyle(textColor)
                if let subtitle {
                    Text(subtitle)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(secondaryTextColor)
                        .lineLimit(2)
                }
            }
            Spacer(minLength: 8)
            HStack(spacing: 6) {
                actions
            }
        }
    }
}

struct IntentPill: View {
    let label: String
    let tool: String
    let field: String

    private var pillContent: some View {
        Text(label)
            .font(.system(size: 9, weight: .bold))
            .foregroundStyle(widgetAccentColor)
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(widgetAccentColor.opacity(0.14))
            .clipShape(Capsule())
    }

    @ViewBuilder
    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            Button(intent: ToggleOptionIntent(tool: tool, field: field)) {
                pillContent
            }
            .buttonStyle(.plain)
        } else {
            pillContent
        }
    }
}

struct HeroCard: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(Color.white.opacity(0.82))
            Text(value)
                .font(.system(size: 28, weight: .black))
                .foregroundStyle(Color.white)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 13)
        .padding(.vertical, 11)
        .background(widgetAccentColor)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

struct MetricCard: View {
    let label: String
    let value: String
    var accent: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label.uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(accent ? widgetAccentColor : secondaryTextColor)
            Text(value)
                .font(.system(size: 15, weight: .heavy))
                .foregroundStyle(textColor)
                .lineLimit(1)
                .minimumScaleFactor(0.65)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 10)
        .padding(.vertical, 10)
        .background((accent ? widgetAccentColor.opacity(0.18) : mutedCardColor))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct StepperCard: View {
    let tool: String
    let field: String
    let label: String
    let value: String
    let step: Double

    var body: some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                Text(label.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(secondaryTextColor)
                Text(value)
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(textColor)
                    .lineLimit(1)
                    .minimumScaleFactor(0.65)
            }
            Spacer(minLength: 8)
            HStack(spacing: 6) {
                AdjustButton(tool: tool, field: field, delta: -step, icon: "minus.circle.fill")
                AdjustButton(tool: tool, field: field, delta: step, icon: "plus.circle.fill")
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 9)
        .background(mutedCardColor)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct CompactStepperCard: View {
    let tool: String
    let field: String
    let label: String
    let value: String
    let step: Double
    var accent: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label.uppercased())
                .font(.system(size: 9, weight: .bold))
                .foregroundStyle(accent ? widgetAccentColor : secondaryTextColor)
            Text(value)
                .font(.system(size: 14, weight: .heavy))
                .foregroundStyle(textColor)
                .lineLimit(1)
                .minimumScaleFactor(0.65)
            HStack {
                AdjustButton(tool: tool, field: field, delta: -step, icon: "minus.circle.fill")
                Spacer(minLength: 6)
                AdjustButton(tool: tool, field: field, delta: step, icon: "plus.circle.fill")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 10)
        .padding(.vertical, 10)
        .background((accent ? widgetAccentColor.opacity(0.18) : mutedCardColor))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct AdjustButton: View {
    let tool: String
    let field: String
    let delta: Double
    let icon: String

    private var iconContent: some View {
        Image(systemName: icon)
            .font(.system(size: 18, weight: .semibold))
            .foregroundStyle(widgetAccentColor)
    }

    @ViewBuilder
    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            Button(intent: AdjustValueIntent(tool: tool, field: field, delta: delta)) {
                iconContent
            }
            .buttonStyle(.plain)
        } else {
            iconContent
        }
    }
}

struct ShapeButton: View {
    let label: String
    let tool: String
    let field: String

    private var buttonContent: some View {
        Text(label)
            .font(.system(size: 11, weight: .bold))
            .foregroundStyle(textColor)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 9)
            .background(widgetAccentColor.opacity(0.14))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    @ViewBuilder
    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            Button(intent: ToggleOptionIntent(tool: tool, field: field)) {
                buttonContent
            }
            .buttonStyle(.plain)
        } else {
            buttonContent
        }
    }
}

struct DDTToolView: View {
    let state: DDTState

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ToolHeader(title: "Dough Temp (DDT)", subtitle: "Water target") {
                IntentPill(label: state.mixingMethod == "machine" ? "Mixer" : "Hand", tool: "ddt", field: "mixingMethod")
                IntentPill(label: "°\(state.unit)", tool: "ddt", field: "unit")
            }
            HeroCard(label: "Required Water Temp", value: "\(Int(ddtWaterTemp(state)))°\(state.unit)")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                StepperCard(tool: "ddt", field: "desired", label: "Desired", value: "\(Int(state.desired))°\(state.unit)", step: 1)
                StepperCard(tool: "ddt", field: "room", label: "Room", value: "\(Int(state.room))°\(state.unit)", step: 1)
                StepperCard(tool: "ddt", field: "flour", label: "Flour", value: "\(Int(state.flour))°\(state.unit)", step: 1)
                StepperCard(tool: "ddt", field: "friction", label: "Friction", value: "\(Int(state.friction))°\(state.unit)", step: 1)
            }
        }
    }
}

struct PanConfigCard: View {
    let title: String
    let summary: String
    let shapeLabel: String
    let shapeField: String
    let primaryLabel: String
    let primaryValue: String
    let primaryField: String
    let secondaryLabel: String?
    let secondaryValue: String?
    let secondaryField: String?
    let accent: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top, spacing: 8) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title.uppercased())
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(accent ? widgetAccentColor : secondaryTextColor)
                    Text(summary)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(textColor)
                        .lineLimit(2)
                        .minimumScaleFactor(0.75)
                }
                Spacer(minLength: 8)
                ShapeButton(label: shapeLabel, tool: "recipe-scaler", field: shapeField)
            }
            HStack(spacing: 8) {
                CompactStepperCard(tool: "recipe-scaler", field: primaryField, label: primaryLabel, value: primaryValue, step: 1, accent: accent)
                if let secondaryLabel, let secondaryValue, let secondaryField {
                    CompactStepperCard(tool: "recipe-scaler", field: secondaryField, label: secondaryLabel, value: secondaryValue, step: 1, accent: accent)
                }
            }
        }
        .padding(10)
        .background(accent ? widgetAccentColor.opacity(0.14) : mutedCardColor)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

struct YeastToolView: View {
    let state: YeastState

    var body: some View {
        let results = yeastResults(state)

        return VStack(alignment: .leading, spacing: 8) {
            ToolHeader(title: "Yeast Converter", subtitle: "Fresh / ADY / Instant") {
                IntentPill(label: state.unit.uppercased(), tool: "yeast", field: "unit")
                IntentPill(label: state.format == "fraction" ? "Frac" : "Dec", tool: "yeast", field: "format")
            }

            HStack(spacing: 6) {
                ForEach(["fresh", "ady", "instant"], id: \.self) { type in
                    YeastTypeButton(type: type, activeType: state.inputType)
                }
            }

            StepperCard(
                tool: "yeast",
                field: "amount",
                label: "Amount",
                value: "\(compact(state.amount)) \(state.unit)",
                step: yeastStep(for: state.unit)
            )

            HStack(spacing: 8) {
                ForEach(results, id: \.label) { result in
                    MetricCard(label: result.label, value: result.value, accent: result.label == "Fresh")
                }
            }
        }
    }
}

struct YeastTypeButton: View {
    let type: String
    let activeType: String

    private var buttonContent: some View {
        Text(type == "ady" ? "ADY" : type.capitalized)
            .font(.system(size: 10, weight: .bold))
            .foregroundStyle(activeType == type ? Color.white : secondaryTextColor)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(activeType == type ? widgetAccentColor : mutedCardColor)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    @ViewBuilder
    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            Button(intent: SetOptionIntent(tool: "yeast", field: "inputType", value: type)) {
                buttonContent
            }
            .buttonStyle(.plain)
        } else {
            buttonContent
        }
    }
}

struct OvenToolView: View {
    let state: OvenState

    var body: some View {
        let tempC = Int((state.tempF - 32) * 5 / 9)
        let gasMark = ovenGasMark(state.tempF)
        let presets = ["325", "350", "375", "400", "450"]

        VStack(alignment: .leading, spacing: 8) {
            ToolHeader(title: "Oven Temperature", subtitle: "F / C / Gas") {
                EmptyView()
            }
            HeroCard(label: "\(tempC)°C | Gas \(gasMark)", value: "\(Int(state.tempF))°F")
            StepperCard(tool: "oven", field: "tempF", label: "Temperature", value: "\(Int(state.tempF))°F", step: 25)
            HStack(spacing: 6) {
                ForEach(presets, id: \.self) { preset in
                    OvenPresetButton(label: preset, activeTemp: Int(state.tempF))
                }
            }
        }
    }
}

struct OvenPresetButton: View {
    let label: String
    let activeTemp: Int

    private var buttonContent: some View {
        Text("\(label)°")
            .font(.system(size: 10, weight: .bold))
            .foregroundStyle(activeTemp == Int(label) ? Color.white : secondaryTextColor)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 7)
            .background(activeTemp == Int(label) ? widgetAccentColor : mutedCardColor)
            .clipShape(RoundedRectangle(cornerRadius: 11, style: .continuous))
    }

    @ViewBuilder
    var body: some View {
        if #available(iOSApplicationExtension 17.0, *) {
            Button(intent: SetOptionIntent(tool: "oven", field: "tempF", value: label)) {
                buttonContent
            }
            .buttonStyle(.plain)
        } else {
            buttonContent
        }
    }
}

struct BakersToolView: View {
    let state: BakersState
    var body: some View {
        let hydration = state.flour > 0 ? (state.water / state.flour) * 100 : 0
        let saltPct = state.flour > 0 ? (state.salt / state.flour) * 100 : 0
        let yeastPct = state.flour > 0 ? (state.yeast / state.flour) * 100 : 0
        let total = state.flour + state.water + state.salt + state.yeast
        let flourStep = state.weightUnit == "g" ? 50.0 : 2.0
        let waterStep = state.weightUnit == "g" ? 25.0 : 1.0
        let smallStep = state.weightUnit == "g" ? 1.0 : 0.1
        VStack(alignment: .leading, spacing: 8) {
            ToolHeader(title: "Baker's Percentage", subtitle: nil) {
                IntentPill(label: state.weightUnit == "g" ? "Metric" : "Imperial", tool: "bakers-math", field: "weightUnit")
            }
            HeroCard(label: "Flour = 100%", value: "\(String(format: "%.1f", hydration))%")
            Text("Total dough \(weightOneDecimalLabel(total)) \(state.weightUnit)")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(secondaryTextColor)
            HStack(spacing: 8) {
                MetricCard(label: "Salt", value: "\(String(format: "%.1f", saltPct))%", accent: true)
                MetricCard(label: "Yeast", value: "\(String(format: "%.1f", yeastPct))%")
            }
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                StepperCard(tool: "bakers-math", field: "flour", label: "Flour", value: "\(weightOneDecimalLabel(state.flour)) \(state.weightUnit)", step: flourStep)
                StepperCard(tool: "bakers-math", field: "water", label: "Water", value: "\(weightOneDecimalLabel(state.water)) \(state.weightUnit)", step: waterStep)
                StepperCard(tool: "bakers-math", field: "salt", label: "Salt", value: "\(weightOneDecimalLabel(state.salt)) \(state.weightUnit)", step: smallStep)
                StepperCard(tool: "bakers-math", field: "yeast", label: "Yeast", value: "\(weightOneDecimalLabel(state.yeast)) \(state.weightUnit)", step: smallStep)
            }
        }
    }
}
struct LevainToolView: View {
    let state: LevainState

    var body: some View {
        let totalParts = max(1, state.ratioStarter + state.ratioFlour + state.ratioWater)
        let partWeight = state.targetWeight / totalParts

        VStack(alignment: .leading, spacing: 8) {
            ToolHeader(title: "Levain Calculator", subtitle: nil) {
                IntentPill(label: state.unit == "g" ? "Metric" : "Imperial", tool: "levain", field: "unit")
            }
            HeroCard(label: "Ratio \(compact(state.ratioStarter)):\(compact(state.ratioFlour)):\(compact(state.ratioWater))", value: "\(compact(state.targetWeight)) \(state.unit)")
            HStack(spacing: 8) {
                MetricCard(label: "Starter", value: "\(weightOneDecimalLabel(partWeight * state.ratioStarter)) \(state.unit)")
                MetricCard(label: "Flour", value: "\(weightOneDecimalLabel(partWeight * state.ratioFlour)) \(state.unit)")
                MetricCard(label: "Water", value: "\(weightOneDecimalLabel(partWeight * state.ratioWater)) \(state.unit)", accent: true)
            }
            StepperCard(tool: "levain", field: "targetWeight", label: "Target Levain", value: "\(compact(state.targetWeight)) \(state.unit)", step: state.unit == "g" ? 10 : 0.5)
            HStack(spacing: 8) {
                CompactStepperCard(tool: "levain", field: "ratioStarter", label: "Starter", value: compact(state.ratioStarter), step: 1)
                CompactStepperCard(tool: "levain", field: "ratioFlour", label: "Flour", value: compact(state.ratioFlour), step: 1)
                CompactStepperCard(tool: "levain", field: "ratioWater", label: "Water", value: compact(state.ratioWater), step: 1)
            }
        }
    }
}

struct ScalerToolView: View {
    let state: ScalerState
    var body: some View {
        let factor = recipeScale(state)
        let originalLabels = panDimensionLabels(state.originalShape)
        let newLabels = panDimensionLabels(state.newShape)
        VStack(alignment: .leading, spacing: 8) {
            ToolHeader(title: "Recipe Scaler", subtitle: state.mode == "servings" ? "Yield scaling" : "Pan scaling") {
                IntentPill(label: state.mode == "servings" ? "Servings" : "Pan", tool: "recipe-scaler", field: "mode")
                if state.mode == "pan" {
                    IntentPill(label: state.panUnit == "in" ? "Inches" : "Centimeters", tool: "recipe-scaler", field: "panUnit")
                }
            }
            HeroCard(
                label: state.mode == "servings" ? "\(Int(state.originalServings)) to \(Int(state.newServings)) servings" : "Pan area scaling",
                value: "\(String(format: "%.2f", factor))x"
            )
            if state.mode == "servings" {
                HStack(spacing: 8) {
                    CompactStepperCard(tool: "recipe-scaler", field: "originalServings", label: "Original", value: compact(state.originalServings), step: 1)
                    CompactStepperCard(tool: "recipe-scaler", field: "newServings", label: "New", value: compact(state.newServings), step: 1, accent: true)
                }
            } else {
                VStack(spacing: 8) {
                    PanConfigCard(title: "Original Pan", summary: panSummary(shape: state.originalShape, dim1: state.originalDim1, dim2: state.originalDim2, unit: state.panUnit), shapeLabel: panLabel(state.originalShape), shapeField: "originalShape", primaryLabel: originalLabels.primary, primaryValue: compact(state.originalDim1), primaryField: "originalDim1", secondaryLabel: originalLabels.secondary, secondaryValue: originalLabels.secondary == nil ? nil : compact(state.originalDim2), secondaryField: originalLabels.secondary == nil ? nil : "originalDim2", accent: false)
                    PanConfigCard(title: "New Pan", summary: panSummary(shape: state.newShape, dim1: state.newDim1, dim2: state.newDim2, unit: state.panUnit), shapeLabel: panLabel(state.newShape), shapeField: "newShape", primaryLabel: newLabels.primary, primaryValue: compact(state.newDim1), primaryField: "newDim1", secondaryLabel: newLabels.secondary, secondaryValue: newLabels.secondary == nil ? nil : compact(state.newDim2), secondaryField: newLabels.secondary == nil ? nil : "newDim2", accent: true)
                }
            }
        }
    }
}
struct ConvertToolView: View {
    let state: ConvertState

    var body: some View {
        let ingredient = convertIngredients[safe: state.ingredientIndex] ?? convertIngredients[0]
        let fromUnit = convertUnits[safe: state.fromUnitIndex] ?? "cup"
        let toUnit = convertUnits[safe: state.toUnitIndex] ?? "g"
        let result = convertAmount(amount: state.amount, fromUnit: fromUnit, toUnit: toUnit, density: ingredient.density)

        VStack(alignment: .leading, spacing: 8) {
            ToolHeader(title: "Ingredient Converter", subtitle: "Volume to weight") {
                IntentPill(label: ingredient.name, tool: "convert", field: "ingredient")
            }
            HeroCard(label: "\(compact(state.amount)) \(fromUnit) | \(ingredient.name)", value: "\(compact(result)) \(toUnit)")
            HStack(spacing: 8) {
                IntentPill(label: "From: \(fromUnit)", tool: "convert", field: "fromUnit")
                IntentPill(label: "To: \(toUnit)", tool: "convert", field: "toUnit")
            }
            StepperCard(tool: "convert", field: "amount", label: "Amount", value: "\(compact(state.amount)) \(fromUnit)", step: convertStep(for: fromUnit))
        }
    }
}

struct DDTWidget: Widget {
    let kind: String = "DDTWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: BakeProvider()) { entry in
            HubWidgetView(entry: entry)
        }
        .configurationDisplayName("Bake-It")
        .description("Interactive baking tools for your Home Screen.")
        .supportedFamilies([.systemLarge])
    }
}

private func adjustDDT(_ state: inout DDTState, field: String, delta: Double) {
    if field == "desired" { state.desired += delta }
    else if field == "room" { state.room += delta }
    else if field == "flour" { state.flour += delta }
    else if field == "friction" { state.friction += delta }
}

private func adjustYeast(_ state: inout YeastState, field: String, delta: Double) {
    if field == "amount" {
        state.amount = max(0, rounded(state.amount + delta))
    }
}

private func adjustBakers(_ state: inout BakersState, field: String, delta: Double) {
    if field == "flour" { state.flour = max(0, rounded(state.flour + delta)) }
    else if field == "water" { state.water = max(0, rounded(state.water + delta)) }
    else if field == "salt" { state.salt = max(0, rounded(state.salt + delta)) }
    else if field == "yeast" { state.yeast = max(0, rounded(state.yeast + delta)) }
}

private func adjustLevain(_ state: inout LevainState, field: String, delta: Double) {
    if field == "targetWeight" { state.targetWeight = max(0, rounded(state.targetWeight + delta)) }
    else if field == "ratioStarter" { state.ratioStarter = max(1, rounded(state.ratioStarter + delta)) }
    else if field == "ratioFlour" { state.ratioFlour = max(1, rounded(state.ratioFlour + delta)) }
    else if field == "ratioWater" { state.ratioWater = max(1, rounded(state.ratioWater + delta)) }
}

private func adjustScaler(_ state: inout ScalerState, field: String, delta: Double) {
    switch field {
    case "originalServings":
        state.originalServings = max(1, rounded(state.originalServings + delta))
    case "newServings":
        state.newServings = max(1, rounded(state.newServings + delta))
    case "originalDim1":
        state.originalDim1 = max(1, rounded(state.originalDim1 + delta))
    case "originalDim2":
        state.originalDim2 = max(1, rounded(state.originalDim2 + delta))
    case "newDim1":
        state.newDim1 = max(1, rounded(state.newDim1 + delta))
    case "newDim2":
        state.newDim2 = max(1, rounded(state.newDim2 + delta))
    default:
        break
    }
}

private func frictionPreset(unit: String, mixingMethod: String) -> Double {
    if unit == "F" {
        return mixingMethod == "machine" ? 24 : 6
    }
    return mixingMethod == "machine" ? 13 : 3
}

private func toggleDDTUnit(_ state: DDTState) -> DDTState {
    let nextUnit = state.unit == "F" ? "C" : "F"
    return DDTState(
        unit: nextUnit,
        mixingMethod: state.mixingMethod,
        desired: convertTemperature(state.desired, from: state.unit, to: nextUnit),
        room: convertTemperature(state.room, from: state.unit, to: nextUnit),
        flour: convertTemperature(state.flour, from: state.unit, to: nextUnit),
        friction: frictionPreset(unit: nextUnit, mixingMethod: state.mixingMethod)
    )
}

private func ddtWaterTemp(_ state: DDTState) -> Double {
    (state.desired * 3) - (state.room + state.flour + state.friction)
}

private func convertTemperature(_ value: Double, from: String, to: String) -> Double {
    if from == to { return value }
    if from == "F" {
        return round((value - 32) * 5 / 9)
    }
    return round(value * 9 / 5 + 32)
}

private func yeastResults(_ state: YeastState) -> [(label: String, value: String)] {
    let ratios: [String: Double] = ["fresh": 1.0, "ady": 0.4, "instant": 0.33]
    let base = state.amount / (ratios[state.inputType] ?? 1)
    let orderedTypes = ["instant", "ady", "fresh"].filter { $0 != state.inputType }

    return orderedTypes.map { type in
        let label = type == "ady" ? "Active Dry" : type.capitalized
        let rawValue = base * (ratios[type] ?? 1)
        return (label, "\(formatYeastValue(rawValue, unit: state.unit, format: state.format)) \(state.unit)")
    }
}

private func formatYeastValue(_ value: Double, unit: String, format: String) -> String {
    if format == "fraction" && ["tsp", "tbsp", "oz"].contains(unit) {
        return fractionString(value)
    }
    return compact(value)
}

private func convertBakersUnit(_ state: BakersState) -> BakersState {
    let nextUnit = state.weightUnit == "g" ? "oz" : "g"
    return BakersState(
        weightUnit: nextUnit,
        flour: convertWeight(state.flour, from: state.weightUnit, to: nextUnit),
        water: convertWeight(state.water, from: state.weightUnit, to: nextUnit),
        salt: convertWeight(state.salt, from: state.weightUnit, to: nextUnit),
        yeast: convertWeight(state.yeast, from: state.weightUnit, to: nextUnit)
    )
}

private func convertLevainUnit(_ state: LevainState) -> LevainState {
    let nextUnit = state.unit == "g" ? "oz" : "g"
    let raw = convertWeight(state.targetWeight, from: state.unit, to: nextUnit)
    return LevainState(
        unit: nextUnit,
        targetWeight: rounded(raw),
        ratioStarter: state.ratioStarter,
        ratioFlour: state.ratioFlour,
        ratioWater: state.ratioWater
    )
}

private func convertScalerUnit(_ state: ScalerState) -> ScalerState {
    let nextUnit = state.panUnit == "in" ? "cm" : "in"
    let ratio = nextUnit == "cm" ? 2.54 : 1 / 2.54
    return ScalerState(
        mode: state.mode,
        panUnit: nextUnit,
        originalServings: state.originalServings,
        newServings: state.newServings,
        originalShape: state.originalShape,
        originalDim1: rounded(state.originalDim1 * ratio),
        originalDim2: rounded(state.originalDim2 * ratio),
        newShape: state.newShape,
        newDim1: rounded(state.newDim1 * ratio),
        newDim2: rounded(state.newDim2 * ratio)
    )
}

private func recipeScale(_ state: ScalerState) -> Double {
    if state.mode == "servings" {
        return state.newServings / max(1, state.originalServings)
    }
    let originalArea = panArea(shape: state.originalShape, dim1: state.originalDim1, dim2: state.originalDim2)
    let newArea = panArea(shape: state.newShape, dim1: state.newDim1, dim2: state.newDim2)
    return originalArea > 0 ? newArea / originalArea : 1
}

private func panArea(shape: String, dim1: Double, dim2: Double) -> Double {
    switch shape {
    case "round":
        let radius = dim1 / 2
        return .pi * radius * radius
    case "square":
        return dim1 * dim1
    case "rectangle", "loaf":
        return dim1 * dim2
    case "oval":
        return .pi * (dim1 / 2) * (dim2 / 2)
    default:
        return 0
    }
}

private func panLabel(_ value: String) -> String {
    switch value {
    case "round": return "Round"
    case "square": return "Square"
    case "rectangle": return "Rectangle"
    case "loaf": return "Loaf"
    case "oval": return "Oval"
    default: return value.capitalized
    }
}
private func panDimensionLabels(_ shape: String) -> (primary: String, secondary: String?) {
    switch shape {
    case "round":
        return ("Diameter", nil)
    case "square":
        return ("Side", nil)
    case "oval":
        return ("Width", "Height")
    default:
        return ("Width", "Length")
    }
}
private func panSummary(shape: String, dim1: Double, dim2: Double, unit: String) -> String {
    let labels = panDimensionLabels(shape)
    let secondary = labels.secondary != nil ? " x \(compact(dim2))" : ""
    return "\(panLabel(shape)) \(compact(dim1))\(secondary) \(unit)"
}

private func destinationURL(for tool: String) -> URL? {
    switch tool {
    case "convert":
        return URL(string: "bakingutility:///convert")
    case "ddt", "levain", "yeast", "oven", "bakers-math", "recipe-scaler":
        return URL(string: "bakingutility:///calculators/\(tool)")
    default:
        return URL(string: "bakingutility:///")
    }
}

private func ovenGasMark(_ tempF: Double) -> String {
    if tempF < 225 { return "0" }
    if tempF == 225 { return "1/4" }
    if tempF == 250 { return "1/2" }
    return "\(Int(round((tempF - 250) / 25)))"
}

private func convertAmount(amount: Double, fromUnit: String, toUnit: String, density: Double) -> Double {
    if fromUnit == toUnit { return amount }

    let fromType = unitType(fromUnit)
    let toType = unitType(toUnit)

    if fromType == toType {
        return rounded(amount * unitToBase(fromUnit) / unitToBase(toUnit))
    }

    if fromType == "volume" && toType == "weight" {
        let cups = amount * unitToBase(fromUnit)
        let grams = cups * density
        return rounded(grams / unitToBase(toUnit))
    }

    if fromType == "weight" && toType == "volume" {
        let grams = amount * unitToBase(fromUnit)
        let cups = grams / density
        return rounded(cups / unitToBase(toUnit))
    }

    return 0
}

private func unitType(_ unit: String) -> String {
    if ["cup", "tbsp", "tsp"].contains(unit) { return "volume" }
    return "weight"
}

private func unitToBase(_ unit: String) -> Double {
    switch unit {
    case "cup": return 1
    case "tbsp": return 0.0625
    case "tsp": return 0.0208333
    case "g": return 1
    case "oz": return 28.3495
    default: return 1
    }
}

private func convertWeight(_ value: Double, from: String, to: String) -> Double {
    if from == to { return value }
    if from == "g" {
        return rounded(value / 28.3495)
    }
    return rounded(value * 28.3495)
}

private func convertStep(for unit: String) -> Double {
    switch unit {
    case "cup": return 0.25
    case "tbsp", "tsp": return 1
    case "g": return 10
    case "oz": return 0.5
    default: return 1
    }
}

/// 10 g steps that stay on a 10 g grid (avoids 1 g + 10 → 11 g).
private func adjustConvertAmountGram(_ amount: Double, delta: Double) -> Double {
    if delta > 0 {
        return floor(amount / 10) * 10 + 10
    }
    return max(0, ceil(amount / 10) * 10 - 10)
}

private func yeastStep(for unit: String) -> Double {
    if unit == "g" { return 1 }
    return 0.25
}

private func rounded(_ value: Double) -> Double {
    (value * 100).rounded() / 100
}

private func compact(_ value: Double) -> String {
    if abs(value.rounded() - value) < 0.001 {
        return "\(Int(value.rounded()))"
    }
    return String(format: "%.2f", value)
        .replacingOccurrences(of: #"0+$"#, with: "", options: .regularExpression)
        .replacingOccurrences(of: #"\.$"#, with: "", options: .regularExpression)
}

/// Matches main-app weight displays (`toFixed(1)`): levain parts, baker's ingredient weights, totals.
private func weightOneDecimalLabel(_ value: Double) -> String {
    String(format: "%.1f", value)
}

private func cycle(value: String, in values: [String]) -> String {
    guard let index = values.firstIndex(of: value) else { return values.first ?? value }
    return values[(index + 1) % values.count]
}

private func fractionString(_ value: Double) -> String {
    if value <= 0 { return "0" }
    let whole = floor(value)
    let decimal = value - whole
    let fractions: [(Double, String)] = [
        (1/8, "1/8"), (1/4, "1/4"), (1/3, "1/3"), (3/8, "3/8"), (1/2, "1/2"),
        (5/8, "5/8"), (2/3, "2/3"), (3/4, "3/4"), (7/8, "7/8")
    ]
    let match = fractions.min { abs(decimal - $0.0) < abs(decimal - $1.0) } ?? (0, "0")
    if abs(decimal) < 0.05 { return whole > 0 ? "\(Int(whole))" : "0" }
    if abs(decimal - 1) < 0.05 { return "\(Int(whole + 1))" }
    if whole > 0 {
        return "\(Int(whole)) \(match.1)"
    }
    return match.1
}

extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}


