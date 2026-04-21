'use client';
import React from 'react';
import {
  BarChart,
  CloudUpload,
  Clock,
  CheckCircle
} from 'lucide-react';

const FileStats = () => {
  const stats = [
    {
      name: 'Total Processed',
      value: '1,234',
      change: '+12%',
      icon: <BarChart className="h-6 w-6" />,
      color: 'bg-blue-800/20 text-blue-400'
    },
    {
      name: 'Space Saved',
      value: '4.2 GB',
      change: '+24%',
      icon: <CloudUpload className="h-6 w-6" />,
      color: 'bg-green-800/20 text-green-400'
    },
    {
      name: 'Avg. Time',
      value: '2.3s',
      change: '-15%',
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-orange-800/20 text-orange-400'
    },
    {
      name: 'Success Rate',
      value: '99.8%',
      change: '+0.5%',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-purple-800/20 text-purple-400'
    }
  ];

  return (
    <div className="bg-gray-800/50 rounded-2xl shadow-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-6 text-gray-100">Processing Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className={`${stat.color} p-2 rounded-lg`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">AI Processing Power</span>
          <div className="w-24 bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileStats;
