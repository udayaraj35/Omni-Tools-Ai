'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart2, CloudUpload, Clock, CheckCircle } from 'lucide-react';

const QuickStats = ({ stats }: { stats: { totalProcessed: number, spaceSaved: string, timeSaved: string, successRate: string } }) => {
  const statItems = [
    {
      name: 'Total Processed',
      value: stats.totalProcessed.toLocaleString(),
      change: '+12%',
      icon: <BarChart2 className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      name: 'Space Saved',
      value: stats.spaceSaved,
      change: '+24%',
      icon: <CloudUpload className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    },
    {
      name: 'Avg. Time',
      value: '2.3s',
      change: '-15%',
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
    },
    {
      name: 'Success Rate',
      value: stats.successRate,
      change: '+0.5%',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Processing Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
            {statItems.map((stat, index) => (
            <div key={index} className="space-y-2 p-3 rounded-lg bg-background/50">
                <div className="flex items-center justify-between">
                <div className={`${stat.color} p-2 rounded-lg`}>
                    {stat.icon}
                </div>
                <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                }`}>
                    {stat.change}
                </span>
                </div>
                
                <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.name}</div>
                </div>
            </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
