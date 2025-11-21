import React from 'react';
import { emitTo } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

const Settings: React.FC = () => {
  const triggerSmall = async () => {
    console.log('Triggering small celebration...');
    await emitTo('main', 'celebrate-small');
    console.log('Emitted celebrate-small to main');
  };

  const triggerBig = async () => {
    console.log('Triggering big celebration...');
    await emitTo('main', 'celebrate-big');
    console.log('Emitted celebrate-big to main');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8">Desktop Celebrator Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Triggers</h2>
        <div className="flex gap-4">
          <button
            onClick={triggerSmall}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Test Small Celebration
          </button>
          <button
            onClick={triggerBig}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Test Big Celebration
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Git Integration</h2>
        <p className="text-gray-600 mb-4">
          Install Git hooks to trigger celebrations on commit.
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
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Install Git Hooks
        </button>
      </div>
    </div>
  );
};

export default Settings;
