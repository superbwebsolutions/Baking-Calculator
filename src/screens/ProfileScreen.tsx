import { ChevronRight, Shield, FileText, Database, LifeBuoy } from 'lucide-react';

export function ProfileScreen() {
  const menuItems = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'data', label: 'Data & Account Management', icon: Database },
    { id: 'support', label: 'Contact Support', icon: LifeBuoy },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-app-bg)] px-6 pt-12 pb-32 overflow-y-auto no-scrollbar">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Profile</h2>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="divide-y divide-gray-50">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-8">
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Data Privacy & Compliance</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            We are committed to protecting your privacy. This application complies with GDPR and CCPA regulations. Your data is stored locally on your device and is not shared with third parties without your explicit consent. You have the right to request access, modification, or deletion of your personal data at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
