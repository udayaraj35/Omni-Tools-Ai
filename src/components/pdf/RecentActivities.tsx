'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCw,
  FileText,
  ImageIcon,
} from 'lucide-react';

const RecentActivities = () => {
    const activities = [
        { id: 1, action: 'PDF Merged', file: 'invoice.pdf, receipt.pdf', time: 'Just now', status: 'completed', icon: <FileText className="h-5 w-5 text-blue-500" /> },
        { id: 2, action: 'Photo Restored', file: 'old_family_photo.jpg', time: '5 min ago', status: 'completed', icon: <ImageIcon className="h-5 w-5 text-green-500" /> },
        { id: 3, action: 'CV Created', file: 'john_doe_cv.pdf', time: '30 min ago', status: 'completed', icon: <FileText className="h-5 w-5 text-purple-500" /> },
        { id: 4, action: 'AI Translation', file: 'document.pdf → Spanish', time: '1 hour ago', status: 'completed', icon: <FileText className="h-5 w-5 text-orange-500" /> },
        { id: 5, action: 'PDF Compressed', file: 'presentation.pdf (3.2MB → 1.1MB)', time: '2 hours ago', status: 'completed', icon: <FileText className="h-5 w-5 text-red-500" /> },
    ];

  return (
    <Card className="glass-card">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <Button variant="link" className="text-sm">View All →</Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition">
                        <div className="flex items-center space-x-3">
                            {activity.icon}
                            <div>
                                <div className="font-medium">{activity.action}</div>
                                <div className="text-sm text-muted-foreground">{activity.file}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  );
};

export default RecentActivities;
