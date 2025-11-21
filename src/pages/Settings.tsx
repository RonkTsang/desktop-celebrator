import React, { useState } from 'react';
import { emitTo } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useSettings } from '../hooks/useSettings';

const Settings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'triggers'>('general');
  const [newEmoji, setNewEmoji] = useState('');

  const triggerSmall = async () => {
    await emitTo('main', 'celebrate-small');
  };

  const triggerBig = async () => {
    await emitTo('main', 'celebrate-big');
  };

  const handleAddEmoji = () => {
    if (newEmoji && !settings.emojis.includes(newEmoji)) {
      updateSettings({ emojis: [...settings.emojis, newEmoji] });
      setNewEmoji('');
    }
  };

  const removeEmoji = (emoji: string) => {
    updateSettings({ emojis: settings.emojis.filter(e => e !== emoji) });
  };

  const toggleShape = (shape: 'square' | 'circle' | 'star') => {
    const shapes = settings.shapes.includes(shape)
      ? settings.shapes.filter(s => s !== shape)
      : [...settings.shapes, shape];
    updateSettings({ shapes });
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...settings.colors];
    newColors[index] = color;
    updateSettings({ colors: newColors });
  };

  return (
    <div className="flex h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans select-none">
      {/* Sidebar */}
      <div className="w-64 bg-[#e8e8ed]/50 backdrop-blur-xl border-r border-[#d2d2d7] flex flex-col pt-10 pb-4 px-4">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-semibold tracking-tight">Celebrator</h1>
          <p className="text-xs text-gray-500 mt-1">v0.1.0</p>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarItem
            label="General"
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
            icon="⚙️"
          />
          <SidebarItem
            label="Appearance"
            active={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}
            icon="🎨"
          />
          <SidebarItem
            label="Triggers & Git"
            active={activeTab === 'triggers'}
            onClick={() => setActiveTab('triggers')}
            icon="⚡️"
          />
        </nav>

        <div className="mt-auto pt-4 border-t border-[#d2d2d7]">
          <button
            onClick={resetSettings}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-black/5 rounded-md transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Section title="Physics">
                <RangeControl
                  label="Particle Count"
                  value={settings.particleCount}
                  min={10} max={500} step={10}
                  onChange={(v) => updateSettings({ particleCount: v })}
                />
                <RangeControl
                  label="Spread"
                  value={settings.spread}
                  min={10} max={360} step={5}
                  onChange={(v) => updateSettings({ spread: v })}
                />
                <RangeControl
                  label="Start Velocity"
                  value={settings.startVelocity}
                  min={10} max={100} step={1}
                  onChange={(v) => updateSettings({ startVelocity: v })}
                />
                <RangeControl
                  label="Particle Size"
                  value={settings.scalar}
                  min={0.1} max={3} step={0.1}
                  onChange={(v) => updateSettings({ scalar: v })}
                />
              </Section>

              <Section title="Colors">
                <div className="flex flex-wrap gap-3">
                  {settings.colors.map((color, i) => (
                    <div key={i} className="relative group">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-none p-0 shadow-sm ring-1 ring-black/10"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateSettings({ colors: [...settings.colors, '#000000'] })}
                    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition ring-1 ring-black/5"
                  >
                    +
                  </button>
                  {settings.colors.length > 1 && (
                    <button
                      onClick={() => updateSettings({ colors: settings.colors.slice(0, -1) })}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition ring-1 ring-black/5"
                    >
                      -
                    </button>
                  )}
                </div>
              </Section>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Section title="Shapes">
                <div className="flex gap-4">
                  {['square', 'circle', 'star'].map((shape) => (
                    <label key={shape} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.shapes.includes(shape as any)}
                        onChange={() => toggleShape(shape as any)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{shape}</span>
                    </label>
                  ))}
                </div>
              </Section>

              <Section title="Emojis">
                <div className="flex items-center gap-3 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.useEmojis}
                      onChange={(e) => updateSettings({ useEmojis: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable Emojis</span>
                  </label>
                </div>

                {settings.useEmojis && (
                  <div className="bg-white p-4 rounded-xl border border-[#d2d2d7] shadow-sm">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {settings.emojis.map((emoji, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-lg">
                          {emoji}
                          <button
                            onClick={() => removeEmoji(emoji)}
                            className="text-gray-400 hover:text-red-500 ml-1 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newEmoji}
                        onChange={(e) => setNewEmoji(e.target.value)}
                        placeholder="Paste emoji here..."
                        className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        maxLength={2}
                      />
                      <button
                        onClick={handleAddEmoji}
                        disabled={!newEmoji}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </Section>
            </div>
          )}

          {activeTab === 'triggers' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Section title="Manual Triggers">
                <div className="flex gap-4">
                  <button
                    onClick={triggerSmall}
                    className="px-6 py-3 bg-white border border-[#d2d2d7] rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition active:scale-95 flex items-center gap-2"
                  >
                    <span>🎉</span> Small Celebration
                  </button>
                  <button
                    onClick={triggerBig}
                    className="px-6 py-3 bg-white border border-[#d2d2d7] rounded-xl shadow-sm hover:shadow-md hover:border-purple-400 transition active:scale-95 flex items-center gap-2"
                  >
                    <span>🚀</span> Big Celebration
                  </button>
                </div>
              </Section>

              <Section title="Git Integration">
                <div className="bg-white p-6 rounded-xl border border-[#d2d2d7] shadow-sm">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Automatically trigger celebrations when you commit code. This installs a <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">post-commit</code> hook in your current repository.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const msg = await invoke('install_git_hooks');
                        alert(msg);
                      } catch (e) {
                        alert('Error: ' + e);
                      }
                    }}
                    className="px-6 py-2.5 bg-[#34c759] text-white rounded-lg hover:bg-[#30b753] transition shadow-sm font-medium flex items-center gap-2"
                  >
                    <span>📦</span> Install Git Hooks
                  </button>
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ label: string; active: boolean; onClick: () => void; icon: string }> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-3 transition-all ${active
      ? 'bg-blue-500 text-white shadow-sm font-medium'
      : 'text-gray-700 hover:bg-black/5'
      }`}
  >
    <span className="text-lg">{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h2 className="text-lg font-semibold mb-4 text-gray-900">{title}</h2>
    {children}
  </section>
);

const RangeControl: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }> = ({ label, value, min, max, step, onChange }) => (
  <div className="mb-6">
    <div className="flex justify-between mb-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-sm text-gray-500 tabular-nums">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);

export default Settings;
